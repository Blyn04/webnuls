import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Typography, Row, Col, Select } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/RequestLog.css";

const { Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

const ReturnItems = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [returnQuantities, setReturnQuantities] = useState({});
  const [itemConditions, setItemConditions] = useState({});

  useEffect(() => {
    const fetchRequestLogs = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found");

        const userRequestLogRef = collection(db, `accounts/${userId}/userrequestlog`);
        const querySnapshot = await getDocs(userRequestLogRef);

        const logs = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const rawTimestamp = data.rawTimestamp;
          const timestamp = data.timestamp;

          let parsedRawTimestamp = "N/A";
          let parsedTimestamp = "N/A";

          if (rawTimestamp && typeof rawTimestamp.toDate === "function") {
            try {
              parsedRawTimestamp = rawTimestamp.toDate().toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
              });
            } catch (e) {
              console.warn(`Error formatting rawTimestamp for doc ${doc.id}:`, e);
            }
          }

          if (timestamp && typeof timestamp.toDate === "function") {
            try {
              parsedTimestamp = timestamp.toDate().toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
              });
            } catch (e) {
              console.warn(`Error formatting timestamp for doc ${doc.id}:`, e);
            }
          }

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
            approvedBy: data.approvedBy ?? "N/A",
            rawTimestamp: rawTimestamp ?? null,
            processDate: parsedRawTimestamp, // Table: Process Date
            timestamp: parsedTimestamp, // Modal: Requested Date
            raw: data,
          };
        });

        // Sort by rawTimestamp (Process Date)
        logs.sort((a, b) => {
          const timeA = a.rawTimestamp?.toMillis?.() ?? 0;
          const timeB = b.rawTimestamp?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        setHistoryData(logs);
      } catch (error) {
        console.error("Error fetching request logs: ", error);
      }
    };

    fetchRequestLogs();
  }, []);

  const columns = [
    {
      title: "Process Date",
      dataIndex: "processDate",
      key: "processDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Text style={{ color: status === "Approved" ? "green" : "red", fontWeight: "bold" }}>
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
      title: "Approved By",
      dataIndex: "approvedBy",
      key: "approvedBy",
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <a href="#" className="view-details" onClick={() => handleViewDetails(record)}>
          View Details
        </a>
      ),
    },
  ];

  const handleViewDetails = async (record) => {
    setSelectedRequest(record);
    setModalVisible(true);

    const inventoryMap = {};
    const requestItems = record.raw?.requestList || [];

    try {
      const inventoryRef = collection(db, "inventory");
      const inventorySnapshot = await getDocs(inventoryRef);
      inventorySnapshot.forEach((doc) => {
        const inv = doc.data();
        requestItems.forEach((item) => {
          if (inv.id === item.itemIdFromInventory) {
            inventoryMap[item.itemIdFromInventory] = inv;
          }
        });
      });
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }

    setInventoryData(inventoryMap);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
    setReturnQuantities({});
    setItemConditions({});
    setInventoryData({});
  };

  const handleReturn = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !selectedRequest) {
        console.error("Missing user ID or request data");
        return;
      }
  
      const timestamp = serverTimestamp();
      const currentDateString = new Date().toISOString();
  
      const fullReturnData = {
        accountId: userId,
        approvedBy: selectedRequest.raw?.approvedBy || "N/A",
        courseCode: selectedRequest.raw?.courseCode || "N/A",
        courseDescription: selectedRequest.raw?.courseDescription || "N/A",
        dateRequired: selectedRequest.raw?.dateRequired || "N/A",
        program: selectedRequest.raw?.program || "N/A",
        reason: selectedRequest.raw?.reason || "No reason provided",
        room: selectedRequest.raw?.room || "N/A",
        timeFrom: selectedRequest.raw?.timeFrom || "N/A",
        timeTo: selectedRequest.raw?.timeTo || "N/A",
        timestamp: timestamp,
        userName: selectedRequest.raw?.userName || "N/A",
        requisitionId: selectedRequest.requisitionId,
        status: "Returned",
        requestList: (selectedRequest.raw?.requestList || [])
          .map((item) => {
            const returnQty = Number(returnQuantities[item.itemIdFromInventory] || 0);
            if (returnQty <= 0) return null;
  
            return {
              ...item,
              returnedQuantity: returnQty,
              condition: itemConditions[item.itemIdFromInventory] || item.condition || "Good",
              status: "Returned",
              dateReturned: currentDateString,
            };
          })
          .filter(Boolean),
      };
  
      // Save to returnedItems and userreturneditems
      const returnedRef = doc(collection(db, "returnedItems"));
      const userReturnedRef = doc(collection(db, `accounts/${userId}/userreturneditems`));
      await setDoc(returnedRef, fullReturnData);
      await setDoc(userReturnedRef, fullReturnData);
  
      // Update full data in original borrowcatalog
      const borrowDocRef = doc(db, "borrowcatalog", selectedRequest.requisitionId);
      await setDoc(borrowDocRef, fullReturnData, { merge: true });
  
      // 🗑️ Delete from userrequestlog
      const userRequestLogRef = doc(
        db,
        `accounts/${userId}/userrequestlog/${selectedRequest.requisitionId}`
      );
      await deleteDoc(userRequestLogRef);

  
      // 📝 Add to history log
      const historyRef = doc(collection(db, `accounts/${userId}/historylog`));
      await setDoc(historyRef, {
        ...fullReturnData,
        action: "Returned",
        date: currentDateString,
      });

      // 📝 Add to history log
      const activityRef = doc(collection(db, `accounts/${userId}/activitylog`));
      await setDoc(activityRef, {
        ...fullReturnData,
        action: "Returned",
        date: currentDateString,
      });
  
      console.log("Returned items processed, removed from userRequests, added to history log.");
      closeModal();
  
    } catch (error) {
      console.error("Error saving returned item details:", error);
    }
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
              type={filterStatus === "Declined" ? "primary" : "default"}
              onClick={() => setFilterStatus("Declined")}
            >
              Declined
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
          footer={[
            <Button key="close" onClick={closeModal}>
              Back
            </Button>,
            <Button key="return" type="primary" onClick={handleReturn}>
              Return
            </Button>,
          ]}
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

              <Row gutter={[16, 8]} style={{ marginTop: 10 }}>
                <Col span={12}>
                  <Text strong>Request Date:</Text> {selectedRequest.timestamp}
                </Col>
                <Col span={12}>
                  <Text strong>Required Date:</Text> {selectedRequest.raw?.dateRequired}
                </Col>
              </Row>

              <Row gutter={[16, 8]} style={{ marginTop: 10 }}>
                <Col span={24}>
                  <Text strong>Requested Items:</Text>
                  <Text style={{ color: "green" }}> ({selectedRequest.status})</Text>
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
                  {
                    title: "Return Quantity",
                    key: "returnQty",
                    render: (_, record) => {
                      const currentQty = returnQuantities[record.itemId] || "";
                  
                      const handleChange = (e) => {
                        let input = Number(e.target.value);
                        if (input > record.quantity) input = record.quantity; // prevent excess
                        if (input < 1) input = 1; // enforce min
                  
                        setReturnQuantities((prev) => ({
                          ...prev,
                          [record.itemId]: input,
                        }));
                      };
                  
                      return (
                        <input
                          type="number"
                          min={1}
                          max={record.quantity}
                          value={currentQty}
                          onChange={handleChange}
                          style={{ width: "80px" }}
                        />
                      );
                    },
                  },                  
                  {
                    title: "Condition",
                    key: "condition",
                    render: (_, record) => (
                      <Select
                        value={itemConditions[record.itemId] || "Good"}
                        onChange={(value) =>
                          setItemConditions((prev) => ({
                            ...prev,
                            [record.itemId]: value,
                          }))
                        }
                        style={{ width: 120 }}
                      >
                        <Option value="Good">Good</Option>
                        <Option value="Damaged">Damaged</Option>
                        <Option value="Needs Repair">Needs Repair</Option>
                      </Select>
                    ),
                  },
                ]}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 10 }}
              />

              <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
                <Col span={12}>
                  <Text strong>Reason:</Text> {selectedRequest.reason}
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Text strong>Approved By:</Text> {selectedRequest.approvedBy ?? "N/A"}
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Layout>
    </Layout>
  );
};

export default ReturnItems;
