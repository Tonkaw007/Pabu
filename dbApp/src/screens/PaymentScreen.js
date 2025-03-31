import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { createReservation, createPayment } from '../services/api'; // Import your API methods
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PaymentScreen = ({ route, navigation }) => {
  if (!route.params) {
    Alert.alert('Error', 'Missing reservation details. Please try again.');
    navigation.goBack();
    return null;
  }

  // Extract params from the route
  const { 
    username, 
    slotId, 
    parkingType, 
    fee, 
    floor, 
    slotNumber,
    duration,           // duration in hours for hourly parking
    startTime, 
    endTime,   
    startDate, 
    endDate,   
    months             // duration in months for monthly parking
  } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [items] = useState([
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' }
  ]);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

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
        username, 
        slotId, 
        startTime, 
        endTime, 
        parkingType, 
        fee, 
        'pending'
      );

      // 2. Create Payment
      const payment = await createPayment(reservation.id, null, fee, 'pending', bankReference);

      // Set reservation details to pass to the next screen
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

      setIsProcessing(false);
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

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
                  <Text style={styles.summaryText}>Start Time: {formatTime(new Date(startTime))}</Text>
                  <Text style={styles.summaryText}>End Time: {formatTime(new Date(endTime))}</Text>
                </>
              )}

              {parkingType === 'daily' && (
                <>
                  <Text style={styles.summaryText}>Start Date: {formatDate(new Date(startDate))}</Text>
                  <Text style={styles.summaryText}>End Date: {formatDate(new Date(endDate))}</Text>
                </>
              )}

              {parkingType === 'monthly' && (
                <>
                  <Text style={styles.summaryText}>Duration: {months} month(s)</Text>
                  <Text style={styles.summaryText}>Start Date: {formatDate(new Date(startDate))}</Text>
                  <Text style={styles.summaryText}>End Date: {formatDate(new Date(endDate))}</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
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
  },
});

export default PaymentScreen;
