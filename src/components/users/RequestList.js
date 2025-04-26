import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Table,
  Button,
  Typography,
  Modal,
  message,
  Spin,
} from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig";
import { getAuth } from "firebase/auth";
import NotificationModal from "../customs/NotificationModal"; 

const { Content } = Layout;
const { Title } = Typography;

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState(false);
  const [userName, setUserName] = useState("User");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const fetchUserName = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "Unknown User");
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in localStorage.");

      const querySnapshot = await getDocs(collection(db, `accounts/${userId}/userRequests`));
      const fetched = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const enrichedItems = await Promise.all(
          (data.filteredMergedData || []).map(async (item) => {
            const inventoryId = item.selectedItemId || item.selectedItem?.value;
            let itemId = "N/A";

            if (inventoryId) {
              try {
                const invDoc = await getDoc(doc(db, `inventory/${inventoryId}`));
                if (invDoc.exists()) {
                  itemId = invDoc.data().itemId || "N/A";
                }

              } catch (err) {
                console.error(`Error fetching inventory item ${inventoryId}:`, err);
              }
            }

            return {
              ...item,
              itemIdFromInventory: itemId,
            };
          })
        );

        fetched.push({
          id: docSnap.id,
          dateRequested: data.timestamp
            ? new Date(data.timestamp.seconds * 1000).toLocaleDateString()
            : "N/A",
          dateRequired: data.dateRequired || "N/A",
          requester: data.userName || "Unknown",
          room: data.room || "N/A",
          timeNeeded: `${data.timeFrom || "N/A"} - ${data.timeTo || "N/A"}`,
          courseCode: data.program || "N/A",
          courseDescription: data.reason || "N/A",
          items: enrichedItems,
          status: "PENDING",
          message: data.reason || "",
          usageType: data.usageType || "",
        });
      }

      const sortedByDate = fetched.sort((a, b) => {
        const dateA = new Date(a.dateRequested);
        const dateB = new Date(b.dateRequested);
        return dateB - dateA; 
      });
      
      setRequests(sortedByDate);      

    } catch (err) {
      console.error("Error fetching requests:", err);
      setNotificationMessage("Failed to fetch user requests.");
      setNotificationVisible(true);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUserName();
  }, []);

  const handleCancelRequest = async () => {
    try {
      const userId = localStorage.getItem("userId");
  
      if (!userId || !selectedRequest?.id) {
        throw new Error("Missing user ID or selected request ID.");
      }
  
      const userRequestRef = doc(db, `accounts/${userId}/userRequests`, selectedRequest.id);
      const activityLogRef = doc(db, `accounts/${userId}/historylog`, selectedRequest.id);
  
      // Fetch request data before deleting
      const requestSnap = await getDoc(userRequestRef);
      if (!requestSnap.exists()) throw new Error("Request not found.");
  
      const requestData = requestSnap.data();
  
      // Write to activity log
      await setDoc(activityLogRef, {
        ...requestData,
        status: "CANCELLED",
        cancelledAt: new Date(),
      });
  
      // Delete from userRequests subcollection
      await deleteDoc(userRequestRef);
  
      // Find and delete from root userrequests collection
      const rootQuery = query(
        collection(db, "userrequests"),
        where("accountId", "==", userId),
        where("timestamp", "==", requestData.timestamp) // Assumes timestamp is unique for each request
      );
  
      const rootSnap = await getDocs(rootQuery);
      const batchDeletes = [];
  
      rootSnap.forEach((docSnap) => {
        batchDeletes.push(deleteDoc(doc(db, "userrequests", docSnap.id)));
      });
  
      await Promise.all(batchDeletes);
      setIsCancelVisible(false);

      setNotificationMessage("Request successfully canceled and logged.");
      setNotificationVisible(true);
      setSelectedRequest(null);
      setViewDetailsModalVisible(false);
      fetchRequests();

    } catch (err) {
      console.error("Error canceling request:", err);
      setNotificationMessage("Failed to cancel the request.");
      setNotificationVisible(true);
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
      render: (_, record) => (
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
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Item ID",
      dataIndex: "itemIdFromInventory",
      key: "itemIdFromInventory",
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
                pagination={{ pageSize: 10 }}
                rowKey="id"
                className="pending-table"
              />
            )}
          </div>

          <Modal
            title={`Request Details - ${selectedRequest?.id}`}
            open={viewDetailsModalVisible}
            onCancel={handleModalClose}
            footer={[
              <Button key="close" onClick={handleModalClose}>
                Close
              </Button>,
              
              <Button
                key="cancel"
                danger
                onClick={() => setIsCancelVisible(true)}
                icon={<CloseOutlined />}
              >
                Cancel Request
              </Button>,
            ]}
          >
            {selectedRequest && (
              <>
                <p><strong>Requester:</strong> {selectedRequest.requester}</p>
                <p><strong>Requisition Date:</strong> {selectedRequest.dateRequested}</p>
                <p><strong>Date Required:</strong> {selectedRequest.dateRequired}</p>
                <p><strong>Time Needed:</strong> {selectedRequest.timeNeeded}</p>
                <p><strong>Course Code:</strong> {selectedRequest.courseCode}</p>
                <p><strong>Course Description:</strong> {selectedRequest.courseDescription}</p>
                <p><strong>Room:</strong> {selectedRequest.room}</p>
                <p><strong>Usage Type:</strong> {selectedRequest.usageType}</p>
                <Title level={5}>Requested Items:</Title>
                <Table
                  columns={itemColumns}
                  dataSource={selectedRequest.items}
                  rowKey={(_, index) => index}
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

      <NotificationModal
        isVisible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        message={notificationMessage}
      />

    </Layout>
  );
};

export default RequestList;
