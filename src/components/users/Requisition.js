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
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, Timestamp, getDocs, updateDoc, doc, deleteDoc,setDoc, getDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from "../../backend/firebase/FirebaseConfig";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/Requisition.css";
import SuccessModal from "../customs/SuccessModal";

const { Content } = Layout;

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
  const [requestList, setRequestList] = useState([]);
  const [dateRequired, setDateRequired] = useState(null);
  const [timeFrom, setTimeFrom] = useState(null);
  const [timeTo, setTimeTo] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isFinalizeVisible, setIsFinalizeVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [programError, setProgramError] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [program, setProgram] = useState("");
  const [room, setRoom] = useState("");
  const [reason, setReason] = useState("");
  const [searchUsageType, setSearchUsageType] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const storedRequestList = JSON.parse(localStorage.getItem('requestList'));
    if (storedRequestList) {
      setRequestList(storedRequestList);
    }
  }, []);

  useEffect(() => {
    const fetchRequestList = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
          const querySnapshot = await getDocs(tempRequestRef);
          const tempRequestList = querySnapshot.docs.map((doc) => doc.data());
  
          setRequestList(tempRequestList);

          localStorage.setItem("requestList", JSON.stringify(tempRequestList));
  
        } catch (error) {
          console.error("Error fetching request list:", error);
        }
      }
    };
  
    fetchRequestList();
  }, []);  

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        const itemList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        setItems(itemList);
        setFilteredItems(itemList);

      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
  
    fetchItems();
  }, []);

  useEffect(() => {
    if (location.state?.loginSuccess === true) {
      setShowModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);
  
  useEffect(() => {
    if (location.state?.loginSuccess === true) {
      sessionStorage.setItem("isLoggedIn", "true");
  
      const newState = { ...location.state };
      delete newState.loginSuccess;
      navigate(location.pathname, { replace: true, state: newState });
    }

  }, [location.state, navigate]);  

  const closeModal = () => {
    setShowModal(false);
  };

  const addToList = async (item) => {
    const alreadyAdded = requestList.find((req) => req.id === item.id);
    if (alreadyAdded) {
      setNotificationMessage("Item already added!");
      setIsNotificationVisible(true);

    } else {
      const updatedRequestList = [...requestList, { ...item, quantity: "" }];
      setRequestList(updatedRequestList);

      localStorage.setItem('requestList', JSON.stringify(updatedRequestList));

      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");

          await addDoc(tempRequestRef, {
            ...item,
            timestamp: Timestamp.fromDate(new Date()), 
          });

          setNotificationMessage("Item added to temporary list");
          setIsNotificationVisible(true);

        } catch (error) {
          console.error("Error adding item to temporary list:", error);
          setNotificationMessage("Failed to add item to temporary list.");
          setIsNotificationVisible(true);
        }
      }
    }
  };

  const removeFromList = async (id) => {
    const updatedList = requestList.filter((item) => item.id !== id);
    setRequestList(updatedList);

    localStorage.setItem('requestList', JSON.stringify(updatedList));
  
    const userId = localStorage.getItem("userId"); 
    if (userId) {
      try {
        const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
  
        const querySnapshot = await getDocs(tempRequestRef);
        const docToDelete = querySnapshot.docs.find(doc => doc.data().id === id);
  
        if (docToDelete) {
          await deleteDoc(docToDelete.ref);
          setNotificationMessage("Item removed from the list");
          setIsNotificationVisible(true);
          

        } else {
          setNotificationMessage("Item not found in Firestore.");
          setIsNotificationVisible(true);
        }

      } catch (error) {
        console.error("Error removing item from Firestore:", error);
      }
    }
  };  

  const updateQuantity = (id, value) => {
    const updatedList = requestList.map((item) =>
      item.id === id ? { ...item, quantity: value } : item
    );

    setRequestList(updatedList);
    localStorage.setItem('requestList', JSON.stringify(updatedList)); 
  };

  const finalizeRequest = async () => {
    let isValid = true;
  
    if (!dateRequired) {
      setNotificationMessage("Please select a date!.");
      setIsNotificationVisible(true);
      isValid = false;
    }
  
    if (!program) {
      setProgramError(true);
      isValid = false;

    } else {
      setProgramError(false);
    }
  
    if (!room) {
      setRoomError(true);
      isValid = false;

    } else {
      setRoomError(false);
    }
  
    if (requestList.length === 0) {
      setNotificationMessage("Please add items to the request list!");
      setIsNotificationVisible(true);
      isValid = false;
    }
  
    if (isValid) {
      try {
        const userId = localStorage.getItem("userId");
  
        if (userId) {
          // Fetch the user's name from the accounts collection
          const userDocRef = doc(db, "accounts", userId);
          const userDocSnapshot = await getDoc(userDocRef);
          
          if (!userDocSnapshot.exists()) {
            message.error("User not found.");
            return;
          }
  
          const userName = userDocSnapshot.data().name;
  
          // Add data to the user's requests collection
          const userRequestRef = collection(db, "accounts", userId, "userRequests");
          const requestData = {
            dateRequired,
            timeFrom,
            timeTo,
            program,
            room,
            reason,
            requestList,
            userName, 
            timestamp: Timestamp.now(),
          };
  
          await addDoc(userRequestRef, requestData);
  
          // Add the user request data to the root userrequests collection
          const userRequestsRootRef = collection(db, "userrequests");
          const newUserRequestRef = doc(userRequestsRootRef);
          await setDoc(newUserRequestRef, {
            ...requestData,
            accountId: userId,
          });
  
          const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
          const querySnapshot = await getDocs(tempRequestRef);
  
          const deletionPromises = []; // Collect promises for deletions
  
          // For each document in the temporaryRequests collection, handle addition to pendingrequest and deletion
          querySnapshot.forEach(async (docSnapshot) => {
            const itemData = docSnapshot.data();
  
            const pendingRequestRef = collection(db, "accounts", userId, "pendingrequest");
            await addDoc(pendingRequestRef, itemData); // Add to pending requests
  
            // Deletion operation for temporaryRequests
            deletionPromises.push(deleteDoc(doc(db, "accounts", userId, "temporaryRequests", docSnapshot.id)));
  
            // Remove item from requestList and update localStorage
            const updatedRequestList = requestList.filter((item) => item.id !== itemData.id);
            setRequestList(updatedRequestList); // Update state to remove item
            localStorage.setItem('requestList', JSON.stringify(updatedRequestList));
  
            // Remove item from pendingrequest collection
            const pendingRequestDocs = await getDocs(pendingRequestRef);
            pendingRequestDocs.forEach(async (pendingDoc) => {
              if (pendingDoc.data().id === itemData.id) {
                deletionPromises.push(deleteDoc(doc(db, "accounts", userId, "pendingrequest", pendingDoc.id)));
              }
            });
          });
  
          // Wait for all deletions and additions to finish
          await Promise.all(deletionPromises);
  
          setNotificationMessage("Requisition sent successfully!");
          setIsNotificationVisible(true);
          setIsFinalizeVisible(false); 
  
          setDateRequired(null);
          setTimeFrom(null);  
          setTimeTo(null); 
          setProgram(""); 
          setRoom("");
          setReason(""); 
          setRequestList([]); 
  
          // Optionally clear localStorage if you want to reset the stored list
          localStorage.removeItem('requestList');

        } else {
          message.error("User is not logged in.");
        }

      } catch (error) {
        console.error("Error finalizing the requisition:", error);
        message.error("Failed to send requisition. Please try again.");
      }
    }
  };
  
  const columns = [
    {
      title: "ID",
      dataIndex: "itemId",
      key: "itemId",
    },
    {
      title: "Item Description",
      dataIndex: "itemName",
      key: "itemName",
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

      <Layout className="site-layout">
        <Content className="requisition-content">
          <div className="requisition-header">
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
                    setFilteredItems(items);

                  } else {
                    const filteredData = items.filter((item) => item.usageType === selectedType);
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

          <div className="table-request-container">
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
                  title={`Item ID: ${item.itemId}`}
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
                    <strong>Item Name:</strong> {item.itemName}
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
          </div>
 
          <div className="request-details">
            <div className="date-time-container">

            <div className="date-required">
              <strong>Date Required:</strong>
              <DatePicker
                onChange={(date, dateString) => setDateRequired(dateString)}
                disabledDate={(current) => current && current < moment().startOf("day")}
                style={{
                  width: "100%",
                  marginTop: "8px",
                }}
              />
              {dateRequired && (
                <p style={{ marginTop: "8px", fontWeight: "bold", color: "#f60" }}>
                  Selected Date: {dateRequired}
                </p>
              )}
            </div>

              <div className="time-required">
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
  
                {programError && (
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
                {roomError && (
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
                      <td style={tableCellStyle}>{item.itemName}</td>
                      <td style={tableCellStyle}>{item.itemId}</td>
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
              <strong>Time Needed:</strong>{" "}
              {timeFrom && timeTo ? `${timeFrom} - ${timeTo}` : "N/A"}
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
