import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const SessionTimeout = ({ onLogout }) => {
  const timerRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const timeoutDuration = 1 * 60 * 1000; // 1 minute

  const logoutUser = () => {
    localStorage.clear(); // clears all localStorage items
    onLogout();
    navigate("/", { replace: true });
  };

  const showSessionTimeoutModal = () => {
    setIsModalVisible(true);
  };

  const resetTimeout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      showSessionTimeoutModal();
    }, timeoutDuration);
  };

  useEffect(() => {
    const handleActivity = () => {
      resetTimeout();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    resetTimeout(); // initialize on mount

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleOk = () => {
    logoutUser();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    resetTimeout();
  };

  return (
    <Modal
      title="Session Timeout"
      open={isModalVisible} // Ant Design v5 uses `open`, not `visible`
      footer={[
        <Button key="ok" type="primary" onClick={handleOk}>
          Okay
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <p>Your session has timed out due to inactivity. Please log in again.</p>
    </Modal>
  );
};

export default SessionTimeout;
