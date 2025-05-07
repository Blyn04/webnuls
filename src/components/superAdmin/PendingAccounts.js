// import React, { useState, useEffect } from "react";
// import { Layout, Row, Col, Button, Typography, Space, Table, notification } from "antd";
// import { db } from "../../backend/firebase/FirebaseConfig"; 
// import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc } from "firebase/firestore"; 

// const { Content } = Layout;
// const { Title } = Typography;

// const PendingAccounts = () => {
//   const [requests, setRequests] = useState([]);
//   const [selectedRequests, setSelectedRequests] = useState([]); // Track selected rows

//   useEffect(() => {
//     const fetchUserRequests = async () => {
//       try {
//         const userRequestRef = collection(db, "pendingaccounts");
//         const querySnapshot = await getDocs(userRequestRef);

//         const fetched = [];

//         querySnapshot.forEach((docSnap) => {
//           const data = docSnap.data();

//           fetched.push({
//             id: docSnap.id,
//             userName: data.name,
//             email: data.email,
//             department: data.department,
//             jobTitle: data.jobTitle,
//             role: data.role,
//             status: data.status,
//             createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "N/A",
//             uid: data.uid,
//           });
//         });

//         setRequests(fetched);
//       } catch (error) {
//         console.error("Error fetching requests: ", error);
//       }
//     };

//     fetchUserRequests();
//   }, []);

//   const sendEmailNotification = async ({ to, name, status }) => {
//     const subject = status === "approved"
//       ? "Account Approved - NU MOA ITSO"
//       : "Account Registration Rejected";
  
//     const text = status === "approved"
//       ? `Hi ${name},\n\nYour account has been approved by the ITSO.\n\nYou may now log in to the system.`
//       : `Hi ${name},\n\nWe regret to inform you that your account registration has been rejected.\n\nRegards,\nNU MOA ITSO Team`;
  
//     const html = status === "approved"
//       ? `<p>Hi ${name},</p><p>Your account has been <strong>approved</strong> by the ITSO.</p><p>You may now log in to the system.</p><p>Regards,<br>NU MOA ITSO Team</p>`
//       : `<p>Hi ${name},</p><p>Your account registration has been <strong>rejected</strong>.</p><p>Regards,<br>NU MOA ITSO Team</p>`;
  
//     try {
//       await fetch("https://sendemail-guopzbbmca-uc.a.run.app", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ to, subject, text, html }),
//       });
//     } catch (error) {
//       console.error("Error sending email notification:", error);
//     }
//   };  

//   const handleSelectChange = (selectedRowKeys) => {
//     setSelectedRequests(selectedRowKeys); // Update selected rows
//   };

//   const handleApprove = async () => {
//     try {
//       await Promise.all(
//         selectedRequests.map(async (requestId) => {
//           const requestRef = doc(db, "pendingaccounts", requestId);
//           const requestSnapshot = await getDoc(requestRef);
//           const requestData = requestSnapshot.data();
          
//           // Step 1: Check if the user already exists in 'accounts' collection by UID
//           const existingUserRef = doc(db, "accounts", requestData.uid);  // Use 'uid' as unique identifier
//           const existingUserSnapshot = await getDoc(existingUserRef);
  
//           // If the document already exists in 'accounts', skip this request
//           if (existingUserSnapshot.exists()) {
//             console.log("User already exists in accounts. Skipping...");
//             return; // Skip this iteration
//           }
  
//           // Step 2: Copy the approved request to the 'accounts' collection
//           const newAccountRef = collection(db, "accounts");
//           await addDoc(newAccountRef, {
//             ...requestData,
//             status: "approved",  // Set status to 'approved'
//             approvedAt: new Date(),  // Add timestamp for approval
//           });
  
//           // Step 3: Remove the document from the 'pendingaccounts' collection
//           await deleteDoc(requestRef); // Delete after copying
//         })
//       );
      
  
//       notification.success({
//         message: "Requests Approved",
//         description: "The selected account requests have been approved and moved to the accounts collection.",
//       });
  
//       // Remove the approved requests from the UI
//       setRequests((prevRequests) =>
//         prevRequests.filter((request) => !selectedRequests.includes(request.id))
//       );
  
//       setSelectedRequests([]); // Clear selected rows
      
//     } catch (error) {
//       console.error("Error approving request: ", error);
//       notification.error({
//         message: "Error",
//         description: "Failed to approve the selected requests.",
//       });
//     }
//   };
  
//   const handleReject = async () => {
//     try {
//       await Promise.all(
//         selectedRequests.map(async (requestId) => {
//           const requestRef = doc(db, "pendingaccounts", requestId);
          
