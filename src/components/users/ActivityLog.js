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
import { collection, getDocs, onSnapshot } from "firebase/firestore";
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

const ActivityLog = () => {
  const [activityData, setActivityData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // NOT REAL TIME
  // useEffect(() => {
  //   const fetchActivityLogs = async () => {
  //     try {
  //       const userId = localStorage.getItem("userId");
  //       if (!userId) throw new Error("User ID not found");

  //       const activityRef = collection(db, `accounts/${userId}/activitylog`);
  //       const querySnapshot = await getDocs(activityRef);

  //       const logs = querySnapshot.docs.map((doc, index) => {
  //         const data = doc.data();
  //         const logDate =
  //           data.cancelledAt?.toDate?.() ||
  //           data.timestamp?.toDate?.() ||
  //           new Date();
        
  //         return {
  //           key: doc.id || index.toString(),
  //           date: logDate.toLocaleString("en-US", {
  //             year: "numeric",
  //             month: "short",
  //             day: "numeric",
  //             hour: "numeric",
  //             minute: "2-digit",
  //             hour12: true,
  //           }),
  //           action:
  //             data.status === "CANCELLED"
  //               ? "Cancelled a request"
  //               : data.action || "Modified a request",
  //           by: data.userName || "Unknown User",
  //           fullData: data,
  //         };
  //       });        

  //       logs.sort((a, b) => {
  //         const dateA = new Date(a.fullData.timestamp?.toDate?.() || a.fullData.cancelledAt?.toDate?.() || 0);
  //         const dateB = new Date(b.fullData.timestamp?.toDate?.() || b.fullData.cancelledAt?.toDate?.() || 0);
  //         return dateB - dateA; 
  //       });        

  //       setActivityData(logs);

  //     } catch (error) {
  //       console.error("Failed to fetch activity logs:", error);
  //     }
  //   };

  //   fetchActivityLogs();
  // }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const activityRef = collection(db, `accounts/${userId}/activitylog`);

    const unsubscribe = onSnapshot(
      activityRef,
      (querySnapshot) => {
        const logs = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const logDate =
            data.cancelledAt?.toDate?.() ||
            data.timestamp?.toDate?.() ||
            new Date();

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
            action:
              data.status === "CANCELLED"
                ? "Cancelled a request"
                : data.action || "Modified a request",
            by: data.userName || "Unknown User",
            fullData: data,
          };
        });

        // Sort logs by newest first
        logs.sort((a, b) => {
          const dateA = new Date(a.fullData.timestamp?.toDate?.() || a.fullData.cancelledAt?.toDate?.() || 0);
          const dateB = new Date(b.fullData.timestamp?.toDate?.() || b.fullData.cancelledAt?.toDate?.() || 0);
          return dateB - dateA;
        });

        setActivityData(logs);
      },
      (error) => {
        console.error("Real-time activity log listener failed:", error);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default ActivityLog;
