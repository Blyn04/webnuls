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
            dataSource={filteredCatalog}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
          />

          <Modal
            title={
              <div style={{ background: "#4CAF50", padding: "12px", color: "#fff" }}>
                <Text strong style={{ color: "#fff" }}>
                  👤 {selectedRequest?.requestor}
                </Text>
                <span style={{ float: "right", fontStyle: "italic" }}>
                  Borrow Catalog
                </span>
              </div>
            }
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
              <Button key="back" onClick={handleCancel}>
                Back
              </Button>,
            ]}
            width={800}
          >
            {selectedRequest && (
              <div style={{ padding: "20px" }}>
                <Descriptions
                  title="Item Details"
                  bordered
                  column={3}
                  size="middle"
                >
                  <Descriptions.Item label={<b>Item Description:</b>}>
                    {selectedRequest.itemDescription}
                  </Descriptions.Item>
                  <Descriptions.Item label={<b>Item ID:</b>}>
                    {selectedRequest.itemId}
                  </Descriptions.Item>
                  <Descriptions.Item label={<b>QR Tracker</b>}>
                    {/* <QRCode
                      value={JSON.stringify({
                        id: selectedRequest.itemId,
                        requestor: selectedRequest.requestor,
                      })}
                      size={80}
                    /> */}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BorrowCatalog;
