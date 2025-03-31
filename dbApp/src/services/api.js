import axios from "axios";

const API_URL = "http://192.168.0.101:5000"

//users
export const registerUser = async (username, phone, email, password, car_plate) => {
    try{
        const response = await axios.post(`${API_URL}/register`, {
            username,
            phone,
            email,
            password,
            car_plate,
        });
        return response.data;
    }catch (error) {
        throw new Error(error.response?.data?.message || "Error registering user");
    }
};

export const loginUser = async (identifier, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            identifier,
            password,
        });
        return response.data.token;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Invalid login")
    }
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม user_id
export const fetchUserById = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data.user;
    } catch (error) {
        throw new Error(error.response?.data?.message || "User not found");
    }
};

//parking_slots
// ฟังก์ชันเพิ่มที่จอดรถ
export const postParkingSlot = async (slot_number, floor, status) => {
    try {
        const response = await axios.post(`${API_URL}/parking_slots`, {
            slot_number,
            floor,
            status
        });
        return response.data; // ส่งข้อมูลการตอบกลับจาก API เช่น { message, slot_id }
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error adding parking slot");
    }
};

// ฟังก์ชันดึงข้อมูลที่จอดรถทั้งหมด
export const fetchParkingSlots = async () => {
    try {
        const response = await axios.get(`${API_URL}/parking_slots`);
        return response.data.parking_slots;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching parking slots");
    }
};

// ฟังก์ชันดึงข้อมูลที่จอดรถตาม slot_id
export const fetchParkingSlotById = async (slotId) => {
    try {
        const response = await axios.get(`${API_URL}/parking_slots/${slotId}`);
        return response.data.parking_slot;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Parking slot not found");
    }
};

// ฟังก์ชันอัปเดตสถานะที่จอดรถ
export const updateParkingSlotStatus = async (slotId, status) => {
    try {
        const response = await axios.put(`${API_URL}/parking_slots/${slotId}`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating parking slot status");
    }
};

//reservations
// ฟังก์ชันสร้างการจองที่จอดรถ
export const createReservation = async (user_id, slot_id, start_time, end_time, booking_type, total_price, status) => {
    try {
        const response = await axios.post(`${API_URL}/reservations`, {
            user_id,
            slot_id,
            start_time,
            end_time,
            booking_type,
            total_price,
            status,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error creating reservation");
    }
};

// ฟังก์ชันดึงข้อมูลการจองทั้งหมด
export const fetchReservations = async () => {
    try {
        const response = await axios.get(`${API_URL}/reservations`);
        return response.data.reservations;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching reservations");
    }
};

// ฟังก์ชันดึงข้อมูลการจองตาม reservation_id
export const fetchReservationById = async (reservation_id) => {
    try {
        const response = await axios.get(`${API_URL}/reservations/${reservation_id}`);
        return response.data.reservation;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Reservation not found");
    }
};

//Payments
// ฟังก์ชันสร้างการชำระเงิน
export const createPayment = async (reservation_id, penalty_id, amount, payment_status, bank_reference_number) => {
    try {
        const response = await axios.post(`${API_URL}/payments`, {
            reservation_id,
            penalty_id,
            amount,
            payment_status,
            bank_reference_number,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error processing payment");
    }
};

// ฟังก์ชันดึงข้อมูลการชำระเงินตาม payment_id
export const fetchPaymentById = async (payment_id) => {
    try {
        const response = await axios.get(`${API_URL}/payments/${payment_id}`);
        return response.data.payment;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Payment not found");
    }
};

// ฟังก์ชันอัปเดตสถานะการชำระเงิน
export const updatePaymentStatus = async (payment_id, payment_status) => {
    try {
        const response = await axios.put(`${API_URL}/payments/${payment_id}`, {
            payment_status,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating payment status");
    }
};

//Penalties
// ฟังก์ชันสร้างค่าปรับ
export const createPenalty = async (reservation_id, actual_exit_time, amount, status) => {
    try {
        const response = await axios.post(`${API_URL}/penalties`, {
            reservation_id,
            actual_exit_time,
            amount,
            status,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error recording penalty");
    }
};

// ฟังก์ชันดึงข้อมูลค่าปรับทั้งหมด
export const fetchPenalties = async () => {
    try {
        const response = await axios.get(`${API_URL}/penalties`);
        return response.data.penalties;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching penalties");
    }
};

// ฟังก์ชันดึงข้อมูลค่าปรับตาม penalty_id
export const fetchPenaltyById = async (penalty_id) => {
    try {
        const response = await axios.get(`${API_URL}/penalties/${penalty_id}`);
        return response.data.penalty;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Penalty not found");
    }
};

// ฟังก์ชันอัปเดตสถานะค่าปรับ
export const updatePenaltyStatus = async (penalty_id, status) => {
    try {
        const response = await axios.put(`${API_URL}/penalties/${penalty_id}`, {
            status,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating penalty status");
    }
};

//Notifications
// ฟังก์ชันส่งการแจ้งเตือน
export const createNotification = async (reservation_id, message, is_read = false) => {
    try {
        const response = await axios.post(`${API_URL}/notifications`, {
            reservation_id,
            message,
            is_read,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error sending notification");
    }
};

// ฟังก์ชันดึงการแจ้งเตือนตาม reservation_id
export const fetchNotificationsByReservation = async (reservation_id) => {
    try {
        const response = await axios.get(`${API_URL}/notifications/${reservation_id}`);
        return response.data.notifications;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching notifications");
    }
};

// ฟังก์ชันอัปเดตสถานะการแจ้งเตือน
export const updateNotificationStatus = async (notification_id, is_read) => {
    try {
        const response = await axios.put(`${API_URL}/notifications/${notification_id}`, {
            is_read,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating notification status");
    }
};

//Barrier Control
// ฟังก์ชันควบคุมที่กั้น (เปิด/ปิด)
export const controlBarrier = async (reservation_id, action) => {
    try {
        const response = await axios.post(`${API_URL}/barrier-control`, {
            reservation_id,
            action,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error controlling barrier");
    }
};
