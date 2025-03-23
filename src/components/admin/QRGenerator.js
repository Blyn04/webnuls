import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Table, Input, Button, Space } from "antd";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import CryptoJS from "crypto-js";
import CONFIG from "../../config";

const SECRET_KEY = CONFIG.SECRET_KEY;

const QRGenerator = () => {
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("");
  const [items, setItems] = useState([]);
  const qrRefs = useRef({});

  const generateQRCode = () => {
    if (!itemName || !itemId) {
      alert("Please enter both Item Name and ID!");
      return;
    }

    const timestamp = new Date().toISOString();
    const data = JSON.stringify({ id: itemId, name: itemName, timestamp });

    const encryptedData = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();

    const newItem = {
      key: items.length + 1,
      id: itemId,
      name: itemName,
      timestamp,
      qrCode: encryptedData,
    };

    setItems([...items, newItem]);
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
    { title: "Item ID", dataIndex: "id", key: "id" },
    { title: "Item Name", dataIndex: "name", key: "name" },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
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
            Print as PDF
          </Button>
          <Button type="default" onClick={() => downloadQRCode(record)}>
            Download as PNG
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Secure Asset QR Code Generator</h2>

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
        
        <Button type="primary" onClick={generateQRCode}>
          Generate QR Code
        </Button>
      </Space>

      <Table columns={columns} dataSource={items} pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default QRGenerator;
