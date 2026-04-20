import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { prisma } from "./prisma";
import {
  sendVerificationCode,
  verifyCode,
} from "@/features/twilio/twilio.service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber }) => {
        sendVerificationCode(phoneNumber);
      },
      verifyOTP: async ({ phoneNumber, code }) => {
        return verifyCode(phoneNumber, code);
      },
    }),
  ],
});
