import axios from "axios";

const API_URL = "http://192.168.0.101:5000"; 

// 1. USERS - จัดการผู้ใช้
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error registering user");
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Invalid login");
    }
};

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data.users;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching users");
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data.user;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching user");
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating user");
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error deleting user");
    }
};

// 2. PARKING SLOTS - พื้นที่จอดรถ
export const getAllParkingSlots = async () => {
    try {
        const response = await axios.get(`${API_URL}/parking_slots`);
        return response.data.parking_slots;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching parking slots");
    }
};

export const getParkingSlotById = async (slotId) => {
    try {
        const response = await axios.get(`${API_URL}/parking_slots/${slotId}`);
        return response.data.parking_slot;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching parking slot");
    }
};

export const updateParkingSlotStatus = async (slotId, status) => {
    try {
        const response = await axios.put(`${API_URL}/parking-slots/${slotId}`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating parking slot");
    }
};

// 3. RESERVATIONS - การจองที่จอดรถ
export const createReservation = async (reservationData) => {
    try {
        const response = await axios.post(`${API_URL}/reservations`, reservationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error creating reservation");
    }
};

export const getAllReservations = async () => {
    try {
        const response = await axios.get(`${API_URL}/reservations`);
        return response.data.reservations;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching reservations");
    }
};

export const getReservationById = async (reservationId) => {
    try {
        const response = await axios.get(`${API_URL}/reservations/${reservationId}`);
        return response.data.reservation;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching reservation");
    }
};

export const updateReservation = async (reservationId, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/reservations/${reservationId}`, updateData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating reservation");
    }
};

export const deleteReservation = async (reservationId) => {
    try {
        const response = await axios.delete(`${API_URL}/reservations/${reservationId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error deleting reservation");
    }
};

// 4. PAYMENTS - การชำระเงิน
export const createPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/payments`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error processing payment");
    }
};

export const getPaymentById = async (paymentId) => {
    try {
        const response = await axios.get(`${API_URL}/payments/${paymentId}`);
        return response.data.payment;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching payment");
    }
};

export const updatePaymentStatus = async (paymentId, paymentStatus) => {
    try {
        const response = await axios.put(`${API_URL}/payments/${paymentId}`, {
            payment_status: paymentStatus
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating payment");
    }
};

// 5. PENALTIES - ค่าปรับ
export const createPenalty = async (penaltyData) => {
    try {
        const response = await axios.post(`${API_URL}/penalties`, penaltyData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error recording penalty");
    }
};

export const getAllPenalties = async () => {
    try {
        const response = await axios.get(`${API_URL}/penalties`);
        return response.data.penalties;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching penalties");
    }
};

export const updatePenaltyStatus = async (penaltyId, status) => {
    try {
        const response = await axios.put(`${API_URL}/penalties/${penaltyId}`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating penalty");
    }
};

// 6. NOTIFICATIONS - การแจ้งเตือน
export const createNotification = async (notificationData) => {
    try {
        const response = await axios.post(`${API_URL}/notifications`, notificationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error sending notification");
    }
};

export const getNotificationsByUserId = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/notifications/${userId}`);
        return response.data.notifications;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching notifications");
    }
};

// 7. BARRIER CONTROL - ควบคุมที่กั้นรถ
export const controlBarrier = async (controlData) => {
    try {
        const response = await axios.post(`${API_URL}/barrier-control`, controlData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error controlling barrier");
    }
};

export const getAllBarrierControls = async () => {
    try {
        const response = await axios.get(`${API_URL}/barrier-control`);
        return response.data.barrier_control;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching barrier control actions");
    }
};

// 8. EXTENSIONS - การต่อเวลา
export const createExtension = async (extensionData) => {
    try {
        const response = await axios.post(`${API_URL}/extensions`, extensionData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error processing extension");
    }
};

export const getExtensionByReservationId = async (reservationId) => {
    try {
        const response = await axios.get(`${API_URL}/extensions/${reservationId}`);
        return response.data.extension;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching extension");
    }
};

// ตั้งค่า Axios สำหรับการส่ง Token
export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};