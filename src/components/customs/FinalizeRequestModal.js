import React from "react";
import { Modal } from "antd";

const FinalizeRequestModal = ({
  visible,
  onOk,
  onCancel,
  dateRequired,
  timeFrom,
  timeTo,
  program,
  room,
  reason,
  requestList = [],
}) => {
  return (
    <Modal
      title="Review Your Requisition"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      okText="Confirm and Submit"
      cancelText="Cancel"
    >
      <p><strong>Date Required:</strong> {dateRequired || "N/A"}</p>
      <p><strong>Time From:</strong> {timeFrom || "N/A"} &nbsp; <strong>To:</strong> {timeTo || "N/A"}</p>
      <p><strong>Program:</strong> {program || "N/A"}</p>
      <p><strong>Room:</strong> {room || "N/A"}</p>
      <p><strong>Reason:</strong> {reason || "N/A"}</p>

      <h4 style={{ marginTop: "20px" }}>📦 Items Summary:</h4>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Item</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Category</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Quantity</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Lab Room</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {requestList.length > 0 ? requestList.map((item, index) => (
              <tr key={index}>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{item.itemName}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{item.category}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{item.quantity}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{item.labRoom}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{item.status}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: "8px", textAlign: "center" }}>No items selected.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default FinalizeRequestModal;
