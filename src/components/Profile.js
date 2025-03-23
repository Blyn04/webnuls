import React, { useState } from "react";
import { Layout, Form, Input, Select, Button, Card, Row, Col, Upload, Avatar } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import AppHeader from "./Header";
import "./styles/Profile.css";

const { Option } = Select;
const { Content } = Layout;

const Profile = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); 
  const [pageTitle, setPageTitle] = useState("Profile");

  const onFinish = (values) => {
    const profileData = { ...values, imageUrl };
    setFormData(profileData);
    console.log("Profile Data:", profileData);
  };

  const handleImageUpload = (info) => {
    if (info.file.status === "done") {

      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar setPageTitle={setPageTitle} />

      <Layout className="site-layout">
        <AppHeader className="profile-header" pageTitle={"Profile"} />

        <Content className="profile-content">
            <Row justify="center" align="middle" style={{ width: "100%" }}>
                <Col xs={24} sm={18} md={12} lg={8}>
                <Card title="User Profile" bordered={false} style={{ width: "100%", maxWidth: "500px" }}>
                <Form
                  form={form}
                  name="profile_form"
                  layout="vertical"
                  onFinish={onFinish}
                >

                  <Form.Item
                    name="profileImage"
                    label="Profile Image"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                  >
                    <Upload
                      name="profileImage"
                      listType="picture"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleImageUpload}
                    >
                      {imageUrl ? (
                        <Avatar
                          src={imageUrl}
                          size={100}
                          style={{ marginBottom: 10 }}
                        />
                      ) : (
                        <Avatar
                          icon={<UserOutlined />}
                          size={100}
                          style={{ marginBottom: 10 }}
                        />
                      )}
                      <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                      { required: true, message: "Please enter your name!" },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Enter Name" />
                  </Form.Item>

                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[
                      {
                        required: true,
                        message: "Please select your department!",
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
                    name="position"
                    label="Position"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your position!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Position" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please enter your email!" },
                      { type: "email", message: "Please enter a valid email!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Enter Email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your password!",
                      },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter Password"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                      Save Profile
                    </Button>
                  </Form.Item>
                </Form>

                {formData && (
                  <Card
                    title="Profile Summary"
                    style={{ marginTop: 20 }}
                    bordered={false}
                  >
              
                    {formData.imageUrl && (
                      <Avatar
                        src={formData.imageUrl}
                        size={100}
                        style={{ marginBottom: 10 }}
                      />
                    )}
                    <p>
                      <strong>Name:</strong> {formData.name}
                    </p>
                    <p>
                      <strong>Department:</strong> {formData.department}
                    </p>
                    <p>
                      <strong>Position:</strong> {formData.position}
                    </p>
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>Password:</strong> {formData.password}
                    </p>
                  </Card>
                )}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
