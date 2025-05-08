// import React from "react";
// import { Modal, Button, Row, Col, Typography, Table } from "antd";

// const { Text, Title } = Typography;

// const RequisitionReqestModal = ({
//   isModalVisible,
//   handleCancel,
//   handleApprove,
//   handleReturn,
//   selectedRequest,
//   columns,
//   formatDate,
// }) => {
//   return (
//     <Modal
//       title={
//         <div style={{ background: "#f60", padding: "12px", color: "#fff" }}>
//           <Text strong style={{ color: "#fff" }}>📄 Requisition Slip</Text>
//           <span style={{ float: "right", fontStyle: "italic" }}>
//             Requisition ID: {selectedRequest?.id}
//           </span>
//         </div>
//       }
//       open={isModalVisible}
//       onCancel={handleCancel}
//       width={800}
//       footer={[
//         <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
//         // <Button key="reject" type="default" onClick={handleReturn}>Reject</Button>,
//         <Button key="approve" type="primary" onClick={handleApprove}>Approve</Button>,
//       ]}
//     >
//       {selectedRequest && (
//         <div style={{ padding: "20px" }}>
//           <Row gutter={[16, 16]}>
//             <Col span={12}>
//               <Text strong>Name:</Text> {selectedRequest.userName}<br />
//               <Text strong>Request Date:</Text> {formatDate(selectedRequest.timestamp)}<br />
//               <Text strong>Required Date:</Text> {selectedRequest.dateRequired}<br />
//               <Text strong>Time Needed:</Text> {selectedRequest.timeFrom} - {selectedRequest.timeTo}
//             </Col>
//             <Col span={12}>
//               <Text strong>Reason of Request:</Text>
//               <p style={{ fontSize: "12px", marginTop: 5 }}>{selectedRequest.reason}</p>
//               <Text strong>Room:</Text> {selectedRequest.room}<br />
//               <Text strong>Course Code:</Text> {selectedRequest.courseCode}<br />
//               <Text strong>Course Description:</Text> {selectedRequest.courseDescription}<br />
//               <Text strong>Program:</Text> {selectedRequest.program}<br />
//               <Text strong>Usage Type:</Text> {selectedRequest.usageType}
//             </Col>
//           </Row>

//           <Title level={5} style={{ marginTop: 20 }}>Requested Items:</Title>
//           <Table
//             dataSource={selectedRequest.requestList}
//             columns={columns}
//             rowKey="id"
//             pagination={false}
//             bordered
//           />
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default RequisitionReqestModal;

import React from "react";
import { Modal, Button, Row, Col, Typography, Table } from "antd";
import "../styles/adminStyle/PendingRequest.css";

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
      // title={
      //   <div style={{ background: "#f60", padding: "12px", color: "#fff" }}>
      //     <Text strong style={{ color: "#fff" }}>📄 Requisition Slip</Text>
          
      //   </div>
      // }
      open={isModalVisible}
      onCancel={handleCancel}
      width={800}
      zIndex={1022}
      footer={[
        <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
        <Button key="reject" type="default" onClick={handleReturn}>Reject</Button>,
        <Button key="approve" type="primary" onClick={handleApprove}>Approve</Button>,
      ]}
    >
      {selectedRequest && (
        <>
        <div className="requisition-slip-title">
          <strong>Requisitian Slip</strong>
          <span style={{ float: "right", fontStyle: "italic", fontSize: '15px' }}>
            Requisition ID: {selectedRequest?.id}
          </span>
        </div>
            <div className="whole-slip">
              <div className="left-slip">
                <div> <strong>Requestor:</strong><p> {selectedRequest.userName}</p></div>
              <div>< strong>Date Submitted:</strong><p>{formatDate(selectedRequest.timestamp)}</p> </div>
              <div>< strong>Date Needed:</strong> <p>{selectedRequest.dateRequired}</p></div>
              <div>< strong>Time Needed:</strong> <p>{selectedRequest.timeFrom} - {selectedRequest.timeTo}</p> </div>
              </div>
              

              <div className="right-slip">
              <div><strong>Room:</strong> <p>{selectedRequest.room}</p></div>
              <div><strong>Course Code:</strong> <p>{selectedRequest.courseCode}</p></div>
              <div><strong>Course Description:</strong> <p>{selectedRequest.courseDescription}</p></div>
              <div><strong>Program:</strong> <p>{selectedRequest.program}</p></div>
              <div><strong>Usage Type:</strong> <p>{selectedRequest.usageType}</p></div>
              </div>
              
            </div>
            
         

          <Title level={5} style={{ marginTop: 20 }}>Requested Items:</Title>
          <Table
            dataSource={selectedRequest.requestList}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
          />

          <div style={{display: 'flex', marginTop: '20px'}}><p><strong>Note:</strong> {selectedRequest.reason}</p></div>
        </>
        
       
              
  
      )}
    </Modal>
  );
};

export default RequisitionReqestModal;
