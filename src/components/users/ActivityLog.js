import React, { useState } from "react";
import {
  Layout,
  Input,
  Table,
  Typography,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/ActivityLog.css";

const { Content } = Layout;
const { Title } = Typography;

const activityData = [
  {
    key: "1",
    date: "2025-05-14",
    action: "Modified request list by adding bond paper.",
    by: "Henreizh Nathan H. Aruta",
  },
  {
    key: "2",
    date: "2025-05-14",
    action: "Modified request list by adding bond paper.",
    by: "Henreizh Nathan H. Aruta",
  },
  {
    key: "3",
    date: "2025-05-14",
    action: "Modified request list by adding bond paper.",
    by: "Henreizh Nathan H. Aruta",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [pageTitle, setPageTitle] = useState("");

  const filteredData = activityData.filter(
    (item) =>
      item.date.includes(searchQuery) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.by.toLowerCase().includes(searchQuery.toLowerCase())
  );

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