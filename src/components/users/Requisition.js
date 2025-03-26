import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Table,
  Button,
  Card,
  Modal,
  DatePicker,
  TimePicker,
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
  {
    id: "CHM01",
    description: "Hydrochloric Acid",
    category: "Chemical",
    quantity: 30,
    labRoom: "Chemistry Lab 1",
    status: "Available",
    condition: "Good",
    usageType: "Laboratory Experiment",
    department: "MEDTECH",
  },
  {
    id: "REG02",
    description: "Phenolphthalein",
    category: "Reagent",
    quantity: 15,
    labRoom: "Chemistry Lab 2",
    status: "In Use",
    condition: "Good",
    usageType: "Research",
    department: "NURSING",
  },
  {
    id: "MAT03",
    description: "Test Tubes",
    category: "Materials",
    quantity: 50,
    labRoom: "Physics Lab 1",
    status: "Out of Stock",
    condition: "Needs Replacement",
    usageType: "Community Extension",
    department: "MEDTECH",
  },
  {
    id: "EQP04",
    description: "Microscope",
    category: "Equipment",
    quantity: 5,
    labRoom: "Biology Lab 1",
    status: "Available",
    condition: "Good",
    usageType: "Others",
    department: "NURSING",
  },
];

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
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [requestList, setRequestList] = useState([]);
  const [dateRequired, setDateRequired] = useState(null);
  const [timeFrom, setTimeFrom] = useState(null);
  const [timeTo, setTimeTo] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isFinalizeVisible, setIsFinalizeVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [program, setProgram] = useState("");
  const [room, setRoom] = useState("");
  const [reason, setReason] = useState("");
  const [searchUsageType, setSearchUsageType] = useState("");
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

    if (!program) {
      message.error("Please select a program!");
      return;
    }

    if (!room) {
      message.error("Please enter the room!");
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Chemical", value: "Chemical" },
        { text: "Reagent", value: "Reagent" },
        { text: "Materials", value: "Materials" },
        { text: "Equipment", value: "Equipment" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Lab Room (Stock Room)",
      dataIndex: "labRoom",
      key: "labRoom",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color;
        switch (text) {
          case "Available":
            color = "green";
            break;

          case "In Use":
            color = "orange";
            break;

          case "Out of Stock":
            color = "red";
            break;
            
          default:
            color = "grey";
        }
        return <span style={{ color, fontWeight: "bold" }}>{text}</span>;
      },
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      render: (text) => (
        <span style={{ color: text === "Good" ? "green" : "red" }}>
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Usage Type",
      dataIndex: "usageType",
      key: "usageType",
      filters: [
        { text: "Laboratory Experiment", value: "Laboratory Experiment" },
        { text: "Research", value: "Research" },
        { text: "Community Extension", value: "Community Extension" },
        { text: "Others", value: "Others" },
      ],
      onFilter: (value, record) => record.usageType === value,
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

          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              placeholder="Search"
              className="requisition-search"
              allowClear
            />
            <select
              value={searchUsageType}
              onChange={(e) => {
                const selectedType = e.target.value;
                setSearchUsageType(selectedType);
                if (selectedType === "") {
                  setFilteredItems(initialItems);
                } else {
                  const filteredData = initialItems.filter((item) => item.usageType === selectedType);
                  setFilteredItems(filteredData);
                }
              }}
              style={{
                width: "200px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">All Usage Types</option>
              <option value="Laboratory Experiment">Laboratory Experiment</option>
              <option value="Research">Research</option>
              <option value="Community Extension">Community Extension</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

          <Table
            dataSource={filteredItems}
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
                Select Date
              </Button>

              {dateRequired && (
                <p style={{ marginTop: "8px", fontWeight: "bold", color: "#f60" }}>
                  Selected Date: {dateRequired}
                </p>
              )}

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

            <div className="time-required" style={{ marginTop: "15px" }}>
              <strong>Time Needed:</strong>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <TimePicker
                  placeholder="From"
                  onChange={(time, timeString) => {
                    setTimeFrom(timeString);
                    setTimeTo(null); 
                  }}
                  format="HH:mm" 
                  use12Hours={false}
                  style={{ width: "50%" }}
                />

                <TimePicker
                  placeholder="To"
                  onChange={(time, timeString) => setTimeTo(timeString)}
                  format="HH:mm"
                  use12Hours={false}
                  disabled={!timeFrom}
                  style={{ width: "50%" }}
                  disabledHours={() => {
                    if (!timeFrom) return [];
                    const [startHour] = timeFrom.split(":").map(Number);
                    return Array.from({ length: startHour }, (_, i) => i);
                  }}
                  disabledMinutes={(selectedHour) => {
                    if (!timeFrom) return [];
                    const [startHour, startMinute] = timeFrom.split(":").map(Number);
                    if (selectedHour === startHour) {
                      return Array.from({ length: startMinute }, (_, i) => i);
                    }
                    return [];
                  }}
                />
              </div>

              {timeFrom && timeTo && (
                <p style={{ marginTop: "8px", fontWeight: "bold", color: "#f60" }}>
                  Time Needed: {timeFrom} - {timeTo}
                </p>
              )}
            </div>

            <div className="program-room-container">
              <div className="program-container">
                <strong>Program:</strong>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginTop: "8px",
                  }}
                >
                  <option value="">Select a Program</option>
                  <option value="SAM - BSMT">SAM - BSMT</option>
                  <option value="SAH - BSN">SAH - BSN</option>
                  <option value="SHS">SHS</option>
                </select>
                {program === "" && (
                  <p style={{ color: "red", marginTop: "5px" }}>
                    Please select a program before finalizing.
                  </p>
                )}
              </div>

              <div className="room-container">
                <strong>Room:</strong>
                <Input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Enter room number"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginTop: "8px",
                  }}
                />
                {room === "" && (
                  <p style={{ color: "red", marginTop: "5px" }}>
                    Please enter the room before finalizing.
                  </p>
                )}
              </div>
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
                    <th style={tableHeaderStyle}>Usage Type</th>
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
                      <td style={tableCellStyle}>{item.usageType}</td>
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
