// AppController.js
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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

const AppController = () => {
  const handleSignOut = () => {
    localStorage.removeItem("userId");  
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("userPosition");
  };

  return (
    <BrowserRouter>
      <SessionTimeout onLogout={handleSignOut} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/inventory" element={<ProtectedRoute element={<Inventory />} />} />
        <Route path="/pending-request" element={<ProtectedRoute element={<PendingRequest />} />} />
        <Route path="/borrow-catalog" element={<ProtectedRoute element={<BorrowCatalog />} />} />
        <Route path="/history" element={<ProtectedRoute element={<History />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/accounts" element={<ProtectedRoute element={<AccountManagement />} />} />
        <Route path="/requisition" element={<ProtectedRoute element={<Requisition />} />} />
        <Route path="/request-list" element={<ProtectedRoute element={<RequestList />} />} />
        <Route path="/activity-log" element={<ProtectedRoute element={<ActivityLog />} />} />
        <Route path="/search-items" element={<ProtectedRoute element={<SearchItems />} />} />
        <Route path="/capex-request" element={<ProtectedRoute element={<CapexRequest />} />} />
        <Route path="/return-items" element={<ProtectedRoute element={<ReturnItems />} />} />
        <Route path="/main/*" element={<ProtectedRoute element={<LayoutMain />} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppController;
