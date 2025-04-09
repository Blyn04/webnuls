import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory

const SessionTimeout = ({ onLogout }) => {  // Accept onLogout prop
  const [timer, setTimer] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate(); 

  const timeoutDuration = 1 * 60 * 1000; // 1 minute in milliseconds

  const logoutUser = () => {
    localStorage.removeItem("userId");
    onLogout();  // Call the onLogout prop to update the login state in AppController
    navigate("/");  // Redirect to the login page
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
      onOk={handleOk}
      okText="Okay"
    >
      <p>Your session has timed out due to inactivity. Please log in again.</p>
    </Modal>
  );
};

export default SessionTimeout;
