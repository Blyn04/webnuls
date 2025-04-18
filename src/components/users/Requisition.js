// import React, { useState, useEffect } from "react";
// import {
//   Layout,
//   Input,
//   Table,
//   Button,
//   Card,
//   Modal,
//   DatePicker,
//   TimePicker,
//   message,
// } from "antd";
// import {
//   PlusOutlined,
//   DeleteOutlined,
//   CalendarOutlined,
// } from "@ant-design/icons";
// import moment from "moment";
// import { useLocation, useNavigate } from "react-router-dom";
// import { getFirestore, collection, addDoc, Timestamp, getDocs, updateDoc, doc, deleteDoc,setDoc, getDoc } from "firebase/firestore";
// import { getAuth } from 'firebase/auth';
// import { db } from "../../backend/firebase/FirebaseConfig";
// import Sidebar from "../Sidebar";
// import AppHeader from "../Header";
// import "../styles/usersStyle/Requisition.css";
// import SuccessModal from "../customs/SuccessModal";

// const { Content } = Layout;

// const tableHeaderStyle = {
//   padding: "8px",
//   borderBottom: "1px solid #ddd",
//   backgroundColor: "#f5f5f5",
//   fontWeight: "bold",
//   textAlign: "center",
// };

// const tableCellStyle = {
//   padding: "8px",
//   borderBottom: "1px solid #ddd",
//   textAlign: "center",
// };

// const Requisition = () => {
//   const [requestList, setRequestList] = useState([]);
//   const [dateRequired, setDateRequired] = useState(null);
//   const [timeFrom, setTimeFrom] = useState(null);
//   const [timeTo, setTimeTo] = useState(null);
//   const [isCalendarVisible, setIsCalendarVisible] = useState(false);
//   const [isFinalizeVisible, setIsFinalizeVisible] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [programError, setProgramError] = useState(false);
//   const [roomError, setRoomError] = useState(false);
//   const [pageTitle, setPageTitle] = useState("");
//   const [program, setProgram] = useState("");
//   const [room, setRoom] = useState("");
//   const [reason, setReason] = useState("");
//   const [searchUsageType, setSearchUsageType] = useState("");
//   const [items, setItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [isNotificationVisible, setIsNotificationVisible] = useState(false);
//   const [notificationMessage, setNotificationMessage] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     const storedRequestList = JSON.parse(localStorage.getItem('requestList'));
//     if (storedRequestList) {
//       setRequestList(storedRequestList);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchRequestList = async () => {
//       const userId = localStorage.getItem("userId");
//       if (userId) {
//         try {
//           const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
//           const querySnapshot = await getDocs(tempRequestRef);
//           const tempRequestList = querySnapshot.docs.map((doc) => doc.data());
  
//           setRequestList(tempRequestList);

//           localStorage.setItem("requestList", JSON.stringify(tempRequestList));
  
//         } catch (error) {
//           console.error("Error fetching request list:", error);
//         }
//       }
//     };
  
//     fetchRequestList();
//   }, []);  

//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "inventory"));
//         const itemList = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
  
//         setItems(itemList);
//         setFilteredItems(itemList);

//       } catch (error) {
//         console.error("Error fetching inventory:", error);
//       }
//     };
  
//     fetchItems();
//   }, []);

//   useEffect(() => {
//     if (location.state?.loginSuccess === true) {
//       setShowModal(true);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     const handleBackButton = (event) => {
//       event.preventDefault();
//       window.history.pushState(null, "", window.location.href);
//     };

//     window.history.pushState(null, "", window.location.href);
//     window.addEventListener("popstate", handleBackButton);

//     return () => {
//       window.removeEventListener("popstate", handleBackButton);
//     };
//   }, []);
  
//   useEffect(() => {
//     if (location.state?.loginSuccess === true) {
//       sessionStorage.setItem("isLoggedIn", "true");
  
//       const newState = { ...location.state };
//       delete newState.loginSuccess;
//       navigate(location.pathname, { replace: true, state: newState });
//     }

//   }, [location.state, navigate]);  

//   const closeModal = () => {
//     setShowModal(false);
//   };

//   const addToList = async (item) => {
//     const alreadyAdded = requestList.find((req) => req.id === item.id);
//     if (alreadyAdded) {
//       setNotificationMessage("Item already added!");
//       setIsNotificationVisible(true);

//     } else {
//       const updatedRequestList = [...requestList, { ...item, quantity: "" }];
//       setRequestList(updatedRequestList);

//       localStorage.setItem('requestList', JSON.stringify(updatedRequestList));

//       const userId = localStorage.getItem("userId");

//       if (userId) {
//         try {
//           const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");

