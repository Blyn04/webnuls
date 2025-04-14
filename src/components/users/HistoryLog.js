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

        const activityRef = collection(db, `accounts/${userId}/activitylog`);
        const querySnapshot = await getDocs(activityRef);

        const logs = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const logDate =
            data.cancelledAt?.toDate?.() ||
            data.timestamp?.toDate?.() ||
            new Date();

          return {
            key: doc.id || index.toString(),
            date: logDate.toLocaleDateString(),
            action:
              data.status === "CANCELLED"
                ? "Cancelled a request"
                : data.action || "Modified a request",
            by: data.userName || "Unknown User",
            fullData: data,
          };
        });

        setActivityData(logs);
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
            pagination={false}
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

          {/* Modal for detailed log info */}
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

                <Descriptions.Item label="Usage Type">
                  {selectedLog.requestList?.[0]?.usageType || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Category">
                  {selectedLog.requestList?.map((item, index) => (
                    <div key={index}>
                      {item.category || "N/A"}
                    </div>
                  )) || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Date Required">
                  {selectedLog.dateRequired || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Items Requested">
                  <ul style={{ paddingLeft: 20 }}>
                    {selectedLog.requestList?.map((item, index) => (
                      <li key={index}>
                        {item.itemName} - Quantity: {item.quantity}
                      </li>
                    )) || "None"}
                  </ul>
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
