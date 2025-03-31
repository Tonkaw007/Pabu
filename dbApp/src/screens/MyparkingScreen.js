/*
3. ตาราง reservations (การจองที่จอดรถ) ยังไม่ได้ตั้งราคาtotal_price – ราคาการจอง
reservation_id (PK) – รหัสการจอง
user_id (FK) – ผู้จอง 
slot_id (FK) – รหัสที่จอดรถ
slot_number – หมายเลขที่จอด
floor – ชั้น /ต้องรับพารามิเตอร์มาจากหน้า CarparkingScreen
start_time – วัน-เวลาที่เริ่มจอด
end_time – วัน-เวลาที่ออกจากที่จอด
booking_type – ประเภทการจอง (hourly, daily, monthly)
total_price – ราคาการจอง ยังไม่ได้ตั้งราคา 
status – สถานะ (pending, confirmed, completed)
created_at – วัน-เวลาที่จอง

7. ตาราง barrier_control (ระบบควบคุมที่กั้นรถ)
control_id (PK) – รหัสการควบคุม
reservation_id (FK) – รหัสการจอง
action – ของที่กั้นรถ (open, close)
action_time – เวลาที่กั้นรถ
*/
//import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MyParkingScreen = ({ navigation, route }) => {
  const { username, paymentSuccess, reservationDetails } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (paymentSuccess && reservationDetails) {
      Alert.alert(
        "Reservation Successful",
        `Your reservation for Slot ${reservationDetails.slotNumber} has been confirmed`,
        [{ text: "OK" }]
      );
      
      setReservations([{
        id: reservationDetails.id,
        slotId: reservationDetails.slotId,
        slotNumber: reservationDetails.slotNumber,
        floor: reservationDetails.floor,
        type: reservationDetails.type,
        startDate: new Date().toLocaleDateString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'confirmed',
        fee: reservationDetails.fee
      }]);
    }

    setIsLoading(false);
  }, []);

  const handleControlBlocker = (reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  const handleConfirmControl = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setModalVisible(false);
      Alert.alert(
        "Success",
        `Barrier for Slot ${selectedReservation?.slotNumber} has been opened`,
        [{ text: "OK" }]
      );
    }, 1500);
  };

  if (!username) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User information is missing</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Carparking")}
        >
          <Text style={styles.backButtonText}>Back to Carparking</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Parking</Text>
        <Text style={styles.usernameText}>{username}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B19CD8" />
        </View>
      ) : (
        <FlatList
          data={reservations}
          contentContainerStyle={reservations.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="local-parking" size={50} color="#B19CD8" />
              <Text style={styles.emptyText}>No active reservations</Text>
              <TouchableOpacity 
                style={styles.findParkingButton}
                onPress={() => navigation.navigate("Carparking", { username })}
              >
                <Text style={styles.findParkingButtonText}>Find Parking</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.reservationCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="local-parking" size={24} color="#B19CD8" />
                <Text style={styles.slotId}>Slot {item.slotNumber} (Floor {item.floor})</Text>
                <Text style={[
                  styles.reservationType,
                  item.status === 'confirmed' ? styles.confirmedStatus : 
                  item.status === 'pending' ? styles.pendingStatus : 
                  styles.completedStatus
                ]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="receipt" size={18} color="#666" />
                <Text style={styles.detailText}>ID: {item.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="calendar-today" size={18} color="#666" />
                <Text style={styles.detailText}>
                  {item.startDate} - {item.endDate}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="attach-money" size={18} color="#666" />
                <Text style={styles.detailText}>Paid: ฿{item.fee}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="info" size={18} color="#666" />
                <Text style={styles.detailText}>
                  Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>

              <TouchableOpacity 
                style={[
                  styles.controlButton,
                  item.status !== 'confirmed' && styles.disabledButton
                ]}
                onPress={() => handleControlBlocker(item)}
                disabled={item.status !== 'confirmed'}
              >
                <MaterialIcons 
                  name={item.status === 'confirmed' ? "lock-open" : "lock"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.controlButtonText}>
                  {item.status === 'confirmed' ? "Open Barrier" : "Not Available"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      )}

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate("Carparking", { username })}
      >
        <Text style={styles.backButtonText}>Back to Carparking</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <MaterialIcons 
              name="lock-open" 
              size={60} 
              color="#B19CD8" 
              style={styles.modalIcon}
            />
            
            <Text style={styles.modalTitle}>Barrier Control</Text>
            <Text style={styles.modalText}>
              Open barrier for Slot {selectedReservation?.slotNumber}?
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmControl}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Open</Text>
                )}
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
  usernameText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
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
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  confirmedStatus: {
    backgroundColor: '#4CAF50',
  },
  pendingStatus: {
    backgroundColor: '#FFC107',
  },
  completedStatus: {
    backgroundColor: '#9E9E9E',
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
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  findParkingButton: {
    backgroundColor: '#B19CD8',
    padding: 12,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  findParkingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#B19CD8',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#B19CD8',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default MyParkingScreen;