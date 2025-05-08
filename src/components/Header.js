import React, { useEffect, useState } from "react";
import { Layout, Avatar, Button } from "antd";
import { UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles/Header.css";

const { Header } = Layout;

const AppHeader = ({ pageTitle, onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || localStorage.getItem("role");
  const [userName, setUserName] = useState("User");
  const [jobTitle, setJobTitle] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 408);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedJobTitle = localStorage.getItem("userJobTitle");

    if (storedName) setUserName(storedName);
    if (storedJobTitle) setJobTitle(storedJobTitle);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 408);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToProfile = () => {
    navigate("/main/profile");
  };

  const capitalizeName = (name) =>
    name?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());  

  return (
    <Header className={`header ${isMobile ? "header-mobile" : ""}`}>
      <div className="header-left">
        <Button
          type="text"
          icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{ fontSize: "18px", marginRight: "16px" }}
        />
        <h2 className={`header-title ${isMobile ? "title-mobile" : ""}`}>
          {pageTitle}
        </h2>
      </div>

      {role !== "super-admin" && (
        <div
          className={`user-profile ${isMobile ? "profile-mobile" : ""}`}
          onClick={goToProfile}
        >
          {!isMobile && (
            <div className="user-info">
              <div className="user-name">Hi, {capitalizeName(userName)}!</div>
              <div className="user-title">{jobTitle}</div>
            </div>
          )}
          <Avatar icon={<UserOutlined />} />
        </div>
      )}
    </Header>
  );
};

export default AppHeader;
