import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Button, Typography, Space, Modal, Table, notification } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/PendingRequest.css";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, getDocs, getDoc, doc, addDoc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import RequisitionRequestModal from "../customs/RequisitionRequestModal";
import ApprovedRequestModal from "../customs/ApprovedRequestModal";

const { Content } = Layout;
const { Title, Text } = Typography;

const PendingRequest = () => {
  const [pageTitle, setPageTitle] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [selectedApprovedRequest, setSelectedApprovedRequest] = useState(null);
  const [isApprovedModalVisible, setIsApprovedModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const userRequestRef = collection(db, "userrequests");
        const querySnapshot = await getDocs(userRequestRef);
  
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
            ...data,
            requestList: enrichedItems,
          });
        }
  
        setRequests(fetched);
  
      } catch (error) {
        console.error("Error fetching requests: ", error);
      }
    };
  
    fetchUserRequests();
  }, []);
  
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setCheckedItems({});
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const handleApprove = async () => {
    const isChecked = Object.values(checkedItems).some((checked) => checked);
  
    if (!isChecked) {
      setNotificationMessage("No Items selected");
      setIsNotificationVisible(true);
      return;
    }
  
    if (selectedRequest) {
      const filteredItems = selectedRequest.requestList.filter((item, index) => {
        const key = `${selectedRequest.id}-${index}`;
        return checkedItems[key];
      });
  
      if (filteredItems.length === 0) {
        setNotificationMessage("No Items selected");
        setIsNotificationVisible(true);
        return;
      }
  
      const enrichedItems = await Promise.all(
        filteredItems.map(async (item) => {
          const selectedItemId = item.selectedItemId || item.selectedItem?.value;
          let itemType = "Unknown";
  
          if (selectedItemId) {
            try {
              const inventoryDoc = await getDoc(doc(db, "inventory", selectedItemId));
              if (inventoryDoc.exists()) {
                itemType = inventoryDoc.data().type || "Unknown";
              }
            } catch (err) {
              console.error(`Failed to fetch type for inventory item ${selectedItemId}:`, err);
            }
          }
  
          return {
            ...item,
            selectedItemId,
            itemType, // This is "Fixed" or "Consumable"
          };
        })
      );

      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userEmail = currentUser.email;
  
      // Fetch the user name from Firestore
      let userName = "Unknown";
      try {
        const userQuery = query(collection(db, "accounts"), where("email", "==", userEmail));
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          userName = userData.name || "Unknown";
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
  
      const requestLogEntry = {
        accountId: selectedRequest.accountId || "N/A",
        userName: selectedRequest.userName || "N/A",
        room: selectedRequest.room || "N/A",
        courseCode: selectedRequest.courseCode || "N/A",
        courseDescription: selectedRequest.courseDescription || "N/A",
        dateRequired: selectedRequest.dateRequired || "N/A",
        timestamp: selectedRequest.timestamp || new Date(), 
        requestList: enrichedItems, 
        status: "Approved", 
        approvedBy: userName, 
        reason: selectedRequest.reason || "No reason provided",
      };
  
      try {
        await addDoc(collection(db, "requestlog"), requestLogEntry);
        setApprovedRequests([...approvedRequests, requestLogEntry]);
        setRequests(requests.filter((req) => req.id !== selectedRequest.id));
        setCheckedItems({});
        setIsModalVisible(false);
        setSelectedRequest(null);
  
        notification.success({
          message: "Request Approved",
          description: "Request has been approved and logged.",
        });
      } catch (error) {
        console.error("Error adding to requestlog:", error);
        notification.error({
          message: "Approval Failed",
          description: "There was an error logging the approved request.",
        });
      }
    }
  };

  const handleReturn = () => {
    if (selectedRequest) {
      setRequests([...requests, selectedRequest]);
      setApprovedRequests(
        approvedRequests.filter((req) => req.id !== selectedRequest.id)
      );

      setIsModalVisible(false);
      setSelectedRequest(null);

      setTimeout(() => {
        notification.success({
          message: "Request Returned",
          description: `Request ID ${selectedRequest.id} has been returned to the requestor.`,
          duration: 3,
        });
      }, 100);
    }
  };

  const columns = [
    {
      title: "Check",
      dataIndex: "check",
      render: (_, record, index) => (
        <input
          type="checkbox"
          checked={checkedItems[`${selectedRequest?.id}-${index}`] || false}
          onChange={(e) =>
            setCheckedItems({
              ...checkedItems,
              [`${selectedRequest?.id}-${index}`]: e.target.checked,
            })
          }         
        />
      ),
      width: 50,
    },
    {
      title: "Item ID",
      dataIndex: "itemIdFromInventory", 
      render: (text) => text || "N/A",  
    },   
    {
      title: "Item Description",
      dataIndex: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Item Condition",
      dataIndex: "condition",
    },
  ];

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const date = timestamp.toDate(); 
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px" }}>
          <Row gutter={24}>
            <Col span={24}>
            <Title level={4}>List of Requests</Title>
              <Table
                dataSource={requests}
                rowKey="id"
                onRow={(record) => ({
                  onClick: () => handleViewDetails(record),
                })}
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: "Requestor",
                    dataIndex: "userName",
                    key: "userName",
                    render: (text, record, index) => (
                      <span>
                        {index + 1}. <strong>{text}</strong>
                      </span>
                    ),
                  },
                  {
                    title: "Room",
                    dataIndex: "room",
                  },
                  {
                    title: "Course Code",
                    dataIndex: "courseCode",
                  },
                  {
                    title: "Course Description",
                    dataIndex: "courseDescription",
                  },
                  {
                    title: "Requisition Date",
                    dataIndex: "timestamp",
                    render: formatDate,
                  },
                  {
                    title: "Required Date",
                    dataIndex: "dateRequired",
                  },
                ]}
              />

              <div className="cards-hidden">
                {requests.map((request, index) => (
                  <Card key={request.id} className="request-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong> {index + 1}. </Text>
                        <Text strong>
                          Requestor: {request.userName}
                          <span style={{ fontWeight: "bold" }}>
                            {request.name}
                          </span>
                        </Text>
                      </Col>
                      <Col>
                        <Space size="middle">
                          <Button
                            type="link"
                            className="view-btn"
                            onClick={() => handleViewDetails(request)}
                          >
                            View Details
                          </Button>
                        </Space>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: 8 }}>
                      <Col span={18} style={{ textAlign: "left" }}>
                        <Text type="secondary">
                          Room: {request.room} | Course Code: {request.courseCode}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Course: {request.courseDescription}
                        </Text>
                      </Col>
                      <Col style={{ textAlign: "right" }}>
                        <Text type="secondary">
                          Requisition Date: {formatDate(request.timestamp)}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Required Date: {request.dateRequired}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

            </Col>
          </Row>
        </Content>

        <RequisitionRequestModal
          isModalVisible={isModalVisible}
          handleCancel={handleCancel}
          handleApprove={handleApprove}
          handleReturn={handleReturn}
          selectedRequest={selectedRequest}
          columns={columns}
          formatDate={formatDate}
        />

        <ApprovedRequestModal
          isApprovedModalVisible={isApprovedModalVisible}
          setIsApprovedModalVisible={setIsApprovedModalVisible}
          selectedApprovedRequest={selectedApprovedRequest}
          setSelectedApprovedRequest={setSelectedApprovedRequest}
          columns={columns}
          formatDate={formatDate}
        />

      </Layout>
    </Layout>
  );
};

export default PendingRequest;
