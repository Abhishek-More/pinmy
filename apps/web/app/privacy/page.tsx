import {
  LegalPage,
  LegalH1,
  LegalH2,
  LegalDate,
  LegalList,
} from "@/components/legal/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage>
      <LegalH1>Privacy Policy</LegalH1>
      <LegalDate>Last updated: April 27, 2026</LegalDate>

      <p>PinMy (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the PinMy application. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>

      <LegalH2>1. Information We Collect</LegalH2>
      <p><strong>Phone Number.</strong> We collect your phone number solely for the purpose of authenticating your identity. When you sign in, we send a one-time verification code to your phone number via SMS. We do not use your phone number for marketing, promotions, or any purpose other than authentication.</p>
      <p><strong>Bookmarks &amp; Links.</strong> We store the URLs, titles, and metadata of links you save to the service. This content is yours and is stored to provide the core functionality of the application.</p>
      <p><strong>Usage Data.</strong> We may collect basic usage data such as timestamps of when you access the service, for the purpose of maintaining and improving the application.</p>

      <LegalH2>2. How We Use Your Information</LegalH2>
      <LegalList>
        <li>To verify your identity via SMS one-time passcode (OTP)</li>
        <li>To provide, maintain, and improve the PinMy service</li>
        <li>To store and organize your saved bookmarks</li>
      </LegalList>
      <p>We do <strong>not</strong> use your phone number or personal data for marketing, advertising, or promotional messaging of any kind. The only SMS messages you will receive from us are one-time verification codes that you explicitly request when signing in.</p>

      <LegalH2>3. SMS &amp; Messaging Disclosure</LegalH2>
      <p>By providing your phone number and requesting a verification code, you consent to receive a single SMS message containing a one-time passcode for authentication. Standard message and data rates may apply depending on your carrier. Message frequency: one message per sign-in attempt. You can opt out at any time by simply not requesting a code. No ongoing or recurring messages are sent.</p>
      <p>We use Twilio as our SMS delivery provider. Your phone number is shared with Twilio solely for the purpose of delivering the verification code. Twilio&apos;s privacy policy is available at <a href="https://www.twilio.com/legal/privacy" style={{ color: "#111" }}>twilio.com/legal/privacy</a>.</p>

      <LegalH2>4. Data Sharing</LegalH2>
      <p>We do not sell, rent, or share your personal information with third parties, except:</p>
      <LegalList>
        <li><strong>Twilio</strong> &mdash; to deliver SMS verification codes, as described above</li>
        <li><strong>Legal requirements</strong> &mdash; if required by law, regulation, or legal process</li>
      </LegalList>

      <LegalH2>5. Data Retention</LegalH2>
      <p>Your phone number and account data are retained for as long as you maintain an active account. You may request deletion of your account and all associated data at any time by contacting us.</p>

      <LegalH2>6. Data Security</LegalH2>
      <p>We implement reasonable security measures to protect your data, including encrypted connections (TLS), secure storage, and access controls. However, no method of transmission or storage is 100% secure.</p>

      <LegalH2>7. Children&apos;s Privacy</LegalH2>
      <p>PinMy is not intended for use by anyone under the age of 13. We do not knowingly collect information from children under 13.</p>

      <LegalH2>8. Changes to This Policy</LegalH2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

      <LegalH2>9. Contact</LegalH2>
      <p>If you have questions about this Privacy Policy or wish to request data deletion, contact us at <strong>privacy@pinmy.app</strong>.</p>
    </LegalPage>
  );
}
