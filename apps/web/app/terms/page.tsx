import {
  LegalPage,
  LegalH1,
  LegalH2,
  LegalDate,
  LegalList,
} from "@/components/legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage>
      <LegalH1>Terms of Service</LegalH1>
      <LegalDate>Last updated: April 27, 2026</LegalDate>

      <p>These Terms of Service (&quot;Terms&quot;) govern your use of the PinMy application (&quot;Service&quot;) operated by PinMy (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By using the Service, you agree to these Terms.</p>

      <LegalH2>1. Account &amp; Authentication</LegalH2>
      <p>To use PinMy, you must provide a valid phone number. We will send you a one-time SMS verification code each time you sign in. By providing your phone number, you confirm that:</p>
      <LegalList>
        <li>You are the owner or authorized user of that phone number</li>
        <li>You consent to receive SMS verification codes at that number</li>
        <li>You understand that standard message and data rates may apply</li>
        <li>You are at least 13 years of age</li>
      </LegalList>
      <p>Message frequency varies based on your sign-in activity (one message per sign-in attempt). These messages are transactional only and are not marketing or promotional. You can stop receiving messages by choosing not to sign in. For help, contact <strong>support@pinmy.app</strong>.</p>

      <LegalH2>2. SMS Terms</LegalH2>
      <p>By opting in to our SMS authentication service:</p>
      <LegalList>
        <li>You will receive one-time passcode (OTP) messages only when you initiate a sign-in</li>
        <li>Message frequency: 1 message per sign-in attempt</li>
        <li>Message and data rates may apply</li>
        <li>Carriers are not liable for delayed or undelivered messages</li>
        <li>To opt out: simply do not request a verification code, or contact us at <strong>support@pinmy.app</strong></li>
        <li>For help: text HELP in reply to any verification message, or email <strong>support@pinmy.app</strong></li>
      </LegalList>
      <p>We do not send recurring, promotional, or marketing messages. SMS is used exclusively for account verification.</p>

      <LegalH2>3. Use of the Service</LegalH2>
      <p>PinMy allows you to save, organize, and search bookmarks. You agree to use the Service only for lawful purposes. You are responsible for all content you save to your account.</p>

      <LegalH2>4. Your Content</LegalH2>
      <p>You retain ownership of all links, notes, and data you store in PinMy. We do not claim any intellectual property rights over your content. We store your content solely to provide the Service to you.</p>

      <LegalH2>5. Prohibited Conduct</LegalH2>
      <p>You agree not to:</p>
      <LegalList>
        <li>Use the Service for any illegal activity</li>
        <li>Attempt to gain unauthorized access to other accounts or systems</li>
        <li>Interfere with or disrupt the Service</li>
        <li>Use automated means to access the Service without our permission</li>
      </LegalList>

      <LegalH2>6. Termination</LegalH2>
      <p>We may suspend or terminate your access to the Service at any time for violation of these Terms. You may delete your account at any time by contacting us at <strong>support@pinmy.app</strong>.</p>

      <LegalH2>7. Disclaimer</LegalH2>
      <p>The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.</p>

      <LegalH2>8. Limitation of Liability</LegalH2>
      <p>To the fullest extent permitted by law, PinMy shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>

      <LegalH2>9. Changes to These Terms</LegalH2>
      <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>

      <LegalH2>10. Contact</LegalH2>
      <p>For questions about these Terms, contact us at <strong>support@pinmy.app</strong>.</p>
    </LegalPage>
  );
}
