import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, jwt } from "better-auth/plugins";
import { prisma } from "./prisma";

const getTwilioService = () =>
  import("../../features/twilio/twilio.service");

function getTrustedOrigins(): string[] {
  const baseURL = process.env.BETTER_AUTH_URL ?? "";
  const origins = new Set<string>();

  // Add the base URL and its www/non-www counterpart
  if (baseURL) {
    origins.add(baseURL);
    const url = new URL(baseURL);
    if (url.hostname.startsWith("www.")) {
      origins.add(baseURL.replace("www.", ""));
    } else {
      origins.add(baseURL.replace("://", "://www."));
    }
  }

  // Add any extra origins from env
  for (const o of process.env.TRUSTED_ORIGINS?.split(",") ?? []) {
    const trimmed = o.trim();
    if (trimmed) origins.add(trimmed);
  }

  return [...origins];
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: getTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    jwt({
      jwt: {
        definePayload: async (session) => {
          return {
            sub: session.user.id,
            phone: session.user.phoneNumber || "",
          };
        },
      },
    }),
    phoneNumber({
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber.replace(/\D/g, "")}@phone.local`,
      },
      sendOTP: async ({ phoneNumber }) => {
        const { sendVerificationCode } = await getTwilioService();
        await sendVerificationCode(phoneNumber);
      },
      verifyOTP: async ({ phoneNumber, code }) => {
        const { verifyCode } = await getTwilioService();
        return verifyCode(phoneNumber, code);
      },
    }),
  ],
});
