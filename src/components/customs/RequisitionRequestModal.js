import React from "react";
import { Modal, Button, Row, Col, Typography, Table } from "antd";

const { Text, Title } = Typography;

const RequisitionReqestModal = ({
  isModalVisible,
  handleCancel,
  handleApprove,
  handleReturn,
  selectedRequest,
  columns,
  formatDate,
}) => {
  return (
    <Modal
      title={
        <div style={{ background: "#f60", padding: "12px", color: "#fff" }}>
          <Text strong style={{ color: "#fff" }}>📄 Requisition Slip</Text>
          <span style={{ float: "right", fontStyle: "italic" }}>
            Requisition ID: {selectedRequest?.id}
          </span>
        </div>
      }
      open={isModalVisible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
        <Button key="reject" type="default" onClick={handleReturn}>Reject</Button>,
        <Button key="approve" type="primary" onClick={handleApprove}>Approve</Button>,
      ]}
    >
      {selectedRequest && (
        <div style={{ padding: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Name:</Text> {selectedRequest.userName}<br />
              <Text strong>Request Date:</Text> {formatDate(selectedRequest.timestamp)}<br />
              <Text strong>Required Date:</Text> {selectedRequest.dateRequired}<br />
              <Text strong>Time Needed:</Text> {selectedRequest.timeFrom} - {selectedRequest.timeTo}
            </Col>
            <Col span={12}>
              <Text strong>Reason of Request:</Text>
              <p style={{ fontSize: "12px", marginTop: 5 }}>{selectedRequest.reason}</p>
              <Text strong>Room:</Text> {selectedRequest.room}<br />
              <Text strong>Course Code:</Text> {selectedRequest.courseCode}<br />
              <Text strong>Course Description:</Text> {selectedRequest.courseDescription}<br />
              <Text strong>Program:</Text> {selectedRequest.program}
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 20 }}>Requested Items:</Title>
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
  );
};

export default RequisitionReqestModal;
