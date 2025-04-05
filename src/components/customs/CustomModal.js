import React from "react";
import { Button } from "antd";
import "../styles/customsStyle/CustomModal.css";

const CustomModal = ({ visible, onConfirm, onCancel }) => {
  if (!visible) return null;

  return (
    <div className="new-modal-overlay">
      <div className="new-modal-container">
        <h3 className="new-modal-title">Sign Out</h3>
        <p className="new-modal-content">Are you sure you want to sign out?</p>

        <div className="new-modal-actions">
          <div style={{ display: "flex", flexDirection: "row", gap: "12px", flexWrap: "wrap" }}>
            <Button type="primary" danger onClick={onConfirm} className="new-modal-btn signout-btn">
              Yes, Sign Out
            </Button>
            
            <Button onClick={onCancel} className="new-modal-btn cancel-btn">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
