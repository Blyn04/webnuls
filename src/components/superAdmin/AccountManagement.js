import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../../backend/firebase/FirebaseConfig";
import { createUserWithEmailAndPassword, updateEmail } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { debounce } from 'lodash';
import Sidebar from "../Sidebar";
import AppHeader from "../Header";
import "../styles/superAdminStyle/AccountManagement.css";
import SuccessModal from "../customs/SuccessModal"; 
import NotificationModal from "../customs/NotificationModal";

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
  const [modalMessage, setModalMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);

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
    const accountsCollection = collection(db, "accounts");
  
    const unsubscribe = onSnapshot(
      accountsCollection,
      (querySnapshot) => {
        const accountList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  
        setAccounts(accountList);
      },

      (error) => {
        console.error("Error fetching accounts in real-time: ", error);
        message.error("Failed to load accounts.");
      }
    );
  
    return () => unsubscribe();
  }, []);  

  useEffect(() => {
    fetchAdminCredentials();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, roleFilter, statusFilter, departmentFilter]);
  
  useEffect(() => {
    setFilteredAccounts(accounts); 
  }, [accounts]);

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []); 

  const closeModal = () => {
    setShowModal(false);
    sessionStorage.removeItem("loginSuccess");
  };  

  const handleSearch = () => {
    let filteredData = [...accounts]; // Start with all accounts
    
    if (searchTerm) {
      filteredData = filteredData.filter(
        (account) =>
          account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    if (roleFilter) {
      filteredData = filteredData.filter((account) => account.role === roleFilter);
    }
  
    if (statusFilter) {
      filteredData = filteredData.filter(
        (account) => (statusFilter === "Active" ? !account.disabled : account.disabled)
      );
    }
  
    if (departmentFilter) {
      filteredData = filteredData.filter((account) => account.department === departmentFilter);
    }
  
    setFilteredAccounts(filteredData); 
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
    // Sanitize input by trimming extra spaces and lowering the case
    const sanitizedValues = {
      ...values,
      name: values.name.trim().toLowerCase(),
      email: values.email.trim().toLowerCase(),
    };

    // Check if the employeeId already exists in the 'accounts' collection
    const employeeQuery = query(
      collection(db, "accounts"),
      where("employeeId", "==", sanitizedValues.employeeId.trim())
    );
    
    const employeeSnapshot = await getDocs(employeeQuery);
    
    if (!employeeSnapshot.empty && employeeSnapshot.docs[0].id !== (editingAccount?.id || null)) {
      setModalMessage("This employee ID is already in use!");
      setIsNotificationVisible(true);
      return;
    }
  
    // Check for duplicates, ensuring all names and emails are unique
    const isDuplicate = accounts.some(
      (acc) =>
        acc.id !== (editingAccount?.id || null) &&
        (acc.name.toLowerCase() === sanitizedValues.name ||
          acc.email.toLowerCase() === sanitizedValues.email)
    );
  
    if (isDuplicate) {
      setModalMessage("An account with the same name or email already exists!");
      setIsNotificationVisible(true);
      return;
    }
  
    try {
      if (editingAccount) {
        // If editing an existing account
        const accountRef = doc(db, "accounts", editingAccount.id);
        await updateDoc(accountRef, sanitizedValues);
  
        const updatedAccounts = accounts.map((acc) =>
          acc.id === editingAccount.id ? { ...acc, ...sanitizedValues } : acc
        );
  
        setAccounts(updatedAccounts);
        setModalMessage("Account updated successfully!");
        
      } else {
        // If adding a new account
        const docRef = await addDoc(collection(db, "accounts"), sanitizedValues);
        const newAccount = { ...sanitizedValues, id: docRef.id };
  
        setAccounts([...accounts, newAccount]);
        setModalMessage("Account added successfully!");
      }
  
      setIsNotificationVisible(true);

    } catch (error) {
      console.error("Error handling account:", error);
      setModalMessage("Failed to update account.");
      setIsNotificationVisible(true);
    }
  
    setIsModalVisible(false);
  };  
  
  const handleDisable = async (id) => {
    try {
      // 1. Mark the account as disabled in Firestore
      await updateDoc(doc(db, "accounts", id), {
        disabled: true,
      });
  
      // 2. Update local state
      const updatedAccounts = accounts.map((acc) =>
        acc.id === id ? { ...acc, disabled: true } : acc
      );
      setAccounts(updatedAccounts);
  
      setModalMessage("Account disabled successfully!");
      setIsNotificationVisible(true);

    } catch (error) {
      console.error("Error disabling account:", error);
      message.error("Failed to disable account.");
    }
  };

  const handleEnable = async (id) => {
    try {
      await updateDoc(doc(db, "accounts", id), {
        disabled: false,
      });
  
      const updatedAccounts = accounts.map((acc) =>
        acc.id === id ? { ...acc, disabled: false } : acc
      );
      setAccounts(updatedAccounts);
  
      setModalMessage("Account enabled successfully!");
      setIsNotificationVisible(true);

    } catch (error) {
      console.error("Error enabling account:", error);
      message.error("Failed to enable account.");
    }
  };  

  const handlePasswordConfirm = () => {
    if (adminCredentials && password === adminCredentials.password) {
      if (actionType === "edit") {
        const accountToEdit = accounts.find((acc) => acc.id === selectedAccountId);
        showModalHandler(accountToEdit);

      } else if (actionType === "delete") {
        handleDisable(selectedAccountId); 
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
      title: "Job Title",
      dataIndex: "jobTitle",
      render: (jobTitle) => (
        <Tag color={jobTitle === "Dean" ? "volcano" : jobTitle === "Laboratory Custodian" ? "geekblue" : "green"}>
          {jobTitle.toLowerCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.disabled ? "red" : "green"}>
          {record.disabled ? "Disabled" : "Active"}
        </Tag>
      ),
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
            disabled={record.disabled} 
          />
          
          {record.disabled ? (
            <Popconfirm
              title="Enable this account?"
              onConfirm={() => handleEnable(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" style={{ color: "green" }}>Enable</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Are you sure you want to disable this account?"
              onConfirm={() => confirmDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>Disable</Button>
            </Popconfirm>
          )}
        </>
      ),
    }    
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>

      <Layout className="site-layout">
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

          <div className="filters">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              className="select-role"
              placeholder="Select Role"
              onChange={(value) => setRoleFilter(value)}
              allowClear
            >
              <Option value="admin">Admin</Option>
              <Option value="super-user">super-user</Option>
              <Option value="User">User</Option>
            </Select>

            <Select
             className="select-status"
              placeholder="Select Status"
              onChange={(value) => setStatusFilter(value)}
              allowClear
            >
              <Option value="Active">Active</Option>
              <Option value="Disabled">Disabled</Option>
            </Select>

            <Select
             className="select-department"
              placeholder="Select Department"
              onChange={(value) => setDepartmentFilter(value)}
              allowClear
            >
              <Option value="Nursing">Nursing</Option>
              <Option value="Medical Technology">Medical Technology</Option>
              <Option value="Dentistry">Dentistry</Option>
              <Option value="Pharmacy">Pharmacy</Option>
            </Select>
          </div>

          <Table
            // dataSource={accounts}
            dataSource={filteredAccounts}
            columns={columns}
            rowKey="id"
            className="account-table"
          />

          <Modal
            title={editingAccount ? "Edit Account" : "Add Account"}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            zIndex={1016}
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

              {/* <Form.Item
                name="employeeId"
                label="Employee ID"
                rules={[
                  { required: true, message: "Please input Employee ID!" },
                  {
                    pattern: /^\d{2}-\d{4}$/,
                    message: "Format must be like 12-0430",
                  },
                ]}
              >
                <Input placeholder="e.g., 12-0430" />
              </Form.Item> */}

              <Form.Item
                name="employeeId"
                label="Employee ID"
                rules={[
                  { required: true, message: "Please input Employee ID!" },
                  {
                    pattern: /^\d{2}-\d{4}$/,
                    message: "Format must be like 12-0430",
                  },
                ]}
              >
                <Input 
                  placeholder="e.g., 12-0430"
                  maxLength={7}
                  onChange={(e) => {
                    const value = e.target.value;
                    const onlyNumbersAndDash = value.replace(/[^0-9-]/g, ""); // Remove non-numeric/non-dash
                    e.target.value = onlyNumbersAndDash; // Set corrected value back
                  }}
                />
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
                name="jobTitle"
                label="Job Title"
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select
                  placeholder="Select Role"
                  onChange={(value) => {
                    form.setFieldsValue({
                      role:
                        value === "Dean"
                          ? "admin"
                          : value === "Laboratory Custodian"
                          ? "super-user"
                          : value === "Faculty"
                          ? "User"
                          : "",
                    });
                  }}
                >
                  <Option value="Dean">Dean</Option>
                  <Option value="Laboratory Custodian">Laboratory Custodian</Option>
                  <Option value="Faculty">Faculty</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Job title is required" }]}
              >
                <Input disabled />
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
          zIndex={1017}
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

        <NotificationModal  
          isVisible={isNotificationVisible}
          onClose={() => setIsNotificationVisible(false)}
          message={modalMessage}/>

        <SuccessModal isVisible={showModal} onClose={closeModal} />
      </Layout>
    </Layout>
  );
};

export default AccountManagement; 