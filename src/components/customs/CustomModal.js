import React from "react";
import { Modal, Button } from "antd";
import "../styles/customsStyle/CustomModal.css";

const CustomModal = ({ visible, onConfirm, onCancel }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3 className="modal-title">Sign Out</h3>
        <p className="modal-content">Are you sure you want to sign out?</p>

        <div className="modal-actions">
          <Button type="primary" danger onClick={onConfirm}>
            Yes, Sign Out
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
