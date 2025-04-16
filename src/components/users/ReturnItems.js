import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Typography, Row, Col, Select } from "antd";
import { db } from "../../backend/firebase/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
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
          const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : "N/A";

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
            timestamp: timestamp,
            raw: data,
          };
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
      title: "Approved By",
      dataIndex: "approvedBy",
      key: "approvedBy",
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

  const handleReturn = () => {
    console.log("Returned Items:", returnQuantities);
    console.log("Item Conditions:", itemConditions);
    // You can implement Firestore update logic here to save the returned items and conditions
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
            pagination={{ pageSize: 5 }}
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
                      const inventoryItem = inventoryData[record.itemId];
                      if (inventoryItem) {
                        return (
                          <input
                            type="number"
                            min={1}
                            max={record.quantity}
                            value={returnQuantities[record.itemId] || ""}
                            onChange={(e) =>
                              setReturnQuantities((prev) => ({
                                ...prev,
                                [record.itemId]: e.target.value,
                              }))
                            }
                            style={{ width: "80px" }}
                          />
                        );
                      } else {
                        return <span style={{ color: "red" }}>Item not found</span>;
                      }
                    },
                  },
                  {
                    title: "Condition",
                    key: "condition",
                    render: (_, record) => {
                      return (
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
                      );
                    },
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
