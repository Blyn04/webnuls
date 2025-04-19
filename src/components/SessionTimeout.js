import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../backend/firebase/FirebaseConfig"; 

const SessionTimeout = ({ onLogout }) => {
  const timerRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const timeoutDuration = 10 * 60 * 1000; // 1 minute

  const logoutUser = async () => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Unknown User";

    // Clear local storage and perform logout action
    localStorage.clear();
    onLogout();

    // Log logout activity to Firestore
    if (userId) {
      try {
        await addDoc(collection(db, `accounts/${userId}/activitylog`), {
          action: "User Logged Out (Website)",
          userName,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error logging logout:", error);
      }
    }

    // Redirect to the home page or login page
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

    resetTimeout(); 

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
      open={isModalVisible}
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
