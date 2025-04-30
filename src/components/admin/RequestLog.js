import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Typography, Row, Col } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/RequestLog.css";

const { Content } = Layout;
const { Text } = Typography;

const RequestLog = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  // useEffect(() => {
  //   const fetchRequestLogs = async () => {
  //     try {
  //       const querySnapshot = await getDocs(collection(db, "requestlog"));
  //       const logs = querySnapshot.docs.map((doc) => {
  //         const data = doc.data();
  //         const timeFrom = data.timeFrom || "N/A";  
  //         const timeTo = data.timeTo || "N/A";    

  //         const timestamp = data.timestamp ? formatTimestamp(data.timestamp) : "N/A";
          
  //         return {
  //           id: doc.id,
  //           date: data.dateRequired ?? "N/A",
  //           status: data.status ?? "Pending",
  //           requestor: data.userName ?? "Unknown",
  //           requestedItems: data.requestList
  //             ? data.requestList.map((item) => item.itemName).join(", ")
  //             : "No items",
  //           requisitionId: doc.id,
  //           reason: data.reason ?? "No reason provided",
  //           department: data.requestList?.[0]?.department ?? "N/A",
  //           approvedBy: data.approvedBy,
  //           rejectedBy: data.rejectedBy, // Include rejectedBy field
  //           timestamp: timestamp,
  //           raw: data,
  //           timeFrom,  // Use timeFrom from root
  //           timeTo,    // Use timeTo from root
  //         };
  //       });

  //       // Sort logs by timestamp, with the most recent first
  //       const sortedLogs = logs.sort((a, b) => {
  //         return new Date(b.timestamp) - new Date(a.timestamp);
  //       });
  
  //       setHistoryData(sortedLogs);
  
  //     } catch (error) {
  //       console.error("Error fetching request logs: ", error);
  //     }
  //   };
  
  //   fetchRequestLogs();
  // }, []);  

  useEffect(() => {
    const fetchRequestLogs = () => {
      try {
        // Set up the real-time listener using onSnapshot
        const requestLogRef = collection(db, "requestlog");

        const unsubscribe = onSnapshot(requestLogRef, (querySnapshot) => {
          const logs = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const timeFrom = data.timeFrom || "N/A";  
            const timeTo = data.timeTo || "N/A";    

            const timestamp = data.timestamp ? formatTimestamp(data.timestamp) : "N/A";
            
            return {
              id: doc.id,
              date: data.dateRequired ?? "N/A",
              status: data.status ?? "Pending",
              requestor: data.userName ?? "Unknown",
              requestedItems: data.requestList
                ? data.requestList.map((item) => item.itemName).join(", ")
                : "No items",
              requisitionId: doc.id,
              reason: data.reason ?? "No reason provided",
              department: data.requestList?.[0]?.department ?? "N/A",
              approvedBy: data.approvedBy,
              rejectedBy: data.rejectedBy, // Include rejectedBy field
              timestamp: timestamp,
              raw: data,
              timeFrom,  // Use timeFrom from root
              timeTo,    // Use timeTo from root
            };
          });

          // Sort logs by timestamp, with the most recent first
          const sortedLogs = logs.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
  
          setHistoryData(sortedLogs);
        });

        // Cleanup listener when component unmounts
        return () => unsubscribe();
        
      } catch (error) {
        console.error("Error fetching request logs: ", error);
      }
    };

    fetchRequestLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    try {
      const date = timestamp.toDate();
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "N/A";
    }
  };

  const columns = [
    {
      title: "Process Date",
      dataIndex: "timestamp",
      key: "timestamp",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Text
          style={{
            color: status === "Approved" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </Text>
      ),
    },
    {
      title: "Requestor",
      dataIndex: "requestor", 
      key: "requestor", 
    },
    {
      title: "By",  // Change column title from "Approved By" to "By"
      key: "by",
      render: (text, record) => {
        // Conditionally render approvedBy or rejectedBy based on status
        return (
          <Text>{record.status === "Approved" ? record.approvedBy : record.rejectedBy}</Text>
        );
      }
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <a
          href="#"
          className="view-details"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </a>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    console.log("Selected Request Data:", record); // Log to check the data
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const filteredData =
    filterStatus === "All"
      ? historyData
      : historyData.filter((item) => item.status === filterStatus);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px" }}>
          <div style={{ marginBottom: 16 }}>
            <Button
              type={filterStatus === "All" ? "primary" : "default"}
              onClick={() => setFilterStatus("All")}
              style={{ marginRight: 8 }}
            >
              All
            </Button>
            
            <Button
              type={filterStatus === "Approved" ? "primary" : "default"}
              onClick={() => setFilterStatus("Approved")}
              style={{ marginRight: 8 }}
            >
              Approved
            </Button>

            <Button
              type={filterStatus === "Rejected" ? "primary" : "default"}
              onClick={() => setFilterStatus("Rejected")}
            >
              Rejected
            </Button>
          </div>

          <Table
            className="request-log-table"
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
          />
        </Content>

        <Modal
          title="📄 Requisition Slip"
          visible={modalVisible}
          onCancel={closeModal}
          footer={[<Button key="close" onClick={closeModal}>Back</Button>]}
          width={800}
        >
          {selectedRequest && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Name:</Text> {selectedRequest.raw?.userName}
                </Col>

                <Col span={12} style={{ textAlign: "right" }}>
                  <Text italic>Requisition ID: {selectedRequest.requisitionId}</Text>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
                <Col span={12}>
                  <Text strong>Request Date:</Text> {selectedRequest.timestamp}
                </Col>

                <Col span={12}>
                  <Text strong>Required Date:</Text> {selectedRequest.raw?.dateRequired}
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
                <Col span={12}>
                  <Text strong>Requested Items:</Text>
                  <Text style={{ color: "green" }}>({selectedRequest.status})</Text>
                </Col>

                <Col span={12}>
                  <Text strong>Time Needed: </Text>
                  <Text>
                    {selectedRequest.timeFrom ? selectedRequest.timeFrom : "N/A"} - 
                    {selectedRequest.timeTo ? selectedRequest.timeTo : "N/A"}
                  </Text>
                </Col>
              </Row>

              <Table
                dataSource={(selectedRequest.raw?.requestList ?? []).map((item, index) => ({
                  key: index,
                  itemId: item.itemIdFromInventory,
                  itemDescription: item.itemName,
                  quantity: item.quantity,
                }))}
                columns={[
                  {
                    title: "Item ID",
                    dataIndex: "itemId",
                    key: "itemId",
                  },
                  {
                    title: "Item Description",
                    dataIndex: "itemDescription",
                    key: "itemDescription",
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                  },
                ]}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 10 }}
              />

              <Row gutter={[16, 8]} style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Text strong>Reason of Request:</Text>
                  <p>{selectedRequest.raw?.reason}</p>
                </Col>

                <Col span={12}>
                  <Text strong>Department:</Text> {selectedRequest.raw?.requestList?.[0]?.department}

                  <br />
                  
                  {selectedRequest.raw?.status === 'Approved' && (
                    <>
                      <Text strong>Approved By:</Text> {selectedRequest.raw?.approvedBy}
                    </>
                  )}

                  {selectedRequest.raw?.status === 'Rejected' && (
                    <>
                      <Text strong>Rejected By:</Text> {selectedRequest.raw?.rejectedBy}
                    </>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Layout>
    </Layout>
  );
};

export default RequestLog;
