import React from "react";
import { Layout, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles/Dashboard.css";

const { Header } = Layout;

const AppHeader =  ({ pageTitle }) => {
  const navigate = useNavigate(); 
  const location = useLocation();

  const role = location.state?.role;

  const goToProfile = () => {
    navigate("/profile"); 
  };

  return (
    <Header className="header">
     <h2 className="header-title">{pageTitle}</h2>

     {role !== "super-admin" && (
        <div
          className="user-profile"
          onClick={goToProfile}
          style={{ cursor: "pointer" }}
        >
          <span style={{ marginRight: 8 }}>Hi, Nathan!</span>
          <Avatar icon={<UserOutlined />} />
        </div>
      )}
    </Header>
  );
};

export default AppHeader;