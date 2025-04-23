import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Button, Typography, Space, Table, notification } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc } from "firebase/firestore"; 

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
            uid: data.uid,
          });
        });

        setRequests(fetched);
      } catch (error) {
        console.error("Error fetching requests: ", error);
      }
    };

    fetchUserRequests();
  }, []);

  const handleSelectChange = (selectedRowKeys) => {
    setSelectedRequests(selectedRowKeys); // Update selected rows
  };

  const handleApprove = async () => {
    try {
      await Promise.all(
        selectedRequests.map(async (requestId) => {
          const requestRef = doc(db, "pendingaccounts", requestId);
          const requestSnapshot = await getDoc(requestRef);
          const requestData = requestSnapshot.data();
          
          // Step 1: Check if the user already exists in 'accounts' collection by UID
          const existingUserRef = doc(db, "accounts", requestData.uid);  // Use 'uid' as unique identifier
          const existingUserSnapshot = await getDoc(existingUserRef);
  
          // If the document already exists in 'accounts', skip this request
          if (existingUserSnapshot.exists()) {
            console.log("User already exists in accounts. Skipping...");
            return; // Skip this iteration
          }
  
          // Step 2: Copy the approved request to the 'accounts' collection
          const newAccountRef = collection(db, "accounts");
          await addDoc(newAccountRef, {
            ...requestData,
            status: "approved",  // Set status to 'approved'
            approvedAt: new Date(),  // Add timestamp for approval
          });
  
          // Step 3: Remove the document from the 'pendingaccounts' collection
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
          
          // Step 1: Remove the document from the 'pendingaccounts' collection
          await deleteDoc(requestRef); // Delete the document
  
          // Optionally, you can also update the status to "rejected" before deletion, if needed.
          // await updateDoc(requestRef, { status: "rejected" });
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
