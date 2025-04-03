import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Inventory from "./admin/Inventory";
import PendingRequest from "./admin/PendingRequest";
import BorrowCatalog from "./admin/BorrowCatalog";
import History from "./admin/History";
import Profile from "./Profile";
import AccountManagement from "./superAdmin/AccountManagement";
import Requisition from "./users/Requisition";
import RequestList from "./users/RequestList";
import ActivityLog from "./users/ActivityLog";
import SearchItems from "./users/SearchItems";
import CapexRequest from "./users/CapexRequest";
import ReturnItems from "./users/ReturnItems";
import ProtectedRoute from "./ProtectedRoute"; 

const AppController = () => {

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("userEmail");
        if (!isAuthenticated) {
          localStorage.removeItem("userEmail"); // Ensure localStorage is cleared if not logged in
        }
      }, []);

  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
};

export default AppController;
