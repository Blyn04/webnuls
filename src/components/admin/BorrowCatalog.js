import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Table, Input, Button, Typography } from "antd";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/BorrowCatalog.css";
import ApprovedRequestModal from "../customs/ApprovedRequestModal";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const BorrowCatalog = () => {
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // useEffect(() => {
  //   const fetchCatalogData = async () => {
  //     try {
  //       const borrowCatalogCollection = collection(db, "borrowcatalog");
  //       const borrowCatalogSnapshot = await getDocs(borrowCatalogCollection);
  //       const catalogData = borrowCatalogSnapshot.docs.map((doc) => {
  //         const data = doc.data();

  //         const formatDate = (timestamp) => {
  //           return timestamp instanceof Date ? timestamp.toLocaleDateString() : "N/A";
  //         };          

  //         const requestedItems = Array.isArray(data.requestList)
  //           ? data.requestList.map((item) => ({
  //               itemId: item.itemIdFromInventory,
  //               itemName: item.itemName,
  //               quantity: item.quantity,
  //               category: item.category,
  //               condition: item.condition,
  //               department: item.department,
  //               labRoom: item.labRoom,
  //             }))
  //           : [];

  //         return {
  //           id: doc.id,
  //           timestamp: data.timestamp || null,
  //           requestor: data.userName || "N/A",
  //           userName: data.userName || "N/A",
  //           approvedBy: data.approvedBy || "N/A",
  //           formatDate,
  //           reason: data.reason || "N/A",
  //           dateRequired: data.dateRequired || "N/A",
  //           timeFrom: data.timeFrom || "N/A",
  //           timeTo: data.timeTo || "N/A",
  //           courseDescription: data.courseDescription || "N/A",
  //           courseCode: data.courseCode || "N/A",
  //           program: data.program || "N/A",
  //           room: data.room || "N/A",
  //           requestList: Array.isArray(data.requestList) ? data.requestList : [],
  //           requestedItems,
  //           status: data.status || "Pending",
  //         };
  //       });

  //       const sortedCatalogData = catalogData.sort((a, b) => {
  //         if (a.timestamp && b.timestamp) {
  //           const timeA = a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000;
  //           const timeB = b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000;
  //           return timeB - timeA;  // Sort by precise timestamp including nanoseconds, most recent first
  //         }
  //         return 0;
  //       });

  //       setCatalog(sortedCatalogData);

  //     } catch (error) {
  //       console.error("Error fetching borrow catalog:", error);
  //     }
  //   };

  //   fetchCatalogData();
  // }, []);

  useEffect(() => {
    const fetchCatalogData = () => {
      try {
        // Set up real-time listener using onSnapshot
        const borrowCatalogRef = collection(db, "borrowcatalog");

        const unsubscribe = onSnapshot(borrowCatalogRef, (snapshot) => {
          const catalogData = snapshot.docs.map((doc) => {
            const data = doc.data();

            const formatDate = (timestamp) => {
              return timestamp instanceof Date ? timestamp.toLocaleDateString() : "N/A";
            };

            const requestedItems = Array.isArray(data.requestList)
              ? data.requestList.map((item) => ({
                  itemId: item.itemIdFromInventory,
                  itemName: item.itemName,
                  quantity: item.quantity,
                  category: item.category,
                  condition: item.condition,
                  department: item.department,
                  labRoom: item.labRoom,
                }))
              : [];

            return {
              id: doc.id,
              timestamp: data.timestamp || null,
              requestor: data.userName || "N/A",
              userName: data.userName || "N/A",
              approvedBy: data.approvedBy || "N/A",
              formatDate,
              reason: data.reason || "N/A",
              dateRequired: data.dateRequired || "N/A",
              timeFrom: data.timeFrom || "N/A",
              timeTo: data.timeTo || "N/A",
              courseDescription: data.courseDescription || "N/A",
              courseCode: data.courseCode || "N/A",
              program: data.program || "N/A",
              room: data.room || "N/A",
              requestList: Array.isArray(data.requestList) ? data.requestList : [],
              requestedItems,
              status: data.status || "Pending",
            };
          });

          // Sort catalog data by timestamp, most recent first
          const sortedCatalogData = catalogData.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              const timeA = a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000;
              const timeB = b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000;
              return timeB - timeA;
            }
            return 0;
          });

          setCatalog(sortedCatalogData);
        });

        // Cleanup listener when component unmounts
        return () => unsubscribe();
        
      } catch (error) {
        console.error("Error fetching borrow catalog:", error);
      }
    };

    fetchCatalogData();
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const filteredCatalog = catalog.filter(
    (item) =>
      item.requestor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dateRequired?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: "Requestor",
      dataIndex: "requestor",
      key: "requestor",
    },
    {
      title: "Course Description",
      dataIndex: "courseDescription",
      key: "courseDescription",
    },
    {
      title: "Date Required",
      dataIndex: "dateRequired",
      key: "dateRequired",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Text
          style={{
            color: status === "Approved" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <a
          href="#"
          className="view-details"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </a>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    console.log("Selected Record:", record);
    setSelectedRequest(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
  
    try {
      // If it's a Firestore Timestamp object
      if (timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
  
      // If it's already a string or Date object
      const date = new Date(timestamp);
      if (isNaN(date)) return "N/A";
      
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      
    } catch (e) {
      return "N/A";
    }
  };
  
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px" }}>
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Search
                placeholder="Search"
                allowClear
                enterButton
                onSearch={handleSearch}
              />
            </Col>
            <Col>
              <Button type="default" onClick={() => setSearchQuery("")}>
                All
              </Button>
            </Col>
          </Row>

          <Table
            className="borrow-catalog-table"
            dataSource={filteredCatalog}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
          />

          <ApprovedRequestModal
            isApprovedModalVisible={isModalVisible}
            setIsApprovedModalVisible={setIsModalVisible}
            selectedApprovedRequest={selectedRequest}
            setSelectedApprovedRequest={setSelectedRequest}
            columns={columns}
            formatDate={formatDate}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BorrowCatalog;
