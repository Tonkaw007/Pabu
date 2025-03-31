/*4. ตาราง payments (การชำระเงิน) front end เพิ่มรูปสลิป ต้องดูอีกทีว่าจะเก็บหลักฐานการโอนเป็นแบบไหน
payment_id (PK) – รหัสการชำระเงิน
reservation_id (FK) – รหัสการจอง
penalty_id (FK) – รหัสค่าปรับ
amount – จำนวนเงิน
payment_status – สถานะการจ่าย (pending, verified, failed)
bank_reference_number - หมายเลขอ้างอิงธนาคาร UNIQUE
รหัสค่าปรับยังเพิ่มมาไม่ได้เพราะยังไม่มีการบันทึกเวลาไว้ใน database 
payment_status – สถานะการจ่าย (pending, verified, failed)เพราะเราไม่ได้ทำจริงเลยไม่แน่ใจว่าต้องจำลองการเก็บยังไง*/

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { username, slotId, parkingType, fee, floor, slotNumber } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate("Myparking", { 
        username: username,
        paymentSuccess: true,
        reservationDetails: {
          id: `RES-${Math.random().toString(36).substr(2, 9)}`,
          slotId: slotId,
          slotNumber: slotNumber,
          floor: floor,
          type: parkingType,
          fee: fee
        }
      });
    }, 1500); // ลดเวลาเหลือ 1.5 วินาที
  };

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B19CD8" />
          <Text style={styles.loadingText}>Processing your payment...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.header}>Payment Confirmation</Text>
          
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>Slot: {slotNumber} (Floor {floor})</Text>
            <Text style={styles.summaryText}>Type: {parkingType.toUpperCase()}</Text>
            <Text style={styles.summaryText}>Total: ฿{fee}</Text>
          </View>

          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirmPayment}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2C3E50',
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#B19CD8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;