//           await addDoc(tempRequestRef, {
//             ...item,
//             timestamp: Timestamp.fromDate(new Date()), 
//           });

//           setNotificationMessage("Item added to temporary list");
//           setIsNotificationVisible(true);

//         } catch (error) {
//           console.error("Error adding item to temporary list:", error);
//           setNotificationMessage("Failed to add item to temporary list.");
//           setIsNotificationVisible(true);
//         }
//       }
//     }
//   };

//   const removeFromList = async (id) => {
//     const updatedList = requestList.filter((item) => item.id !== id);
//     setRequestList(updatedList);

//     localStorage.setItem('requestList', JSON.stringify(updatedList));
  
//     const userId = localStorage.getItem("userId"); 
//     if (userId) {
//       try {
//         const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
  
//         const querySnapshot = await getDocs(tempRequestRef);
//         const docToDelete = querySnapshot.docs.find(doc => doc.data().id === id);
  
//         if (docToDelete) {
//           await deleteDoc(docToDelete.ref);
//           setNotificationMessage("Item removed from the list");
//           setIsNotificationVisible(true);
          
//         } else {
//           setNotificationMessage("Item not found in Firestore.");
//           setIsNotificationVisible(true);
//         }

//       } catch (error) {
//         console.error("Error removing item from Firestore:", error);
//       }
//     }
//   };  

//   const updateQuantity = (id, value) => {
//     const updatedList = requestList.map((item) =>
//       item.id === id ? { ...item, quantity: value } : item
//     );

//     setRequestList(updatedList);
//     localStorage.setItem('requestList', JSON.stringify(updatedList)); 
//   };

//   const finalizeRequest = async () => {
//     let isValid = true;
  
//     if (!dateRequired) {
//       setNotificationMessage("Please select a date!.");
//       setIsNotificationVisible(true);
//       isValid = false;
//     }
  
//     if (!program) {
//       setProgramError(true);
//       isValid = false;

//     } else {
//       setProgramError(false);
//     }
  
//     if (!room) {
//       setRoomError(true);
//       isValid = false;

//     } else {
//       setRoomError(false);
//     }
  
//     if (requestList.length === 0) {
//       setNotificationMessage("Please add items to the request list!");
//       setIsNotificationVisible(true);
//       isValid = false;
//     }
  
//     if (isValid) {
//       try {
//         const userId = localStorage.getItem("userId");
  
//         if (userId) {
//           // Fetch the user's name from the accounts collection
//           const userDocRef = doc(db, "accounts", userId);
//           const userDocSnapshot = await getDoc(userDocRef);
          
//           if (!userDocSnapshot.exists()) {
//             message.error("User not found.");
//             return;
//           }
  
//           const userName = userDocSnapshot.data().name;
  
//           // Add data to the user's requests collection
//           const userRequestRef = collection(db, "accounts", userId, "userRequests");
//           const requestData = {
//             dateRequired,
//             timeFrom,
//             timeTo,
//             program,
//             room,
//             reason,
//             requestList,
//             userName, 
//             timestamp: Timestamp.now(),
//           };
  
//           await addDoc(userRequestRef, requestData);
  
//           // Add the user request data to the root userrequests collection
//           const userRequestsRootRef = collection(db, "userrequests");
//           const newUserRequestRef = doc(userRequestsRootRef);
//           await setDoc(newUserRequestRef, {
//             ...requestData,
//             accountId: userId,
//           });
  
//           const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
//           const querySnapshot = await getDocs(tempRequestRef);
  
//           const deletionPromises = []; // Collect promises for deletions
  
//           // For each document in the temporaryRequests collection, handle addition to pendingrequest and deletion
//           querySnapshot.forEach(async (docSnapshot) => {
//             const itemData = docSnapshot.data();
  
//             const pendingRequestRef = collection(db, "accounts", userId, "pendingrequest");
//             await addDoc(pendingRequestRef, itemData); // Add to pending requests
  
//             // Deletion operation for temporaryRequests
//             deletionPromises.push(deleteDoc(doc(db, "accounts", userId, "temporaryRequests", docSnapshot.id)));
  
//             // Remove item from requestList and update localStorage
//             const updatedRequestList = requestList.filter((item) => item.id !== itemData.id);
//             setRequestList(updatedRequestList); // Update state to remove item
//             localStorage.setItem('requestList', JSON.stringify(updatedRequestList));
  
//             // Remove item from pendingrequest collection
//             const pendingRequestDocs = await getDocs(pendingRequestRef);
//             pendingRequestDocs.forEach(async (pendingDoc) => {
//               if (pendingDoc.data().id === itemData.id) {
//                 deletionPromises.push(deleteDoc(doc(db, "accounts", userId, "pendingrequest", pendingDoc.id)));
//               }
//             });
//           });
  
