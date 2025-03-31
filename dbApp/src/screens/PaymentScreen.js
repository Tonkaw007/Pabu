import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';

const PaymentScreen = ({ route }) => {
  const { username, parkingType, fee, floor, slotNumber, startTime, endTime, duration, bankReferenceNumber } = route.params || {};

  const qrCodeUrl = `https://example.com/payment?user=${username}&ref=${bankReferenceNumber}&fee=${fee}`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Payment Confirmation</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Slot: {slotNumber} (Floor {floor})</Text>
        <Text style={styles.summaryText}>Type: {parkingType.toUpperCase()}</Text>
        <Text style={styles.summaryText}>Duration: {duration} hour(s)</Text>
        <Text style={styles.summaryText}>Fee: {fee} THB</Text>
        <Text style={styles.summaryText}>End Time: {new Date(endTime).toLocaleTimeString()}</Text>
        <Text style={styles.summaryText}>Start Time: {new Date(startTime).toLocaleTimeString()}</Text>
        <Text style={styles.summaryText}>Bank Reference: {bankReferenceNumber}</Text>
      </View>
      
      <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}` }} style={styles.qrCode} />
      <TouchableOpacity style={styles.confirmButton} onPress={() => Alert.alert("Payment Confirmed")}>
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