//           // Step 1: Remove the document from the 'pendingaccounts' collection
//           await deleteDoc(requestRef); // Delete the document
  
//           // Optionally, you can also update the status to "rejected" before deletion, if needed.
//           // await updateDoc(requestRef, { status: "rejected" });
//         })
//       );
  
//       notification.success({
//         message: "Requests Rejected",
//         description: "The selected account requests have been rejected and removed from the pending list.",
//       });
  
//       // Remove the rejected requests from the UI
//       setRequests((prevRequests) =>
//         prevRequests.filter((request) => !selectedRequests.includes(request.id))
//       );
  
//       setSelectedRequests([]); // Clear selected 
      
//     } catch (error) {
//       console.error("Error rejecting request: ", error);
//       notification.error({
//         message: "Error",
//         description: "Failed to reject the selected requests.",
//       });
//     }
//   };  

//   const columns = [
//     {
//       title: "User Name",
//       dataIndex: "userName", 
//     },   
//     {
//       title: "Email",
//       dataIndex: "email",
//     },
//     {
//       title: "Department",
//       dataIndex: "department",
//     },
//     {
//       title: "Job Title",
//       dataIndex: "jobTitle",
//     },
//     {
//       title: "Role",
//       dataIndex: "role",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//     },
//   ];

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <Layout>
//         <Content style={{ margin: "20px" }}>
//           <Row gutter={24}>
//             <Col span={24}>
//               <Title level={4}>List of Pending Accounts</Title>
//               <Table
//                 rowKey="id"
//                 dataSource={requests}
//                 pagination={{ pageSize: 5 }}
//                 columns={columns}
//                 className="pending-accounts-table"
//                 rowSelection={{
//                   type: "checkbox",
//                   selectedRowKeys: selectedRequests,
//                   onChange: handleSelectChange,
//                 }}
//               />
//               <Space>
//                 <Button
//                   type="primary"
//                   onClick={handleApprove}
//                   disabled={selectedRequests.length === 0}
//                 >
//                   Approve Selected
//                 </Button>

//                 <Button
//                   type="danger"
//                   onClick={handleReject}
//                   disabled={selectedRequests.length === 0}
//                 >
//                   Reject Selected
//                 </Button>
//               </Space>
//             </Col>
//           </Row>
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default PendingAccounts;

import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Button, Typography, Space, Table, notification } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const { Content } = Layout;
const { Title } = Typography;

