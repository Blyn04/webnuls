import React from "react";
import { Calendar, Badge, Card } from "antd";
import '../styles/customsStyle/CalendarModal.css'; 

const approvedRequests = [
  { date: "2025-04-15", title: "Microscope Reservation" },
  { date: "2025-04-17", title: "Chemical Usage" },
  { date: "2025-04-20", title: "Equipment for Research" },
];

// Get events for a specific day
const getListData = (value) => {
  const dateStr = value.format("YYYY-MM-DD");
  return approvedRequests
    .filter((item) => item.date === dateStr)
    .map((item) => ({ type: "success", content: item.title }));
};

// Optional: Get data for a specific month (e.g., summary)
const getMonthData = (value) => {
  if (value.month() === 3) {
    return 3; // Example: 3 requests in April
  }
  return null;
};

// Render events in date cells
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

// Render info in month cells
const monthCellRender = (value) => {
  const num = getMonthData(value);
  return num ? (
    <div className="notes-month">
      <section>{num}</section>
      <span>Requests</span>
    </div>
  ) : null;
};

// Main cell render
const cellRender = (current, info) => {
  if (info.type === "date") return dateCellRender(current);
  if (info.type === "month") return monthCellRender(current);
  return info.originNode;
};

const CustomCalendar = () => {
  return (
    <Card title="Usage Schedule Calendar" style={{ marginTop: 20, width: "100%" }}>
      <Calendar cellRender={cellRender} />
    </Card>
  );
};

export default CustomCalendar;
