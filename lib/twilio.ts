const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const twilioClient = require("twilio")(accountSid, authToken);
