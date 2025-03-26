import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Upload,
  Avatar,
  Button,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Sidebar from "./Sidebar";
import AppHeader from "./Header";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../backend/firebase/FirebaseConfig";
import "./styles/Profile.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  const [formData, setFormData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [pageTitle, setPageTitle] = useState("Profile");
  const [userDocRef, setUserDocRef] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");

        if (!userEmail) {
          console.error("No logged-in user found.");
          return;
        }

        const q = query(
          collection(db, "accounts"),
          where("email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserDocRef(userDoc.ref);
          setFormData(userData);

          if (userData.profileImage) {
            setImageUrl(userData.profileImage);
          }
        } else {
          console.error("No user data found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // ✅ Handle Image Upload
  const handleImageUpload = async (info) => {
    if (info.file.status === "done") {
      const reader = new FileReader();
      reader.onload = async () => {
        const uploadedImageUrl = reader.result;
        setImageUrl(uploadedImageUrl);

        if (userDocRef) {
          try {
            await updateDoc(userDocRef, { profileImage: uploadedImageUrl });
            message.success("Profile image updated successfully!");
          } catch (error) {
            console.error("Error updating profile image:", error);
            message.error("Failed to update profile image.");
          }
        }
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
              <Card
                title="User Profile"
                bordered={false}
                style={{ width: "100%", maxWidth: "500px" }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  {/* ✅ Profile Image Upload Enabled */}
                  <Upload
                    name="profileImage"
                    listType="picture"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleImageUpload}
                  >
                    {imageUrl ? (
                      <Avatar src={imageUrl} size={100} />
                    ) : (
                      <Avatar icon={<UserOutlined />} size={100} />
                    )}
                    <Button
                      icon={<UploadOutlined />}
                      style={{ marginTop: 10 }}
                    >
                      Change Profile Picture
                    </Button>
                  </Upload>

                  <Title level={5} style={{ marginTop: 10 }}>
                    {formData?.name || "No Name Available"}
                  </Title>
                  <Text type="secondary">
                    {formData?.email || "No Email Available"}
                  </Text>
                </div>
              </Card>

              {/* ✅ Profile Summary Section */}
              {formData && (
                <Card
                  title="Profile Summary"
                  style={{ marginTop: 20 }}
                  bordered={false}
                >
                  {formData.profileImage && (
                    <Avatar
                      src={formData.profileImage}
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
                    <strong>Position:</strong> {formData.role}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                </Card>
              )}
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
