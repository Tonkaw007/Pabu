const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express()
app.use(express.json())

const db = new sqlite3.Database("./parkingDB.db", (err) => {
    if (err) console.error(err.message);
    console.log("Connected to SQLite DB ✅");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (    
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        car_plate TEXT NOT NULL
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS parking_slots (
        slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
        slot_number TEXT UNIQUE NOT NULL,
        floor INTEGER NOT NULL,
        status TEXT CHECK(status IN ('available', 'reserved')) NOT NULL DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservations (
        reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        slot_number TEXT UNIQUE NOT NULL,
        floor INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        booking_type TEXT CHECK(booking_type IN ('hourly', 'daily', 'monthly')) NOT NULL,
        total_price REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'completed')) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        FOREIGN KEY(slot_id) REFERENCES parking_slots(slot_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        penalty_id INTEGER NULL,
        amount REAL NOT NULL,
        payment_status TEXT CHECK(payment_status IN ('pending', 'verified', 'failed')) NOT NULL DEFAULT 'pending',
        bank_reference_number TEXT UNIQUE NOT NULL,
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS penalties (
        penalty_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        actual_exit_time TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT CHECK(status IN ('unpaid', 'paid')) NOT NULL DEFAULT 'unpaid',
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS barrier_control (
        control_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        action TEXT CHECK(action IN ('open', 'close')) NOT NULL,
        action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);

});

//users
// API ลงทะเบียนผู้ใช้ใหม่
app.post("/register", async (req, res) => {
    const { username, phone, email, password, car_plate } = req.body;

    // ตรวจสอบว่า username, phone, หรือ email มีอยู่แล้วในฐานข้อมูลหรือไม่
    db.get(`SELECT * FROM users WHERE username = ? OR phone = ? OR email = ?`, [username, phone, email], (err, row) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Error checking user existence" });
        }
        if (row) {
            return res.status(400).send({ message: "User already exists" }); // หากพบผู้ใช้แล้ว
        }

        // ถ้าไม่มีผู้ใช้ในระบบ, ทำการแทรกข้อมูลใหม่
        const encryptedPassword = bcrypt.hashSync(password, 10);
        db.run(
            `INSERT INTO users (username, phone, email, password, car_plate) VALUES (?, ?, ?, ?, ?)`,
            [username, phone, email, encryptedPassword, car_plate],
            function (err) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send({ message: "Error inserting user" });
                }
                res.send({ message: "User registered successfully" });
            }
        );
    });
});



// API เข้าสู่ระบบ (Login)
app.post("/login", (req, res) => {
    const { identifier, password } = req.body;

    console.log("Login:", identifier, password);

    db.get(
        `SELECT * FROM users WHERE email = ? OR username = ? OR phone = ?`,
        [identifier, identifier, identifier],
        async (err, user) => {
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(400).send({ message: "Invalid credentials" });
            }
            const token = jwt.sign({ userId: user.user_id }, "secretkey");
            res.send({ token });
        }
    );
});

// API ดึงข้อมูลผู้ใช้ตาม user_id
app.get("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id, 10);

    // ตรวจสอบว่า userId เป็นตัวเลขที่ถูกต้อง
    if (isNaN(userId)) {
        return res.status(400).send({ message: "Invalid user ID" });
    }

    db.get(
        `SELECT user_id, username, phone, email, car_plate FROM users WHERE user_id = ?`,
        [userId],
        (err, row) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching user" });
            }
            if (!row) {
                return res.status(404).send({ message: "User not found" });
            }
            res.send({ user: row });
        }
    );
});

