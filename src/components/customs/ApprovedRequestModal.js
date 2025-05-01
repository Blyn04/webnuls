import React from "react";
import { Modal, Row, Col, Typography, Table, Button } from "antd";

const { Text, Title } = Typography;

const ApprovedRequestModal = ({
  isApprovedModalVisible,
  setIsApprovedModalVisible,
  selectedApprovedRequest,
  setSelectedApprovedRequest,
  formatDate,
}) => {
  // fallback to empty array if undefined
  const requestList = selectedApprovedRequest?.requestList || [];
  console.log("requestList in Modal:", requestList);

  if (selectedApprovedRequest) {
    console.log("Raw timestamp value:", selectedApprovedRequest.timestamp);
  }

  // Define your own columns for the modal
  const approvedRequestColumns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
    },
  ];

  const handleApprove = () => {
    console.log("Approve clicked for ID:", selectedApprovedRequest?.id);
    // Your approval logic goes here
  };

  return (
    <Modal
      title={
        <div style={{ background: "#389e0d", padding: "12px", color: "#fff" }}>
          <Text strong>✅ Approved Request Details</Text>
          <span style={{ float: "right", fontStyle: "italic" }}>
            Requisition ID: {selectedApprovedRequest?.id || "N/A"}
          </span>
        </div>
      }
      open={isApprovedModalVisible}
      onCancel={() => {
        setIsApprovedModalVisible(false);
        setSelectedApprovedRequest(null);
      }}
      width={800}
      footer={
        selectedApprovedRequest?.status === "returned" ? (
          <Button type="primary" onClick={handleApprove}>
            Approve
          </Button>
        ) : null
      }
    >
      {selectedApprovedRequest && (
        <div style={{ padding: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Name:</Text> {selectedApprovedRequest.userName || "N/A"}<br />
              <Text strong>Request Date:</Text>{" "}
              {selectedApprovedRequest?.timestamp
                ? formatDate(selectedApprovedRequest.timestamp)
                : "N/A"}
              <br />
              <Text strong>Required Date:</Text> {selectedApprovedRequest.dateRequired || "N/A"}<br />
              <Text strong>Time Needed:</Text> {selectedApprovedRequest.timeFrom || "N/A"} - {selectedApprovedRequest.timeTo || "N/A"}
            </Col>
            <Col span={12}>
              <Text strong>Reason of Request:</Text>
              <p style={{ fontSize: "12px", marginTop: 5 }}>{selectedApprovedRequest.reason || "N/A"}</p>
              <Text strong>Room:</Text> {selectedApprovedRequest.room || "N/A"}<br />
              <Text strong>Course Code:</Text> {selectedApprovedRequest.courseCode || "N/A"}<br />
              <Text strong>Course Description:</Text> {selectedApprovedRequest.courseDescription || "N/A"}<br />
              <Text strong>Program:</Text> {selectedApprovedRequest.program || "N/A"}
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 20 }}>Requested Items:</Title>
          <Table
            dataSource={requestList.map((item, index) => ({
              ...item,
              key: item.itemIdFromInventory || `item-${index}`,
            }))}
            columns={approvedRequestColumns}
            rowKey="key"
            pagination={false}
            bordered
          />
        </div>
      )}
    </Modal>
  );
};

export default ApprovedRequestModal;
