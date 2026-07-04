import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, jwt } from "better-auth/plugins";
import { prisma } from "@pinmy/db";

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
        // Dev-only bypass: agents/browsers can't receive SMS. Never set DEV_OTP in prod.
        if (process.env.DEV_OTP) {
          console.log(`[auth] DEV_OTP active; code for ${phoneNumber} is ${process.env.DEV_OTP}`);
          return;
        }
        console.log("[auth] sendOTP phoneNumber:", phoneNumber);
        const { sendVerificationCode } = await getTwilioService();
        await sendVerificationCode(phoneNumber);
      },
      verifyOTP: async ({ phoneNumber, code }) => {
        if (process.env.DEV_OTP) return code === process.env.DEV_OTP;
        console.log("[auth] verifyOTP phoneNumber:", phoneNumber, "code:", code);
        const { verifyCode } = await getTwilioService();
        return verifyCode(phoneNumber, code);
      },
    }),
  ],
});
