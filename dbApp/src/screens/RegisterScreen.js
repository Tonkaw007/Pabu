import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Platform,
  TouchableWithoutFeedback
} from "react-native";
import CustomButton from "../component/CustomButton";
import SearchBox from "../component/SearchBox";
import { MaterialIcons } from '@expo/vector-icons';
import { registerUser } from "../services/api";

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [carPlate, setCarPlate] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        try {
            Keyboard.dismiss();

            if (!username.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword || !carPlate.trim()) {
                Alert.alert("Error", "Please fill in all fields");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                Alert.alert("Error", "Invalid email format");
                return;
            }

            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone.trim())) {
                Alert.alert("Error", "Phone number must be 10 digits");
                return;
            }

            if (password !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return;
            }

            setIsLoading(true);
            // ส่งข้อมูลตามลำดับในฐานข้อมูล: username, phone, email, password, car_plate
            await registerUser(username.trim(), phone.trim(), email.trim(), password, carPlate.trim());
            
            Alert.alert(
                "Registration Successful", 
                "You can now log in!",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );

        } catch (error) {
            Alert.alert("Register Failed", error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <MaterialIcons name="person-add" size={40} color="white" />
                        <Text style={styles.title}>Create Account</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <SearchBox
                            placeHolder="Username"
                            value={username}
                            onChangeText={setUsername}
                            containerStyle={styles.input}
                        />
                        
                        {/* ย้าย Phone Number มาก่อน Email */}
                        <SearchBox
                            placeHolder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            containerStyle={styles.input}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        
                        <SearchBox
                            placeHolder="Email"
                            value={email}
                            onChangeText={setEmail}
                            containerStyle={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <SearchBox
                            placeHolder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secure={true}
                            containerStyle={styles.input}
                        />
                        
                        <SearchBox
                            placeHolder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secure={true}
                            containerStyle={styles.input}
                        />
                        
                        <SearchBox
                            placeHolder="Car Plate"
                            value={carPlate}
                            onChangeText={setCarPlate}
                            containerStyle={styles.input}
                            autoCapitalize="characters"
                        />

                        <CustomButton 
                            title={isLoading ? "Registering..." : "Register Now"}
                            backgroundColor="#FFFFFF"
                            textColor="#B19CD8"
                            fontSize={18}
                            width="100%"
                            borderRadius={15}
                            marginTop={30}
                            onPress={handleRegister}
                            disabled={isLoading}
                        />

                        <TouchableOpacity 
                            style={styles.loginLink}
                            onPress={() => navigation.navigate("Login")}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B19CD8',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 25,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 15,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
    },
    loginLink: {
        marginTop: 25,
        alignItems: 'center',
    },
    loginText: {
        color: 'white',
        fontSize: 16,
    },
    loginHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;