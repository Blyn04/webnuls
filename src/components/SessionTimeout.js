import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const SessionTimeout = ({ onLogout }) => { 
  const [timer, setTimer] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate(); 

  const timeoutDuration = 20 * 60 * 1000; // 1 minute in milliseconds

  const logoutUser = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("userPosition");
    onLogout();
    navigate("/", { replace: true });
  };

  const showSessionTimeoutModal = () => {
    setIsModalVisible(true);
  };

  const resetTimeout = () => {
    setLastActivityTime(Date.now());  
    if (timer) {
      clearTimeout(timer);  
    }

    const newTimer = setTimeout(() => {
      showSessionTimeoutModal();  
    }, timeoutDuration);

    setTimer(newTimer);  
  };

  useEffect(() => {
    const handleActivity = () => {
      resetTimeout();  
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [lastActivityTime]);

  useEffect(() => {
    resetTimeout();  
    return () => {
      if (timer) {
        clearTimeout(timer);  
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
      visible={isModalVisible}
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
