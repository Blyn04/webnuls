import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Input,
  Tag,
  Typography,
  Select,
  Space,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../backend/firebase/FirebaseConfig";
import "../styles/usersStyle/SearchItems.css";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

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
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

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

  useEffect(() => {
    let data = [...inventoryData];

    if (searchText) {
      data = data.filter((item) =>
        item.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter) {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (categoryFilter) {
      data = data.filter((item) => item.category === categoryFilter);
    }

    setFilteredData(data);
  }, [searchText, statusFilter, categoryFilter, inventoryData]);

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
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              className="search-input"
            />

            <Space style={{ marginTop: 16 }} wrap>
              <Select
                placeholder="Filter by Status"
                allowClear
                style={{ width: 200 }}
                onChange={value => setStatusFilter(value)}
                value={statusFilter}
              >
                <Option value="Available">Available</Option>
                <Option value="Out of Stock">Out of Stock</Option>
                <Option value="In Use">In Use</Option>
              </Select>

              <Select
                placeholder="Filter by Category"
                allowClear
                style={{ width: 200 }}
                onChange={value => setCategoryFilter(value)}
                value={categoryFilter}
              >
                <Option value="Chemical">Chemical</Option>
                <Option value="Reagent">Reagent</Option>
                <Option value="Materials">Materials</Option>
                <Option value="Equipment">Equipment</Option>
              </Select>
            </Space>
          </div>

          <div className="pending-main" style={{ marginTop: 24 }}>
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
