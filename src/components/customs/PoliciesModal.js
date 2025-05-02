import React, { useState } from 'react';
import { Modal, Button } from 'antd'; // Ant Design modal component
import { useHistory } from 'react-router-dom'; // Optional, if you want to redirect after closing

const PoliciesModal = ({ visible, onClose }) => {
  const history = useHistory(); // Optional, if using React Router for redirects

  const handleAgree = () => {
    // Logic to handle user's agreement to the policies
    console.log('User agreed to the policies');
    onClose(); // Close modal after agreement
    // Optional: Redirect to a different page (e.g., dashboard)
    // history.push('/dashboard');
  };

  const handleDisagree = () => {
    // Logic for handling disagreement (optional)
    console.log('User disagreed with the policies');
    onClose(); // Close modal after disagreement
  };

  return (
    <Modal
      title="Terms & Policies"
      visible={visible}
      onCancel={onClose} // Close modal when the user clicks outside or the close button
      footer={null} // No footer by default, we can add buttons manually
      width={600}
    >
      <div>
        <h3>Introduction</h3>
        <p>
          These are the terms and policies governing the use of our platform. Please read them carefully before proceeding.
        </p>

        <h3>Privacy Policy</h3>
        <p>
          We respect your privacy. Your data is secure with us. For more details, read our full privacy policy.
        </p>

        <h3>Usage Terms</h3>
        <p>
          By using our platform, you agree to comply with the following usage terms.
        </p>

        {/* More sections of your policy can be added here */}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button type="default" onClick={handleDisagree} style={{ marginRight: 10 }}>
            Disagree
          </Button>
          <Button type="primary" onClick={handleAgree}>
            Agree
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PoliciesModal;
