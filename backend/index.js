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

// ==========================================
// 3. E-Commerce API Routes
// ==========================================

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