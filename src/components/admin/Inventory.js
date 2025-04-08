import React, { useState, useRef, useEffect } from "react";
import {
  Layout,
  Table,
  Input,
  Button,
  Select,
  Form,
  Row,
  Col,
  Space,
  DatePicker,
  Modal,
} from "antd";
import moment from "moment";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getFirestore, collection, addDoc, Timestamp, getDocs, updateDoc, doc } from "firebase/firestore";
import CryptoJS from "crypto-js";
import CONFIG from "../../config";
import "../styles/adminStyle/Inventory.css";
import DeleteModal from "../customs/DeleteModal";
import NotificationModal from "../customs/NotifcationModal";

const { Content } = Layout;
const { Option } = Select;

const SECRET_KEY = CONFIG.SECRET_KEY;

const Inventory = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const qrRefs = useRef({});
  const [pageTitle, setPageTitle] = useState("");
  const [itemType, setItemType] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const db = getFirestore();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snapshot = await getDocs(collection(db, "inventory"));
        console.log(snapshot);
        const items = snapshot.docs.map((doc, index) => {
          const data = doc.data();
  
          const entryDate = data.entryDate ? data.entryDate : "N/A"; 
          const expiryDate = data.expiryDate ? data.expiryDate : "N/A";
        
  
          return {
            id: index + 1,
            itemId: data.itemId,
            item: data.itemName,
            entryDate,
            expiryDate,
            qrCode: data.qrCode,
            ...data,
          };
        });
  
        setDataSource(items);  
        setCount(items.length);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
  
    fetchInventory();
  }, []);  

  const handleAdd = async (values) => {
    if (!itemName || !values.department) {
      alert("Please enter both Item Name and Department!");
      return;
    }
  
    const isDuplicate = dataSource.some(
      (item) => item.item.toLowerCase() === itemName.trim().toLowerCase()
    );
  
    if (isDuplicate) {
      setNotificationMessage("An item with the same description already exists in the inventory.");
      setIsNotificationVisible(true);
      return;
    }
  
    const departmentPrefix = values.department.replace(/\s+/g, "").toUpperCase();
    const deptItems = dataSource.filter(item => item.department === values.department);
    const departmentCount = deptItems.length + 1;
    const generatedItemId = `${departmentPrefix}${departmentCount.toString().padStart(2, "0")}`;
    setItemId(generatedItemId); 
  
    const entryDate = values.entryDate ? values.entryDate.format("YYYY-MM-DD") : null;
    const expiryDate = values.type === "Fixed" 
      ? null 
      : values.expiryDate 
      ? values.expiryDate.format("YYYY-MM-DD")
      : null;
    
  
    const timestamp = new Date();
  
    const inventoryItem = {
      itemId: generatedItemId,
      itemName,
      entryDate,
      expiryDate,
      timestamp,
      category: values.category,
      labRoom: values.labRoom,
      quantity: values.quantity,
      department: values.department,
      type: values.type,
      status: "Available",
      condition: "Good",  
      usageType: values.usageType,
    };
  
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(inventoryItem),
      SECRET_KEY
    ).toString();
  
    const newItem = {
      id: count + 1,
      itemId: generatedItemId,
      item: itemName,
      entryDate: entryDate, 
      expiryDate: expiryDate, 
      qrCode: encryptedData,
      ...inventoryItem,
    };
  
    try {
      await addDoc(collection(db, "inventory"), {
        ...inventoryItem,
        qrCode: encryptedData,
      });
  
      setDataSource([...dataSource, newItem]);
      setCount(count + 1);
      form.resetFields();
      setItemName("");
      setItemId("");
  
    } catch (error) {
      console.error("Error adding document to Firestore:", error);
    }
  };  

  const editItem = (record) => {
    editForm.resetFields();
    setEditingItem(record);
    editForm.setFieldsValue({
      entryDate: record.entryDate ? moment(record.entryDate) : null,
      expiryDate: record.expiryDate ? moment(record.expiryDate) : null,
      category: record.category,
      labRoom: record.labRoom,
      quantity: record.quantity,
      department: record.department,
      type: record.type,
      status: record.status,
      condition: record.condition, 
      usageType: record.usageType,
    });
    setIsEditModalVisible(true);
  };
  

  const updateItem = async (values) => {
    const updatedEntryDate = values.entryDate
      ? values.entryDate.format("YYYY-MM-DD")
      : "N/A";
  
    const updatedExpiryDate = values.expiryDate
      ? values.expiryDate.format("YYYY-MM-DD")
      : "N/A";
  
    const safeValues = {
      entryDate: updatedEntryDate,
      expiryDate: updatedExpiryDate,
      category: values.category ?? "",
      labRoom: values.labRoom ?? "",
      quantity: values.quantity ?? 0,
      department: values.department ?? "",
      type: values.type ?? "",
      status: values.status ?? "Available",
      condition: values.condition ?? "Good",
      usageType: values.usageType ?? "",
    };
  
    try {
      const snapshot = await getDocs(collection(db, "inventory"));
  
      snapshot.forEach(async (docItem) => {
        const data = docItem.data();
        if (data.itemId === editingItem.itemId) {
          const itemRef = doc(db, "inventory", docItem.id);
          await updateDoc(itemRef, safeValues);
  
          setIsNotificationVisible(true);
          setNotificationMessage("Item updated successfully!");
  
          const updatedItem = {
            ...editingItem,
            ...safeValues,
          };
  
          setDataSource((prevData) =>
            prevData.map((item) =>
              item.id === editingItem.id ? updatedItem : item
            )
          );
  
          setIsEditModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }
      });
    } catch (error) {
      console.error("Error updating document in Firestore:", error);
    }
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

  const handleDelete = (record) => {
    setItemToDelete(record);
    setDeleteModalVisible(true);
  };  

  const columns = [
    { title: "Item ID", dataIndex: "itemId", key: "itemId" },
    { title: "Item Description", dataIndex: "item", key: "item" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Lab/Stock Room", dataIndex: "labRoom", key: "labRoom" },
    { title: "Inventory Balance", dataIndex: "quantity", key: "quantity" },
    { title: "Usage Type", dataIndex: "usageType", key: "usageType" }, 
    {
      title: "Date of Entry",
      dataIndex: "entryDate",
      key: "entryDate",
      render: (date) => {
        return date && date !== "N/A" ? date : "N/A";
      },
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => {
        return date && date !== "N/A" ? date : "N/A";
      },
    },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Condition", dataIndex: "condition", key: "condition" },
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
        <Space direction="vertical" size="small">
          <Button type="primary" onClick={() => printQRCode(record)}>
            Print PDF
          </Button>

          <Button type="link" onClick={() => editItem(record)}>
            Edit
          </Button>

          <Button type="text" danger onClick={() => handleDelete(record)}>
            Delete
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
    return current && entryDate && current.isBefore(entryDate.endOf("day"));
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>

      <Layout>
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
            rowKey={(record) => record.itemId}
            bordered
            className="inventory-table"
          />

          <div className="form-container">
            <h3>Add Item to Inventory with QR Code</h3>

            <Form layout="vertical" form={form} onFinish={handleAdd}>
              <Space style={{ marginBottom: "20px" }}>
                    <Form.Item 
                        name="Item Name" 
                        label="Item Name" 
                        rules={[
                        {
                          required: true,
                          message: "Please enter Item Name!",
                        },
                      ]}>
                        <Input
                          placeholder="Enter Item Name"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          style={{ width: "200px" }}
                        />
                    </Form.Item>
              </Space>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="usageType"
                    label="Usage Type"
                    rules={[{ required: true, message: "Please select usage type!" }]}
                  >
                    <Select placeholder="Select Usage Type">
                      <Option value="Laboratory Experiment">Laboratory Experiment</Option>
                      <Option value="Research">Research</Option>
                      <Option value="Community Extension">Community Extension</Option>
                      <Option value="Others">Others</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      name="type" 
                      label="Item Type" 
                      rules={[
                        {
                        required: true,
                        message: "Please select Item Type!",
                        },
                      ]}>
                      <Select onChange={value => setItemType(value)} placeholder="Select Item Type">
                        <Option value="Fixed">Fixed</Option>
                        <Option value="Consumable">Consumable</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item 
                      name="quantity" 
                      label="Quantity" 
                      rules={[
                      {
                        required: true,
                        message: "Please enter Quantity!",
                      },
                    ]}>
                      <Input placeholder="Enter quantity" />
                    </Form.Item>
                  </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="entryDate"
                    label="Date of Entry"
                    rules={[
                      {
                        required: true,
                        message: "Please select a date of entry!",
                      },
                    ]}
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
                    rules={[
                      {
                        required: false,
                        message: "Please select a date of expiry!",
                      },
                    ]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      style={{ width: "100%" }}
                      placeholder="Select Date of Expiry"
                      disabledDate={disabledExpiryDate}
                      disabled={itemType === "Fixed"}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[
                      { required: true, message: "Please select a category!" },
                    ]}
                  >
                    <Select placeholder="Select Category">
                      <Option value="Chemical">Chemical</Option>
                      <Option value="Reagent">Reagent</Option>
                      <Option value="Materials">Materials</Option>
                      <Option value="Equipment">Equipment</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="labRoom"
                    label="Lab/Stock Room"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Lab/Stock Room!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Lab/Stock Room" />
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

          <Modal
            title="Edit Item"
            visible={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            onOk={() => editForm.submit()}
          >
            <Form layout="vertical" form={editForm} onFinish={updateItem}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[
                      { required: true, message: "Please select a category!" },
                    ]}
                  >
                    <Select placeholder="Select Category">
                      <Option value="Chemical">Chemical</Option>
                      <Option value="Reagent">Reagent</Option>
                      <Option value="Materials">Materials</Option>
                      <Option value="Equipment">Equipment</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="usageType" label="Usage Type">
                    <Select placeholder="Select Usage Type">
                      <Option value="Laboratory Experiment">Laboratory Experiment</Option>
                      <Option value="Research">Research</Option>
                      <Option value="Community Extension">Community Extension</Option>
                      <Option value="Others">Others</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

                <Col span={12}>
                  <Form.Item
                    name="labRoom"
                    label="Lab/Stock Room"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Lab/Stock Room!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Lab/Stock Room" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="type" label="Item Type">
                    <Select onChange={value => setItemType(value)}>
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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="status" label="Status">
                    <Select placeholder="Select Status">
                      <Option value="Available">Available</Option>
                      <Option value="In Use">In Use</Option>
                      <Option value="Damaged">Damaged</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="condition" label="Condition">
                    <Select placeholder="Select Condition">
                      <Option value="Good">Good</Option>
                      <Option value="Fair">Fair</Option>
                      <Option value="Poor">Poor</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          <DeleteModal
            visible={deleteModalVisible}
            onClose={() => {
              setDeleteModalVisible(false);
              setItemToDelete(null);
            }}
            item={itemToDelete}
            onDeleteSuccess={(deletedItemId) => {
              setDataSource((prev) =>
                prev.filter((item) => item.itemId !== deletedItemId)
              );
            }}
          />

          <NotificationModal
            isVisible={isNotificationVisible}
            onClose={() => setIsNotificationVisible(false)}
            message={notificationMessage}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Inventory;
