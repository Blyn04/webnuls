import React from "react";
import { Modal, Table } from "antd";

const FinalizeCapexModal = ({ visible, onConfirm, onCancel, totalPrice, dataSource }) => {

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      width: 50,
      align: "center",
    },
    {
      title: "Item Description",
      dataIndex: "itemDescription",
      key: "itemDescription",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 80,
      align: "center",
    },
    {
      title: "Estimated Cost",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
      render: (text) => {
        const value = text || 0;
        return `₱${value.toLocaleString()}`;
      },
      width: 120,
      align: "right",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => {
        const value = text || 0;
        return `₱${value.toLocaleString()}`;
      },
      width: 120,
      align: "right",
    },
    {
      title: "Justification",
      dataIndex: "justification",
      key: "justification",
    },
  ];

  return (
    <Modal
      title="Finalize CAPEX Request"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Confirm Submit"
      cancelText="Go Back"
    >
      <p>Are you sure you want to submit this CAPEX request?</p>
      <p>
        <strong>Total Estimated Cost:</strong>{" "}
        <span style={{ color: "green" }}>₱{totalPrice.toLocaleString()}</span>
      </p>
      <p>This action cannot be undone.</p>

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
        size="small"
      />
    </Modal>
  );
};

export default FinalizeCapexModal;
