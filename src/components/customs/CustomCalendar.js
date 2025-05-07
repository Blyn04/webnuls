import React, { useEffect, useState } from "react";
import { Calendar, Badge } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import "../styles/customsStyle/CalendarModal.css";

const CustomCalendar = ({ onSelectDate }) => {
  const [approvedRequests, setApprovedRequests] = useState([]);

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
                title: item.itemName || "Approved Request"
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
      .map((item) => ({ type: "success", content: item.title }));
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

  return (
    <Calendar
      dateCellRender={dateCellRender}
      onSelect={(date) => onSelectDate(date)}
    />
  );
};

export default CustomCalendar;
