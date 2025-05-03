import React, { useState } from 'react';
import './styles/Policies.css';

const PoliciesModal = ({ isOpen, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Our Policies</h2>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <h3>Terms & Conditions</h3>
          <p>
            These terms and conditions outline the rules and regulations for the use of our website.
          </p>
          <h3>Privacy Policy</h3>
          <p>
            We value your privacy and ensure that your personal information is kept safe.
          </p>
          <h3>Return and Refund Policy</h3>
          <p>
            If you are not satisfied with your purchase, you can return it within 30 days.
          </p>
        </div>
        <div className="modal-footer">
          <button className="close-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoliciesModal;
