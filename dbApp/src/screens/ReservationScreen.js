import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReservationScreen = ({ route, navigation }) => {
  const { slotId, username } = route.params;
  const [parkingType, setParkingType] = useState('hourly');
  
  // Time states
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1); // Default to 1 hour duration
    return date;
  });
  const [hours, setHours] = useState('1'); // Duration in hours
  
  // Date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });

  const [months, setMonths] = useState('1');

  // Dropdown states
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Hourly', value: 'hourly'},
    {label: 'Daily', value: 'daily'},
    {label: 'Monthly', value: 'monthly'}
  ]);

  // Picker visibility states
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const handleHoursChange = (text) => {
    if (text === '' || /^\d*$/.test(text)) {
      setHours(text);
      if (text) {
        const hoursNum = parseInt(text);
        const newEndTime = new Date(startTime);
        newEndTime.setHours(newEndTime.getHours() + hoursNum);
        setEndTime(newEndTime);
      }
    }
  };

  const handleMonthsChange = (text) => {
    if (text === '' || /^\d*$/.test(text)) {
      setMonths(text);
      if (text) {
        const monthsNum = parseInt(text);
        const newEndDate = new Date(startDate);
        newEndDate.setMonth(newEndDate.getMonth() + monthsNum);
        setEndDate(newEndDate);
      }
    }
  };

  const updateEndTime = (newStartTime) => {
    const hoursNum = hours ? parseInt(hours) : 1;
    const newEndTime = new Date(newStartTime);
    newEndTime.setHours(newEndTime.getHours() + hoursNum);
    setStartTime(newStartTime);
    setEndTime(newEndTime);
  };

  const calculateFee = () => {
    const rates = { hourly: 50, daily: 500, monthly: 1000 };
    switch(parkingType) {
      case 'hourly':
        const hoursNum = hours ? parseInt(hours) : 1;
        return hoursNum * rates.hourly;
      case 'daily':
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return rates.daily * days;
      case 'monthly':
        return rates.monthly * (months ? parseInt(months) : 1);
      default:
        return 0;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const validateBeforePayment = () => {
    if (parkingType === 'hourly' && (!hours || parseInt(hours) < 1)) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of hours');
      return;
    }
    if (parkingType === 'monthly' && (!months || parseInt(months) < 1)) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of months');
      return;
    }
  
    // สร้าง Bank Reference Number
    const bankReferenceNumber = generateBankReference();
  
    navigation.navigate('Payment', {
      username,
      slotId,
      slotNumber: Number(slotId), // ตรวจสอบให้แน่ใจว่าเป็นตัวเลข
      parkingType,
      fee: calculateFee(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: hours ? Number(hours) : 1,
      months: months ? Number(months) : 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      bankReferenceNumber // ส่งไปยัง PaymentScreen
    });
  };
  
  // ฟังก์ชันสร้าง Bank Reference Number
  const generateBankReference = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  

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
        <Text style={styles.header}>Reservation for {slotId}</Text>
        
        {/* Parking Type Dropdown */}
        <View style={{ zIndex: 5000 }}>
          <Text style={styles.label}>Parking Type:</Text>
          <DropDownPicker
            open={open}
            value={parkingType}
            items={items}
            setOpen={setOpen}
            setValue={setParkingType}
            setItems={setItems}
            placeholder="Select parking type"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            selectedItemLabelStyle={styles.selectedItem}
            zIndex={5000}
            zIndexInverse={1000}
            listMode="MODAL"
          />
        </View>

        {/* Hourly Parking Controls */}
        {parkingType === 'hourly' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Duration (hours):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={hours}
              onChangeText={handleHoursChange}
              onBlur={() => {
                if (!hours) setHours('1');
                else if (parseInt(hours) < 1) setHours('1');
              }}
            />

            <Text style={styles.label}>End Time:</Text>
            <View style={styles.timeInput}>
              <Text>{formatTime(endTime)}</Text>
            </View>
          </View>
        )}

        {/* Daily Parking Controls */}
        {parkingType === 'daily' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date:</Text>
            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>End Date:</Text>
            <View style={styles.timeInput}>
              <Text>{formatDate(endDate)}</Text>
            </View>

            <Text style={styles.label}>End Time:</Text>
            <View style={styles.timeInput}>
              <Text>{formatTime(endTime)}</Text>
            </View>
          </View>
        )}

        {/* Monthly Parking Controls */}
        {parkingType === 'monthly' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date:</Text>
            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Duration (months):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={months}
              onChangeText={handleMonthsChange}
              onBlur={() => {
                if (!months) setMonths('1');
                else if (parseInt(months) < 1) setMonths('1');
              }}
            />

            <Text style={styles.label}>End Date:</Text>
            <View style={styles.timeInput}>
              <Text>{formatDate(endDate)}</Text>
            </View>
          </View>
        )}

        {/* Total Fee Display */}
        <Text style={styles.feeText}>Total Fee: ฿{calculateFee()}</Text>

        {/* Continue to Payment Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={validateBeforePayment}
        >
          <Text style={styles.buttonText}>Continue to Payment</Text>
        </TouchableOpacity>

        {/* Date Time Pickers */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowStartTimePicker(false);
              if (selectedTime) {
                updateEndTime(selectedTime);
              }
            }}
          />
        )}

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                const monthsNum = months ? parseInt(months) : 1;
                const newEndDate = new Date(selectedDate);
                newEndDate.setMonth(newEndDate.getMonth() + monthsNum);
                setStartDate(selectedDate);
                setEndDate(newEndDate);
                updateEndTime(startTime);
              }
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333'
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#B19CD8',
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#f8f9fa',
    borderColor: '#B19CD8',
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333'
  },
  selectedItem: {
    color: '#B19CD8',
    fontWeight: 'bold'
  },
  inputGroup: { 
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8,
    color: '#555'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#B19CD8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#B19CD8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15
  },
  feeText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#B19CD8',
    marginVertical: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#B19CD8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ReservationScreen;