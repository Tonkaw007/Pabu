import React, {useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { username, parkingType, fee, floor, slotNumber, startTime, endTime, duration } = route.params || {};
  
  const [bankReferenceNumber, setBankReferenceNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bankReferenceNumber) {
      setBankReferenceNumber(Math.floor(100000 + Math.random() * 900000).toString());
    }
  }, []);

  const handleConfirmPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Payment Confirmed");
      navigation.navigate('Myparking', {
        slotNumber,
        floor,
        parkingType,
        startTime,
        endTime,
        fee,
        reservationId: bankReferenceNumber // เพิ่ม reservationId ที่นี่
      });
    }, 1500);
  };

  const qrCodeUrl = `https://example.com/payment?user=${username}&ref=${bankReferenceNumber}&fee=${fee}`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Payment Confirmation</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Slot: {slotNumber} (Floor {floor})</Text>
        <Text style={styles.summaryText}>Type: {parkingType.toUpperCase()}</Text>
        <Text style={styles.summaryText}>Duration: {duration} hour(s)</Text>
        <Text style={styles.summaryText}>Fee: {fee} THB</Text>
        <Text style={styles.summaryText}>Start Time: {new Date(startTime).toLocaleTimeString()}</Text>
        <Text style={styles.summaryText}>End Time: {new Date(endTime).toLocaleTimeString()}</Text>
        <Text style={styles.summaryText}>Bank Reference: {bankReferenceNumber}</Text>
      </View>
      
      <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}` }} style={styles.qrCode} />
      
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Payment</Text>
        )}
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