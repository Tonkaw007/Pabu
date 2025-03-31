import React, {useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { 
    username, 
    parkingType, 
    fee, 
    floor, 
    slotNumber, 
    startTime, 
    endTime, 
    duration,
    months,
    startDate,
    endDate
  } = route.params || {};
  
  const [bankReferenceNumber, setBankReferenceNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bankReferenceNumber) {
      setBankReferenceNumber(Math.floor(100000 + Math.random() * 900000).toString());
    }
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleConfirmPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Payment Confirmed",
        "Your payment has been successfully processed",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate('Myparking', {
                slotNumber,
                floor,
                parkingType,
                startTime,
                endTime,
                fee,
                reservationId: bankReferenceNumber,
                username
              });
            }
          }
        ]
      );
    }, 1500);
  };

  const qrCodeUrl = `https://example.com/payment?user=${username}&ref=${bankReferenceNumber}&fee=${fee}`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Payment Confirmation</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Slot: {slotNumber} (Floor {floor})</Text>
        <Text style={styles.summaryText}>Type: {parkingType.toUpperCase()}</Text>
        
        {parkingType === 'hourly' && (
          <>
            <Text style={styles.summaryText}>Duration: {duration} hour(s)</Text>
            <Text style={styles.summaryText}>Start Time: {formatTime(startTime)}</Text>
            <Text style={styles.summaryText}>End Time: {formatTime(endTime)}</Text>
          </>
        )}

        {parkingType === 'daily' && (
          <>
            <Text style={styles.summaryText}>Start Date: {formatDate(startDate)}</Text>
            <Text style={styles.summaryText}>Start Time: {formatTime(startTime)}</Text>
            <Text style={styles.summaryText}>End Date: {formatDate(endDate)}</Text>
            <Text style={styles.summaryText}>End Time: {formatTime(endTime)}</Text>
          </>
        )}

        {parkingType === 'monthly' && (
          <>
            <Text style={styles.summaryText}>Duration: {months} month(s)</Text>
            <Text style={styles.summaryText}>Start Date: {formatDate(startDate)}</Text>
            <Text style={styles.summaryText}>End Date: {formatDate(endDate)}</Text>
          </>
        )}

        <Text style={styles.summaryText}>Fee: {parkingType === 'monthly' ? '฿' : '฿'}{fee}</Text>
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