import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView, 
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MyParkingScreen = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showFine, setShowFine] = useState(false);

  // Destructure with proper validation
  const { 
    slotNumber, 
    floor, 
    parkingType, 
    startTime, 
    endTime, 
    fee, 
    reservationId,
    username 
  } = route.params || {};

  // Updated useEffect with reservationId check
  useEffect(() => {
    if (!reservationId) {
      setTimeout(() => {
        navigation.navigate('Carparking', { username });
      }, 0);
    }
  }, [route.params, navigation, username]);

  // Reservation object with fallback values
  const reservation = {
    id: reservationId,
    slotId: slotNumber || 'N/A',
    type: parkingType || 'hourly',
    startDate: new Date(startTime || Date.now()).toLocaleDateString(),
    endDate: new Date(endTime || Date.now()).toLocaleDateString(),
    startTime: new Date(startTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: new Date(endTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fee: fee || 0,
    floor: floor || 1
  };

  const calculateFine = () => {
    return reservation.fee * 2;
  };

  const handleControlBlocker = () => {
    setModalVisible(true);
  };

  const handleBackToCarparking = () => {
    navigation.navigate('Carparking', { username });
  };

  const handleConfirmBlocker = () => {
    setModalVisible(false);
    Alert.alert(
      "Blocker Controlled",
      `Blocker for Slot ${reservation.slotId} has been activated`,
      [{ text: "OK" }]
    );
  };

  // Updated rendering condition
  if (!reservationId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Parking</Text>
        </View>
        
        <View style={styles.noReservationContainer}>
          <MaterialIcons name="error-outline" size={50} color="#B19CD8" />
          <Text style={styles.noReservationText}>No active reservation found</Text>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Carparking', { username })}
          >
            <Text style={styles.backButtonText}>Back to Carparking</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Parking</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <MaterialIcons name="notifications" size={24} color="#B19CD8" />
        </TouchableOpacity>
      </View>

      {/* Reservation Card */}
      <View style={styles.reservationCard}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="local-parking" size={24} color="#B19CD8" />
          <Text style={styles.slotId}>Slot {reservation.slotId} (Floor {reservation.floor})</Text>
          <Text style={styles.reservationType}>
            {reservation.type?.toUpperCase() || 'HOURLY'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="receipt" size={18} color="#666" />
          <Text style={styles.detailText}>ID: {reservation.id}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={18} color="#666" />
          <Text style={styles.detailText}>Date: {reservation.startDate} - {reservation.endDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={18} color="#666" />
          <Text style={styles.detailText}>Time: {reservation.startTime} - {reservation.endTime}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={18} color="#666" />
          <Text style={styles.detailText}>Fee: {reservation.fee} THB</Text>
        </View>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleControlBlocker}
        >
          <MaterialIcons name="lock" size={20} color="white" />
          <Text style={styles.controlButtonText}>Control Blocker</Text>
        </TouchableOpacity>

        {/* เพิ่มปุ่มคำนวณค่าปรับ */}
        <TouchableOpacity 
          style={styles.fineButton}
          onPress={() => setShowFine(!showFine)}
        >
          <MaterialIcons name="warning" size={20} color="white" />
          <Text style={styles.fineButtonText}>
            {showFine ? 'Hide Fine Calculation' : 'Show Fine Calculation'}
          </Text>
        </TouchableOpacity>

        {/* แสดงผลการคำนวณค่าปรับ */}
        {showFine && (
          <View style={styles.fineContainer}>
            <Text style={styles.fineText}>Original Fee: {reservation.fee} THB</Text>
            <Text style={styles.fineText}>Fine (2x): {calculateFine()} THB</Text>
            <Text style={styles.fineNote}>Note: This is a demo of fine calculation</Text>
          </View>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackToCarparking}
      >
        <Text style={styles.backButtonText}>Back to Carparking</Text>
      </TouchableOpacity>

      {/* Blocker Control Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <MaterialIcons name="lock" size={60} color="#B19CD8" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Blocker Control</Text>
            <Text style={styles.modalText}>
              You are controlling the blocker for Slot {reservation.slotId}
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmBlocker}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  notificationIcon: {
    padding: 8,
  },
  noReservationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noReservationText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  slotId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
  },
  reservationType: {
    backgroundColor: '#B19CD8',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    color: '#666',
    marginLeft: 8,
    fontSize: 14,
  },
  controlButton: {
    flexDirection: 'row',
    backgroundColor: '#B19CD8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fineButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5252',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  fineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fineContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  fineText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 5,
  },
  fineNote: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#B19CD8',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: width * 0.8,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#D9534F',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#5CB85C',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MyParkingScreen;