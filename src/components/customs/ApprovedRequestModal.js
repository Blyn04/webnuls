import React from "react";
import { Modal, Row, Col, Typography, Table } from "antd";

const { Text, Title } = Typography;

const ApprovedRequestModal = ({
  isApprovedModalVisible,
  setIsApprovedModalVisible,
  selectedApprovedRequest,
  setSelectedApprovedRequest,
  columns,
  formatDate,
}) => {
  
  // Add a fallback for when `selectedApprovedRequest` or its `requestList` is undefined
  const requestedItems = selectedApprovedRequest?.requestList || [];

  return (
    <Modal
      title={
        <div style={{ background: "#389e0d", padding: "12px", color: "#fff" }}>
          <Text strong style={{ color: "#fff" }}>✅ Approved Request Details</Text>
          <span style={{ float: "right", fontStyle: "italic" }}>
            Requisition ID: {selectedApprovedRequest?.id}
          </span>
        </div>
      }
      open={isApprovedModalVisible}
      onCancel={() => {
        setIsApprovedModalVisible(false);
        setSelectedApprovedRequest(null);
      }}
      width={800}
      footer={null}
    >
      {selectedApprovedRequest && (
        <div style={{ padding: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Name:</Text> {selectedApprovedRequest.userName}<br />
              <Text strong>Request Date:</Text> {formatDate(selectedApprovedRequest.timestamp)}<br />
              <Text strong>Required Date:</Text> {selectedApprovedRequest.dateRequired}<br />
              <Text strong>Time Needed:</Text> {selectedApprovedRequest.timeFrom} - {selectedApprovedRequest.timeTo}
            </Col>
            <Col span={12}>
              <Text strong>Reason of Request:</Text>
              <p style={{ fontSize: "12px", marginTop: 5 }}>{selectedApprovedRequest.reason}</p>
              <Text strong>Room:</Text> {selectedApprovedRequest.room}<br />
              <Text strong>Course Code:</Text> {selectedApprovedRequest.courseCode}<br />
              <Text strong>Course Description:</Text> {selectedApprovedRequest.courseDescription}<br />
              <Text strong>Program:</Text> {selectedApprovedRequest.program}
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 20 }}>Requested Items:</Title>
          <Table
            dataSource={requestedItems}  // Use the fallback array
            columns={columns.filter(col => col.dataIndex !== "check")}
            rowKey="itemId"  // Ensure itemId is unique
            pagination={false}
            bordered
          />
        </div>
      )}
    </Modal>
  );
};

export default ApprovedRequestModal;
