import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
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
import LayoutMain from './LayoutMain';
import ProtectedRoute from './ProtectedRoute'; 
import SessionTimeout from './SessionTimeout'; 
import HistoryLog from './users/HistoryLog';
import RequestLog from './admin/RequestLog';
import AdminActivityLog from './admin/AdminActivityLog';

const AppWrapper = () => {
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem("userId");  
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("userPosition");
  };

  const shouldShowTimeout = location.pathname !== '/';

  return (
    <>
      {shouldShowTimeout && <SessionTimeout onLogout={handleSignOut} />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/main/*" element={<LayoutMain />} />
        </Route>
      </Routes>
    </>
  );
};

const AppController = () => (
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);

export default AppController;
