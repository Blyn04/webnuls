import React, { useState } from "react";
import { Layout, Row, Col, Card, Button, Typography, Space, Modal, Table } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/PendingRequest.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const PendingRequest = () => {
  const [pageTitle, setPageTitle] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [requests, setRequests] = useState([
    {
      id: "Req0002",
      name: "Ma. Nadine Faye Rufo",
      requisitionDate: "Sept. 28, 2025",
      requiredDate: "Oct. 7, 2025",
      department: "Medical Technology",
      reason:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      items: [
        { id: "Med02", description: "Syringe", quantity: "24 pieces" },
        { id: "Med02", description: "Syringe", quantity: "24 pieces" },
        { id: "Med02", description: "Syringe", quantity: "24 pieces" },
      ],
    },
    {
      id: "Req0004",
      name: "Mikmik Dubu",
      requisitionDate: "Sept. 28, 2025",
      requiredDate: "Oct. 7, 2025",
      department: "Nursing",
      reason: "For training purposes in laboratory simulations.",
      items: [{ id: "Med03", description: "Gauze", quantity: "10 packs" }],
    },
  ]);

  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
  ];
  

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar setPageTitle={setPageTitle} />

      <Layout>
        <AppHeader pageTitle={pageTitle} />

        <Content style={{ margin: "20px" }}>
          <Title level={2} style={{ marginBottom: 20 }}>
            📋 Pending Requests
          </Title>

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

                  <Row justify="end" style={{ marginTop: 8 }}>
                    <Col>
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
                    <Text strong>Name:</Text> {selectedRequest.name}

                    <br />

                    <Text strong>Request Date:</Text>{" "}
                    {selectedRequest.requisitionDate}

                    <br />

                    <Text strong>Required Date:</Text>{" "}
                    {selectedRequest.requiredDate}
                  </Col>

                  <Col span={12}>
                    <Text strong>Reason of Request:</Text>
                    <p style={{ fontSize: "12px", marginTop: 5 }}>
                      {selectedRequest.reason}
                    </p>
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

export default PendingRequest;
