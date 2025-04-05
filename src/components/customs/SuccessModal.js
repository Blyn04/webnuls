import React from "react";
import { Modal, Button } from "antd";

const SuccessModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      title="Login Successful"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          OK
        </Button>,
      ]}
      centered
      className="success-modal"
      width="90%" 
      maxWidth={400} 
    >
      <p style={{ fontSize: "16px", textAlign: "center" }}>
        Login Successful!!
      </p>
    </Modal>
  );
};

export default SuccessModal;