//           // Wait for all deletions and additions to finish
//           await Promise.all(deletionPromises);
  
//           setNotificationMessage("Requisition sent successfully!");
//           setIsNotificationVisible(true);
//           setIsFinalizeVisible(false); 
  
//           setDateRequired(null);
//           setTimeFrom(null);  
//           setTimeTo(null); 
//           setProgram(""); 
//           setRoom("");
//           setReason(""); 
//           setRequestList([]); 
  
//           // Optionally clear localStorage if you want to reset the stored list
//           localStorage.removeItem('requestList');

//         } else {
//           message.error("User is not logged in.");
//         }

//       } catch (error) {
//         console.error("Error finalizing the requisition:", error);
//         message.error("Failed to send requisition. Please try again.");
//       }
//     }
//   };
  
//   const columns = [
//     {
//       title: "ID",
//       dataIndex: "itemId",
//       key: "itemId",
//     },
//     {
//       title: "Item Description",
//       dataIndex: "itemName",
//       key: "itemName",
//     },
//     {
//       title: "Category",
//       dataIndex: "category",
//       key: "category",
//       filters: [
//         { text: "Chemical", value: "Chemical" },
//         { text: "Reagent", value: "Reagent" },
//         { text: "Materials", value: "Materials" },
//         { text: "Equipment", value: "Equipment" },
//       ],
//       onFilter: (value, record) => record.category === value,
//     },
//     {
//       title: "Qty",
//       dataIndex: "quantity",
//       key: "quantity",
//       render: (text) => <span>{text || "N/A"}</span>,
//     },
//     {
//       title: "Lab Room (Stock Room)",
//       dataIndex: "labRoom",
//       key: "labRoom",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (text) => {
//         let color;
//         switch (text) {
//           case "Available":
//             color = "green";
//             break;

//           case "In Use":
//             color = "orange";
//             break;

//           case "Out of Stock":
//             color = "red";
//             break;
            
//           default:
//             color = "grey";
//         }
//         return <span style={{ color, fontWeight: "bold" }}>{text}</span>;
//       },
//     },
//     {
//       title: "Condition",
//       dataIndex: "condition",
//       key: "condition",
//       render: (text) => (
//         <span style={{ color: text === "Good" ? "green" : "red" }}>
//           {text || "N/A"}
//         </span>
//       ),
//     },
//     {
//       title: "Usage Type",
//       dataIndex: "usageType",
//       key: "usageType",
//       filters: [
//         { text: "Laboratory Experiment", value: "Laboratory Experiment" },
//         { text: "Research", value: "Research" },
//         { text: "Community Extension", value: "Community Extension" },
//         { text: "Others", value: "Others" },
//       ],
//       onFilter: (value, record) => record.usageType === value,
//     },
//     {
//       title: "Department",
//       dataIndex: "department",
//       key: "department",
//       render: (text) => (
//         <span
//           style={{
//             color: text === "MEDTECH" ? "magenta" : "orange",
//             fontWeight: "bold",
//           }}
//         >
//           {text}
//         </span>
//       ),
//     },
//     {
//       title: "",
//       key: "action",
//       render: (text, record) => (
//         <Button
//           type="primary"
//           danger
//           size="small"
//           onClick={() => addToList(record)}
//         >
//           Add to List
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <Layout style={{ minHeight: "100vh" }}>

//       <Layout className="site-layout">
//         <Content className="requisition-content">
//           <div className="requisition-header">
//             <div style={{ display: "flex", gap: "10px" }}>
//               <Input
//                 placeholder="Search"
//                 className="requisition-search"
//                 allowClear
//               />
//               <select
//                 value={searchUsageType}
//                 onChange={(e) => {
//                   const selectedType = e.target.value;
//                   setSearchUsageType(selectedType);
//                   if (selectedType === "") {
//                     setFilteredItems(items);

//                   } else {
//                     const filteredData = items.filter((item) => item.usageType === selectedType);
//                     setFilteredItems(filteredData);
//                   }
//                 }}
//                 style={{
//                   width: "200px",
//                   padding: "8px",
//                   borderRadius: "4px",
//                   border: "1px solid #ccc",
//                 }}
//               >
//                 <option value="">All Usage Types</option>
//                 <option value="Laboratory Experiment">Laboratory Experiment</option>
//                 <option value="Research">Research</option>
//                 <option value="Community Extension">Community Extension</option>
//                 <option value="Others">Others</option>
//               </select>
//             </div>
//           </div>

//           <div className="table-request-container">
//             <Table
//               dataSource={filteredItems}
//               columns={columns}
//               rowKey="id"
//               className="requisition-table"
//             />
  
