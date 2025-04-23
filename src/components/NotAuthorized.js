import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './styles/NotAuthorized.css'; // 👈 make sure to create this CSS file

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="not-authorized-container">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate("/main/dashboard")}>
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export default NotAuthorized;
