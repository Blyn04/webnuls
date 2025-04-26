import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Input,
  Form,
  Modal,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import { db } from "../../backend/firebase/FirebaseConfig"; 
import { collection, addDoc, doc, setDoc, serverTimestamp, onSnapshot, query, where, deleteDoc, getDocs } from "firebase/firestore"; 
import "../styles/usersStyle/CapexRequest.css";
import { getAuth } from "firebase/auth";
import NotificationModal from "../customs/NotificationModal"; 
import FinalizeCapexModal from "../customs/FinalizeCapexModal";
import "../styles/usersStyle/CapexRequest.css";

const { Content } = Layout;

const CapexRequest = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pageTitle, setPageTitle] = useState("CAPEX Request");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isFinalizeModalVisible, setIsFinalizeModalVisible] = useState(false);
  const [capexHistory, setCapexHistory] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearRange = `${currentYear}-${nextYear}`;

  useEffect(() => {
    const userId = localStorage.getItem("userId");
  
    if (!userId) return;
  
    const capexRequestRef = collection(db, `accounts/${userId}/temporaryCapexRequest`);
  
    const unsubscribe = onSnapshot(capexRequestRef, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Ignore items that are marked deleted
        if (!data.deleted) {
          items.push({
            ...data,
            id: doc.id,
          });
        }
      });
  
      // Assign 'no' field based on index
      const numberedItems = items.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
  
      setDataSource(numberedItems);
      calculateTotalPrice(numberedItems);
    });
  
    return () => unsubscribe(); // Detach listener when component unmounts
  }, []);


  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
  
    const capexHistoryRef = collection(db, `accounts/${userId}/capexrequests`);
    
    const unsubscribeHistory = onSnapshot(capexHistoryRef, (snapshot) => {
      const historyData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
  
      setCapexHistory(historyData);
    });
  
    return () => unsubscribeHistory(); // Cleanup
  }, []);  

  const logRequestOrReturn = async (userId, userName, action, requestDetails) => {
    await addDoc(collection(db, `accounts/${userId}/activitylog`), {
      action, // e.g. "Requested Items" or "Returned Items"
      userName,
      timestamp: serverTimestamp(),
      requestList: requestDetails, 
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setEditingRow(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleView = (record) => {
    setSelectedRowDetails(record); 
    setViewModalVisible(true); 
  };  

  const calculateTotalPrice = (data) => {
    const total = data.reduce(
      (sum, item) => sum + (item.estimatedCost * item.qty || 0),
      0
    );
    setTotalPrice(total);
  };

  const handleSave = async (values) => {
    // Close the modal immediately
    setIsModalVisible(false);
  
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    let itemToLog;
  
    try {
      if (editingRow !== null) {
        // Updating an existing item
        const updatedItem = {
          ...values,
          id: editingRow.id,
          totalPrice: values.qty * values.estimatedCost,
        };
  
        // Directly update the item in Firestore
        const capexRequestRef = doc(db, `accounts/${userId}/temporaryCapexRequest`, editingRow.id);
        await setDoc(capexRequestRef, updatedItem);
  
        itemToLog = updatedItem;
  
        setNotificationMessage("Item updated successfully!");
        setNotificationVisible(true);
  
      } else {
        // Adding a new item
        const newItem = {
          ...values,
          totalPrice: values.qty * values.estimatedCost,
        };
  
        // Add the new item to Firestore directly
        const capexRequestRef = await addDoc(collection(db, `accounts/${userId}/temporaryCapexRequest`), newItem);
        const newItemWithId = {
          ...newItem,
          id: capexRequestRef.id,
          no: dataSource.length + 1,
        };
  
        setNotificationMessage("Item added successfully!");
        setNotificationVisible(true);
  
        itemToLog = newItem;
      }
  
      await logRequestOrReturn(userId, userName, "Added a Capex Item", itemToLog);
  
      calculateTotalPrice(); // Recalculate total price without modifying the state directly
  
    } catch (error) {
      console.error("Error saving item to Firestore:", error);
      setNotificationMessage("Failed to save Item");
      setNotificationVisible(true);
    }
  };  
   
  const handleDelete = async (id) => {
    const updatedData = dataSource.filter((item) => item.id !== id);
    setDataSource(updatedData);
    calculateTotalPrice(updatedData);
    setNotificationMessage("Item deleted successfully!");
    setNotificationVisible(true);
  
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
  
    try {
      const capexRequestRef = doc(db, `accounts/${userId}/temporaryCapexRequest`, id);
      await deleteDoc(capexRequestRef); // 👈 Use deleteDoc here
  
      await logRequestOrReturn(userId, userName, "Deleted a Capex Item", [
        { deletedItemId: id }
      ]);

    } catch (error) {
      console.error("Error deleting item from Firestore:", error);
      setNotificationMessage("Failed to delete Item");
      setNotificationVisible(true);
    }
  };

  const editRow = (record) => {
    setEditingRow(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    if (dataSource.length === 0) {
      setNotificationMessage("Please add at least one item to submit");
      setNotificationVisible(true);
      return;
    }
  
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
  
    try {
      // Step 1: Add to root collection "capexrequestlist"
      const capexRequestRef = await addDoc(collection(db, "capexrequestlist"), {
        userId,
        userName,
        totalPrice,
        createdAt: serverTimestamp(),
        items: dataSource,
      });
  
      // Step 2: Add to user's "capexrequests" subcollection
      await addDoc(collection(db, `accounts/${userId}/capexrequests`), {
        capexRequestId: capexRequestRef.id,
        userId,
        userName,
        totalPrice,
        createdAt: serverTimestamp(),
        items: dataSource,
      });
  
      // Step 3: Fetch all documents inside "temporaryCapexRequest" and delete them
      const tempCapexSnapshot = await getDocs(collection(db, `accounts/${userId}/temporaryCapexRequest`));
      const deletePromises = tempCapexSnapshot.docs.map((docSnapshot) => 
        deleteDoc(doc(db, `accounts/${userId}/temporaryCapexRequest/${docSnapshot.id}`))
      );
      await Promise.all(deletePromises);
  
      // Step 4: Log
      await logRequestOrReturn(userId, userName, "Sent a Capex Request", dataSource);
  
      // Step 5: Success actions
      setNotificationMessage("CAPEX Request submitted successfully!");
      setNotificationVisible(true);
  
      setDataSource([]);
      setTotalPrice(0);
      setIsFinalizeModalVisible(false);
  
    } catch (error) {
      console.error("Error submitting CAPEX request:", error);
      setNotificationMessage("Failed to submit CAPEX request");
      setNotificationVisible(true);
    }
  };  

  const handleRequestCancel = () => {
    setDataSource([]);
    setTotalPrice(0);
    message.info("CAPEX Request cancelled.");
  };
  
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
      render: (text) => {
        const value = text || 0; 
        return `₱${value.toLocaleString()}`;
      },
      width: 120,
      align: "right",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => {
        const value = text || 0; 
        return `₱${value.toLocaleString()}`;
      },
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

          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}  // Ensure onConfirm is used here
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
            ❌
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Submission Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => createdAt?.toDate().toLocaleString(),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `₱${price?.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button type="link" onClick={() => handleView(record)}>
          View
        </Button>
      ),
    },
  ];  

  const itemsColumns = [
    {
      title: "Item Description",
      dataIndex: "itemDescription",
      key: "itemDescription",
    },
    {
      title: "Justification",
      dataIndex: "justification",
      key: "justification",
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Estimated Cost",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
      render: (cost) => `₱${cost?.toLocaleString()}`,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `₱${price?.toLocaleString()}`,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className="site-layout">
        <Content className="capex-content">
          <div className="capex-header">
            <h2>
              CAPEX Request for Materials
              <span style={{ marginLeft: "20px", fontWeight: "normal" }}>
                Year {yearRange}
              </span>
            </h2>

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
            rowKey="id"
            pagination={false}
            bordered
            className="capex-table"
            onRow={(record) => ({
              onClick: () => {
                setSelectedRowDetails(record);
                setViewModalVisible(true);
              },
            })}
            
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
              onClick={() => setIsFinalizeModalVisible(true)}
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
                rules={[{ required: true, message: "Please enter the item description!" }]}
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
                rules={[{ required: true, message: "Please enter estimated cost!" }]}
              >
                <Input type="number" placeholder="Enter estimated cost" />
              </Form.Item>

              <Form.Item
                name="justification"
                label="Justification"
                rules={[{ required: true, message: "Please enter a justification!" }]}
              >
                <Input.TextArea rows={3} placeholder="Enter justification" />
              </Form.Item>
            </Form>
          </Modal>

          <div style={{ marginTop: "50px" }}>
            <h2>Submitted CAPEX History</h2>
            <Table
              dataSource={capexHistory}
              columns={historyColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              bordered
              className="capex-history-table"
            />
          </div>

        </Content>
      </Layout>

      <Modal
        title="CAPEX Request Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRowDetails && (
          <div>
            <p><strong>User Name:</strong> {selectedRowDetails.userName}</p>
            <p><strong>Total Price:</strong> ₱{selectedRowDetails.totalPrice?.toLocaleString()}</p>
            <p><strong>Submission Date:</strong> {selectedRowDetails.createdAt?.toDate().toLocaleString()}</p>

            <h3>Items:</h3>
            <Table
              dataSource={selectedRowDetails.items}
              columns={itemsColumns}
              pagination={false}
              rowKey="itemDescription" 
              className="capex-modal-table"
            />
          </div>
        )}
      </Modal>
      
      <FinalizeCapexModal
        visible={isFinalizeModalVisible}
        onConfirm={handleSubmit}
        onCancel={() => setIsFinalizeModalVisible(false)}
        dataSource={dataSource}  
        totalPrice={totalPrice || 0}
      />

    </Layout>
  );
};

export default CapexRequest;
