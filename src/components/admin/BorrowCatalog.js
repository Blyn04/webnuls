import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Table, Input, Button, Typography, Modal } from "antd";
import { collection, getDocs } from "firebase/firestore";
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

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const borrowCatalogCollection = collection(db, "borrowcatalog");
        const borrowCatalogSnapshot = await getDocs(borrowCatalogCollection);
        const catalogData = borrowCatalogSnapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Format the timestamp
          const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : "N/A";
          
          // Ensure that requestList is always an array (fallback to empty array if undefined)
          const requestedItems = Array.isArray(data.requestList) ? data.requestList.map(item => ({
            itemId: item.itemIdFromInventory,
            itemName: item.itemName,
            quantity: item.quantity,
            category: item.category,
            condition: item.condition,
            department: item.department,
            labRoom: item.labRoom,
          })) : [];  // Fallback to empty array if requestList is not an array
    
          return {
            id: doc.id,
            requestor: data.userName,
            approvedBy: data.approvedBy,
            timestamp, // formatted timestamp
            requestedItems,
            reason: data.reason,
            dateRequired: data.dateRequired,
            courseDescription: data.courseDescription,
            status: data.status,
          };
        });
  
        setCatalog(catalogData);
  
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
      (item.requestor?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.dateRequired?.toLowerCase().includes(searchQuery.toLowerCase()))
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
      title: "Items",
      dataIndex: "requestedItems",
      key: "requestedItems",
      render: (requestedItems) => (
        <div>
          {requestedItems.map((item, index) => (
            <div key={index}>
              <Text>{item.itemDescription} (Qty: {item.quantity})</Text>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <a
          href={`#`}
          className="view-details"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </a>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    console.log("Selected Record:", record);  // Check the structure of the record
    setSelectedRequest(record);
    setIsModalVisible(true);
  };  

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : "N/A";
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
            pagination={{ pageSize: 5 }}
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
