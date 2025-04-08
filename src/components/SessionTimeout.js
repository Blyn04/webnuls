import React, { useState, useEffect } from "react";
import { message } from "antd";
import { useHistory } from "react-router-dom";  // or 'react-router-dom' for navigation

const SessionTimeout = () => {
  const [timer, setTimer] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const history = useHistory();

  const timeoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds

  // Function to log out the user
  const logoutUser = () => {
    // You can perform any logout action here (e.g., clearing tokens, redirecting to login page)
    localStorage.removeItem("userId"); // Example: remove userId from localStorage
    message.warning("Your session has timed out due to inactivity.");
    history.push("/login");  // Redirect to the login page
  };

  // Function to reset the timeout when activity is detected
  const resetTimeout = () => {
    setLastActivityTime(Date.now());  // Update last activity time
    if (timer) {
      clearTimeout(timer);  // Clear previous timeout
    }
    // Set a new timeout to log out the user
    const newTimer = setTimeout(() => {
      logoutUser();
    }, timeoutDuration);

    setTimer(newTimer);  // Set new timer state
  };

  // Set up event listeners to detect user activity
  useEffect(() => {
    const handleActivity = () => {
      resetTimeout();  // Reset the timeout whenever user interacts
    };

    // Add event listeners for user activity (mousemove, click, keypress)
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [lastActivityTime]);

  // Start the session timer when the component mounts
  useEffect(() => {
    resetTimeout();  // Start the timeout
    return () => {
      if (timer) {
        clearTimeout(timer);  // Clear the timeout when the component unmounts
      }
    };
  }, []);

  return null;  // This component doesn't render anything but runs the session timeout logic
};

export default SessionTimeout;