//             <div className="request-list-container">
//               <h3>Request List:</h3>
//               {requestList.map((item) => (
//                 <Card
//                   key={item.id}
//                   className="request-card"
//                   size="small"
//                   title={`Item ID: ${item.itemId}`}
//                   extra={
//                     <Button
//                       type="text"
//                       danger
//                       icon={<DeleteOutlined />}
//                       onClick={() => removeFromList(item.id)}
//                     />
//                   }
//                 >
//                   <p>
//                     <strong>Item Name:</strong> {item.itemName}
//                   </p>
  
//                   <p>
//                     <strong>Department:</strong>{" "}
//                     <span
//                       style={{
//                         color: item.department === "MEDTECH" ? "magenta" : "orange",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {item.department}
//                     </span>
//                   </p>
  
//                   <Input
//                     placeholder="Enter quantity"
//                     type="number"
//                     min={1}
//                     value={item.quantity}
//                     onChange={(e) => updateQuantity(item.id, e.target.value)}
//                   />
//                 </Card>
//               ))}
//             </div>
//           </div>
 
//           <div className="request-details">
//             <div className="date-time-container">

//             <div className="date-required">
//               <strong>Date Required:</strong>
//               <DatePicker
//                 onChange={(date, dateString) => setDateRequired(dateString)}
//                 disabledDate={(current) => current && current < moment().startOf("day")}
//                 style={{
//                   width: "100%",
//                   marginTop: "8px",
//                 }}
//               />
//               {dateRequired && (
//                 <p style={{ marginTop: "8px", fontWeight: "bold", color: "#f60" }}>
//                   Selected Date: {dateRequired}
//                 </p>
//               )}
//             </div>

//               <div className="time-required">
//                 <strong>Time Needed:</strong>
//                 <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
//                   <TimePicker
//                     placeholder="From"
//                     onChange={(time, timeString) => {
//                       setTimeFrom(timeString);
//                       setTimeTo(null);
//                     }}
//                     format="HH:mm"
//                     use12Hours={false}
//                     style={{ width: "50%" }}
//                   />

//                   <TimePicker
//                     placeholder="To"
//                     onChange={(time, timeString) => setTimeTo(timeString)}
//                     format="HH:mm"
//                     use12Hours={false}
//                     disabled={!timeFrom}
//                     style={{ width: "50%" }}
//                     disabledHours={() => {
//                       if (!timeFrom) return [];
//                       const [startHour] = timeFrom.split(":").map(Number);
//                       return Array.from({ length: startHour }, (_, i) => i);
//                     }}
//                     disabledMinutes={(selectedHour) => {
//                       if (!timeFrom) return [];
//                       const [startHour, startMinute] = timeFrom.split(":").map(Number);

//                       if (selectedHour === startHour) {
//                         return Array.from({ length: startMinute }, (_, i) => i);
//                       }
//                       return [];
//                     }}
//                   />
//                 </div>

//                 {timeFrom && timeTo && (
//                   <p style={{ marginTop: "8px", fontWeight: "bold", color: "#f60" }}>
//                     Time Needed: {timeFrom} - {timeTo}
//                   </p>
//                 )}
//               </div>
//             </div>
  
//             <div className="program-room-container">
//               <div className="program-container">
//                 <strong>Program:</strong>
//                 <select
//                   value={program}
//                   onChange={(e) => setProgram(e.target.value)}
//                   style={{
//                     width: "100%",
//                     padding: "8px",
//                     borderRadius: "4px",
//                     border: "1px solid #ccc",
//                     marginTop: "8px",
//                   }}
//                 >
//                   <option value="">Select a Program</option>
//                   <option value="SAM - BSMT">SAM - BSMT</option>
//                   <option value="SAH - BSN">SAH - BSN</option>
//                   <option value="SHS">SHS</option>
//                 </select>
  
//                 {programError && (
//                   <p style={{ color: "red", marginTop: "5px" }}>
//                     Please select a program before finalizing.
//                   </p>
//                 )}
//               </div>
  
//               <div className="room-container">
//                 <strong>Room:</strong>
//                 <Input
//                   type="text"
//                   value={room}
//                   onChange={(e) => setRoom(e.target.value)}
//                   placeholder="Enter room number"
//                   style={{
//                     width: "100%",
//                     padding: "8px",
//                     borderRadius: "4px",
//                     border: "1px solid #ccc",
//                     marginTop: "8px",
//                   }}
//                 />
//                 {roomError && (
//                   <p style={{ color: "red", marginTop: "5px" }}>
//                     Please enter the room before finalizing.
//                   </p>
//                 )}
//               </div>
//             </div>
  
