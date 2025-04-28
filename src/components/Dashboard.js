import React, { useState, useEffect } from "react";
import { useNavigate,  useLocation } from "react-router-dom";
import { Layout, Card, Col, Row, Table, List } from "antd";
import { db } from "../backend/firebase/FirebaseConfig"; 
import { collectionGroup, query, where, getDocs, onSnapshot } from "firebase/firestore";
import SuccessModal from "./customs/SuccessModal";
import CustomCalendar from "./customs/CustomCalendar";
import "./styles/Dashboard.css";

const { Content } = Layout;

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [borrowCatalogCount, setBorrowCAtalogCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const [topProducts, setTopProducts] = useState([
    { title: "Raspberry Pi", sold: 6, quantity: 10 },
    { title: "Arduino Nano", sold: 4, quantity: 4 },
    { title: "DHT Sensor", sold: 3, quantity: 3 },
    { title: "PIR Passive Infrared Sensor", sold: 1, quantity: 5 },
    { title: "Electronics Project Enclosure Case Box", sold: 1, quantity: 5 },
  ]);

  const [latestSales, setLatestSales] = useState([
    { key: 1, name: "Arduino Nano", date: "2019-02-03", total: "$10.00" },
    { key: 2, name: "Raspberry Pi", date: "2019-02-03", total: "$100.00" },
    { key: 3, name: "Electronics Project Enclosure Case Box", date: "2019-02-03", total: "$30.00" },
    { key: 4, name: "PIR Passive Infrared Sensor", date: "2019-02-03", total: "$6.00" },
  ]);

  const [recentProducts, setRecentProducts] = useState([
    { title: "PIR Passive Infrared Sensor", category: "Sensors", price: "$5" },
    { title: "Electronics Project Enclosure Case Box", category: "Electronics", price: "$30" },
  ]);

  useEffect(() => {
    const q = collectionGroup(db, "userrequests");

    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPendingRequestCount(querySnapshot.size);

    }, (error) => {
      console.error("Error fetching pending requests:", error);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = collectionGroup(db, "borrowcatalog");

    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setBorrowCAtalogCount(querySnapshot.size);

    }, (error) => {
      console.error("Error fetching pending requests:", error);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.loginSuccess === true) {
      setShowModal(true);
    }
  }, [location.state]);

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
    if (location.state?.loginSuccess) {
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

  const summaryCards = [
    { title: "Pending Requests", count: pendingRequestCount, color: "#a0d911", icon: "📄" },
    { title: "Borrow Catalog", count: borrowCatalogCount, color: "#fa541c", icon: "📋" },
    { title: "Products", count: 7, color: "#13c2c2", icon: "🛒" },
    { title: "Sales", count: 15, color: "#faad14", icon: "💵" },
  ];

  const salesColumns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Total Sale",
      dataIndex: "total",
      key: "total",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content className="content">

          <Row gutter={[16, 16]}>
            {summaryCards.map((card, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  className="summary-card"
                  style={{ backgroundColor: card.color, cursor: card.title === "Pending Requests" ? "pointer" : "default" }}
                  onClick={() => {
                    if (card.title === "Pending Requests") {
                      navigate("/main/pending-request"); 
                    }

                    if (card.title === "Borrow Catalog") {
                      navigate("/main/borrow-catalog"); 
                    }
                  }}
                >
                  <div className="summary-card-content">
                    <div className="summary-card-icon">{card.icon}</div>
                    <div>
                      <h3>{card.count}</h3>
                      <p>{card.title}</p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Main Content - Highest Sale / Latest Sales / Recent Products */}
          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col xs={24} md={8}>
              <Card title="Highest Sale Products">
                <List
                  dataSource={topProducts}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <span>{item.title}</span>
                        <span>{item.sold} Sold / {item.quantity} Qty</span>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Latest Sales">
                <Table
                  dataSource={latestSales}
                  columns={salesColumns}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Recently Added Products">
                <List
                  dataSource={recentProducts}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div>{item.title}</div>
                          <small style={{ color: "#999" }}>{item.category}</small>
                        </div>
                        <div style={{ fontWeight: "bold" }}>{item.price}</div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Row style={{ marginTop: "20px" }}>
            <Col>
              <div className="calendar-wrapper">
                <CustomCalendar />
              </div>
            </Col>
          </Row>

        </Content>
        <SuccessModal isVisible={showModal} onClose={closeModal} />
      </Layout>
    </Layout>
  );
};

export default Dashboard;
