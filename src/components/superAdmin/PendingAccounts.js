import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Button, Typography, Space, Table, notification } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"; 

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
          await updateDoc(requestRef, { status: "approved" });
        })
      );
      notification.success({
        message: "Requests Approved",
        description: "The selected account requests have been approved.",
      });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          selectedRequests.includes(request.id)
            ? { ...request, status: "approved" }
            : request
        )
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
          await updateDoc(requestRef, { status: "rejected" });
        })
      );
      notification.success({
        message: "Requests Rejected",
        description: "The selected account requests have been rejected.",
      });
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          selectedRequests.includes(request.id)
            ? { ...request, status: "rejected" }
            : request
        )
      );
      setSelectedRequests([]); // Clear selected rows
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
