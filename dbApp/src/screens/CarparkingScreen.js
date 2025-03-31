import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  StatusBar, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ParkingSlot from '../component/ParkingSlot';
import CustomButton from '../component/CustomButton';
import { fetchParkingSlots } from '../services/api';

const { width } = Dimensions.get('window');

const CarparkingScreen = ({ route, navigation }) => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { username } = route.params || {};

  useEffect(() => {
    if (!username) {
      Alert.alert(
        "Error", 
        "User information is missing. Please login again.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
      return;
    }

    const loadParkingSlots = async () => {
      setIsLoading(true);
      try {
        // ดึงข้อมูลจาก API จริง
        const slots = await fetchParkingSlots();
        
        // กรองข้อมูลตามชั้นที่เลือก
        const filteredSlots = slots.filter(slot => slot.floor === currentFloor);
        
        // เรียงลำดับ slot ตามหมายเลข (A01, A02,... หรือ B01, B02,...)
        const sortedSlots = filteredSlots.sort((a, b) => {
          const aNum = parseInt(a.slot_number.substring(1));
          const bNum = parseInt(b.slot_number.substring(1));
          return aNum - bNum;
        });
        
        // ตั้งค่า status เป็น 'available' ทั้งหมด (ไม่มีการจอง)
        const availableSlots = sortedSlots.map(slot => ({
          ...slot,
          status: 'available'
        }));
        
        setParkingSlots(availableSlots);
      } catch (error) {
        console.error("Error loading parking slots:", error);
        Alert.alert('Error', 'Failed to load parking slots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadParkingSlots();
  }, [currentFloor, username, navigation]);

  const handleSlotPress = (slot) => {
    if (!username) {
      Alert.alert(
        "Error", 
        "User information is missing. Please login again.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
      return;
    }

    if (isLoading) return;

    navigation.navigate('Reservation', { 
      slotId: slot.slot_id,
      username: username,
      slotNumber: slot.slot_number,
      floor: slot.floor,
      slotDetails: slot // ส่งข้อมูล slot ทั้งหมดไปด้วย
    });
  };

  const renderParkingSlots = () => {
    const rows = [];
    for (let i = 0; i < parkingSlots.length; i += 2) {
      const rowSlots = parkingSlots.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.slotRow}>
          {rowSlots.map(slot => (
            <ParkingSlot
              key={slot.slot_id}
              slotNumber={slot.slot_number}
              isOccupied={false} // ตั้งค่าเป็น false ทั้งหมดเพราะไม่มีการจอง
              onPress={() => handleSlotPress(slot)}
            />
          ))}
        </View>
      );
    }
    return rows;
  };

  if (!username) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#B19CD8" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User information is missing</Text>
          <CustomButton 
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
            backgroundColor="#B19CD8"
            textColor="white"
            width={width * 0.7}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#B19CD8" barStyle="light-content" />
      
      <View style={styles.header}>
        <MaterialIcons name="account-circle" size={30} color="white" />
        <Text style={styles.welcomeText}>Welcome, {username}</Text>
      </View>

      <Text style={styles.title}>Available Parking Slots</Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.floorSelector}
      >
        {[1, 2, 3].map(floor => (
          <TouchableOpacity
            key={floor}
            style={[styles.floorButton, currentFloor === floor && styles.selectedFloor]}
            onPress={() => setCurrentFloor(floor)}
          >
            <Text style={[styles.floorText, currentFloor === floor && styles.selectedFloorText]}>
              Floor {floor}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.slotGrid}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading parking slots...</Text>
          </View>
        ) : parkingSlots.length > 0 ? (
          renderParkingSlots()
        ) : (
          <View style={styles.emptyContainer}>
            <Text>No parking slots available on this floor</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton 
          title={isLoading ? "Processing..." : "My Reservations"} 
          onPress={() => navigation.navigate('Myparking', { username })}
          backgroundColor="#B19CD8"
          textColor="white"
          width={width * 0.9}
          height={50}
          borderRadius={8}
          fontSize={16}
          fontWeight="600"
          marginTop={10}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B19CD8',
    padding: 15,
    paddingTop: 40,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    paddingBottom: 5,
    textAlign: 'center',
  },
  floorSelector: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  floorButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedFloor: {
    backgroundColor: '#B19CD8',
  },
  floorText: {
    color: '#555',
    fontWeight: '500',
  },
  selectedFloorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 15,
    paddingBottom: 10,
  },
  slotGrid: {
    padding: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
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
  },
});

export default CarparkingScreen;