//parking_slots
//เพิ่มข้อมูลที่จอดรถ
app.post("/parking_slots", (req, res) => {
    const { slot_number, floor, status } = req.body;

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!slot_number || !floor || !status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // ตรวจสอบว่า status ต้องเป็น 'available' หรือ 'reserved' เท่านั้น
    if (!["available", "reserved"].includes(status)) {
        return res.status(400).send({ message: "Invalid status. Must be 'available' or 'reserved'" });
    }

    // ตรวจสอบ floor ว่าเป็นจำนวนเต็มบวก
    if (isNaN(floor) || floor <= 0) {
        return res.status(400).send({ message: "Invalid floor number" });
    }

    // ตรวจสอบรูปแบบของ slot_number (optional)
    const slotNumberPattern = /^[A-Za-z0-9]+$/; // ตัวอย่างการใช้ regex สำหรับตรวจสอบ
    if (!slotNumberPattern.test(slot_number)) {
        return res.status(400).send({ message: "Invalid slot number format" });
    }

    // แทรกข้อมูลที่จอดรถลงในฐานข้อมูล
    db.run(
        `INSERT INTO parking_slots (slot_number, floor, status) VALUES (?, ?, ?)`,
        [slot_number, floor, status],
        function (err) {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error adding parking slot" });
            }
            res.status(201).send({ message: "Parking slot added", slot_id: this.lastID });
        }
    );
});

// API ดึงข้อมูลที่จอดรถทั้งหมด
app.get("/parking_slots", (req, res) => {
    db.all(
        `SELECT slot_id, slot_number, floor, status, created_at FROM parking_slots`,
        (err, rows) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching parking slots" });
            }
            res.send({ parking_slots: rows });
        }
    );
});

// API ดึงข้อมูลที่จอดรถตาม slot_id
app.get("/parking_slots/:id", (req, res) => {
    const slotId = parseInt(req.params.id, 10);

    // ตรวจสอบว่า slotId เป็นตัวเลขที่ถูกต้อง
    if (isNaN(slotId)) {
        return res.status(400).send({ message: "Invalid slot ID" });
    }

    db.get(
        `SELECT slot_id, slot_number, floor, status, created_at FROM parking_slots WHERE slot_id = ?`,
        [slotId],
        (err, row) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching parking slot" });
            }
            if (!row) {
                return res.status(404).send({ message: "Parking slot not found" });
            }
            res.send({ parking_slot: row });
        }
    );
});

//อัพเดตสถานะที่จอดรถ
app.put("/parking_slots/:slot_id", (req, res) => {
    const slotId = parseInt(req.params.slot_id, 10);
    const { status } = req.body;

    // ตรวจสอบค่า status ต้องเป็น 'available' หรือ 'reserved' เท่านั้น
    if (!["available", "reserved"].includes(status)) {
        return res.status(400).send({ message: "Invalid status value" });
    }

    db.run(
        `UPDATE parking_slots SET status = ? WHERE slot_id = ?`,
        [status, slotId],
        function (err) {
            if (err) {
                console.error("Database Error:", err);
                return res.status(400).send({ message: "Error updating parking slot" });
            }
            if (this.changes === 0) {
                return res.status(404).send({ message: "Parking slot not found" });
            }
            res.send({ message: "Parking slot updated successfully" });
        }
    );
});

