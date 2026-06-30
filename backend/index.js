const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Frontend-la irunthu vara JSON data-va padikka

// ==========================================
// 1. MySQL Database Connection
// ==========================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error ❌: ', err);
    } else {
        console.log('MySQL Database Connected Successfully! 🔥');
        
        // Automatic-ah Products Table Create Panna Code
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.query(createTableQuery, (err, result) => {
            if (err) console.error('Table create aagala ❌:', err);
            else console.log('Products Table Ready aagiduchu! 📦');
        });
    }
});

// ==========================================
// 2. Cloudinary Config
// ==========================================
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});
console.log('Cloudinary Configured! ☁️');

const nodemailer = require('nodemailer');

// ==========================================
// 3. E-Commerce API Routes
// ==========================================

// Route: Send order invoice email (POST)
app.post('/api/send-order-email', (req, res) => {
    const { order } = req.body;
    if (!order) {
        return res.status(400).json({ error: "Order details missing" });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        console.warn("⚠️ SMTP credentials (EMAIL_USER/EMAIL_PASS) are not configured. Skipping email.");
        return res.status(200).json({ success: false, message: "SMTP credentials not configured. Email skipped." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    const itemsList = order.items
        .map(item => `<li><strong>${item.name}</strong> (Qty: ${item.quantity}) - ₹${Number(item.price).toLocaleString('en-IN')}</li>`)
        .join('');

    const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #d97706; text-transform: uppercase; margin-bottom: 2px;">Madurai Gadgets 58</h2>
            <p style="font-size: 12px; color: #71717a; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Official Billing Receipt</p>
            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
            <p>Vanakkam Machan!</p>
            <p>Your watch order payment validation is complete. Here is your digital invoice details:</p>
            
            <h3 style="margin-top: 25px;">Order References:</h3>
            <ul style="list-style-type: none; padding-left: 0; line-height: 1.6;">
                <li><strong>Invoice ID:</strong> ${order.id}</li>
                <li><strong>Date:</strong> ${order.date}</li>
                <li><strong>Payment Status:</strong> PAID</li>
            </ul>

            <h3 style="margin-top: 25px;">Customer Details:</h3>
            <ul style="list-style-type: none; padding-left: 0; line-height: 1.6;">
                <li><strong>Name:</strong> ${order.shipping.fullName}</li>
                <li><strong>Phone:</strong> ${order.shipping.phone}</li>
                <li><strong>Address:</strong> ${order.shipping.address}, ${order.shipping.city} - ${order.shipping.zipCode}</li>
            </ul>

            <h3 style="margin-top: 25px;">Purchase Details:</h3>
            <ul style="line-height: 1.8;">
                ${itemsList}
            </ul>

            <h3 style="margin-top: 25px; font-size: 18px; color: #111827;">
                Grand Total: ₹${Number(order.total).toLocaleString('en-IN')}
            </h3>
            
            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 25px 0;" />
            <p style="font-size: 12px; color: #71717a; text-align: center;">
                For warranty claims or status support, reach out directly on WhatsApp at 9688616838.<br />
                <strong>Madurai Gadgets 58 - Wear Peak, Master Your Style! ☄️✨</strong>
            </p>
        </div>
    `;

    const mailOptions = {
        from: `"Madurai Gadgets 58" <${emailUser}>`,
        to: order.shipping.email,
        cc: emailUser,
        subject: `Madurai Gadgets 58 - Invoice Order #${order.id}`,
        html: emailHtml
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("❌ Email dispatch failed:", error);
            return res.status(500).json({ error: "Could not send invoice email", details: error.toString() });
        }
        console.log("✅ Email sent successfully:", info.response);
        res.status(200).json({ success: true, message: "Invoice email sent successfully!" });
    });
});

// Route 1: Puthu Product-ah Add panna (POST)
app.post('/api/products', (req, res) => {
    const { name, price, description, image_url } = req.body;

    const sqlInsert = "INSERT INTO products (name, price, description, image_url) VALUES (?, ?, ?, ?)";
    db.query(sqlInsert, [name, price, description, image_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Product save aagala macha" });
        }
        res.status(201).json({ message: "Product super-ah add aayiduchu!", productId: result.insertId });
    });
});

// Route 2: Ellam Products-aiyum Edukka (GET)
app.get('/api/products', (req, res) => {
    const sqlSelect = "SELECT * FROM products";
    db.query(sqlSelect, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Products edukkum pothu error" });
        }
        res.status(200).json(results);
    });
});

// Basic testing route
app.get('/', (req, res) => {
    res.send('Madurai Gadgets Backend is 100% Ready! 😎');
});

// ==========================================
// 4. Server Start
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
});