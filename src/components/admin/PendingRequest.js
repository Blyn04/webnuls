import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Button, Typography, Space, Modal, Table, notification } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/PendingRequest.css";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, getDocs } from "firebase/firestore";

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

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const userRequestRef = collection(db, "userrequests");
        const querySnapshot = await getDocs(userRequestRef);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRequests(fetchedRequests);

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

  const handleApprove = () => {
    const isChecked = Object.values(checkedItems).some((checked) => checked);

    if (!isChecked) {
      setNotificationMessage("No Items selected");
      setIsNotificationVisible(true);
      return;
    }

    if (selectedRequest) {
      setApprovedRequests([...approvedRequests, selectedRequest]);
      setRequests(requests.filter((req) => req.id !== selectedRequest.id));
      setCheckedItems({});
      setIsModalVisible(false);
      setSelectedRequest(null);
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

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: "Check",
      dataIndex: "check",
      render: (_, record, index) => (
        <input
          type="checkbox"
          checked={checkedItems[`${record.id}-${index}`] || false}
          onChange={(e) =>
            setCheckedItems({
              ...checkedItems,
              [`${record.id}-${index}`]: e.target.checked,
            })
          }
        />
      ),
      width: 50,
    },
    {
      title: "Item ID",
      dataIndex: "id",
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
            <Col span={16}>
              <Title level={4}>List of Requests</Title>

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
            </Col>

            <Col span={8}>
              <Title level={4}>Approved Requests:</Title>
              {approvedRequests.length === 0 ? (
                <Text italic type="secondary">
                  No approved requests yet.
                </Text>
              ) : (
                approvedRequests.map((request, index) => (
                  <Row key={request.id} justify="space-between" align="middle">
                    <Col>
                      <Text>
                        {index + 1}. Requisition ID: {request.id}
                      </Text>
                    </Col>

                    <Col>
                      <a
                        href={`#`}
                        style={{ color: "#1890ff", textDecoration: "underline" }}
                      >
                        Download PDF
                      </a>
                    </Col>
                  </Row>
                ))
              )}
            </Col>
          </Row>

          <Modal
            title={
              <div style={{ background: "#f60", padding: "12px", color: "#fff" }}>
                <Text strong style={{ color: "#fff" }}>
                  📄 Requisition Slip
                </Text>

                <span style={{ float: "right", fontStyle: "italic" }}>
                  Requisition ID: {selectedRequest?.id}
                </span>
              </div>
            }
            open={isModalVisible}
            onCancel={handleCancel}
            width={800}
            footer={[
              <Button key="print" onClick={handlePrint}>
                Print
              </Button>,

              <Button key="return" type="default" onClick={handleReturn}>
                Return
              </Button>,

              <Button key="cancel" onClick={handleCancel}>
                Cancel
              </Button>,

              <Button key="approve" type="primary" onClick={handleApprove}>
                Approve
              </Button>,
            ]}
          >
            {selectedRequest && (
              <div style={{ padding: "20px" }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Name:</Text> {selectedRequest.userName}

                    <br />

                    <Text strong>Request Date:</Text>{" "}
                    {formatDate(selectedRequest.timestamp)}

                    <br />

                    <Text strong>Required Date:</Text>{" "}
                    {selectedRequest.dateRequired}

                    <br />

                    <Text strong>Time Needed:</Text>{" "}
                    {selectedRequest.timeFrom} -  {selectedRequest.timeTo}
                  </Col>

                  <Col span={12}>
                    <Text strong>Reason of Request:</Text>
                    <p style={{ fontSize: "12px", marginTop: 5 }}>
                      {selectedRequest.reason}
                    </p>

                    <br />

                    <Text strong>Room:</Text> {selectedRequest.room}

                    <br />

                    <Text strong>Course Code:</Text>{" "}
                    {selectedRequest.courseCode}

                    <br />

                    <Text strong>Course Description:</Text>{" "}
                    {selectedRequest.courseDescription}

                    <br />

                    <Text strong>Program:</Text>{" "}
                    {selectedRequest.program}
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 20 }}>
                  Requested Items:
                </Title>

                <Table
                  dataSource={selectedRequest.requestList}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  bordered
                />
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PendingRequest;
