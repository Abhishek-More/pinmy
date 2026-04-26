import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, jwt } from "better-auth/plugins";
import { prisma } from "./prisma";

const getTwilioService = () =>
  import("../../features/twilio/twilio.service");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
        sendVerificationCode(phoneNumber);
      },
      verifyOTP: async ({ phoneNumber, code }) => {
        const { verifyCode } = await getTwilioService();
        return verifyCode(phoneNumber, code);
      },
    }),
  ],
});
