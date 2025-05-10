import React, { useEffect, useState } from "react";
import { Calendar, Badge, Modal, List, Descriptions, Select } from "antd";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig";
import "../styles/customsStyle/CalendarModal.css";

const { Option } = Select;

const CustomCalendar = ({ onSelectDate }) => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedDateRequests, setSelectedDateRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "borrowcatalog"),
      (querySnapshot) => {
        const requests = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.requestList)) {
            data.requestList.forEach((item) => {
              requests.push({
                date: data.dateRequired,
                title: item.itemName || "Request",
                userName: data.userName || "N/A",
                department: item.department || "N/A",
                room: data.room || "N/A",
                status: data.status || "N/A",
                quantity: item.quantity || "N/A",
                condition: item.condition || "N/A",
                approvedBy: data.approvedBy || "N/A",
              });
            });
          }
        });

        setApprovedRequests(requests);
      },
      (error) => {
        console.error("Error in real-time listener:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔍 Filter logic for events
  const filteredApprovedRequests = filterStatus === "all" ? approvedRequests : approvedRequests.filter((item) => item.status.toLowerCase() === filterStatus);

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return filteredApprovedRequests
      .filter((item) => item.date === dateStr)
      .map((item) => {
        const status = item.status?.toLowerCase().trim();
        let type = "default";

        if (status === "borrowed") type = "error";
        else if (status === "returned") type = "success";

        return {
          type,
          content: `${item.title}`,
        };
      });
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const handleDateSelect = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const matchedRequests = filteredApprovedRequests.filter((item) => item.date === dateStr);
    setSelectedDateRequests(matchedRequests);
    setIsModalVisible(true);
    onSelectDate(date);
  };

  return (
    <>
      {/* 🗂️ Filter for status outside of the modal */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8, fontWeight: "bold" }}>Filter by status:</span>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ width: 200 }}
        >
          <Option value="all">All</Option>
          <Option value="approved">Approved</Option>
          <Option value="borrowed">Borrowed</Option>
          <Option value="returned">Returned</Option>
        </Select>
      </div>

      <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />

      <Modal
        title="Approved Requests"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        zIndex={1027}
      >
        {selectedDateRequests.length === 0 ? (
          <p>No approved requests for this date.</p>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={selectedDateRequests}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <div style={{ marginBottom: 8, fontWeight: "bold", color: "#1890ff" }}>
                  Status: {item.status}
                </div>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Item Name">{item.title}</Descriptions.Item>
                  <Descriptions.Item label="Quantity">{item.quantity}</Descriptions.Item>
                  <Descriptions.Item label="Condition">{item.condition}</Descriptions.Item>
                  <Descriptions.Item label="Room">{item.room}</Descriptions.Item>
                  <Descriptions.Item label="Department">{item.department}</Descriptions.Item>
                  <Descriptions.Item label="Approved By">{item.approvedBy}</Descriptions.Item>
                  <Descriptions.Item label="Requested By">{item.userName}</Descriptions.Item>
                </Descriptions>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
};

export default CustomCalendar;