//             <div className="reason-container">
//               <strong>Reason of Request:</strong>
//               <Input.TextArea
//                 rows={3}
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 placeholder="Enter reason for request"
//               />
//             </div>
  
//             <Button
//               type="primary"
//               danger
//               block
//               className="finalize-btn"
//               onClick={finalizeRequest}
//             >
//               Finalize
//             </Button>
//           </div>
  
//           <Modal
//             title={
//               <div style={{ background: "#f60", padding: "12px", color: "#fff" }}>
//                 <strong>📝 Finalize Request</strong>
//               </div>
//             }
//             open={isFinalizeVisible}
//             onCancel={() => setIsFinalizeVisible(false)}
//             footer={null}
//             centered
//             className="finalize-modal"
//           >
//             <div style={{ padding: "10px" }}>
//               <h3 style={{ marginBottom: "10px" }}>Item Summary:</h3>
//               <table
//                 style={{
//                   width: "100%",
//                   borderCollapse: "collapse",
//                   marginBottom: "10px",
//                 }}
//               >
//                 <thead>
//                   <tr>
//                     <th style={tableHeaderStyle}>#</th>
//                     <th style={tableHeaderStyle}>Item Description</th>
//                     <th style={tableHeaderStyle}>Item ID</th>
//                     <th style={tableHeaderStyle}>Usage Type</th>
//                     <th style={tableHeaderStyle}>Qty</th>
//                     <th style={tableHeaderStyle}>Dept.</th>
//                   </tr>
//                 </thead>
  
//                 <tbody>
//                   {requestList.map((item, index) => (
//                     <tr key={item.id}>
//                       <td style={tableCellStyle}>{index + 1}.</td>
//                       <td style={tableCellStyle}>{item.itemName}</td>
//                       <td style={tableCellStyle}>{item.itemId}</td>
//                       <td style={tableCellStyle}>{item.usageType}</td>
//                       <td style={tableCellStyle}>{item.quantity || "N/A"}</td>
//                       <td
//                         style={{
//                           ...tableCellStyle,
//                           color: item.department === "MEDTECH" ? "magenta" : "orange",
//                         }}
//                       >
//                         {item.department}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
  
//               <h4>
//                 <strong>Date Required:</strong> {dateRequired || "N/A"}
//               </h4>

//               <h4>
//               <strong>Time Needed:</strong>{" "}
//               {timeFrom && timeTo ? `${timeFrom} - ${timeTo}` : "N/A"}
//               </h4>
  
//               <h4>
//                 <strong>Message:</strong>{" "}
//                 <em>{reason || "No message provided."}</em>
//               </h4>
  
//               <Button
//                 type="primary"
//                 danger
//                 block
//                 style={{ marginTop: "15px" }}
//                 onClick={() => {
//                   message.success("Requisition sent successfully!");
//                   setIsFinalizeVisible(false);
//                 }}
//               >
//                 Send Requisition
//               </Button>
//             </div>
//           </Modal>
//         </Content>
  
//         <SuccessModal isVisible={showModal} onClose={closeModal} />
//       </Layout>
//     </Layout>
//   );  
// };

// export default Requisition;