//reservations
// POST /reservations: สร้างการจองที่จอดรถ  ****ค่าจองจะถูกคำนวนจาก frontend แล้วส่งมา
app.post("/reservations", (req, res) => {
    const { user_id, slot_id, start_time, end_time, booking_type, total_price, status } = req.body;
    const created_at = new Date().toISOString();

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!user_id || !slot_id || !start_time || !end_time || !booking_type || !total_price || !status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // ตรวจสอบค่า booking_type และ status
    if (!["hourly", "daily", "monthly"].includes(booking_type)) {
        return res.status(400).send({ message: "Invalid booking type" });
    }
    if (!["pending", "confirmed", "completed"].includes(status)) {
        return res.status(400).send({ message: "Invalid status value" });
    }

    // ตรวจสอบว่า slot_id มีอยู่จริง พร้อมดึง slot_number และ floor
    db.get(`SELECT slot_number, floor FROM parking_slots WHERE slot_id = ?`, [slot_id], (err, slot) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Error checking parking slot" });
        }
        if (!slot) {
            return res.status(404).send({ message: "Parking slot not found" });
        }

        // ทำการจองที่จอดรถ
        db.run(
            `INSERT INTO reservations (user_id, slot_id, slot_number, floor, start_time, end_time, booking_type, total_price, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, slot_id, slot.slot_number, slot.floor, start_time, end_time, booking_type, total_price, status, created_at],
            function (err) {
                if (err) return res.status(500).send({ message: "Error creating reservation" });
                res.status(201).send({ message: "Reservation created successfully", reservation_id: this.lastID });
            }
        );
    });
});

// GET /reservations: ดึงข้อมูลการจองทั้งหมด
app.get("/reservations", (req, res) => {
    db.all(
        `SELECT reservation_id, user_id, slot_id, slot_number, floor, start_time, end_time, booking_type, total_price, status, created_at 
         FROM reservations`,
        (err, rows) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching reservations" });
            }
            res.send({ reservations: rows });
        }
    );
});

// GET /reservations/:reservation_id: ดึงข้อมูลการจองตาม ID
app.get("/reservations/:reservation_id", (req, res) => {
    const reservation_id = parseInt(req.params.reservation_id, 10);

    if (isNaN(reservation_id)) {
        return res.status(400).send({ message: "Invalid reservation ID" });
    }

    db.get(
        `SELECT reservation_id, user_id, slot_id, slot_number, floor, start_time, end_time, booking_type, total_price, status, created_at 
         FROM reservations WHERE reservation_id = ?`,
        [reservation_id],
        (err, row) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching reservation" });
            }
            if (!row) {
                return res.status(404).send({ message: "Reservation not found" });
            }
            res.send({ reservation: row });
        }
    );
});

//Payments
// POST /payments: การชำระเงิน
app.post("/payments", (req, res) => {
    const { reservation_id, penalty_id, amount, payment_status, bank_reference_number } = req.body;
    const created_at = new Date().toISOString();

    // ตรวจสอบค่าที่จำเป็นต้องมี (ยกเว้น penalty_id ที่สามารถเป็น null ได้)
    if (!reservation_id || !amount || !payment_status || !bank_reference_number) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // ตรวจสอบค่า payment_status
    if (!["pending", "verified", "failed"].includes(payment_status)) {
        return res.status(400).send({ message: "Invalid payment status" });
    }

    // ตรวจสอบว่า reservation_id มีอยู่จริง
    db.get(`SELECT reservation_id FROM reservations WHERE reservation_id = ?`, [reservation_id], (err, reservation) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Error checking reservation" });
        }
        if (!reservation) {
            return res.status(404).send({ message: "Reservation not found" });
        }

        // ทำการบันทึกการชำระเงิน
        db.run(
            `INSERT INTO payments (reservation_id, penalty_id, amount, payment_status, bank_reference_number) 
            VALUES (?, ?, ?, ?, ?)`,
            [reservation_id, penalty_id || null, amount, payment_status, bank_reference_number], // ตรวจสอบ penalty_id ว่ามีค่าไหม ถ้าไม่มีให้เป็น null
            function (err) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send({ message: "Error processing payment" });
                }
                res.status(201).send({ message: "Payment processed successfully", payment_id: this.lastID });
            }
        );
    });
});

// GET /payments/:payment_id: ดึงข้อมูลการชำระเงินตาม ID //เราสามารถดึงมาใช้เมื่อ user จ่ายค่าปรับแล้วเราก็ให้สิทธิ์ควบคุมที่กั้นได้
app.get("/payments/:payment_id", (req, res) => {
    const payment_id = parseInt(req.params.payment_id, 10);

    if (isNaN(payment_id)) {
        return res.status(400).send({ message: "Invalid payment ID" });
    }

    db.get(
        `SELECT payment_id, reservation_id, penalty_id, amount, payment_status, bank_reference_number 
         FROM payments WHERE payment_id = ?`,
        [payment_id],
        (err, row) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching payment" });
            }
            if (!row) {
                return res.status(404).send({ message: "Payment not found" });
            }
            res.send({ payment: row });
        }
    );
});

// PUT /payments/:payment_id: อัพเดตสถานะการชำระเงิน
app.put("/payments/:payment_id", (req, res) => {
    const payment_id = parseInt(req.params.payment_id, 10);
    const { payment_status } = req.body;

    if (isNaN(payment_id)) {
        return res.status(400).send({ message: "Invalid payment ID" });
    }

    if (!payment_status) {
        return res.status(400).send({ message: "Missing payment status" });
    }

    // ตรวจสอบค่า payment_status
    if (!["pending", "verified", "failed"].includes(payment_status)) {
        return res.status(400).send({ message: "Invalid payment status" });
    }

    db.run(
        `UPDATE payments SET payment_status = ? WHERE payment_id = ?`,
        [payment_status, payment_id],
        function (err) {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error updating payment" });
            }
            if (this.changes === 0) {
                return res.status(404).send({ message: "Payment not found" });
            }
            res.send({ message: "Payment status updated successfully" });
        }
    );
});

//Penalties
// POST /penalties: การบันทึกค่าปรับ
app.post("/penalties", (req, res) => {
    const { reservation_id, actual_exit_time, amount, status } = req.body;
    const created_at = new Date().toISOString();

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!reservation_id || !actual_exit_time || !amount || !status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // ตรวจสอบค่า status
    if (!["unpaid", "paid"].includes(status)) {
        return res.status(400).send({ message: "Invalid penalty status" });
    }

    // ตรวจสอบว่า reservation_id มีอยู่จริง
    db.get(`SELECT reservation_id FROM reservations WHERE reservation_id = ?`, [reservation_id], (err, reservation) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Error checking reservation" });
        }
        if (!reservation) {
            return res.status(404).send({ message: "Reservation not found" });
        }

        // ทำการบันทึกค่าปรับ
        db.run(
            `INSERT INTO penalties (reservation_id, actual_exit_time, amount, status) 
            VALUES (?, ?, ?, ?)`,
            [reservation_id, actual_exit_time, amount, status],
            function (err) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send({ message: "Error recording penalty" });
                }
                res.status(201).send({ message: "Penalty recorded successfully", penalty_id: this.lastID });
            }
        );
    });
});

// GET /penalties: ดึงข้อมูลค่าปรับทั้งหมด
app.get("/penalties", (req, res) => {
    db.all(
        `SELECT penalty_id, reservation_id, actual_exit_time, amount, status 
         FROM penalties`,
        (err, rows) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching penalties" });
            }
            res.send({ penalties: rows });
        }
    );
});

// GET /penalties/:penalty_id: ดึงข้อมูลค่าปรับตาม ID
app.get("/penalties/:penalty_id", (req, res) => {
    const penalty_id = parseInt(req.params.penalty_id, 10);

    if (isNaN(penalty_id)) {
        return res.status(400).send({ message: "Invalid penalty ID" });
    }

    db.get(
        `SELECT penalty_id, reservation_id, actual_exit_time, amount, status 
         FROM penalties WHERE penalty_id = ?`,
        [penalty_id],
        (err, row) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching penalty" });
            }
            if (!row) {
                return res.status(404).send({ message: "Penalty not found" });
            }
            res.send({ penalty: row });
        }
    );
});

// PUT /penalties/:penalty_id: อัพเดตสถานะค่าปรับ
app.put("/penalties/:penalty_id", (req, res) => {
    const penalty_id = parseInt(req.params.penalty_id, 10);
    const { status } = req.body;

    if (isNaN(penalty_id)) {
        return res.status(400).send({ message: "Invalid penalty ID" });
    }

    if (!status) {
        return res.status(400).send({ message: "Missing penalty status" });
    }

    // ตรวจสอบค่า status
    if (!["unpaid", "paid"].includes(status)) {
        return res.status(400).send({ message: "Invalid penalty status" });
    }

    db.run(
        `UPDATE penalties SET status = ? WHERE penalty_id = ?`,
        [status, penalty_id],
        function (err) {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error updating penalty" });
            }
            if (this.changes === 0) {
                return res.status(404).send({ message: "Penalty not found" });
            }
            res.send({ message: "Penalty status updated successfully" });
        }
    );
});

//Notifications
// POST /notifications: ส่งการแจ้งเตือน
app.post("/notifications", (req, res) => {
    const { reservation_id, message, is_read } = req.body;
    const created_at = new Date().toISOString();

    // ตั้งค่า is_read เป็น false ถ้าไม่ได้ส่งมา
    const readStatus = is_read !== undefined ? is_read : false;

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!reservation_id || !message) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // ตรวจสอบว่า reservation_id มีอยู่จริง
    db.get(`SELECT reservation_id, reservation_end_time FROM reservations WHERE reservation_id = ?`, [reservation_id], (err, reservation) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Error checking reservation" });
        }
        if (!reservation) {
            return res.status(404).send({ message: "Reservation not found" });
        }

        // ตรวจสอบเวลาจองที่เหลือ
        const currentTime = new Date();
        const reservationEndTime = new Date(reservation.reservation_end_time);
        const timeDiff = reservationEndTime - currentTime;
        
        // ถ้าเหลือเวลา 5 นาที จะส่งการแจ้งเตือน
        if (timeDiff <= 5 * 60 * 1000 && timeDiff > 0) {
            message = "Your parking reservation will end in 5 minutes. Please prepare to leave.";
        } else if (timeDiff <= 0) {
            message = "Your parking reservation has ended. You will be charged a penalty for exceeding the reserved time.";
        }

        // บันทึกการแจ้งเตือน
        db.run(
            `INSERT INTO notifications (reservation_id, message, is_read) 
            VALUES (?, ?, ?)`,
            [reservation_id, message, readStatus],
            function (err) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send({ message: "Error sending notification" });
                }
                res.status(201).send({ message: "Notification sent successfully", notification_id: this.lastID });
            }
        );
    });
});


// GET /notifications/:reservation_id: ดึงการแจ้งเตือนสำหรับการจอง
app.get("/notifications/:reservation_id", (req, res) => {
    const reservation_id = parseInt(req.params.reservation_id, 10);

    if (isNaN(reservation_id)) {
        return res.status(400).send({ message: "Invalid reservation ID" });
    }

    db.all(
        `SELECT notification_id, reservation_id, message, is_read 
         FROM notifications WHERE reservation_id = ?`,
        [reservation_id],
        (err, rows) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error fetching notifications" });
            }
            res.send({ notifications: rows });
        }
    );
});

// PUT /notifications/:notification_id: อัพเดตสถานะการแจ้งเตือนเป็นอ่านแล้ว
app.put("/notifications/:notification_id", (req, res) => {
    const notification_id = parseInt(req.params.notification_id, 10);
    const { is_read } = req.body;

    if (isNaN(notification_id)) {
        return res.status(400).send({ message: "Invalid notification ID" });
    }

    if (typeof is_read !== "boolean") {
        return res.status(400).send({ message: "Invalid is_read value" });
    }

    db.run(
        `UPDATE notifications SET is_read = ? WHERE notification_id = ?`,
        [is_read, notification_id],
        function (err) {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send({ message: "Error updating notification" });
            }
            if (this.changes === 0) {
                return res.status(404).send({ message: "Notification not found" });
            }
            res.send({ message: "Notification updated successfully" });
        }
    );
});

//Barrier Control
// POST /barrier-control: ควบคุมการพับที่กั้น
app.post("/barrier-control", (req, res) => {
    const { reservation_id, action } = req.body;

    // ตรวจสอบค่าที่จำเป็นต้องมี
    if (!reservation_id || !action) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // ตรวจสอบว่า action มีค่าเป็น 'open' หรือ 'close' เท่านั้น
    if (!["open", "close"].includes(action)) {
        return res.status(400).send({ message: "Invalid action. Must be 'open' or 'close'" });
    }

    // ตรวจสอบว่า reservation_id มีอยู่จริง
    db.get(`SELECT reservation_id FROM reservations WHERE reservation_id = ?`, [reservation_id], (err, reservation) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send({ message: "Error checking reservation" });
        }
        if (!reservation) {
            return res.status(404).send({ message: "Reservation not found" });
        }

        // บันทึกข้อมูลการควบคุมที่กั้น
        db.run(
            `INSERT INTO barrier_control (reservation_id, action) VALUES (?, ?)`,
            [reservation_id, action],
            function (err) {
                if (err) {
                    console.error("Database Error:", err);
                    return res.status(500).send({ message: "Error controlling barrier" });
                }
                res.status(201).send({ message: "Barrier control action recorded", control_id: this.lastID });
            }
        );
    });
});

//เอาไว้เช็ค root
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    }
  });

app.listen(5000,() => console.log("Server running on port 5000"));