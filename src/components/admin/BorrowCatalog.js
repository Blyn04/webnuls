import React, { useState } from "react";
import {
  Layout,
  Row,
  Col,
  Table,
  Input,
  Button,
  Typography,
  Modal,
  Descriptions,
} from "antd";
import QRCode from "qrcode.react";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/adminStyle/BorrowCatalog.css";
import ApprovedRequestModal from "../customs/ApprovedRequestModal";


const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const BorrowCatalog = () => {
  const [pageTitle, setPageTitle] = useState("");
  const [catalog, setCatalog] = useState([
    {
      id: "1",
      requestor: "Rich James Lozano",
      itemDescription: "Microscope",
      itemId: "Med002",
    },
    {
      id: "2",
      requestor: "Henreizh Nathan H. Aruta",
      itemDescription: "Centrifuge",
      itemId: "Med001",
    },
    {
      id: "3",
      requestor: "Berlene Bernabe",
      itemDescription: "Microscope",
      itemId: "Med002",
    },
    {
      id: "4",
      requestor: "Tristan Jay Aquino",
      itemDescription: "Centrifuge",
      itemId: "Med001",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const filteredCatalog = catalog.filter(
    (item) =>
      item.requestor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  const columns = [
    {
      title: "Requestor",
      dataIndex: "requestor",
      key: "requestor",
    },
    {
      title: "Item Description",
      dataIndex: "itemDescription",
      key: "itemDescription",
    },
    {
      title: "Item Id",
      dataIndex: "itemId",
      key: "itemId",
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <a
          href={`#`}
          className="view-details"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </a>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const date = timestamp.toDate(); 
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={{ margin: "20px" }}>

          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Search
                placeholder="Search"
                allowClear
                enterButton
                onSearch={handleSearch}
              />
            </Col>
            <Col>
              <Button type="default" onClick={() => setSearchQuery("")}>
                All
              </Button>
            </Col>
          </Row>

          <Table
            className="borrow-catalog-table"
            dataSource={filteredCatalog}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
          />

          <ApprovedRequestModal
            isApprovedModalVisible={isModalVisible}
            setIsApprovedModalVisible={setIsModalVisible}
            selectedApprovedRequest={selectedRequest}
            setSelectedApprovedRequest={setSelectedRequest}
            columns={columns}
            formatDate={formatDate}
          />

        </Content>
      </Layout>
    </Layout>
  );
};

export default BorrowCatalog;
