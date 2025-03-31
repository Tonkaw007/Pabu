import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, 
  Dimensions, SafeAreaView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MyParkingScreen = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // รับข้อมูลการจองจาก PaymentScreen ที่ผ่านมา
  const { slotNumber, floor, parkingType, startTime, endTime, fee } = route.params || {};

  const reservation = {
    id: `RES-${Math.floor(1000 + Math.random() * 9000)}`, // สุ่ม ID
    slotId: slotNumber,
    type: parkingType,
    startDate: new Date(startTime).toISOString().split('T')[0], // แปลงเป็น YYYY-MM-DD
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

      {/* แสดงการจองที่ได้รับจาก PaymentScreen */}
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
        onPress={() => navigation.navigate("Parking")}
      >
        <Text style={styles.backButtonText}>Back to Parking</Text>
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
              You are controlling blocker for Slot {selectedReservation?.slotId}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  notificationIcon: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    marginRight: 'auto',
  },
  reservationType: {
    backgroundColor: '#B19CD8',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#B19CD8',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyParkingScreen;
