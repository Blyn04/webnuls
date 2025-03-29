import React, { useState } from "react";
import {
  Layout,
  Input,
  Table,
  Button,
  Card,
  Typography,
  Modal,
  message,
} from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/RequestList.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const pendingRequests = [
  {
    id: "REQ002",
    dateRequested: "2025-09-20",
    dateRequired: "2025-09-28",
    status: "PENDING",
    requester: "Henreizh Nathan H. Aruta",
    timeNeeded: "08:00 AM - 12:00 PM",
    courseCode: "MED101",
    courseDescription: "Basic Medical Laboratory Science",
    room: "Chemistry Lab 1",
    items: [
      {
        description: "Bond Paper",
        itemId: "SPL02",
        quantity: 20,
        department: "MEDTECH",
        usageType: "Laboratory Experiment",
      },
      {
        description: "Paracetamol",
        itemId: "SPL03",
        quantity: 30,
        department: "NURSING",
        usageType: "Research",
      },
    ],
    message: "Hello, may klase kami kc, we need these thx",
  },
  {
    id: "REQ003",
    dateRequested: "2025-09-20",
    dateRequired: "2025-09-28",
    status: "PENDING",
    requester: "Henreizh Nathan H. Aruta",
    timeNeeded: "01:00 PM - 04:00 PM",
    courseCode: "NRS202",
    courseDescription: "Pharmacology and Nursing Care",
    room: "Nursing Lab 2",
    items: [
      {
        description: "Syringe",
        itemId: "SPL04",
        quantity: 10,
        department: "MEDTECH",
        usageType: "Community Extension",
      },
      {
        description: "Pen",
        itemId: "SPL05",
        quantity: 15,
        department: "NURSING",
        usageType: "Others",
      },
    ],
    message: "Hello, need namin for training. Thanks!",
  },
];

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
];

const itemColumns = [
  {
    title: "Item #",
    key: "index",
    render: (text, record, index) => <span>{index + 1}</span>,
  },
  {
    title: "Item Name",
    dataIndex: "description",
    key: "description",
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

const RequestList = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  const handleRowClick = (record) => {
    setSelectedRequest(record);
  };

  const handleCancelRequest = () => {
    message.success("Request successfully canceled!");
    setSelectedRequest(null);
    setIsCancelVisible(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar setPageTitle={setPageTitle} />

      <Layout className="site-layout">
        <AppHeader pageTitle={pageTitle} />

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
            <Table
              columns={columns}
              dataSource={pendingRequests}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
              })}
              className="pending-table"
            />

            {selectedRequest && (
              <Card
                title={
                  <div className="details-header">
                    <span>Details:</span>
                    <span className="req-id">
                      <strong>ID:</strong> {selectedRequest.id}
                    </span>
                  </div>
                }
                className="details-card"
              >
                <p>
                  <strong>Requester:</strong> {selectedRequest.requester}
                </p>
                <p>
                  <strong>Requisition Date:</strong>{" "}
                  {selectedRequest.dateRequested}
                </p>
                <p>
                  <strong>Date Required:</strong> {selectedRequest.dateRequired}
                </p>
                <p>
                  <strong>Time Needed:</strong> {selectedRequest.timeNeeded}
                </p>
                <p>
                  <strong>Course Code:</strong> {selectedRequest.courseCode}
                </p>
                <p>
                  <strong>Course Description:</strong>{" "}
                  {selectedRequest.courseDescription}
                </p>
                <p>
                  <strong>Room:</strong> {selectedRequest.room}
                </p>

                <Title level={5}>Requested Items:</Title>

                <Table
                  columns={itemColumns}
                  dataSource={selectedRequest.items}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={false}
                  className="items-table"
                />

                <p style={{ marginTop: "15px" }}>
                  <strong>Message:</strong>{" "}
                  <em>{selectedRequest.message || "No message provided."}</em>
                </p>

                <Button
                  type="primary"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => setIsCancelVisible(true)}
                  className="cancel-btn"
                >
                  Cancel Request
                </Button>

                <Button
                  type="default"
                  onClick={() => setSelectedRequest(null)}
                  className="close-btn"
                  style={{ marginLeft: "8px" }}
                >
                  Close
                </Button>
              </Card>
            )}
          </div>

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
