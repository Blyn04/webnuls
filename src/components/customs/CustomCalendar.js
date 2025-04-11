import React from "react";
import { Calendar, Badge, Card } from "antd";

const approvedRequests = [
  { date: "2025-04-15", title: "Microscope Reservation" },
  { date: "2025-04-17", title: "Chemical Usage" },
  { date: "2025-04-20", title: "Equipment for Research" },
];

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

const CustomCalendar = () => {
  return (
    <Card title="Usage Schedule Calendar" style={{ marginTop: 20 }}>
      <Calendar dateCellRender={dateCellRender} />
    </Card>
  );
};

export default CustomCalendar;
