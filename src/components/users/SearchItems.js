import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Input,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig";
import "../styles/usersStyle/SearchItems.css";

const { Content } = Layout;
const { Title } = Typography;

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
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snapshot = await getDocs(collection(db, "inventory"));
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            key: doc.id,
            description: data.itemName || "Unnamed Item",
            quantity: data.quantity || 0,
            status: data.status || "Unknown",
            category: data.category || "Uncategorized",
            room: data.labRoom || "No Room Info",
          };
        });
        setInventoryData(items);
        setFilteredData(items);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
      }
    };

    fetchInventory();
  }, []);

  const handleSearch = (value) => {
    const filteredItems = inventoryData.filter((item) =>
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
