import React from "react";
import { Modal } from "antd";

const NotificationModal = ({ isVisible, onClose, message }) => {
  return (
    <Modal
      title="Notification"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <p style={{ fontSize: "16px", textAlign: "center" }}>{message}</p>
    </Modal>
  );
};

export default NotificationModal;
