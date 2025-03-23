import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);

  const handleScan = (e) => {
    try {
      const data = JSON.parse(e.data);
      setScannedData(data);
      Alert.alert("QR Code Scanned", `Timestamp: ${data.timestamp}\nLocation: Lat ${data.location.latitude}, Lng ${data.location.longitude}`);
    } catch (error) {
      Alert.alert("Error", "Invalid QR Code");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <QRCodeScanner onRead={handleScan} flashMode={RNCamera.Constants.FlashMode.off} />
      {scannedData && (
        <View>
          <Text>Timestamp: {scannedData.timestamp}</Text>
          <Text>Location: {scannedData.location.latitude}, {scannedData.location.longitude}</Text>
        </View>
      )}
    </View>
  );
};

export default QRScanner;
