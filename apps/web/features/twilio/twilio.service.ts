import { twilioClient } from "@/lib/clients/twilio";

const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;

export const sendVerificationCode = async (phoneNumber: string) => {
  await twilioClient.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verifications.create({ to: phoneNumber, channel: "sms" });
};

export const verifyCode = async (
  phoneNumber: string,
  code: string,
): Promise<boolean> => {
  const check = await twilioClient.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phoneNumber, code });
  return check.status === "approved";
};
