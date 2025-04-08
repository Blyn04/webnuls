import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Table,
  Button,
  Card,
  Typography,
  Modal,
  message,
  Spin,
} from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig"; // Adjust path if different
import { getAuth } from "firebase/auth"; // Import Firebase Auth to get the current user

const { Content } = Layout;
const { Title } = Typography;

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState(false);
  const [userName, setUserName] = useState("User");

  const storedName = localStorage.getItem("userName");

  // Fetch the current user's name from Firebase Authentication
  const fetchUserName = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "Unknown User");
    } else {
      setUserName("Unknown User");
    }
  };

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts/7Gy44baolf72J0T8yq3u/userRequests"));
      const fetched = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          dateRequested: new Date(data.timestamp.seconds * 1000).toLocaleDateString(),
          dateRequired: data.dateRequired,
          requester: data.name || "Unknown",
          room: data.room,
          timeNeeded: `${data.timeFrom} - ${data.timeTo}`,
          courseCode: data.program || "N/A",
          courseDescription: data.reason || "N/A",
          items: data.requestList || [],
          status: "PENDING", // assuming static for now
          message: data.reason || "",
        });
      });

      setRequests(fetched);
    } catch (err) {
      console.error("Error fetching requests:", err);
      message.error("Failed to fetch user requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUserName(); // Fetch user name on component mount
  }, []);

  const handleCancelRequest = async () => {
    try {
      const requestRef = doc(db, "accounts/7Gy44baolf72J0T8yq3u/userRequests", selectedRequest.id);
      await updateDoc(requestRef, { status: "CANCELLED" }); // Update request status to CANCELLED
      message.success("Request successfully canceled!");
      setSelectedRequest(null);
      setIsCancelVisible(false);
    } catch (err) {
      console.error("Error canceling request:", err);
      message.error("Failed to cancel the request.");
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setViewDetailsModalVisible(true);
  };

  const handleModalClose = () => {
    setViewDetailsModalVisible(false);
    setSelectedRequest(null);
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Requisition Date",
      dataIndex: "dateRequested",
      key: "dateRequested",
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
        <Button type="text" className="status-btn">
          {status}
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button onClick={() => handleViewDetails(record)} type="primary">
          View Details
        </Button>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Item #",
      key: "index",
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Item ID",
      dataIndex: "itemId",
      key: "itemId",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) => (
        <span
          style={{
            color: department === "MEDTECH" ? "magenta" : "orange",
            fontWeight: "bold",
          }}
        >
          {department}
        </span>
      ),
    },
    {
      title: "Usage Type",
      dataIndex: "usageType",
      key: "usageType",
      render: (usageType) => (
        <span style={{ fontStyle: "italic", color: "#1890ff" }}>
          {usageType}
        </span>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className="site-layout">
        <Content className="pending-content">
          <div className="pending-header">
            <Title level={3}>
              <span className="icon-pending">⏳</span> Requests List
            </Title>
          </div>

          <div className="search-container">
            <Input
              placeholder="Search requests..."
              prefix={<SearchOutlined />}
              className="pending-search"
              allowClear
            />
          </div>

          <div className="pending-main">
            {loading ? (
              <Spin size="large" />
            ) : (
              <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                className="pending-table"
              />
            )}
          </div>

          <Modal
            title={`Request Details - ${selectedRequest?.id}`}
            visible={viewDetailsModalVisible}
            onCancel={handleModalClose}
            footer={[
              <Button key="close" onClick={handleModalClose}>
                Close
              </Button>,
              <Button
                key="cancel"
                danger
                onClick={handleCancelRequest}
                icon={<CloseOutlined />}
              >
                Cancel Request
              </Button>,
            ]}
          >
            {selectedRequest && (
              <>
                <p><strong>Requester:</strong> {storedName}</p> 
                <p><strong>Requisition Date:</strong> {selectedRequest.dateRequested}</p>
                <p><strong>Date Required:</strong> {selectedRequest.dateRequired}</p>
                <p><strong>Time Needed:</strong> {selectedRequest.timeNeeded}</p>
                <p><strong>Course Code:</strong> {selectedRequest.courseCode}</p>
                <p><strong>Course Description:</strong> {selectedRequest.courseDescription}</p>
                <p><strong>Room:</strong> {selectedRequest.room}</p>
                <Title level={5}>Requested Items:</Title>
                <Table
                  columns={itemColumns}
                  dataSource={selectedRequest.items}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={false}
                />
                <p><strong>Message:</strong> {selectedRequest.message || "No message provided."}</p>
              </>
            )}
          </Modal>

          <Modal
            title="Confirm Cancellation"
            open={isCancelVisible}
            onCancel={() => setIsCancelVisible(false)}
            onOk={handleCancelRequest}
            okText="Yes, Cancel"
            cancelText="No"
          >
            <p>Are you sure you want to cancel this request?</p>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RequestList;
