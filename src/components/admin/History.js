import React, { useState } from "react";
import { Layout, Table, Button, Modal, Typography, Row, Col } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/History.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const History = () => {
  const [pageTitle, setPageTitle] = useState("");

  const [historyData, setHistoryData] = useState([
    {
      id: "1",
      date: "January 25, 2025",
      status: "Approved",
      requestor: "Rich James Lozano",
      requestedItems: "Pen, Paper, Pencil...",
      requisitionId: "Reg0001",
      reason:
        "Classroom supplies for the upcoming semester to facilitate effective learning.",
      department: "Education",
    },
    {
      id: "2",
      date: "January 25, 2025",
      status: "Declined",
      requestor: "Rich James Lozano",
      requestedItems: "Markers",
      requisitionId: "Reg0002",
      reason:
        "Additional markers for lecture presentations and classroom activities.",
      department: "Arts",
    },
    {
      id: "3",
      date: "January 20, 2025",
      status: "Declined",
      requestor: "Henreizh Nathan H. Aruta",
      requestedItems: "Centrifuge",
      requisitionId: "Reg0003",
      reason: "Replacement centrifuge for medical laboratory experiments.",
      department: "Medical Technology",
    },
    {
      id: "4",
      date: "January 10, 2025",
      status: "Approved",
      requestor: "Berlene Bernabe",
      requestedItems: "Medicine",
      requisitionId: "Reg0004",
      reason: "Stock replenishment for the laboratory.",
      department: "Pharmacy",
    },
    {
      id: "5",
      date: "December 25, 2025",
      status: "Approved",
      requestor: "Tristan Jay Aquino",
      requestedItems: "Syringe",
      requisitionId: "Reg0005",
      reason: "Supplies for medical training and practice.",
      department: "Nursing",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const columns = [
    {
      title: "Process Date",
      dataIndex: "date",
      key: "date",
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
      title: "Requestor",
      dataIndex: "requestor",
      key: "requestor",
    },
    {
      title: "Requested Items",
      dataIndex: "requestedItems",
      key: "requestedItems",
      render: (text) => <i>{text}</i>,
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <a
          href="#"
          className="view-details"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </a>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>

      <Layout>
        <Content style={{ margin: "20px" }}>
          <Table
            dataSource={historyData}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        </Content>
               
        <Modal
          title="📄 Requisition Slip"
          visible={modalVisible}
          onCancel={closeModal}
          footer={[
            <Button key="close" onClick={closeModal}>
              Back
            </Button>,
          ]}
          width={800}
        >
          {selectedRequest && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Name:</Text> {selectedRequest.requestor}
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Text italic>Requisition ID: {selectedRequest.requisitionId}</Text>
                </Col>
              </Row>
              <Row gutter={[16, 8]} style={{ marginTop: 10 }}>
                <Col span={12}>
                  <Text strong>Request Date:</Text> Sept. 28, 2025
                </Col>
                <Col span={12}>
                  <Text strong>Required Date:</Text> Oct. 7, 2025
                </Col>
              </Row>
              <Row gutter={[16, 8]} style={{ marginTop: 10 }}>
                <Col span={24}>
                  <Text strong>Requested Items:</Text>{" "}
                  <Text style={{ color: "green" }}>
                    ({selectedRequest.status})
                  </Text>
                </Col>
              </Row>

              <Table
                dataSource={[
                  {
                    key: "1",
                    itemId: selectedRequest.requisitionId,
                    itemDescription: selectedRequest.requestedItems,
                    quantity: 1,
                  },
                ]}
                columns={[
                  {
                    title: "Item ID",
                    dataIndex: "itemId",
                    key: "itemId",
                  },
                  {
                    title: "Item Description",
                    dataIndex: "itemDescription",
                    key: "itemDescription",
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                  },
                ]}
                pagination={false}
                style={{ marginTop: 10 }}
              />
              <Row gutter={[16, 8]} style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Text strong>Reason of Request:</Text>
                  <p>{selectedRequest.reason}</p>
                </Col>
                <Col span={12}>
                  <Text strong>Department:</Text> {selectedRequest.department}
                  <br />
                  <Text strong>Process Date:</Text> {selectedRequest.date}
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Layout>
    </Layout>
  );
};

export default History;
