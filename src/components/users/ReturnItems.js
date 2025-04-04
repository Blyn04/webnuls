import React, { useState } from "react";
import { Layout, Row, Col, Card, Button, Typography, Space, Modal, Table, notification } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/ReturnItems.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const ReturnItems = () => {
  const [pageTitle, setPageTitle] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [requests, setRequests] = useState([
    {
      id: "Req0002",
      name: "Ma. Nadine Faye Rufo",
      requisitionDate: "Sept. 28, 2025",
      requiredDate: "Oct. 7, 2025",
      department: "Medical Technology",
      reason:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      room: "Lab 203",
      courseCode: "MEDTECH101",
      courseDescription: "Introduction to Medical Technology",
      timeNeeded: "9:00 AM - 12:00 PM",
      items: [
        {
          id: "Med02",
          description: "Syringe",
          quantity: "24 pieces",
          category: "Equipment",
          itemCondition: "New",
        },
      ],
    },
    {
      id: "Req0004",
      name: "Mikmik Dubu",
      requisitionDate: "Sept. 28, 2025",
      requiredDate: "Oct. 7, 2025",
      department: "Nursing",
      reason: "For training purposes in laboratory simulations.",
      room: "Lab 105",
      courseCode: "NURS102",
      courseDescription: "Advanced Nursing Procedures",
      timeNeeded: "1:00 PM - 4:00 PM",
      items: [
        {
          id: "Med03",
          description: "Gauze",
          quantity: "10 packs",
          category: "Supplies",
          itemCondition: "Good",
        },
      ],
    },
  ]);

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
      Modal.warning({
        title: "No Items Selected",
        content: "Please select at least one item before approving.",
      });
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
      dataIndex: "description",
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
      dataIndex: "itemCondition",
    },
  ];
  

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
                        Requestor: {" "}
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
                        Requisition Date: {request.requisitionDate}
                      </Text>

                      <br />

                      <Text type="secondary">
                        Required Date: {request.requiredDate}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              ))}
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
              <Button key="return" type="default" onClick={handleReturn}>
                Return
              </Button>,

              <Button key="cancel" onClick={handleCancel}>
                Cancel
              </Button>,
            ]}
          >
            {selectedRequest && (
              <div style={{ padding: "20px" }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Name:</Text> {selectedRequest.name}

                    <br />

                    <Text strong>Request Date:</Text>{" "}
                    {selectedRequest.requisitionDate}

                    <br />

                    <Text strong>Required Date:</Text>{" "}
                    {selectedRequest.requiredDate}

                    <br />

                    <Text strong>Time Needed:</Text>{" "}
                    {selectedRequest.timeNeeded}
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

                    <Text strong>Department:</Text>{" "}
                    {selectedRequest.department}
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 20 }}>
                  Requested Items:
                </Title>
                
                <Table
                  dataSource={selectedRequest.items}
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

export default ReturnItems;
