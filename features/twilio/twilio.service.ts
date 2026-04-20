import { twilioClient } from "@/lib/twilio";

const VERIFY_SERVICE_SID = "VA70c5f3e71b3a228c30e7800dad3a1e52";

export const sendVerificationCode = async (phoneNumber: string) => {
  twilioClient.verify.v2
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
