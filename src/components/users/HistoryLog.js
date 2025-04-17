import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Table,
  Typography,
  Modal,
  Descriptions,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig";
import "../styles/usersStyle/ActivityLog.css";

const { Content } = Layout;
const { Title } = Typography;

const columns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    className: "table-header",
    align: "center",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    className: "table-header",
    align: "center",
  },
  {
    title: "By",
    dataIndex: "by",
    key: "by",
    className: "table-header",
    align: "center",
  },
];

const HistoryLog = () => {
  const [activityData, setActivityData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found");
    
        const activityRef = collection(db, `accounts/${userId}/historylog`);
        const querySnapshot = await getDocs(activityRef);
    
        const logs = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const logDate =
            data.cancelledAt?.toDate?.() ||
            data.timestamp?.toDate?.() ||
            new Date();
    
          const isCancelled = data.status === "CANCELLED";
          const action = isCancelled
            ? "Cancelled a request"
            : data.action || "Modified a request";
    
          const by = action === "Request Approved" ? data.approvedBy : data.userName || "Unknown User";
    
          return {
            key: doc.id || index.toString(),
            date: logDate.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            rawDate: logDate,
            action: action,
            by: by,
            fullData: data,
          };
        });
    
        const sortedLogs = logs.sort((a, b) => b.rawDate - a.rawDate);
        setActivityData(sortedLogs);
    
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
      }
    };    
  
    fetchActivityLogs();
  }, []);
  

  const filteredData = activityData.filter(
    (item) =>
      item.date.includes(searchQuery) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (record) => {
    setSelectedLog(record.fullData);
    setModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className="site-layout">
        <Content className="activity-content">
          <div className="activity-header">
            <Title level={3}>
              <span className="icon-activity">⏰</span> Activity Log
            </Title>
          </div>

          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            className="activity-search"
            allowClear
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10 }}
            bordered
            className="activity-table"
            rowClassName="activity-row"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            locale={{
              emptyText: (
                <div className="empty-row">
                  <span>No activity found.</span>
                </div>
              ),
            }}
          />

          <Modal
            title="Activity Details"
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            {selectedLog && (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Action">
                  {selectedLog.status === "CANCELLED"
                    ? "Cancelled a request"
                    : selectedLog.action || "Modified a request"}
                </Descriptions.Item>

                <Descriptions.Item label="By">
                  {selectedLog.userName || "Unknown User"}
                </Descriptions.Item>

                <Descriptions.Item label="Program">
                  {selectedLog.program || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Reason">
                  {selectedLog.reason || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Room">
                  {selectedLog.room || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Time">
                  {selectedLog.timeFrom && selectedLog.timeTo
                    ? `${selectedLog.timeFrom} - ${selectedLog.timeTo}`
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Date Required">
                  {selectedLog.dateRequired || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Items Requested">
                  {(selectedLog.filteredMergedData || selectedLog.requestList)?.length > 0 ? (
                    <ul style={{ paddingLeft: 20 }}>
                      {(selectedLog.filteredMergedData || selectedLog.requestList).map(
                        (item, index) => (
                          <li key={index} style={{ marginBottom: 10 }}>
                            <strong>{item.itemName}</strong>
                            <ul style={{ marginLeft: 20 }}>
                              <li>Quantity: {item.quantity}</li>
                              {item.category && <li>Category: {item.category}</li>}
                              {item.condition && <li>Condition: {item.condition}</li>}
                              {item.labRoom && <li>Lab Room: {item.labRoom}</li>}
                              {item.usageType && <li>Usage Type: {item.usageType}</li>}
                              {item.itemType && <li>Item Type: {item.itemType}</li>}
                              {item.department && <li>Department: {item.department}</li>}
                            </ul>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    "None"
                  )}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HistoryLog;
