import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MyParkingScreen = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Get reservation data passed from PaymentScreen
  const { slotNumber, floor, parkingType, startTime, endTime, fee, reservationId } = route.params || {};

  // Updated reservation object without random ID
  const reservation = {
    id: reservationId, // Using the reservation ID passed from PaymentScreen
    slotId: slotNumber,
    type: parkingType,
    startDate: new Date(startTime).toISOString().split('T')[0], // Convert to YYYY-MM-DD
    endDate: new Date(endTime).toISOString().split('T')[0],
    fee,
    floor
  };

  const handleControlBlocker = (reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

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
          <Text style={styles.reservationType}>{reservation.type.toUpperCase()}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="receipt" size={18} color="#666" />
          <Text style={styles.detailText}>ID: {reservation.id}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={18} color="#666" />
          <Text style={styles.detailText}>
            {reservation.startDate} - {reservation.endDate}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => handleControlBlocker(reservation)}
        >
          <MaterialIcons name="lock" size={20} color="white" />
          <Text style={styles.controlButtonText}>Control Blocker</Text>
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate("Carparking")}
      >
        <Text style={styles.backButtonText}>Back to Carparking</Text>
      </TouchableOpacity>

      {/* Modal */}
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
              You are controlling the blocker for Slot {selectedReservation?.slotId}
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
                onPress={() => setModalVisible(false)}
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
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
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
  backButton: {
    backgroundColor: '#B19CD8',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'center',
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
    margin: 5,
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
    backgroundColor: '#5BC0DE',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MyParkingScreen;
