import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView 
} from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { username, slotId, parkingType, fee, floor, slotNumber } = route.params || {};

  const [bankReferenceNumber, setBankReferenceNumber] = useState('');

  useEffect(() => {
    // สร้าง bankReferenceNumber หลังจากเข้าหน้านี้
    const generateBankReference = () => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    setBankReferenceNumber(generateBankReference());
  }, []);

  // สร้าง QR Code URL
  const qrCodeUrl = `https://example.com/payment?user=${username}&ref=${bankReferenceNumber}&fee=${fee}`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Payment Confirmation</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Slot: {slotNumber} (Floor {floor})</Text>
        <Text style={styles.summaryText}>Type: {parkingType.toUpperCase()}</Text>
        <Text style={styles.summaryText}>Fee: {fee} THB</Text>
        <Text style={styles.summaryText}>Bank Reference: {bankReferenceNumber}</Text>
      </View>

      <Image 
        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}` }} 
        style={styles.qrCode} 
      />

      <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={() => Alert.alert("Payment Confirmed")}
      >
        <Text style={styles.buttonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20
  },
  summaryBox: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 5
  },
  qrCode: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20
  },
  confirmButton: {
    backgroundColor: '#B19CD8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  }
});

export default PaymentScreen;
