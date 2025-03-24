import React, { useState, useEffect } from "react";
import { Layout, Card, Col, Row, Modal, Button, message, notification  } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppHeader from "./Header";
import "./styles/Dashboard.css";
import SuccessModal from "./customs/SuccessModal";

const { Content } = Layout;

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

  useEffect(() => {
    if (location.state?.loginSuccess === true) {
      setShowModal(true);
    }
  }, [location.state]);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      
      <Sidebar setPageTitle={setPageTitle} />

      <Layout>
        <AppHeader pageTitle={pageTitle}  role={location.state?.role} />

        <Content className="content">
          <Row gutter={[16, 16]}>

            <Col span={12}>
              <Card title="Sales Overview" bordered>
                <p>Annual Sales: £12,458</p>
                <p>Annual Profit: £8,248</p>
                <p>Daily Sales: £880</p>
                <p>Daily Profit: £11,578</p>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Purchase Overview" bordered>
                <p>No. of Purchases: 46</p>
                <p>Cancelled Orders: 05</p>
                <p>Purchase Amount: £828</p>
                <p>Returns: 08</p>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>          
            <Col span={16}>
              <Card title="Sales Statistics" bordered>
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

            <Col span={8}>
              <Card title="Top Selling Items" bordered>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={80} label>
                      {pieData.map((entry, index) => (
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
