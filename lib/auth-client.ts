import { createAuthClient } from "better-auth/react";
import { phoneNumberClient, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [phoneNumberClient(), jwtClient()],
});
