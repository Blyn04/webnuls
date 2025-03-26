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

// Sample Pending Requests Data
const pendingRequests = [
  {
    id: "REQ002",
    dateRequested: "2025-09-20",
    dateRequired: "2025-09-28",
    status: "PENDING",
    requester: "Henreizh Nathan H. Aruta",
    items: [
      {
        description: "Bond Paper",
        itemId: "SPL02",
        quantity: 20,
        department: "MEDTECH",
      },
      {
        description: "Paracetamol",
        itemId: "SPL02",
        quantity: 30,
        department: "NURSING",
      },
    ],
    message: "hello, may klase kami kc, we need these thx",
  },
  {
    id: "REQ003",
    dateRequested: "2025-09-20",
    dateRequired: "2025-09-28",
    status: "PENDING",
    requester: "Henreizh Nathan H. Aruta",
    items: [
      {
        description: "Bond Paper",
        itemId: "SPL02",
        quantity: 20,
        department: "MEDTECH",
      },
      {
        description: "Paracetamol",
        itemId: "SPL02",
        quantity: 30,
        department: "NURSING",
      },
      {
        description: "Syringe",
        itemId: "SPL02",
        quantity: 10,
        department: "MEDTECH",
      },
      {
        description: "Pen",
        itemId: "SPL02",
        quantity: 15,
        department: "NURSING",
      },
    ],
    message: "hello, may klase kami kc, we need these thx",
  },
];

// Main Table Columns
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

// Requested Items Table Columns
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
];

const RequestList = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  // Handle Row Click to Show Details
  const handleRowClick = (record) => {
    setSelectedRequest(record);
  };

  // Handle Cancel Request
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
                  block
                  icon={<CloseOutlined />}
                  onClick={() => setIsCancelVisible(true)}
                  className="cancel-btn"
                >
                  Cancel Request
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
