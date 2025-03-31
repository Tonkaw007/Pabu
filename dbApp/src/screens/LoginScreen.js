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
import { loginUser } from "../services/api";

const LoginScreen = ({ navigation }) => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {    
            Keyboard.dismiss();

            if (!identifier.trim() || !password.trim()) {
                Alert.alert("Error", "Please fill in all fields");
                return;
            }

            setIsLoading(true);
            const token = await loginUser(identifier, password);

            Alert.alert("Login Successful", "Welcome back!");
            
            // ส่งข้อมูล username ไปยังหน้า Carparking
            navigation.navigate("Carparking", { username: identifier });

        } catch (error) {
            Alert.alert("Login Failed", error.message || "Invalid credentials");
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
                        <MaterialIcons name="login" size={40} color="white" />
                        <Text style={styles.title}>Welcome Back</Text>
                    </View>

                    <SearchBox 
                        placeHolder="Username/Phone number/Email" 
                        value={identifier} 
                        onChangeText={setIdentifier}
                        containerStyle={styles.input}
                    />
                    
                    <SearchBox 
                        placeHolder="Password"
                        secure={true}
                        value={password}
                        onChangeText={setPassword}
                        containerStyle={styles.input}
                    />
                    
                    <CustomButton 
                        title={isLoading ? "Logging in..." : "Log In"}
                        backgroundColor="#FFFFFF"
                        textColor="#B19CD8"
                        fontSize={18}
                        width="100%"
                        borderRadius={15}
                        marginTop={20}
                        onPress={handleLogin}
                        disabled={isLoading}
                    />

                    <TouchableOpacity 
                        style={styles.registerLink}
                        onPress={() => navigation.navigate("Register")}
                        disabled={isLoading}
                    >
                        <Text style={styles.registerText}>
                            Don't have an account? <Text style={styles.registerHighlight}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
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
        width: '100%',
    },
    registerLink: {
        marginTop: 25,
        alignItems: 'center',
    },
    registerText: {
        color: 'white',
        fontSize: 16,
    },
    registerHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
