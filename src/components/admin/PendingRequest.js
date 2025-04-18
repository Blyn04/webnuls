import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Button, Typography, Space, Modal, Table, notification, Input } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/PendingRequest.css";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, getDocs, getDoc, doc, addDoc, query, where, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import RequisitionRequestModal from "../customs/RequisitionRequestModal";
import ApprovedRequestModal from "../customs/ApprovedRequestModal";

const { Content } = Layout;
const { Title, Text } = Typography;

const PendingRequest = () => {
  const [pageTitle, setPageTitle] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [selectedApprovedRequest, setSelectedApprovedRequest] = useState(null);
  const [isApprovedModalVisible, setIsApprovedModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const userRequestRef = collection(db, "userrequests");
        const querySnapshot = await getDocs(userRequestRef);
  
        const fetched = [];
  
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
  
          // Enrich filteredMergedData with item details
          const enrichedItems = await Promise.all(
            (data.filteredMergedData || []).map(async (item) => {
              const inventoryId = item.selectedItemId || item.selectedItem?.value;
              let itemId = "N/A";
  
              if (inventoryId) {
                try {
                  const invDoc = await getDoc(doc(db, `inventory/${inventoryId}`));
                  if (invDoc.exists()) {
                    itemId = invDoc.data().itemId || "N/A";
                  }
                } catch (err) {
                  console.error(`Error fetching inventory item ${inventoryId}:`, err);
                }
              }
  
              return {
                ...item,
                itemIdFromInventory: itemId,
              };
            })
          );
  
          // Push data with timeFrom and timeTo
          fetched.push({
            id: docSnap.id,
            ...data,
            requestList: enrichedItems,
            timeFrom: data.timeFrom || "N/A", // Include timeFrom
            timeTo: data.timeTo || "N/A",     // Include timeTo
          });
        }
  
        setRequests(fetched);
  
      } catch (error) {
        console.error("Error fetching requests: ", error);
      }
    };
  
    fetchUserRequests();
  }, []);  
  
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setCheckedItems({});
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  // const handleApprove = async () => { 
  //   const isChecked = Object.values(checkedItems).some((checked) => checked);
  
  //   if (!isChecked) {
  //     setNotificationMessage("No Items selected");
  //     setIsNotificationVisible(true);
  //     return;
  //   }
  
  //   if (selectedRequest) {
  //     const filteredItems = selectedRequest.requestList.filter((item, index) => {
  //       const key = `${selectedRequest.id}-${index}`;
  //       return checkedItems[key];
  //     });
  
  //     if (filteredItems.length === 0) {
  //       setNotificationMessage("No Items selected");
  //       setIsNotificationVisible(true);
  //       return;
  //     }
  
  //     const enrichedItems = await Promise.all(
  //       filteredItems.map(async (item) => {
  //         const selectedItemId = item.selectedItemId || item.selectedItem?.value;
  //         let itemType = "Unknown";
  
  //         if (selectedItemId) {
  //           try {
  //             const inventoryDoc = await getDoc(doc(db, "inventory", selectedItemId));
  //             if (inventoryDoc.exists()) {
  //               itemType = inventoryDoc.data().type || "Unknown";
  //             }

  //           } catch (err) {
  //             console.error(`Failed to fetch type for inventory item ${selectedItemId}:`, err);
  //           }
  //         }
  
  //         return {
  //           ...item,
  //           selectedItemId,
  //           itemType, 
  //         };
  //       })
  //     );
  
  //     const auth = getAuth();
  //     const currentUser = auth.currentUser;
  //     const userEmail = currentUser.email;
  
  //     // Fetch the user name from Firestore
  //     let userName = "Unknown";
  //     try {
  //       const userQuery = query(collection(db, "accounts"), where("email", "==", userEmail));
  //       const userSnapshot = await getDocs(userQuery);
  
  //       if (!userSnapshot.empty) {
  //         const userDoc = userSnapshot.docs[0];
  //         const userData = userDoc.data();
  //         userName = userData.name || "Unknown";
  //       }

  //     } catch (error) {
  //       console.error("Error fetching user name:", error);
  //     }
  
  //     const requestLogEntry = {
  //       accountId: selectedRequest.accountId || "N/A",
  //       userName: selectedRequest.userName || "N/A",
  //       room: selectedRequest.room || "N/A",
  //       courseCode: selectedRequest.courseCode || "N/A",
  //       courseDescription: selectedRequest.courseDescription || "N/A",
  //       dateRequired: selectedRequest.dateRequired || "N/A",
  //       timeFrom: selectedRequest.timeFrom || "N/A",  
  //       timeTo: selectedRequest.timeTo || "N/A",  
  //       timestamp: selectedRequest.timestamp || new Date(), 
  //       requestList: enrichedItems, 
  //       status: "Approved", 
  //       approvedBy: userName, 
  //       reason: selectedRequest.reason || "No reason provided",
  //       program: selectedRequest.program,
  //     };
  
  //     try {
  //       // First, add the request log entry to the "requestlog" collection
  //       await addDoc(collection(db, "requestlog"), requestLogEntry);
  
  //       // Now handle the "Fixed" items by adding them to the borrowcatalog collection
  //       const fixedItems = enrichedItems.filter(item => item.itemType === "Fixed");
  //       if (fixedItems.length > 0) {
  //         await Promise.all(
  //           fixedItems.map(async (item) => {
  //             const borrowCatalogEntry = {
  //               accountId: selectedRequest.accountId || "N/A",
  //               userName: selectedRequest.userName || "N/A",
  //               room: selectedRequest.room || "N/A",
  //               courseCode: selectedRequest.courseCode || "N/A",
  //               courseDescription: selectedRequest.courseDescription || "N/A",
  //               dateRequired: selectedRequest.dateRequired || "N/A",
  //               timeFrom: selectedRequest.timeFrom || "N/A",  // Add timeFrom
  //               timeTo: selectedRequest.timeTo || "N/A",  
  //               timestamp: selectedRequest.timestamp || new Date(),
  //               requestList: [item],  // Add only the selected "Fixed" item
  //               status: "Borrowed",    // Status can be "Borrowed" instead of "Approved"
  //               approvedBy: userName,
  //               reason: selectedRequest.reason || "No reason provided",
  //               program: selectedRequest.program,
  //             };

  //             // Add to userrequestlog subcollection for the requestor's account
  //             const userRequestLogEntry = {
  //               ...requestLogEntry,
  //               status: "Approved", 
  //               approvedBy: userName,
  //               timestamp: new Date(), // You can choose to use the original timestamp or the current one
  //             };
  
  //             // Add to borrowcatalog collection
  //             await addDoc(collection(db, "borrowcatalog"), borrowCatalogEntry);

  //             // Add to the user's 'userrequestlog' subcollection
  //             await addDoc(collection(db, "accounts", selectedRequest.accountId, "userrequestlog"), userRequestLogEntry);
  //           })
  //         );
  //       }

  //       const logRequestOrReturn = async (
  //         userId,
  //         userName,
  //         action,
  //         requestDetails,
  //         extraInfo = {} // for fields like dateRequired, approvedBy, etc.
  //       ) => {
  //         await addDoc(collection(db, `accounts/${userId}/historylog`), {
  //           action,
  //           userName,
  //           timestamp: serverTimestamp(),
  //           requestList: requestDetails,
  //           ...extraInfo, // merge additional data like dateRequired, reason, etc.
  //         });
  //       };

  //       await logRequestOrReturn(
  //         selectedRequest.accountId,     // user ID
  //         selectedRequest.userName,      // user name
  //         "Request Approved",            // action
  //         enrichedItems,                 // request list
  //         {
  //           approvedBy: userName, // whoever approved
  //           courseCode: selectedRequest.courseCode || "N/A",
  //           courseDescription: selectedRequest.courseDescription || "N/A",
  //           dateRequired: selectedRequest.dateRequired,
  //           reason: selectedRequest.reason,
  //           room: selectedRequest.room,
  //           program: selectedRequest.program,
  //           timeFrom: selectedRequest.timeFrom || "N/A",  // Include timeFrom
  //           timeTo: selectedRequest.timeTo || "N/A",  
  //         }
  //       );

  //       console.log("selectedRequest.id:", selectedRequest.id);
  //       console.log("selectedRequest.accountId:", selectedRequest.accountId);
  //       // ✅ Delete from userrequests main collection
  //       await deleteDoc(doc(db, "userrequests", selectedRequest.id));

  //       // ✅ Delete from subcollection with matching timestamp and selectedItemId
  //       const subCollectionRef = collection(db, "accounts", selectedRequest.accountId, "userRequests");
  //       const subDocsSnap = await getDocs(subCollectionRef);

  //       subDocsSnap.forEach(async (docSnap) => {
  //         const data = docSnap.data();
  //         const match = (
  //           data.timestamp?.seconds === selectedRequest.timestamp?.seconds &&
  //           data.filteredMergedData?.[0]?.selectedItemId === selectedRequest.filteredMergedData?.[0]?.selectedItemId
  //         );

  //         if (match) {
  //           console.log("✅ Deleting from subcollection:", docSnap.id);
  //           await deleteDoc(doc(db, "accounts", selectedRequest.accountId, "userRequests", docSnap.id));
  //         }
  //       });

  //       setApprovedRequests([...approvedRequests, requestLogEntry]);
  //       setRequests(requests.filter((req) => req.id !== selectedRequest.id));
  //       setCheckedItems({});
  //       setIsModalVisible(false);
  //       setSelectedRequest(null);
  
  //       notification.success({
  //         message: "Request Approved",
  //         description: "Request has been approved and logged.",
  //       });

  //     } catch (error) {
  //       console.error("Error adding to requestlog:", error);
  //       notification.error({
  //         message: "Approval Failed",
  //         description: "There was an error logging the approved request.",
  //       });
  //     }
  //   }
  // };

  const handleApprove = async () => {  
    const isChecked = Object.values(checkedItems).some((checked) => checked);
  
    if (!isChecked) {
      setNotificationMessage("No Items selected");
      setIsNotificationVisible(true);
      return;
    }
  
    if (selectedRequest) {
      // Filter checked items and prepare for approval
      const filteredItems = selectedRequest.requestList.filter((item, index) => {
        const key = `${selectedRequest.id}-${index}`;
        return checkedItems[key];
      });
  
      if (filteredItems.length === 0) {
        setNotificationMessage("No Items selected");
        setIsNotificationVisible(true);
        return;
      }
  
      const enrichedItems = await Promise.all(
        filteredItems.map(async (item) => {
          const selectedItemId = item.selectedItemId || item.selectedItem?.value;
          let itemType = "Unknown";
  
          if (selectedItemId) {
            try {
              const inventoryDoc = await getDoc(doc(db, "inventory", selectedItemId));
              if (inventoryDoc.exists()) {
                itemType = inventoryDoc.data().type || "Unknown";
              }
              
            } catch (err) {
              console.error(`Failed to fetch type for inventory item ${selectedItemId}:`, err);
            }
          }
  
          return {
            ...item,
            selectedItemId,
            itemType, 
          };
        })
      );
  
      // Filter out unchecked items (for rejection)
      const uncheckedItems = selectedRequest.requestList.filter((item, index) => {
        const key = `${selectedRequest.id}-${index}`;
        return !checkedItems[key]; // This will get the unchecked items
      });
  
      // Process rejected items
      const rejectedItems = await Promise.all(
        uncheckedItems.map(async (item) => {
          const selectedItemId = item.selectedItemId || item.selectedItem?.value;
          let itemType = "Unknown";
  
          if (selectedItemId) {
            try {
              const inventoryDoc = await getDoc(doc(db, "inventory", selectedItemId));
              if (inventoryDoc.exists()) {
                itemType = inventoryDoc.data().type || "Unknown";
              }
            } catch (err) {
              console.error(`Failed to fetch type for inventory item ${selectedItemId}:`, err);
            }
          }
  
          return {
            ...item,
            selectedItemId,
            itemType, 
          };
        })
      );
  
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userEmail = currentUser.email;
  
      // Fetch the user name from Firestore
      let userName = "Unknown";
      try {
        const userQuery = query(collection(db, "accounts"), where("email", "==", userEmail));
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          userName = userData.name || "Unknown";
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
  
      const requestLogEntry = {
        accountId: selectedRequest.accountId || "N/A",
        userName: selectedRequest.userName || "N/A",
        room: selectedRequest.room || "N/A",
        courseCode: selectedRequest.courseCode || "N/A",
        courseDescription: selectedRequest.courseDescription || "N/A",
        dateRequired: selectedRequest.dateRequired || "N/A",
        timeFrom: selectedRequest.timeFrom || "N/A",  
        timeTo: selectedRequest.timeTo || "N/A",  
        timestamp: selectedRequest.timestamp || new Date(), 
        requestList: enrichedItems, 
        status: "Approved", 
        approvedBy: userName, 
        reason: selectedRequest.reason || "No reason provided",
        program: selectedRequest.program,
      };
  
      const rejectLogEntry = {
        accountId: selectedRequest.accountId || "N/A",
        userName: selectedRequest.userName || "N/A",
        room: selectedRequest.room || "N/A",
        courseCode: selectedRequest.courseCode || "N/A",
        courseDescription: selectedRequest.courseDescription || "N/A",
        dateRequired: selectedRequest.dateRequired || "N/A",
        timeFrom: selectedRequest.timeFrom || "N/A",  
        timeTo: selectedRequest.timeTo || "N/A",  
        timestamp: selectedRequest.timestamp || new Date(),
        requestList: rejectedItems, 
        status: "Rejected", 
        rejectedBy: userName, 
        reason: "Item not selected for approval",
        program: selectedRequest.program,
      };
  
      // Log approved items in historylog subcollection
      const logRequestOrReturn = async (
        userId,
        userName,
        action,
        requestDetails,
        extraInfo = {} // for fields like dateRequired, approvedBy, etc.
      ) => {
        await addDoc(collection(db, `accounts/${userId}/historylog`), {
          action,
          userName,
          timestamp: serverTimestamp(),
          requestList: requestDetails,
          ...extraInfo, // merge additional data like dateRequired, reason, etc.
        });
      };

      // Log approved items
      await logRequestOrReturn(
        selectedRequest.accountId,     // user ID
        selectedRequest.userName,      // user name
        "Request Approved",            // action
        enrichedItems,                 // request list
        {
          approvedBy: userName, // whoever approved
          courseCode: selectedRequest.courseCode || "N/A",
          courseDescription: selectedRequest.courseDescription || "N/A",
          dateRequired: selectedRequest.dateRequired,
          reason: selectedRequest.reason,
          room: selectedRequest.room,
          program: selectedRequest.program,
          timeFrom: selectedRequest.timeFrom || "N/A",  // Include timeFrom
          timeTo: selectedRequest.timeTo || "N/A",  
        }
      );

      // Log rejected items
      if (rejectedItems.length > 0) {
        await logRequestOrReturn(
          selectedRequest.accountId,     // user ID
          selectedRequest.userName,      // user name
          "Request Rejected",            // action
          rejectedItems,                 // request list
          {
            rejectedBy: userName, // whoever rejected
            courseCode: selectedRequest.courseCode || "N/A",
            courseDescription: selectedRequest.courseDescription || "N/A",
            dateRequired: selectedRequest.dateRequired,
            reason: "Item not selected for approval",  // Reason for rejection
            room: selectedRequest.room,
            program: selectedRequest.program,
            timeFrom: selectedRequest.timeFrom || "N/A",  // Include timeFrom
            timeTo: selectedRequest.timeTo || "N/A",  
          }
        );
      }
  
      try {
        // Add to requestlog for approval
        await addDoc(collection(db, "requestlog"), requestLogEntry);
  
        // Add to requestlog for rejection
        if (rejectedItems.length > 0) {
          await addDoc(collection(db, "requestlog"), rejectLogEntry);
        }
  
        // Proceed with borrow catalog logic for approved items
        const fixedItems = enrichedItems.filter(item => item.itemType === "Fixed");
        if (fixedItems.length > 0) {
          await Promise.all(
            fixedItems.map(async (item) => {
              const borrowCatalogEntry = {
                accountId: selectedRequest.accountId || "N/A",
                userName: selectedRequest.userName || "N/A",
                room: selectedRequest.room || "N/A",
                courseCode: selectedRequest.courseCode || "N/A",
                courseDescription: selectedRequest.courseDescription || "N/A",
                dateRequired: selectedRequest.dateRequired || "N/A",
                timeFrom: selectedRequest.timeFrom || "N/A",  // Add timeFrom
                timeTo: selectedRequest.timeTo || "N/A",  
                timestamp: selectedRequest.timestamp || new Date(),
                requestList: [item],  // Add only the selected "Fixed" item
                status: "Borrowed",    // Status can be "Borrowed" instead of "Approved"
                approvedBy: userName,
                reason: selectedRequest.reason || "No reason provided",
                program: selectedRequest.program,
              };
  
              // Add to userrequestlog subcollection for the requestor's account
              const userRequestLogEntry = {
                ...requestLogEntry,
                status: "Approved", 
                approvedBy: userName,
                timestamp: new Date(), // You can choose to use the original timestamp or the current one
              };
  
              // Add to borrowcatalog collection
              await addDoc(collection(db, "borrowcatalog"), borrowCatalogEntry);
  
              // Add to the user's 'userrequestlog' subcollection
              await addDoc(collection(db, "accounts", selectedRequest.accountId, "userrequestlog"), userRequestLogEntry);
            })
          );
        }
  
        await deleteDoc(doc(db, "userrequests", selectedRequest.id));
  
        // Cleanup the user requests subcollection
        const subCollectionRef = collection(db, "accounts", selectedRequest.accountId, "userRequests");
        const subDocsSnap = await getDocs(subCollectionRef);
  
        subDocsSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          const match = (
            data.timestamp?.seconds === selectedRequest.timestamp?.seconds &&
            data.filteredMergedData?.[0]?.selectedItemId === selectedRequest.filteredMergedData?.[0]?.selectedItemId
          );
  
          if (match) {
            console.log("✅ Deleting from subcollection:", docSnap.id);
            await deleteDoc(doc(db, "accounts", selectedRequest.accountId, "userRequests", docSnap.id));
          }
        });
  
        setApprovedRequests([...approvedRequests, requestLogEntry]);
        setRequests(requests.filter((req) => req.id !== selectedRequest.id));
        setCheckedItems({});
        setIsModalVisible(false);
        setSelectedRequest(null);
  
        notification.success({
          message: "Request Approved",
          description: "Request has been approved and logged.",
        });
  
      } catch (error) {
        console.error("Error adding to requestlog:", error);
        notification.error({
          message: "Approval Failed",
          description: "There was an error logging the approved request.",
        });
      }
    }
  };

  const handleReject = () => {
    // Open the rejection reason modal
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    const isChecked = Object.values(checkedItems).some((checked) => checked);
  
    if (!isChecked) {
      setNotificationMessage("No Items selected");
      setIsNotificationVisible(true);
      return;
    }
  
    if (selectedRequest) {
      const filteredItems = selectedRequest.requestList.filter((item, index) => {
        const key = `${selectedRequest.id}-${index}`;
        return checkedItems[key];
      });
  
      if (filteredItems.length === 0) {
        setNotificationMessage("No Items selected");
        setIsNotificationVisible(true);
        return;
      }
  
      const enrichedItems = await Promise.all(
        filteredItems.map(async (item) => {
          const selectedItemId = item.selectedItemId || item.selectedItem?.value;
          let itemType = "Unknown";
  
          if (selectedItemId) {
            try {
              const inventoryDoc = await getDoc(doc(db, "inventory", selectedItemId));
              if (inventoryDoc.exists()) {
                itemType = inventoryDoc.data().type || "Unknown";
              }
            } catch (err) {
              console.error(`Failed to fetch type for inventory item ${selectedItemId}:`, err);
            }
          }
  
          return {
            ...item,
            selectedItemId,
            itemType,
          };
        })
      );
  
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userEmail = currentUser.email;
  
      // Fetch the user name from Firestore
      let userName = "Unknown";
      try {
        const userQuery = query(collection(db, "accounts"), where("email", "==", userEmail));
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          userName = userData.name || "Unknown";
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
  
      const rejectLogEntry = {
        accountId: selectedRequest.accountId || "N/A",
        userName: selectedRequest.userName || "N/A",
        room: selectedRequest.room || "N/A",
        courseCode: selectedRequest.courseCode || "N/A",
        courseDescription: selectedRequest.courseDescription || "N/A",
        dateRequired: selectedRequest.dateRequired || "N/A",
        timeFrom: selectedRequest.timeFrom || "N/A",  
        timeTo: selectedRequest.timeTo || "N/A",  
        timestamp: selectedRequest.timestamp || new Date(),
        requestList: enrichedItems, 
        status: "Rejected", 
        rejectedBy: userName, 
        reason: rejectReason || "No reason provided",
        program: selectedRequest.program,
      };
  
      try {
        // Add to rejection log (requestlog collection)
        await addDoc(collection(db, "requestlog"), rejectLogEntry);

        // Add to historylog subcollection for the user
        await addDoc(
          collection(db, "accounts", selectedRequest.accountId, "historylog"), 
          {
            ...rejectLogEntry, 
            action: "Request Rejected", 
            timestamp: serverTimestamp(),
          }
        );        
  
        // Delete rejected request from userrequests
        await deleteDoc(doc(db, "userrequests", selectedRequest.id));
  
        // Delete from subcollection with matching timestamp and selectedItemId
        const subCollectionRef = collection(db, "accounts", selectedRequest.accountId, "userRequests");
        const subDocsSnap = await getDocs(subCollectionRef);

        subDocsSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          const match = (
            data.timestamp?.seconds === selectedRequest.timestamp?.seconds &&
            data.filteredMergedData?.[0]?.selectedItemId === selectedRequest.filteredMergedData?.[0]?.selectedItemId
          );

          if (match) {
            console.log("✅ Deleting from subcollection:", docSnap.id);
            await deleteDoc(doc(db, "accounts", selectedRequest.accountId, "userRequests", docSnap.id));
          }
        });
  
        // Update state
        setRequests(requests.filter((req) => req.id !== selectedRequest.id));
        setCheckedItems({});
        setIsRejectModalVisible(false);
        setRejectReason(""); 
        setIsModalVisible(false);
  
        notification.success({
          message: "Request Rejected",
          description: "Request has been rejected and logged.",
        });

      } catch (error) {
        console.error("Error adding rejection log:", error);
        notification.error({
          message: "Rejection Failed",
          description: "There was an error logging the rejected request.",
        });
      }
    }
  };

  const columns = [
    {
      title: "Check",
      dataIndex: "check",
      render: (_, record, index) => (
        <input
          type="checkbox"
          checked={checkedItems[`${selectedRequest?.id}-${index}`] || false}
          onChange={(e) =>
            setCheckedItems({
              ...checkedItems,
              [`${selectedRequest?.id}-${index}`]: e.target.checked,
            })
          }         
        />
      ),
      width: 50,
    },
    {
      title: "Item ID",
      dataIndex: "itemIdFromInventory", 
      render: (text) => text || "N/A",  
    },   
    {
      title: "Item Description",
      dataIndex: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Item Condition",
      dataIndex: "condition",
    },
  ];

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const date = timestamp.toDate(); 
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px" }}>
          <Row gutter={24}>
            <Col span={24}>
            <Title level={4}>List of Requests</Title>
              <Table
                dataSource={requests}
                rowKey="id"
                onRow={(record) => ({
                  onClick: () => handleViewDetails(record),
                })}
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: "Requestor",
                    dataIndex: "userName",
                    key: "userName",
                    render: (text, record, index) => (
                      <span>
                        {index + 1}. <strong>{text}</strong>
                      </span>
                    ),
                  },
                  {
                    title: "Room",
                    dataIndex: "room",
                  },
                  {
                    title: "Course Code",
                    dataIndex: "courseCode",
                  },
                  {
                    title: "Course Description",
                    dataIndex: "courseDescription",
                  },
                  {
                    title: "Requisition Date",
                    dataIndex: "timestamp",
                    render: formatDate,
                  },
                  {
                    title: "Required Date",
                    dataIndex: "dateRequired",
                  },
                ]}
              />

              <div className="cards-hidden">
                {requests.map((request, index) => (
                  <Card key={request.id} className="request-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong> {index + 1}. </Text>
                        <Text strong>
                          Requestor: {request.userName}
                          <span style={{ fontWeight: "bold" }}>
                            {request.name}
                          </span>
                        </Text>
                      </Col>
                      <Col>
                        <Space size="middle">
                          <Button
                            type="link"
                            className="view-btn"
                            onClick={() => handleViewDetails(request)}
                          >
                            View Details
                          </Button>
                        </Space>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: 8 }}>
                      <Col span={18} style={{ textAlign: "left" }}>
                        <Text type="secondary">
                          Room: {request.room} | Course Code: {request.courseCode}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Course: {request.courseDescription}
                        </Text>
                      </Col>
                      <Col style={{ textAlign: "right" }}>
                        <Text type="secondary">
                          Requisition Date: {formatDate(request.timestamp)}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Required Date: {request.dateRequired}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

            </Col>
          </Row>
        </Content>

        <Modal
        title="Reject Reason"
        visible={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        onOk={handleRejectSubmit}
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Please provide a reason for rejection"
        />
      </Modal>

        <RequisitionRequestModal
          isModalVisible={isModalVisible}
          handleCancel={handleCancel}
          handleApprove={handleApprove}
          handleReturn={handleReject}
          selectedRequest={selectedRequest}
          columns={columns}
          formatDate={formatDate}
        />

        <ApprovedRequestModal
          isApprovedModalVisible={isApprovedModalVisible}
          setIsApprovedModalVisible={setIsApprovedModalVisible}
          selectedApprovedRequest={selectedApprovedRequest}
          setSelectedApprovedRequest={setSelectedApprovedRequest}
          columns={columns}
          formatDate={formatDate}
        />

      </Layout>
    </Layout>
  );
};

export default PendingRequest;
