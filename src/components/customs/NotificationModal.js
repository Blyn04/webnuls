import React from "react";
import { Modal } from "antd";

const NotificationModal = ({ isVisible, onClose, message }) => {
  return (
    <Modal
      title="Notification"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      zIndex={1012}
      centered
      className="notification-modal"
    >
      <p className="notification-message">{message}</p>
    </Modal>
  );
};

export default NotificationModal;
