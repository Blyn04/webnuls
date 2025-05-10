import React, { useState, useEffect } from "react";
import { useNavigate,  useLocation } from "react-router-dom";
import { Layout, Card, Col, Row, Table, List, Modal } from "antd";
import { db } from "../backend/firebase/FirebaseConfig"; 
import { collectionGroup, query, where, getDocs, onSnapshot, collection, orderBy, limit } from "firebase/firestore";
import SuccessModal from "./customs/SuccessModal";
import CustomCalendar from "./customs/CustomCalendar";
import PoliciesModal from "./Policies";
import "./styles/Dashboard.css";
 
 const { Content } = Layout;
 
 const Dashboard = () => {
   const [showModal, setShowModal] = useState(false);
   const [pendingRequestCount, setPendingRequestCount] = useState(0);
   const [borrowCatalogCount, setBorrowCAtalogCount] = useState(0);
   const [predictedSales, setPredictedSales] = useState(null);  
   const [productTrends, setProductTrends] = useState([]);  
   const [showPolicies, setShowPolicies] = useState(false); 
   const [selectedDate, setSelectedDate] = useState(null);
   const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);
   const [recentProducts, setRecentProducts] = useState([]);
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

    // Fetch AI-based sales predictions and product trends
    useEffect(() => {
        // Replace with your AI-powered API endpoints once your Blaze plan is active
        fetch('/api/predict-sales')  // Example endpoint for sales prediction
          .then((res) => res.json())
          .then((data) => {
            setPredictedSales(data.prediction);  // Update predicted sales state
          });

        fetch('/api/product-trends')  
          .then((res) => res.json())
          .then((data) => {
            setProductTrends(data.trends);  
          });
    }, []);

    useEffect(() => {
      // Query to fetch recent products ordered by 'entryDate' and limit to a certain number (e.g., last 5 products)
      const fetchRecentProducts = async () => {
        const productsRef = collection(db, "inventory"); // Assuming "inventory" is the collection name

        // Query to fetch the most recent products
        const q = query(
          productsRef, 
          orderBy("entryDate", "desc"),  // Order by the entry date in descending order
          limit(5)  // Limit the number of recent products (e.g., 5)
        );

        const querySnapshot = await getDocs(q);
        const recentItems = [];

        querySnapshot.forEach((doc) => {
          recentItems.push(doc.data());
        });

        setRecentProducts(recentItems);  // Set the fetched data to the state
        };

        fetchRecentProducts();
    }, []);
 
   const closeModal = () => {
    setShowModal(false);        
    setShowPolicies(true);      
   };
  
   const closePolicies = () => {
    setShowPolicies(false);    
   };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    const selectedDateStr = date.format("YYYY-MM-DD"); 

    const q = query(
      collection(db, "borrowcatalog"),
      where("dateRequired", "==", selectedDateStr)
      // Removed the status == "Approved" filter
    );

    const querySnapshot = await getDocs(q);
    const items = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.requestList)) {
        data.requestList.forEach((item) => {
          items.push({
            id: doc.id,
            title: item.itemName || "Request",
            description: `Quantity: ${item.quantity} | Status: ${item.status}`,
          });
        });
      }
    });

    setEventsOnSelectedDate(items);
  };
 
   const summaryCards = [
     { title: "Pending Requests", count: pendingRequestCount, color: "#fa541c", icon: "📄" },
     { title: "Borrow Catalog", count: borrowCatalogCount, color: "#a0d911", icon: "📋" },
     { title: "Products", count: 7, color: "#13c2c2", icon: "🛒" },
     { title: "Sales", count: 15, color: "#faad14", icon: "💵" },
   ];

   const lightenColor = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R > 255 ? 255 : R) * 0x10000 +
        (G > 255 ? 255 : G) * 0x100 +
        (B > 255 ? 255 : B)
      )
        .toString(16)
        .slice(1)
    );
  };
  
 
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
 
   const [hoveredIndex, setHoveredIndex] = useState(null);
   return (
     <Layout style={{ minHeight: "100vh" }}>
       <Layout>
        <div className="summary-card-whole">
        {summaryCards.map((card, index)=>{
          const isHovered = index === hoveredIndex;
          const bgColor = isHovered
            ? lightenColor(card.color, 0.1)
            : card.color;
          return(
            <div on className="summary-card-content" style={{backgroundColor: bgColor}}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              if (card.title === "Pending Requests") {
                navigate("/main/pending-request"); 
              }

              if (card.title === "Borrow Catalog") {
                navigate("/main/borrow-catalog"); 
              }
            }}
            >
            <div className="summary-card-icon">{card.icon}</div>
            <div className="card-content-layout">
              <h3 className="card-count">{card.count}</h3>
              <div className="card-title"><p style={{margin: 0}}>{card.title}</p></div>
            </div>
          </div>
          )
            
 })}
        </div>

        <Content className="content">

          <h1 style={{fontWeight: "bold", marginTop: '20px'}}>Analytics Center</h1>
            {/* AI Analytics Section */}
            <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
              <Col xs={24} md={8}>
                <Card title="Predicted Sales">
                  <div>{predictedSales ? `$${predictedSales}` : 'Loading prediction...'}</div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card title="Product Trends">
                  <List
                    dataSource={productTrends}
                    renderItem={(item) => (
                      <List.Item>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                          <span>{item.title}</span>
                          <span>{item.salesTrend}</span> {/* Display trend data */}
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
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
                            <div>{item.itemName}</div>
                            <small style={{ color: "#999" }}>{item.category}</small>
                          </div>
                          <div>{item.entryDate}</div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Row style={{ marginTop: "20px", width: "100%" }}>
              <Col span={24}>
                <div className="calendar-wrapper">
                <CustomCalendar onSelectDate={handleDateSelect} />
                {/* <CustomCalendar onSelectDate={(date) => setSelectedDate(date)} /> */}
                </div>
              </Col>
            </Row>
          </Content>

         <SuccessModal isVisible={showModal} onClose={closeModal} />

         <PoliciesModal isOpen={showPolicies} onClose={closePolicies} />

       </Layout>
     </Layout>
   );
 };
 
 export default Dashboard;