import React, { useEffect, useState } from "react";
import { Calendar, Badge, Modal, List, Descriptions } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig";
import "../styles/customsStyle/CalendarModal.css";

const CustomCalendar = ({ onSelectDate }) => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [selectedDateRequests, setSelectedDateRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "requestlog"));
        const requests = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "Approved" && Array.isArray(data.requestList)) {
            data.requestList.forEach((item) => {
              requests.push({
                date: data.dateRequired,
                title: item.itemName || "Approved Request",
                userName: data.userName || "N/A",
                department: item.department || "N/A",
                room: item.room || "N/A",
                status: item.status || "N/A",
                quantity: item.quantity || "N/A",
                condition: item.condition || "N/A",
                approvedBy: data.approvedBy || "N/A",
              });
            });
          }
        });

        setApprovedRequests(requests);
      } catch (error) {
        console.error("Error fetching approved requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return approvedRequests
      .filter((item) => item.date === dateStr)
      .map((item) => ({
        type: "success",
        content: `${item.title}`,
      }));
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
    const matchedRequests = approvedRequests.filter((item) => item.date === dateStr);
    setSelectedDateRequests(matchedRequests);
    setIsModalVisible(true);
    onSelectDate(date); // keep your original onSelectDate behavior
  };

  return (
    <>
      <Calendar
        dateCellRender={dateCellRender}
        onSelect={handleDateSelect}
      />

      <Modal
        title="Approved Requests"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedDateRequests.length === 0 ? (
          <p>No approved requests for this date.</p>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={selectedDateRequests}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Item Name">{item.title}</Descriptions.Item>
                  <Descriptions.Item label="Quantity">{item.quantity}</Descriptions.Item>
                  <Descriptions.Item label="Condition">{item.condition}</Descriptions.Item>
                  <Descriptions.Item label="Status">{item.status}</Descriptions.Item>
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
