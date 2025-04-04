import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Card, Col, Row, Modal, Button, message, notification } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppHeader from "./Header";
import "./styles/Dashboard.css";
import SuccessModal from "./customs/SuccessModal";

const { Content } = Layout;

// Placeholder data for requests and borrowed statistics
const salesData = [
  { name: "Apr", value: 4400 },
  { name: "May", value: 6200 },
  { name: "Jun", value: 7800 },
  { name: "Jul", value: 4800 },
  { name: "Aug", value: 9400 },
  { name: "Sep", value: 10500 },
];

const pieData = [
  { name: "Dairy/Frozen", value: 25 },
  { name: "Meat/Bread", value: 20 },
  { name: "Snacks", value: 15 },
  { name: "Drinks", value: 20 },
  { name: "Fruits", value: 20 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff4d4f"];

const Dashboard = () => {
  const [pageTitle, setPageTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState(8);
  const [lowStockItems, setLowStockItems] = useState(["Item A", "Item B", "Item C"]);
  const [borrowedStats, setBorrowedStats] = useState({
    totalBorrowed: 120,
    totalUsers: 50,
  });
  const [topBorrowedItems, setTopBorrowedItems] = useState([
    { name: "Item X", borrowedCount: 35 },
    { name: "Item Y", borrowedCount: 30 },
    { name: "Item Z", borrowedCount: 25 },
  ]);

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (location.state?.loginSuccess === true) {
      sessionStorage.setItem("isLoggedIn", "true");
      setShowModal(true);

      const newState = { ...location.state };
      delete newState.loginSuccess;
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [location.state, navigate]);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content className="content">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card title="Pending Requests">
                <p>{pendingRequests} Pending</p>
              </Card>
            </Col>

            <Col span={6}>
              <Card title="Low Stock Items">
                <ul>
                  {lowStockItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Borrowed Stats">
                <p>Total Borrowed: {borrowedStats.totalBorrowed}</p>
                <p>Total Users: {borrowedStats.totalUsers}</p>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Sales Statistics">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Top Borrowed Items">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={topBorrowedItems} dataKey="borrowedCount" outerRadius={80} label>
                      {topBorrowedItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Content>

        <SuccessModal isVisible={showModal} onClose={closeModal} />
      </Layout>
    </Layout>

  );
};

export default Dashboard;