import React, { useState, useEffect, useCallback } from "react";
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
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import dayjs from 'dayjs';
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, Timestamp, getDocs, updateDoc, doc, deleteDoc,setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from "../../backend/firebase/FirebaseConfig";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/Requisition.css";
import SuccessModal from "../customs/SuccessModal";
import FinalizeRequestModal from "../customs/FinalizeRequestModal";

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
  const [isFinalizeVisible, setIsFinalizeVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [programError, setProgramError] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const [program, setProgram] = useState("");
  const [room, setRoom] = useState("");
  const [reason, setReason] = useState("");
  const [searchUsageType, setSearchUsageType] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [isFinalizeModalVisible, setIsFinalizeModalVisible] = useState(false);
  const [mergedData, setMergedData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const [tableData, setTableData] = useState([
    { key: 0, selectedItemId: null }, 
  ]);

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
          const tempRequestList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              selectedItem: {
                value: data.selectedItemId,
                label: data.selectedItemLabel, // <-- This restores the label after refresh
              },
            };
          });          
  
          setRequestList(tempRequestList);

          localStorage.setItem("requestList", JSON.stringify(tempRequestList));
  
        } catch (error) {
          console.error("Error fetching request list:", error);
        }
      }
    };
  
    
    fetchRequestList();
  }, []);  

  // REAL TIME UPDATE TEMREQ
  // useEffect(() => {
  //   const userId = localStorage.getItem("userId");

  //   const fetchRequestList = async () => {
  //     if (userId) {
  //       try {
  //         const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
  //         const querySnapshot = await getDocs(tempRequestRef);
  //         const tempRequestList = querySnapshot.docs.map((doc) => {
  //           const data = doc.data();
  //           return {
  //             ...data,
  //             selectedItem: {
  //               value: data.selectedItemId,
  //               label: data.selectedItemLabel, // <-- This restores the label after refresh
  //             },
  //           };
  //         });

  //         setRequestList(tempRequestList);
  //         localStorage.setItem("requestList", JSON.stringify(tempRequestList));

  //       } catch (error) {
  //         console.error("Error fetching request list:", error);
  //       }
  //     }
  //   };

  //   fetchRequestList(); // run initial fetch

  //   // Real-time listener
  //   let unsubscribe;
  //   if (userId) {
  //     const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
  //     unsubscribe = onSnapshot(tempRequestRef, (querySnapshot) => {
  //       const tempRequestList = querySnapshot.docs.map((doc) => {
  //         const data = doc.data();
  //         return {
  //           ...data,
  //           selectedItem: {
  //             value: data.selectedItemId,
  //             label: data.selectedItemLabel,
  //           },
  //         };
  //       });

  //       setRequestList(tempRequestList);
  //       localStorage.setItem("requestList", JSON.stringify(tempRequestList));
  //     }, (error) => {
  //       console.error("Real-time listener error:", error);
  //     });
  //   }

  //   // Clean up real-time listener on unmount
  //   return () => {
  //     if (unsubscribe) unsubscribe();
  //   };
  // }, []);

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

  const mergeData = useCallback(() => {
    const merged = [
      ...tableData,
      ...requestList.filter(item => !tableData.some(t => t.selectedItemId === item.selectedItemId)),
    ];
    console.log("Merged Data:", merged);
    setMergedData(merged);
  }, [tableData, requestList]); // <- dependencies added
  

  useEffect(() => {
    mergeData(); // will always use the freshest version now
  }, [mergeData]);

  const logRequestOrReturn = async (userId, userName, action, requestDetails) => {
    await addDoc(collection(db, `accounts/${userId}/activitylog`), {
      action, // e.g. "Requested Items" or "Returned Items"
      userName,
      timestamp: serverTimestamp(),
      requestList: requestDetails, 
    });
  };  
  
  const finalizeRequest = async () => {
    let isValid = true;
    let idsToRemove = [];
  
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
  
    if (mergedData.length === 0) {
      setNotificationMessage("Please add items to the request list!");
      setIsNotificationVisible(true);
      isValid = false;
    }

    console.log("Original mergedData:", mergedData);
    // Filter out incomplete items from mergedData
    const filteredMergedData = mergedData.filter(item =>
      item.itemName && item.category && item.quantity && item.labRoom &&
      item.status && item.condition && item.usageType && item.department
    );

    // Show a warning if all items are incomplete
    if (filteredMergedData.length === 0) {
      setNotificationMessage("Please complete all required item fields before finalizing.");
      setIsNotificationVisible(true);
      isValid = false;
    }
    console.log("Filtered mergedData:", filteredMergedData);

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
            filteredMergedData,
            userName,
            timestamp: Timestamp.now(),
          };
  
          await addDoc(userRequestRef, requestData);
  
          // Add to root userrequests collection
          const userRequestsRootRef = collection(db, "userrequests");
          const newUserRequestRef = doc(userRequestsRootRef);
          await setDoc(newUserRequestRef, {
            ...requestData,
            accountId: userId,
          });

          await logRequestOrReturn(userId, userName, "Requested Items", filteredMergedData); 
  
          const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
          const querySnapshot = await getDocs(tempRequestRef);
  
          const deletionPromises = [];
  
          querySnapshot.forEach((docSnapshot) => {
            const itemData = docSnapshot.data();
            idsToRemove.push(itemData.id);
  
            const pendingRequestRef = collection(db, "accounts", userId, "pendingrequest");
  
            deletionPromises.push(
              (async () => {
                // Add to pending requests
                await addDoc(pendingRequestRef, itemData);
  
                // Delete from temporaryRequests
                await deleteDoc(doc(db, "accounts", userId, "temporaryRequests", docSnapshot.id));
  
                // Delete from pendingRequest if already exists
                const pendingRequestDocs = await getDocs(pendingRequestRef);
                pendingRequestDocs.forEach((pendingDoc) => {
                  if (pendingDoc.data().id === itemData.id) {
                    deletionPromises.push(deleteDoc(doc(db, "accounts", userId, "pendingrequest", pendingDoc.id)));
                  }
                });
              })()
            );
          });
  
          await Promise.all(deletionPromises);
  
          // Filter out removed items from requestList
          const updatedRequestList = mergedData.filter((item) => !idsToRemove.includes(item.id));
          setRequestList(updatedRequestList);
          localStorage.setItem('requestList', JSON.stringify(updatedRequestList));
  
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
          setMergedData([]);
          setTableData([]); 
          console.log("MergedData after finalize:", mergedData);
          console.log("TableData after finalize:", tableData);

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

  const removeFromList = async (id) => {
    try {
      // Filter out the item from local state
      const updatedList = requestList.filter((item) => item.selectedItemId !== id);
      setRequestList(updatedList);
  
      // Also update tableData
      const updatedTableData = tableData.filter((item) => item.selectedItemId !== id);
      setTableData(updatedTableData);
  
      console.log("Attempting to remove ID:", id);
      console.log("Current requestList:", updatedList);
  
      // Update localStorage
      localStorage.setItem('requestList', JSON.stringify(updatedList));
  
      const userId = localStorage.getItem("userId"); 
      if (!userId) {
        console.warn("User ID not found in localStorage.");
        return;
      }
  
      // Check Firestore and remove item
      const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
      const querySnapshot = await getDocs(tempRequestRef);
  
      let foundInFirestore = false;
  
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data.id === id) {
          await deleteDoc(docSnapshot.ref);
          foundInFirestore = true;
          break;
        }
      }
  
      // Notify user
      setNotificationMessage(foundInFirestore ? "Item removed from the list" : "Item not found in Firestore.");
      setIsNotificationVisible(true);
  
    } catch (error) {
      console.error("Error removing item:", error);
      setNotificationMessage("Something went wrong while removing the item.");
      setIsNotificationVisible(true);
    }
  };

  const updateQuantity = (id, value) => {
    // Update the quantity in the requestList
    const updatedRequestList = requestList.map((item) =>
      item.id === id ? { ...item, quantity: value } : item
    );
    setRequestList(updatedRequestList);
    localStorage.setItem('requestList', JSON.stringify(updatedRequestList)); 
  
    // Update the quantity in tableData as well to keep the table consistent
    const updatedTableData = tableData.map((item) =>
      item.id === id ? { ...item, quantity: value } : item
    );
    setTableData(updatedTableData);
  };  

  const handleItemSelect = async (selected, index) => {
    const { value: itemId } = selected;
    const selectedItem = JSON.parse(JSON.stringify(items.find(item => item.id === itemId)));

    // Build new row object
    const newRow = {
      ...tableData[index],
      selectedItem: {
        value: itemId,
        label: selectedItem.itemName,
      },
      selectedItemId: itemId,
      itemName: selectedItem.itemName,
      category: selectedItem.category,
      quantity: tableData[index]?.quantity || 1,
      labRoom: selectedItem.labRoom,
      status: selectedItem.status,
      condition: selectedItem.condition,
      usageType: selectedItem.usageType,
      department: selectedItem.department,
    };
  
    // Update tableData
    const updatedData = [...tableData];
    updatedData[index] = newRow;
    setTableData(updatedData);
  
    // Ensure the item is added to requestList
    const existsInRequestList = requestList.some((item) => item.selectedItemId === itemId);
    let updatedRequestList = [...requestList];
  
    if (!existsInRequestList) {
      updatedRequestList.push(newRow);
      setRequestList(updatedRequestList);
      localStorage.setItem("requestList", JSON.stringify(updatedRequestList));
    }
  
    mergeData(); 
  
    const userId = localStorage.getItem("userId");
  
    if (userId) {
      try {
        const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
        await addDoc(tempRequestRef, {
          ...selectedItem,
          id: itemId,
          selectedItemId: itemId,
          selectedItemLabel: selectedItem.itemName,
          quantity: newRow.quantity,
          timestamp: Timestamp.fromDate(new Date()),
        });
  
        setNotificationMessage("Item added to temporary list.");
        setIsNotificationVisible(true);

      } catch (error) {
        console.error("Error adding item to temporary list:", error);
        setNotificationMessage("Failed to add item to temporary list.");
        setIsNotificationVisible(true);
      }
    }
  };
  
  useEffect(() => {
    mergeData();
  }, [requestList, tableData]);
  
  const columns = [
    {
      title: "Item Name",
      dataIndex: "selectedItemId",
      key: "selectedItemId",
      render: (value, record, index) => {
        // Get all selected item IDs except the current row
        const selectedIds = mergedData
          .filter((_, i) => i !== index)
          .map((row) => row.selectedItemId);
  
        return (
          <Select
            showSearch
            placeholder="Select item"
            style={{ width: 100 }}
            dropdownStyle={{ width: 700 }}
            optionFilterProp="label"
            labelInValue
            value={record.selectedItem || undefined}
            onChange={(selected) => handleItemSelect(selected, index)} // Trigger handleItemSelect on change
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {/* Map through filtered items instead of the entire items list */}
            {filteredItems.map((item) => {
              const label = `${item.itemName} | ${item.category} | Qty: ${item.quantity} | ${item.status} | ${item.condition} | ${item.usageType} | ${item.department}`;
              const isDisabled = selectedIds.includes(item.id);
  
              return (
                <Select.Option
                  key={item.id}
                  value={item.id}
                  label={item.itemName}
                  disabled={isDisabled}
                >
                  {label}
                </Select.Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (value, record) => (
        <Input
          type="number"
          min={1}
          value={record.quantity}
          onChange={async (e) => {
            const newQuantity = e.target.value;
    
            // Update local tableData
            const updated = tableData.map((row) =>
              row.key === record.key ? { ...row, quantity: newQuantity } : row
            );
            setTableData(updated);
    
            // Update requestList too (optional but keeps both in sync)
            const updatedRequestList = requestList.map((row) =>
              row.selectedItemId === record.selectedItemId ? { ...row, quantity: newQuantity } : row
            );
            setRequestList(updatedRequestList);
            localStorage.setItem("requestList", JSON.stringify(updatedRequestList));
    
            // Update Firestore
            const userId = localStorage.getItem("userId");
            if (userId) {
              const tempRequestRef = collection(db, "accounts", userId, "temporaryRequests");
    
              // Find the doc with this item's ID
              const snapshot = await getDocs(tempRequestRef);
              const docToUpdate = snapshot.docs.find(doc => doc.data().selectedItemId === record.selectedItemId);
    
              if (docToUpdate) {
                await updateDoc(doc(db, "accounts", userId, "temporaryRequests", docToUpdate.id), {
                  quantity: newQuantity,
                });
              }
            }
          }}
        />
      ),
    },    
    {
      title: "Lab Room",
      dataIndex: "labRoom",
      key: "labRoom",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
    },
    {
      title: "Usage Type",
      dataIndex: "usageType",
      key: "usageType",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromList(record.selectedItemId)}
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "80vh" }}>
      <Layout className="site-layout">
        <Content className="requisition-content">

          <div className="request-details">
            <div className="date-time-container">

            <div className="date-required">
              <strong>Date Required:</strong>
              <DatePicker
                value={dateRequired ? dayjs(dateRequired, "YYYY-MM-DD") : null}
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
                   value={timeFrom ? dayjs(timeFrom, "HH:mm") : null}
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
                    value={timeTo ? dayjs(timeTo, "HH:mm") : null}
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
                  type="number"
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

            <div className="dropdowns" style={{ display: "flex", gap: "20px" }}>
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
              
              <select
                value={searchCategory}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  setSearchCategory(selectedCategory);
                  if (selectedCategory === "") {
                    setFilteredItems(items);
                    
                  } else {
                    const filteredData = items.filter((item) => item.category === selectedCategory);
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
                <option value="">All Categories</option>
                <option value="Chemical">Chemical</option>
                <option value="Reagent">Reagent</option>
                <option value="Materials">Materials</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div className="table-request-container">
          <Table
            className="requisition-table"
            columns={columns}
            dataSource={mergedData}
            pagination={{ pageSize: 5 }}
            rowKey={(record) => record.key}
          />
          </div>

          <div>
            <Button
              type="dashed"
              onClick={() => {
                const lastRow = tableData[tableData.length - 1];

                if (!lastRow || lastRow.selectedItemId) {
                  setTableData([
                    ...tableData,
                    { key: Date.now(), selectedItemId: null }
                  ]);
                } else {
                  setNotificationMessage("Please select an item in the last row first.");
                  setIsNotificationVisible(true);
                }
              }}
              className="add-item-row-btn"
            >
              Add Item Row
            </Button>

            <Button
                type="primary"
                danger
                block
                className="finalize-btn"
                onClick={() => setIsFinalizeModalVisible(true)}
              >
                Finalize
            </Button>
          </div>
        </Content>

        <FinalizeRequestModal
          visible={isFinalizeModalVisible}
          onOk={() => {
            finalizeRequest();
            setIsFinalizeModalVisible(false);
          }}
          onCancel={() => setIsFinalizeModalVisible(false)}
          dateRequired={dateRequired}
          timeFrom={timeFrom}
          timeTo={timeTo}
          program={program}
          room={room}
          reason={reason}
          requestList={mergedData}
        />

        <SuccessModal isVisible={showModal} onClose={closeModal} />
      </Layout>
    </Layout>
  );  
};

export default Requisition;
