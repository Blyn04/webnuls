import React, { useState } from "react";
import {
  Layout,
  Table,
  Button,
  Input,
  Form,
  Modal,
  message,
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/usersStyle/CapexRequest.css";

const { Content } = Layout;

const CapexRequest = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pageTitle, setPageTitle] = useState("CAPEX Request");

  // ✅ Open Modal for Adding/Editing Items
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setEditingRow(null);
  };

  // ✅ Cancel Modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // ✅ Calculate Total Price
  const calculateTotalPrice = (data) => {
    const total = data.reduce(
      (sum, item) => sum + (item.estimatedCost * item.qty || 0),
      0
    );
    setTotalPrice(total);
  };

  // ✅ Add or Edit Items
  const handleSave = (values) => {
    const newItem = {
      ...values,
      key: editingRow !== null ? editingRow.key : Date.now(),
      totalPrice: values.qty * values.estimatedCost,
    };

    if (editingRow !== null) {
      const updatedData = dataSource.map((item) =>
        item.key === editingRow.key ? newItem : item
      );
      setDataSource(updatedData);
      message.success("Item updated successfully!");
    } else {
      setDataSource([...dataSource, { ...newItem, no: dataSource.length + 1 }]);
      message.success("Item added successfully!");
    }

    calculateTotalPrice([...dataSource, newItem]);
    setIsModalVisible(false);
  };

  // ✅ Delete Item from Table
  const handleDelete = (key) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(updatedData);
    calculateTotalPrice(updatedData);
    message.success("Item deleted successfully!");
  };

  // ✅ Table Columns Definition
  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      width: 50,
      align: "center",
    },
    {
      title: "Item Description",
      dataIndex: "itemDescription",
      key: "itemDescription",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 80,
      align: "center",
    },
    {
      title: "Estimated Cost",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
      render: (text) => `₱${text.toLocaleString()}`,
      width: 120,
      align: "right",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => `₱${text.toLocaleString()}`,
      width: 120,
      align: "right",
    },
    {
      title: "Justification",
      dataIndex: "justification",
      key: "justification",
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (text, record) => (
        <>
          <Button
            type="link"
            onClick={() => editRow(record)}
            style={{ marginRight: 8 }}
          >
            ✏️
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.key)}
          >
            ❌
          </Button>
        </>
      ),
    },
  ];

  // ✅ Edit Row Data
  const editRow = (record) => {
    setEditingRow(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // ✅ Submit Request
  const handleSubmit = () => {
    if (dataSource.length === 0) {
      message.error("Please add at least one item to submit.");
      return;
    }
    message.success("CAPEX Request submitted successfully!");
    setDataSource([]);
    setTotalPrice(0);
  };

  // ✅ Cancel Request
  const handleRequestCancel = () => {
    setDataSource([]);
    setTotalPrice(0);
    message.info("CAPEX Request cancelled.");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>

      <Layout className="site-layout">
        <Content className="capex-content">
          <div className="capex-header">
            <h2>CAPEX Request for Materials</h2>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
            >
              New
            </Button>
          </div>

          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="key"
            pagination={false}
            bordered
            className="capex-table"
          />

          <div className="total-price-container">
            <h3>
              Total Price: <span>₱{totalPrice.toLocaleString()}</span>
            </h3>
          </div>

          <div className="button-group">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              disabled={dataSource.length === 0}
            >
              Submit
            </Button>

            <Button
              type="default"
              icon={<CloseOutlined />}
              onClick={handleRequestCancel}
            >
              Cancel
            </Button>
          </div>

          <Modal
            title={editingRow ? "Edit Item" : "Add New Item"}
            open={isModalVisible}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            okText={editingRow ? "Update" : "Add"}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                qty: 1,
                estimatedCost: 0,
              }}
            >
              <Form.Item
                name="itemDescription"
                label="Item Description"
                rules={[
                  { required: true, message: "Please enter the item description!" },
                ]}
              >
                <Input placeholder="Enter item description" />
              </Form.Item>

              <Form.Item
                name="qty"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity!" }]}
              >
                <Input type="number" placeholder="Enter quantity" />
              </Form.Item>

              <Form.Item
                name="estimatedCost"
                label="Estimated Cost (₱)"
                rules={[
                  { required: true, message: "Please enter estimated cost!" },
                ]}
              >
                <Input type="number" placeholder="Enter estimated cost" />
              </Form.Item>

              <Form.Item
                name="justification"
                label="Justification"
                rules={[
                  { required: true, message: "Please enter a justification!" },
                ]}
              >
                <Input.TextArea rows={3} placeholder="Enter justification" />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CapexRequest;