const PendingAccounts = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]); // Track selected rows

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const userRequestRef = collection(db, "pendingaccounts");
        const querySnapshot = await getDocs(userRequestRef);

        const fetched = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();

          fetched.push({
            id: docSnap.id,
            userName: data.name,
            email: data.email,
            department: data.department,
            jobTitle: data.jobTitle,
            role: data.role,
            status: data.status,
            createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "N/A",
            // uid: data.uid,
          });
        });

        setRequests(fetched);
      } catch (error) {
        console.error("Error fetching requests: ", error);
      }
    };

    fetchUserRequests();
  }, []);

  const sendEmailNotification = async ({ to, name, status }) => {
    const subject = status === "approved"
      ? "Account Approved - NU MOA ITSO"
      : "Account Registration Rejected";

    const text = status === "approved"
      ? `Hi ${name},\n\nYour account has been approved by the ITSO.\n\nYou may now log in to the system.`
      : `Hi ${name},\n\nWe regret to inform you that your account registration has been rejected.\n\nRegards,\nNU MOA ITSO Team`;

    const html = status === "approved"
      ? `<p>Hi ${name},</p><p>Your account has been <strong>approved</strong> by the ITSO.</p><p>You may now log in to the system.</p><p>Regards,<br>NU MOA ITSO Team</p>`
      : `<p>Hi ${name},</p><p>Your account registration has been <strong>rejected</strong>.</p><p>Regards,<br>NU MOA ITSO Team</p>`;

    try {
      await fetch("https://sendemail-guopzbbmca-uc.a.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, text, html }),
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  };

  const handleSelectChange = (selectedRowKeys) => {
    setSelectedRequests(selectedRowKeys); // Update selected rows
  };

  const handleApprove = async () => {
    const auth = getAuth();
    
    try {
      await Promise.all(
        selectedRequests.map(async (requestId) => {
          const requestRef = doc(db, "pendingaccounts", requestId);
          const requestSnapshot = await getDoc(requestRef);
          const requestData = requestSnapshot.data();
          
          if (!requestData) {
            console.warn(`No data found for request ID: ${requestId}`);
            return;
          }

          // Step 1: Check if the user already exists in 'accounts' collection by UID
          // const existingUserRef = doc(db, "accounts", requestData.uid);  // Use 'uid' as unique identifier
          // const existingUserSnapshot = await getDoc(existingUserRef);
  
          // // If the document already exists in 'accounts', skip this request
          // if (existingUserSnapshot.exists()) {
          //   console.log("User already exists in accounts. Skipping...");
          //   return; // Skip this iteration
          // }

        // Step 1: Check if the user already exists in 'accounts' collection by UID
        if (requestData.uid) {
          const existingUserRef = doc(db, "accounts", requestData.uid);
          const existingUserSnapshot = await getDoc(existingUserRef);

          if (existingUserSnapshot.exists()) {
            console.log("User already exists in accounts. Skipping...");
            return;
          }
        }
  
          // Step 2: Copy the approved request to the 'accounts' collection
          // const newAccountRef = collection(db, "accounts");
          // await addDoc(newAccountRef, {
          //   ...requestData,
          //   status: "approved",  // Set status to 'approved'
          //   approvedAt: new Date(),  // Add timestamp for approval
          // });

          // Step 2: Create the Firebase Auth user
          const auth = getAuth();
          const userCredential = await createUserWithEmailAndPassword(auth, requestData.email, requestData.password);

          // Step 3: Store the user in the 'accounts' collection
          const userUID = userCredential.user.uid; // Firebase Auth UID
          const newAccountRef = doc(db, "accounts", userUID);
          await setDoc(newAccountRef, {
            ...requestData,
            uid: userUID, // Store Firebase Auth UID in Firestore
            status: "approved",
            approvedAt: new Date(),
          });

          // ✅ Send email notification
          await sendEmailNotification({
            to: requestData.email,
            name: requestData.name,
            status: "approved",
          });
  
          // Step 4: Remove the document from the 'pendingaccounts' collection
          await deleteDoc(requestRef); // Delete after copying
        })
      );
  
      notification.success({
        message: "Requests Approved",
        description: "The selected account requests have been approved and moved to the accounts collection.",
      });
  
      // Remove the approved requests from the UI
      setRequests((prevRequests) =>
        prevRequests.filter((request) => !selectedRequests.includes(request.id))
      );
  
      setSelectedRequests([]); // Clear selected rows
      
    } catch (error) {
      console.error("Error approving request: ", error);
      notification.error({
        message: "Error",
        description: "Failed to approve the selected requests.",
      });
    }
  };
  
  const handleReject = async () => {
    try {
      await Promise.all(
        selectedRequests.map(async (requestId) => {
          const requestRef = doc(db, "pendingaccounts", requestId);
          const requestSnapshot = await getDoc(requestRef);
          const requestData = requestSnapshot.data();

          // ✅ Send rejection email
          await sendEmailNotification({
            to: requestData.email,
            name: requestData.name,
            status: "rejected",
          });

          // Step 1: Remove the document from the 'pendingaccounts' collection
          await deleteDoc(requestRef); // Delete the document
        })
      );
  
      notification.success({
        message: "Requests Rejected",
        description: "The selected account requests have been rejected and removed from the pending list.",
      });
  
      // Remove the rejected requests from the UI
      setRequests((prevRequests) =>
        prevRequests.filter((request) => !selectedRequests.includes(request.id))
      );
  
      setSelectedRequests([]); // Clear selected 
      
    } catch (error) {
      console.error("Error rejecting request: ", error);
      notification.error({
        message: "Error",
        description: "Failed to reject the selected requests.",
      });
    }
  };  

  const columns = [
    {
      title: "User Name",
      dataIndex: "userName", 
    },   
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Department",
      dataIndex: "department",
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
    },
    {
      title: "Role",
      dataIndex: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px" }}>
          <Row gutter={24}>
            <Col span={24}>
              <Title level={4}>List of Pending Accounts</Title>
              <Table
                rowKey="id"
                dataSource={requests}
                pagination={{ pageSize: 5 }}
                columns={columns}
                className="pending-accounts-table"
                rowSelection={{
                  type: "checkbox",
                  selectedRowKeys: selectedRequests,
                  onChange: handleSelectChange,
                }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={handleApprove}
                  disabled={selectedRequests.length === 0}
                >
                  Approve Selected
                </Button>

                <Button
                  type="danger"
                  onClick={handleReject}
                  disabled={selectedRequests.length === 0}
                >
                  Reject Selected
                </Button>
              </Space>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PendingAccounts;
