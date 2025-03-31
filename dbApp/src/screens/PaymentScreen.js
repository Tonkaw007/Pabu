import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { createReservation, createPayment } from '../services/api'; // Import your API methods

const PaymentScreen = ({ route, navigation }) => {
  if (!route.params) {
    Alert.alert('Error', 'Missing reservation details. Please try again.');
    navigation.goBack();
    return null;
  }

  const { 
    username = '', 
    slotId = '', 
    parkingType = 'hourly', 
    fee = 0, 
    floor = '', 
    slotNumber = '',
    duration = 1,           
    startTime = new Date(), 
    endTime = new Date(),   
    startDate = new Date(), 
    endDate = new Date(),   
    months = 1              
  } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);

  const generateBankReference = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [bankReference] = useState(generateBankReference());
  
  const demoQRCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `ParkingReservation:${username}:${bankReference}:${slotId}:${fee}THB`
  )}`;

  const handleConfirmPayment = async () => {
    if (!username || !slotId || !parkingType || !fee || !floor || !slotNumber) {
      Alert.alert('Error', 'Missing payment details. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Reservation
      const reservation = await createReservation(
        username, slotId, startTime, endTime, parkingType, fee, 'pending'
      );

      // 2. Create Payment
      const payment = await createPayment(
        reservation.id, null, fee, 'pending', bankReference
      );

      // Handle success and navigate
      setIsProcessing(false);
      
      const reservationDetails = {
        id: reservation.id,
        slotId: slotId,
        slotNumber: slotNumber,
        floor: floor,
        type: parkingType,
        fee: fee,
        bankReference: bankReference,
        qrCodeUrl: demoQRCodeUrl,
        duration: parkingType === 'hourly' ? duration : undefined,
        months: parkingType === 'monthly' ? months : undefined,
        startTime: startTime,
        endTime: endTime,
        startDate: startDate,
        endDate: endDate
      };
      
      navigation.replace("Myparking", { 
        username: username,
        paymentSuccess: true,
        reservationDetails: reservationDetails
      });
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', error.message || 'Something went wrong, please try again.');
    }
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
            
            {parkingType === 'hourly' && (
              <>
                <Text style={styles.summaryText}>Duration: {duration} hour(s)</Text>
                <Text style={styles.summaryText}>Start Time: {new Date(startTime).toLocaleTimeString()}</Text>
                <Text style={styles.summaryText}>End Time: {new Date(endTime).toLocaleTimeString()}</Text>
              </>
            )}
            
            {parkingType === 'daily' && (
              <>
                <Text style={styles.summaryText}>Start Date: {new Date(startDate).toLocaleDateString()}</Text>
                <Text style={styles.summaryText}>End Date: {new Date(endDate).toLocaleDateString()}</Text>
              </>
            )}
            
            {parkingType === 'monthly' && (
              <>
                <Text style={styles.summaryText}>Duration: {months} month(s)</Text>
                <Text style={styles.summaryText}>Start Date: {new Date(startDate).toLocaleDateString()}</Text>
                <Text style={styles.summaryText}>End Date: {new Date(endDate).toLocaleDateString()}</Text>
              </>
            )}
          </View>

          <Image source={{ uri: demoQRCodeUrl }} style={styles.qrCode} />

          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmPayment}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Confirm Payment</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  summaryBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 5,
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#B19CD8',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  }
});

export default PaymentScreen;
