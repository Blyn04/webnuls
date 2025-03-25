// src/components/admin/Inventory.js
import React, { useState, useRef } from "react";
import { Layout, Table, Input, Button, Select, Form, Row, Col, Space, DatePicker } from "antd";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import CryptoJS from "crypto-js";
import CONFIG from "../../config";
import "../styles/adminStyle/Inventory.css";

const { Content } = Layout;
const { Option } = Select;

const SECRET_KEY = CONFIG.SECRET_KEY;

const Inventory = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("");
  const qrRefs = useRef({});
  const [pageTitle, setPageTitle] = useState("");

  const handleAdd = (values) => {
    if (!itemName || !itemId) {
      alert("Please enter both Item Name and ID for QR Code!");
      return;
    }

    const formattedEntryDate = values.entryDate
    ? values.entryDate.format("YYYY-MM-DD")
    : null;

    const formattedExpiryDate = values.expiryDate
    ? values.expiryDate.format("YYYY-MM-DD")
    : null;

    const timestamp = new Date().toISOString();
    const data = JSON.stringify({
      id: itemId,
      name: itemName,
      entryDate: formattedEntryDate,
      expiryDate: formattedExpiryDate,
      timestamp,
      ...values,
    });

    const encryptedData = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();

    const newItem = {
      id: count + 1,
      item: itemName,
      entryDate: formattedEntryDate,
      expiryDate: formattedExpiryDate,
      qrCode: encryptedData,
      timestamp,
      ...values,
    };

    setDataSource([...dataSource, newItem]);
    setCount(count + 1);
    form.resetFields();
    setItemName("");
    setItemId("");
  };

  const printQRCode = (record) => {
    html2canvas(qrRefs.current[record.id]).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.text("Scan this QR Code", 80, 10);
      pdf.addImage(imgData, "PNG", 40, 20, 120, 120);
      pdf.save(`QRCode_${record.id}.pdf`);
    });
  };

  const downloadQRCode = (record) => {
    html2canvas(qrRefs.current[record.id]).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `QRCode_${record.id}.png`;
      link.click();
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50 },
    { title: "Item Description", dataIndex: "item", key: "item" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Inventory Balance", dataIndex: "quantity", key: "quantity" },
    { title: "Date of Entry", dataIndex: "entryDate", key: "entryDate" },
    { title: "Expiry Date", dataIndex: "expiryDate", key: "expiryDate" },
    {
      title: "QR Code",
      dataIndex: "qrCode",
      key: "qrCode",
      render: (qrCode, record) => (
        <div ref={(el) => (qrRefs.current[record.id] = el)}>
          <QRCodeCanvas value={qrCode} size={100} />
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => printQRCode(record)}>
            Print PDF
          </Button>
          <Button type="default" onClick={() => downloadQRCode(record)}>
            Download PNG
          </Button>
        </Space>
      ),
    },
  ];

  const disabledDate = (current) => {
    return current && current < new Date().setHours(0, 0, 0, 0);
  };  

  const disabledExpiryDate = (current) => {
    const entryDate = form.getFieldValue("entryDate");
    return current && entryDate && current < entryDate.endOf("day");
  };  

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar setPageTitle={setPageTitle} />

      <Layout>
        <AppHeader pageTitle={pageTitle} />

        <Content className="content inventory-container">

          <div className="inventory-header">
            <Input.Search
              placeholder="Search"
              className="search-bar"
              style={{ width: 300 }}
            />
            <Button type="default" className="filter-btn">
              All
            </Button>
          </div>

          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(record) => record.id}
            bordered
            className="inventory-table"
          />

          <div className="form-container">
            <h3>Add Item to Inventory with QR Code</h3>

            <Space style={{ marginBottom: "20px" }}>
              <Input
                placeholder="Enter Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={{ width: "200px" }}
              />

              <Input
                placeholder="Enter Item ID"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                style={{ width: "150px" }}
              />
            </Space>

            <Form layout="vertical" form={form} onFinish={handleAdd}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="entryDate"
                    label="Date of Entry"
                    rules={[{ required: true, message: "Please select a date of entry!" }]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      style={{ width: "100%" }}
                      placeholder="Select Date of Entry"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="expiryDate"
                    label="Date of Expiry"
                    rules={[{ required: true, message: "Please select a date of expiry!" }]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      style={{ width: "100%" }}
                      placeholder="Select Date of Expiry"
                      disabledDate={disabledExpiryDate}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="type" label="Item Type" initialValue="Fixed">
                    <Select>
                      <Option value="Fixed">Fixed</Option>
                      <Option value="Consumable">Consumable</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="quantity" label="Quantity">
                    <Input placeholder="Enter quantity" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="department" label="Department">
                <Input placeholder="Enter department" />
              </Form.Item>

              <Button type="primary" htmlType="submit" className="add-btn">
                Add to Inventory with QR Code
              </Button>
            </Form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Inventory;
