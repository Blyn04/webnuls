import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  LogoutOutlined,
  FileDoneOutlined,
  SnippetsOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import Dashboard from './Dashboard';
import Inventory from './admin/Inventory';
import PendingRequest from './admin/PendingRequest';
import BorrowCatalog from './admin/BorrowCatalog';
import History from './admin/History';
import Profile from './Profile';
import AccountManagement from './superAdmin/AccountManagement';
import Requisition from './users/Requisition';
import RequestList from './users/RequestList';
import ActivityLog from './users/ActivityLog';
import SearchItems from './users/SearchItems';
import CapexRequest from './users/CapexRequest';
import ReturnItems from './users/ReturnItems';
import CustomModal from "./customs/CustomModal";
import AppHeader from './Header';
const { Header, Sider, Content } = Layout;

const LayoutMain = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");
  const [pageTitle, setPageTitle] = useState("");

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
    
    if (path.toLowerCase() === "/main/profile") {
      setSelectedKey("");
      setPageTitle("Profile");
      return;
    }

    switch (path.toLowerCase()) {
      case "/main/dashboard":
        setSelectedKey("1");
        setPageTitle("Dashboard");
        break;

      case "/main/inventory":
        setSelectedKey("2");
        setPageTitle("Inventory");
        break;

      case "/main/pending-request":
        setSelectedKey("3");
        setPageTitle("Pending Requests");
        break;

      case "/main/borrow-catalog":
        setSelectedKey("4");
        setPageTitle("Borrow Catalog");
        break;

      case "/main/history":
        setSelectedKey("5");
        setPageTitle("History");
        break;

      case "/main/accounts":
        setSelectedKey("7");
        setPageTitle("Accounts");
        break;

      case "/main/requisition":
        setSelectedKey("8");
        setPageTitle("Requisition");
        break;

      case "/main/request-list":
        setSelectedKey("9");
        setPageTitle("Request List");
        break;

      case "/main/activity-log":
        setSelectedKey("10");
        setPageTitle("Activity Log");
        break;

      case "/main/search-items":
        setSelectedKey("11");
        setPageTitle("Search Items");
        break;

      case "/main/capex-request":
        setSelectedKey("12");
        setPageTitle("Capex Request");
        break;

      case "/main/return-items":
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

//   const handleMenuClick = (e) => {
//     switch (e.key) {
//       case "1":
//         navigate("/main/dashboard");
//         setPageTitle("Dashboard");
//         break;

//       case "2":
//         navigate("/main/inventory");
//         setPageTitle("Inventory");
//         break;

//       case "3":
//         navigate("/main/pending-request");
//         setPageTitle("Pending Requests");
//         break;

//       case "4":
//         navigate("/main/borrow-catalog");
//         setPageTitle("Borrow Catalog");
//         break;

//       case "5":
//         navigate("/main/history");
//         setPageTitle("History");
//         break;

//       case "6":
//         setShowModal(true);
//         break;

//       case "7":
//         navigate("/main/accounts");
//         setPageTitle("Accounts");
//         break;

//       case "8":
//         navigate("/main/requisition");
//         setPageTitle("Requisition");
//         break;

//       case "9":
//         navigate("/main/request-list");
//         setPageTitle("Request List");
//         break;

//       case "10":
//         navigate("/main/activity-log");
//         setPageTitle("Activity Log");
//         break;

//       case "11":
//         navigate("/main/search-items");
//         setPageTitle("Search Items");
//         break;

//       case "12":
//         navigate("/main/capex-request");
//         setPageTitle("Capex Request");
//         break;

//       case "13":
//         navigate("/main/return-items");
//         setPageTitle("Return Items");
//         break;

//       default:
//         break;
//     }

//     if (isMobile) {
//       setMobileOpen(false);
//     }
//   };

const handleMenuClick = (e) => {
    if (e.key === "logout") {
      setShowModal(true);

    } else {
      navigate(e.key); 
    }
  
    if (isMobile) setMobileOpen(false);
  };  

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const superAdminMenuItems = [
    {
      key: "/main/accounts",
      icon: <UserOutlined />,
      label: "Accounts",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const adminMenuItems = [
    {
      key: "/main/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/main/inventory",
      icon: <UnorderedListOutlined />,
      label: "Inventory",
    },
    {
      key: "/main/pending-request",
      icon: <FileTextOutlined />,
      label: "Pending Requests",
    },
    {
      key: "/main/borrow-catalog",
      icon: <AppstoreOutlined />,
      label: "Borrow Catalog",
    },
    {
      key: "/main/history",
      icon: <HistoryOutlined />,
      label: "History",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const userMenuItems = [
    {
      key: "/main/requisition",
      icon: <FileDoneOutlined />,
      label: "Requisition",
    },
    {
      key: "/main/request-list",
      icon: <SnippetsOutlined />,
      label: "Request List",
    },
    {
      key: "/main/activity-log",
      icon: <ClockCircleOutlined />,
      label: "Activity Log",
    },
    {
      key: "/main/search-items",
      icon: <ClockCircleOutlined />,
      label: "Search Items",
    },
    {
      key: "/main/capex-request",
      icon: <ClockCircleOutlined />,
      label: "Capex Request",
    },
    {
      key: "/main/return-items",
      icon: <ClockCircleOutlined />,
      label: "Return Items",
    },
    {
      key: "logout",
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
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />

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

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}

        />
      </Sider>

      <Layout>
        <AppHeader
        pageTitle={pageTitle}
        onToggleSidebar={() => {
            if (isMobile) {
            setMobileOpen(!mobileOpen);
            } else {
            setCollapsed(!collapsed);
            }
        }}
        isSidebarCollapsed={collapsed}
        />

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
            <Routes>
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/pending-request" element={<PendingRequest />} />
                <Route path="/borrow-catalog" element={<BorrowCatalog />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/accounts" element={<AccountManagement />} />
                <Route path="/requisition" element={<Requisition />} />
                <Route path="/request-list" element={<RequestList />} />
                <Route path="/activity-log" element={<ActivityLog />} />
                <Route path="/search-items" element={<SearchItems />} />
                <Route path="/capex-request" element={<CapexRequest />} />
                <Route path="/return-items" element={<ReturnItems />} />
            </Routes>
        </Content>
        
        <CustomModal
            visible={showModal}
            onConfirm={handleSignOut}
            onCancel={() => setShowModal(false)}
        />
      </Layout>
    </Layout>
  );
};

export default LayoutMain;