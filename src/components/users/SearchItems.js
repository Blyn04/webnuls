import React, { useState } from "react";
import {
  Layout,
  Table,
  Input,
  Tag,
  Select,
  Card,
  Typography,
  Button,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/SearchItems.css";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const itemData = [
  {
    key: "1",
    description: "Sodium Chloride",
    quantity: 50,
    status: "Available",
    category: "Chemical",
    room: "Chemistry Lab 1",
  },
  {
    key: "2",
    description: "Test Tubes",
    quantity: 0,
    status: "Out of Stock",
    category: "Reagent",
    room: "Biology Lab 2",
  },
  {
    key: "3",
    description: "Beaker Set",
    quantity: 20,
    status: "In Use",
    category: "Equipment",
    room: "Physics Lab 3",
  },
  {
    key: "4",
    description: "Gloves",
    quantity: 100,
    status: "Available",
    category: "Materials",
    room: "Nursing Lab 1",
  },
  {
    key: "5",
    description: "Ethanol",
    quantity: 0,
    status: "Out of Stock",
    category: "Chemical",
    room: "Chemistry Lab 2",
  },
];

const columns = [
  {
    title: "Item Description",
    dataIndex: "description",
    key: "description",
    sorter: (a, b) => a.description.localeCompare(b.description),
  },
  {
    title: "Stock Qty",
    dataIndex: "quantity",
    key: "quantity",
    sorter: (a, b) => a.quantity - b.quantity,
    render: (quantity) => <strong>{quantity}</strong>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    filters: [
      { text: "Available", value: "Available" },
      { text: "Out of Stock", value: "Out of Stock" },
      { text: "In Use", value: "In Use" },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => {
      let color;
      switch (status) {
        case "Available":
          color = "green";
          break;

        case "Out of Stock":
          color = "red";
          break;

        case "In Use":
          color = "orange";
          break;
          
        default:
          color = "blue";
      }
      return <Tag color={color}>{status.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    filters: [
      { text: "Chemical", value: "Chemical" },
      { text: "Reagent", value: "Reagent" },
      { text: "Materials", value: "Materials" },
      { text: "Equipment", value: "Equipment" },
    ],
    onFilter: (value, record) => record.category === value,
    render: (category) => (
      <Tag color={category === "Chemical" ? "blue" : "geekblue"}>
        {category.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Room Location",
    dataIndex: "room",
    key: "room",
    sorter: (a, b) => a.room.localeCompare(b.room),
  },
];

const SearchItems = () => {
  const [filteredData, setFilteredData] = useState(itemData);
  const [searchText, setSearchText] = useState("");
  const [pageTitle, setPageTitle] = useState("Search Items");

  const handleSearch = (value) => {
    const filteredItems = itemData.filter((item) =>
      item.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filteredItems);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      
      <Layout className="site-layout">
        <Content className="search-content">
          <div className="pending-header">
            <Title level={3}>
              <SearchOutlined /> Search Items
            </Title>
          </div>

          <div className="search-container">
            <Input
              placeholder="Search by item description..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                handleSearch(e.target.value);
              }}
              allowClear
              prefix={<SearchOutlined />}
              className="search-input"
            />
          </div>

          <div className="pending-main">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="key"
              pagination={{ pageSize: 5 }}
              className="search-table"
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SearchItems;
