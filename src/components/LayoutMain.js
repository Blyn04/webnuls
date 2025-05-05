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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../backend/firebase/FirebaseConfig"; 
import Dashboard from './Dashboard';
import Inventory from './admin/Inventory';
import PendingRequest from './admin/PendingRequest';
import BorrowCatalog from './admin/BorrowCatalog';
import History from './admin/History';
import Profile from './Profile';
import AccountManagement from './superAdmin/AccountManagement';
import PendingAccounts from './superAdmin/PendingAccounts';
import Requisition from './users/Requisition';
import RequestList from './users/RequestList';
import ActivityLog from './users/ActivityLog';
import SearchItems from './users/SearchItems';
import CapexRequest from './users/CapexRequest';
import ReturnItems from './users/ReturnItems';
import CustomModal from "./customs/CustomModal";
import AppHeader from './Header';
import ProtectedRoute from './ProtectedRoute';
import HistoryLog from './users/HistoryLog';
import RequestLog from './admin/RequestLog';
import AdminActivityLog from './admin/AdminActivityLog';
import NotAuthorized from './NotAuthorized';
import CapexList from './admin/CapexList';

const { Header, Sider, Content } = Layout;

const LayoutMain = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 408);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 408);
      if (window.innerWidth > 408) {
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

      case "/main/history-log":
        setSelectedKey("14");
        setPageTitle("Status Board");
        break;

      case "/main/request-log":
        setSelectedKey("15");
        setPageTitle("Request Log");
        break;

      case "/main/admin-activity-log":
        setSelectedKey("16");
        setPageTitle("Activivty Log");
        break;

      case "/main/pending-accounts":
        setSelectedKey("17");
        setPageTitle("Pending Accounts");
        break;

      case "/main/capex-request-list":
        setSelectedKey("18");
        setPageTitle("Capex Request List");
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
    if (e.key === "logout") {
      setShowModal(true);

    } else {
      navigate(e.key); 
    }
  
    if (isMobile) setMobileOpen(false);
  };  

  const handleSignOut = async () => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Unknown User";

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

    // Clear local storage and redirect
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("userPosition");
    localStorage.removeItem("userJobTitle");

    navigate("/", { replace: true });
  };

  const superAdminMenuItems = [
    {
      key: "/main/accounts",
      icon: <UserOutlined />,
      label: "Accounts",
    },
    {
      key: "/main/pending-accounts",
      icon: <UserOutlined />,
      label: "Pending Accounts",
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
      key: "/main/admin-activity-log",
      icon: <HistoryOutlined />,
      label: "Activity Log",
    },
    {
      key: "/main/request-log",
      icon: <HistoryOutlined />,
      label: "Request Log",
    },
    {
      key: "/main/capex-request-list",
      icon: <HistoryOutlined />,
      label: "Capex Request List",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const superUserMenuItems = [
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
      key: "/main/admin-activity-log",
      icon: <HistoryOutlined />,
      label: "Activity Log",
    },
    {
      key: "/main/request-log",
      icon: <HistoryOutlined />,
      label: "Request Log",
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
      key: "/main/search-items",
      icon: <ClockCircleOutlined />,
      label: "Search Items",
    },
    {
      key: "/main/activity-log",
      icon: <ClockCircleOutlined />,
      label: "Activity Log",
    },
    {
      key: "/main/history-log",
      icon: <ClockCircleOutlined />,
      label: "Status Board",
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
      : role === "super-user"
      ? superUserMenuItems
      : userMenuItems;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={isMobile ? 0 : undefined} 
          width={200}  
          className={isMobile && !mobileOpen ? 'mobile-collapsed' : ''} 
          style={{ 
            width: mobileOpen ? '200px' : (collapsed && !isMobile ? '80px' : '200px'),
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: 1000,
            overflow: "auto",
          }}
        > 
          <div className="demo-logo-vertical" />

          <div className="logo">
              {!collapsed || isMobile ? (
                <>
                  <h3 className="logo-title">NU MOA</h3>
                  <p className="logo-subtitle">Laboratory System</p>
                </>
              ) : (
                <h3 className="logo-title">NU MOA</h3>
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

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>

        <Header
          style={{
            position: "fixed",
            top: 0,
            left: collapsed ? 80 : 200,
            right: 0,
            zIndex: 1001,
            background: "#fff",
            padding: 0,
            transition: 'left 0.2s',
          }}
        >
          <AppHeader
            pageTitle={pageTitle}
            onToggleSidebar={toggleSidebar}
            isSidebarCollapsed={collapsed}
          />
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: "100vh",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >

          <Routes>
            <Route path="/not-authorized" element={<NotAuthorized />} />

            {/* Routes accessible to all logged-in users */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "user", "super-admin", "super-user"]} />} >
              <Route path="/profile" element={<Profile />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/history-log" element={<HistoryLog />} />
            </Route>

            {/* Superadmin-only routes */}
            <Route element={<ProtectedRoute allowedRoles={["super-admin"]} />}>
              <Route path="/accounts" element={<AccountManagement />} />
              <Route path="/pending-accounts" element={<PendingAccounts />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "super-user"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/pending-request" element={<PendingRequest />} />
              <Route path="/borrow-catalog" element={<BorrowCatalog />} />
              <Route path="/request-log" element={<RequestLog />} />
              <Route path="/admin-activity-log" element={<AdminActivityLog />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/capex-request-list" element={<CapexList/>} />
            </Route>

            {/* User-only routes */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/requisition" element={<Requisition />} />
              <Route path="/request-list" element={<RequestList />} />
              <Route path="/search-items" element={<SearchItems />} />
              <Route path="/return-items" element={<ReturnItems />} />
              <Route path="/capex-request" element={<CapexRequest />} />
            </Route>

            <Route path="/not-authorized" element={<NotAuthorized />} />
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