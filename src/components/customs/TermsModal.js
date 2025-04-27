import React from 'react';
import '../styles/customsStyle/TermsModal.css'; 

const TermsModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Terms and Conditions</h2>

        <div className="terms-content">
          <p>Please read these Terms and Conditions ("Terms") carefully before using our application.</p>

          <h3>1. Data Privacy</h3>
          <p>We value your privacy and are committed to protecting your personal data. By using our application, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy.</p>

          <p><strong>1.1 Information We Collect</strong>: We collect personal data, including but not limited to your name, email address, employee ID, job title, department, and other details you provide during sign-up or use of the application.</p>

          <p><strong>1.2 How We Use Your Information</strong>:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Verify your identity</li>
            <li>Send you relevant notifications and updates</li>
            <li>Process your requests and inquiries</li>
          </ul>

          <p><strong>1.3 Data Sharing and Disclosure</strong>:</p>
          <ul>
            <li>With your consent</li>
            <li>As required by law or regulation</li>
            <li>To protect our rights or prevent fraud</li>
          </ul>

          <p><strong>1.4 Data Security</strong>: We implement reasonable security measures to protect your personal data from unauthorized access, use, or disclosure.</p>

          <p><strong>1.5 Your Rights</strong>: You have the right to access, correct, or delete your personal data. If you wish to exercise these rights, please contact us at [your contact email].</p>

          <p><strong>1.6 Changes to Privacy Policy</strong>: We may update our Privacy Policy from time to time. Any changes will be posted on this page, and the updated policy will be effective as of the posted date.</p>

          <h3>2. User Responsibilities</h3>
          <p><strong>2.1 Accuracy of Information</strong>: You are responsible for ensuring that the information you provide is accurate and up-to-date.</p>
          <p><strong>2.2 Account Security</strong>: You are responsible for keeping your account credentials confidential and for all activities that occur under your account.</p>

          <h3>3. Limitation of Liability</h3>
          <p><strong>3.1 No Warranty</strong>: We provide the application "as is" and make no warranties regarding its accuracy, reliability, or availability.</p>
          <p><strong>3.2 Limitation of Liability</strong>: We are not liable for any indirect, incidental, or consequential damages arising from your use of the application.</p>

          <h3>4. Governing Law</h3>
          <p><strong>4.1 Jurisdiction</strong>: These terms shall be governed by and construed in accordance with the laws of [your jurisdiction].</p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="modal-close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
