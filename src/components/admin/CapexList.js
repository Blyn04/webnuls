import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Typography, Table, Modal, Button } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, onSnapshot } from "firebase/firestore";
import "../styles/adminStyle/CapexList.css";

const { Content } = Layout;
const { Title } = Typography;

const CapexList = () => {
  const [requests, setRequests] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);

  useEffect(() => {
    const userRequestRef = collection(db, "capexrequestlist");
  
    const unsubscribe = onSnapshot(userRequestRef, (querySnapshot) => {
      const fetched = [];
  
      querySnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          ...data,
        });
      });
  
      setRequests(fetched);
    }, (error) => {
      console.error("Error fetching requests in real-time: ", error);
    });
  
    return () => unsubscribe(); // Clean up listener on component unmount
  }, []);  

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewDetails = (record) => {
    setSelectedRowDetails(record);
    setViewModalVisible(true);
  };

  const columns = [
    {
      title: "Requestor",
      dataIndex: "userName",
      render: (text, record, index) => (
        <span>
          {index + 1}. <strong>{text}</strong>
        </span>
      ),
    },
    {
      title: "Submission Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => createdAt?.toDate().toLocaleString(),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `₱${price?.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetails(record)}>
          View
        </Button>
      ),
    },
  ];

  const itemsColumns = [
    {
      title: "Item Description",
      dataIndex: "itemDescription",
      key: "itemDescription",
    },
    {
      title: "Justification",
      dataIndex: "justification",
      key: "justification",
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Estimated Cost",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
      render: (cost) => `₱${cost?.toLocaleString()}`,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `₱${price?.toLocaleString()}`,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "20px" }}>
        <Row gutter={24}>
          <Col span={24}>
            <Title level={4}>List of Requests</Title>
            <Table
              dataSource={requests}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={columns}
            />
          </Col>
        </Row>
      </Content>

      <Modal
        title="CAPEX Request Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
        zIndex={1026}
      >
        {selectedRowDetails && (
          <div>
            <p><strong>User Name:</strong> {selectedRowDetails.userName}</p>
            <p><strong>Total Price:</strong> ₱{selectedRowDetails.totalPrice?.toLocaleString()}</p>
            <p><strong>Submission Date:</strong> {selectedRowDetails.createdAt?.toDate().toLocaleString()}</p>

            <h3>Items:</h3>
            <Table
              dataSource={selectedRowDetails.items}
              columns={itemsColumns}
              pagination={false}
              rowKey="itemDescription" 
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default CapexList;
