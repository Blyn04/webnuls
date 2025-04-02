import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  UserOutlined,
  FileDoneOutlined,
  SnippetsOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import CustomModal from "./customs/CustomModal";
import "./styles/Sidebar.css";

const { Sider } = Layout;

const Sidebar = ({ setPageTitle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileOpen(false); 
      }
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const state = location.state || {};
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("userName");
    const normalizedRole = state.role ? state.role.toLowerCase() : storedRole ? storedRole.toLowerCase() : "user";

    setRole(normalizedRole);
    localStorage.setItem("role", normalizedRole);

    if (state.name) {
      localStorage.setItem("userName", state.name);
      
    } else if (storedName) {
      localStorage.setItem("userName", storedName);
    }

    const path = location.pathname.replace(/\/$/, "");
    
    if (path.toLowerCase() === "/profile") {
      setSelectedKey("");
      setPageTitle("Profile");
      return;
    }

    switch (path.toLowerCase()) {
      case "/dashboard":
        setSelectedKey("1");
        setPageTitle("Dashboard");
        break;

      case "/inventory":
        setSelectedKey("2");
        setPageTitle("Inventory");
        break;

      case "/pending-request":
        setSelectedKey("3");
        setPageTitle("Pending Requests");
        break;

      case "/borrow-catalog":
        setSelectedKey("4");
        setPageTitle("Borrow Catalog");
        break;

      case "/history":
        setSelectedKey("5");
        setPageTitle("History");
        break;

      case "/accounts":
        setSelectedKey("7");
        setPageTitle("Accounts");
        break;

      case "/requisition":
        setSelectedKey("8");
        setPageTitle("Requisition");
        break;

      case "/request-list":
        setSelectedKey("9");
        setPageTitle("Request List");
        break;

      case "/activity-log":
        setSelectedKey("10");
        setPageTitle("Activity Log");
        break;

      case "/search-items":
        setSelectedKey("11");
        setPageTitle("Search Items");
        break;

      case "/capex-request":
        setSelectedKey("12");
        setPageTitle("Capex Request");
        break;

      case "/return-items":
        setSelectedKey("13");
        setPageTitle("Return Items");
        break;

      default:
        setSelectedKey("1");
        setPageTitle("Dashboard");
        break;
    }
  }, [location.pathname, setPageTitle]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "1":
        navigate("/dashboard");
        setPageTitle("Dashboard");
        break;

      case "2":
        navigate("/inventory");
        setPageTitle("Inventory");
        break;

      case "3":
        navigate("/pending-request");
        setPageTitle("Pending Requests");
        break;

      case "4":
        navigate("/borrow-catalog");
        setPageTitle("Borrow Catalog");
        break;

      case "5":
        navigate("/history");
        setPageTitle("History");
        break;

      case "6":
        setShowModal(true);
        break;

      case "7":
        navigate("/accounts");
        setPageTitle("Accounts");
        break;

      case "8":
        navigate("/requisition");
        setPageTitle("Requisition");
        break;

      case "9":
        navigate("/request-list");
        setPageTitle("Request List");
        break;

      case "10":
        navigate("/activity-log");
        setPageTitle("Activity Log");
        break;

      case "11":
        navigate("/search-items");
        setPageTitle("Search Items");
        break;

      case "12":
        navigate("/capex-request");
        setPageTitle("Capex Request");
        break;

      case "13":
        navigate("/return-items");
        setPageTitle("Return Items");
        break;

      default:
        break;
    }

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const superAdminMenuItems = [
    {
      key: "7",
      icon: <UserOutlined />,
      label: "Accounts",
    },
    {
      key: "6",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const adminMenuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <UnorderedListOutlined />,
      label: "Inventory",
    },
    {
      key: "3",
      icon: <FileTextOutlined />,
      label: "Pending Requests",
    },
    {
      key: "4",
      icon: <AppstoreOutlined />,
      label: "Borrow Catalog",
    },
    {
      key: "5",
      icon: <HistoryOutlined />,
      label: "History",
    },
    {
      key: "6",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const userMenuItems = [
    {
      key: "8",
      icon: <FileDoneOutlined />,
      label: "Requisition",
    },
    {
      key: "9",
      icon: <SnippetsOutlined />,
      label: "Request List",
    },
    {
      key: "10",
      icon: <ClockCircleOutlined />,
      label: "Activity Log",
    },
    {
      key: "11",
      icon: <ClockCircleOutlined />,
      label: "Search Items",
    },
    {
      key: "12",
      icon: <ClockCircleOutlined />,
      label: "Capex Request",
    },
    {
      key: "13",
      icon: <ClockCircleOutlined />,
      label: "Return Items",
    },
    {
      key: "6",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const menuItems =
    role === "super-admin"
      ? superAdminMenuItems
      : role === "admin"
      ? adminMenuItems
      : userMenuItems;

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sider
        collapsible
        collapsed={isMobile ? !mobileOpen : collapsed}
        width={220}
        collapsedWidth={isMobile ? 80 : 80} 
        className={`${
          isMobile
            ? `sidebar-modal ${mobileOpen ? "open" : ""}`
            : "sidebar"
        }`}
        trigger={null}
        style={{
          position: isMobile ? "fixed" : "relative",
          height: "100vh",
          zIndex: isMobile ? 1000 : "auto",
        }}
      >
      <div
          className={`logo-container ${collapsed && !isMobile ? "collapsed" : ""}`}
          onClick={isMobile ? () => setMobileOpen(!mobileOpen) : toggleSidebar}
        >
          <div className="logo">
            {!collapsed || isMobile ? (
              <>
                <h3 className="logo-title">NU MOA</h3>
                <p className="logo-subtitle">Laboratory System</p>
              </>
            ) : (
              <h3 className="logo-title">NU</h3>
            )}
          </div>

          {collapsed && !isMobile ? (
            <div className="toggle-icon toggle-center">
              <MenuUnfoldOutlined />
            </div>
          ) : (
            <div className="toggle-icon toggle-right">
              <MenuFoldOutlined />
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>

      <CustomModal
      visible={showModal}
      onConfirm={handleSignOut}
      onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default Sidebar;
