import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Table,
  Button,
  Card,
  Modal,
  DatePicker,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/Requisition.css";
import SuccessModal from "../customs/SuccessModal";

const { Content } = Layout;

const initialItems = [
  { id: "SPL02", description: "Bondpaper", department: "MEDTECH" },
  { id: "MED03", description: "Paracetamol", department: "NURSING" },
  { id: "MED04", description: "Syringe", department: "MEDTECH" },
  { id: "SPL03", description: "Pen", department: "NURSING" },
];

// Table styles for finalize modal
const tableHeaderStyle = {
  padding: "8px",
  borderBottom: "1px solid #ddd",
  backgroundColor: "#f5f5f5",
  fontWeight: "bold",
  textAlign: "center",
};

const tableCellStyle = {
  padding: "8px",
  borderBottom: "1px solid #ddd",
  textAlign: "center",
};

const Requisition = () => {
  const [items] = useState(initialItems);
  const [requestList, setRequestList] = useState([]);
  const [dateRequired, setDateRequired] = useState(null);
  const [reason, setReason] = useState("");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isFinalizeVisible, setIsFinalizeVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.loginSuccess === true) {
      setShowModal(true);
    }
  }, [location.state]);

  const closeModal = () => {
    setShowModal(false);
  };

  const addToList = (item) => {
    const alreadyAdded = requestList.find((req) => req.id === item.id);
    if (alreadyAdded) {
      message.warning("Item already added!");
    } else {
      setRequestList([...requestList, { ...item, quantity: "" }]);
    }
  };

  const removeFromList = (id) => {
    const updatedList = requestList.filter((item) => item.id !== id);
    setRequestList(updatedList);
  };

  const updateQuantity = (id, value) => {
    const updatedList = requestList.map((item) =>
      item.id === id ? { ...item, quantity: value } : item
    );
    setRequestList(updatedList);
  };

  const finalizeRequest = () => {
    if (!dateRequired) {
      message.error("Please select a date!");
      return;
    }
    if (requestList.length === 0) {
      message.error("Please add items to the request list!");
      return;
    }
    setIsFinalizeVisible(true); 
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Item Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (text) => (
        <span
          style={{
            color: text === "MEDTECH" ? "magenta" : "orange",
            fontWeight: "bold",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      render: (text, record) => (
        <Button
          type="primary"
          danger
          size="small"
          onClick={() => addToList(record)}
        >
          Add to List
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar setPageTitle={setPageTitle} />

      <Layout className="site-layout">
        <AppHeader pageTitle={pageTitle} />
        
        <Content className="requisition-content">
          <div className="requisition-header">
            <h2>Requisition</h2>
            <Input
              placeholder="Search"
              className="requisition-search"
              allowClear
            />
          </div>

          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            className="requisition-table"
          />

          <div className="request-list-container">
            <h3>Request List:</h3>
            {requestList.map((item) => (
              <Card
                key={item.id}
                className="request-card"
                size="small"
                title={`Item ID: ${item.id}`}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromList(item.id)}
                  />
                }
              >
                <p>
                  <strong>Description:</strong> {item.description}
                </p>
                <p>
                  <strong>Department:</strong>{" "}
                  <span
                    style={{
                      color: item.department === "MEDTECH" ? "magenta" : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {item.department}
                  </span>
                </p>
                <Input
                  placeholder="Enter quantity"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                />
              </Card>
            ))}
          </div>

          <div className="request-details">
            <div className="date-required">
              <strong>Date Required:</strong>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => setIsCalendarVisible(true)}
              >
                Calendar
              </Button>
              <Modal
                title="Select Date"
                open={isCalendarVisible}
                onCancel={() => setIsCalendarVisible(false)}
                onOk={() => setIsCalendarVisible(false)}
              >
                <DatePicker
                  onChange={(date, dateString) => setDateRequired(dateString)}
                  style={{ width: "100%" }}
                />
              </Modal>
            </div>

            <div className="reason-container">
              <strong>Reason of Request:</strong>
              <Input.TextArea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for request"
              />
            </div>

            <Button
              type="primary"
              danger
              block
              className="finalize-btn"
              onClick={finalizeRequest}
            >
              Finalize
            </Button>
          </div>

          <Modal
            title={
              <div style={{ background: "#f60", padding: "12px", color: "#fff" }}>
                <strong>📝 Finalize Request</strong>
              </div>
            }
            open={isFinalizeVisible}
            onCancel={() => setIsFinalizeVisible(false)}
            footer={null}
            centered
            className="finalize-modal"
          >
            <div style={{ padding: "10px" }}>
              <h3 style={{ marginBottom: "10px" }}>Item Summary:</h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "10px",
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>#</th>
                    <th style={tableHeaderStyle}>Item Description</th>
                    <th style={tableHeaderStyle}>Item ID</th>
                    <th style={tableHeaderStyle}>Qty</th>
                    <th style={tableHeaderStyle}>Dept.</th>
                  </tr>
                </thead>
                <tbody>
                  {requestList.map((item, index) => (
                    <tr key={item.id}>
                      <td style={tableCellStyle}>{index + 1}.</td>
                      <td style={tableCellStyle}>{item.description}</td>
                      <td style={tableCellStyle}>{item.id}</td>
                      <td style={tableCellStyle}>{item.quantity || "N/A"}</td>
                      <td
                        style={{
                          ...tableCellStyle,
                          color: item.department === "MEDTECH" ? "magenta" : "orange",
                        }}
                      >
                        {item.department}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>
                <strong>Date Required:</strong> {dateRequired || "N/A"}
              </h4>
              <h4>
                <strong>Message:</strong>{" "}
                <em>{reason || "No message provided."}</em>
              </h4>

              <Button
                type="primary"
                danger
                block
                style={{ marginTop: "15px" }}
                onClick={() => {
                  message.success("Requisition sent successfully!");
                  setIsFinalizeVisible(false);
                }}
              >
                Send Requisition
              </Button>
            </div>
          </Modal>
        </Content>

        <SuccessModal isVisible={showModal} onClose={closeModal} />
      </Layout>
    </Layout>
  );
};

export default Requisition;
