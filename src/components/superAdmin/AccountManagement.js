import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../backend/firebase/FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/superAdminStyle/AccountManagement.css";
import SuccessModal from "../customs/SuccessModal"; 

const { Content } = Layout;
const { Option } = Select;

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form] = Form.useForm();
  const [pageTitle, setPageTitle] = useState("");
  const [showModal, setShowModal] = useState(false); 
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [actionType, setActionType] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loginSuccessFlag = sessionStorage.getItem("loginSuccess");

    if (location.state?.loginSuccess === true && !loginSuccessFlag) {
      setShowModal(true);
      sessionStorage.setItem("loginSuccess", "true");

      const newState = { ...location.state };
      delete newState.loginSuccess;
      navigate(".", { replace: true, state: newState });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "accounts"));
        const accountList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAccounts(accountList);

      } catch (error) {
        console.error("Error fetching accounts:", error);
        message.error("Failed to load accounts.");
      }
    };
  
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchAdminCredentials();
  }, []);

  const closeModal = () => {
    setShowModal(false);
    sessionStorage.removeItem("loginSuccess");
  };  

  const fetchAdminCredentials = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "super-admin"));
      if (!querySnapshot.empty) {
        const adminData = querySnapshot.docs[0].data(); 
        setAdminCredentials(adminData);

      } else {
        console.error("No super admin credentials found.");
        message.error("Super admin credentials not found!");
      }

    } catch (error) {
      console.error("Error fetching super admin credentials:", error);
      message.error("Failed to load admin credentials.");
    }
  };
  
  const showModalHandler = (account) => {
    if (account) {
      setEditingAccount(account);
      form.setFieldsValue(account);

    } else {
      setEditingAccount(null);
      form.resetFields();
    }

    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    if (editingAccount) {
      try {
        const accountRef = doc(db, "accounts", editingAccount.id);
        await updateDoc(accountRef, values);
  
        const updatedAccounts = accounts.map((acc) =>
          acc.id === editingAccount.id ? { ...acc, ...values } : acc
        );

        setAccounts(updatedAccounts);
        message.success("Account updated successfully!");

      } catch (error) {
        console.error("Error updating account:", error);
        message.error("Failed to update account.");
      }

    } else {
      try {
        const docRef = await addDoc(collection(db, "accounts"), values);
        const newAccount = { ...values, id: docRef.id };
  
        setAccounts([...accounts, newAccount]);
        message.success("Account added successfully!");

      } catch (error) {
        console.error("Error adding account:", error);
        message.error("Failed to add account.");
      }
    }
  
    setIsModalVisible(false);
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "accounts", id));
      const updatedAccounts = accounts.filter((acc) => acc.id !== id);
      setAccounts(updatedAccounts);
      message.success("Account deleted successfully!");

    } catch (error) {
      console.error("Error deleting account:", error);
      message.error("Failed to delete account.");
    }
  };

  const handlePasswordConfirm = () => {
    if (adminCredentials && password === adminCredentials.password) {
      if (actionType === "edit") {
        const accountToEdit = accounts.find((acc) => acc.id === selectedAccountId);
        showModalHandler(accountToEdit);

      } else if (actionType === "delete") {
        handleDelete(selectedAccountId); 
      }
      message.success("Password confirmed!");
      setIsPasswordModalVisible(false);
      setPassword("");
      setPasswordError("");

    } else {
      setPasswordError("❗ Incorrect password. Please try again.");
    }
  };

  const confirmDelete = (id) => {
    setActionType("delete");
    setSelectedAccountId(id);
    setIsPasswordModalVisible(true);
  };

  const confirmEdit = (account) => {
    setActionType("edit");
    setSelectedAccountId(account.id);
    setIsPasswordModalVisible(true);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => confirmEdit(record)}
          />
          
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => confirmDelete(record.id)} 
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar setPageTitle={setPageTitle} />

      <Layout className="site-layout">
        <AppHeader pageTitle={pageTitle} />

        <Content className="account-content">
          <div className="account-header">
            <h2>Account Management</h2> 
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModalHandler(null)}
            >
              Add Account
            </Button>
          </div>

          <Table
            dataSource={accounts}
            columns={columns}
            rowKey="id"
            className="account-table"
          />

          <Modal
            title={editingAccount ? "Edit Account" : "Add Account"}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={() => form.submit()}
            okText="Save"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{ role: "User", department: "Nursing" }}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter the name" }]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter the email" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input placeholder="Enter Email" />
              </Form.Item>

              <Form.Item
                name="department"
                label="Department"
                rules={[
                  {
                    required: true,
                    message: "Please select a department!",
                  },
                ]}
              >
                <Select placeholder="Select Department">
                  <Option value="Nursing">Nursing</Option>
                  <Option value="Medical Technology">
                    Medical Technology
                  </Option>
                  <Option value="Dentistry">Dentistry</Option>
                  <Option value="Pharmacy">Pharmacy</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select placeholder="Select Role">
                  <Option value="Admin">Admin</Option>
                  <Option value="User">User</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Content>

       <Modal
          title="Confirm Password"
          open={isPasswordModalVisible}
          onCancel={() => {
            setIsPasswordModalVisible(false);
            setPasswordError(""); 
            setPassword(""); 
          }}
          onOk={handlePasswordConfirm}
          okText="Confirm"
        >
          <Form layout="vertical">
            <Form.Item label="Enter your password to proceed:">
              <Input.Password
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(""); 
                }}
                placeholder="Enter Password"
              />
            </Form.Item>

            {passwordError && (
              <p style={{ color: "red", marginTop: "-8px", marginBottom: "15px" }}>
                {passwordError}
              </p>
            )}
          </Form>
        </Modal>

        <SuccessModal isVisible={showModal} onClose={closeModal} />
      </Layout>
    </Layout>
  );
};

export default AccountManagement; 