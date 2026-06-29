import express from "express";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import compression from "compression";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// ==========================================
// NEW: SECURITY PACKAGES 🛡️
// ==========================================
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const JWT_SECRET = process.env.JWT_SECRET || "madurai_gadgets_super_secret";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// ==========================================
// HIGH SECURITY & SHIELD CONFIGURATION 🛡️
// ==========================================

// 1. Helmet: HTTP headers-ah hide panni XSS, Clickjacking mathiri attacks-ah thadukkum.
app.use(helmet({
  contentSecurityPolicy: false
})); 

// Enable response compression (GZIP) for optimized payload delivery speeds
app.use(compression());

// Secure restricted CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://madurai-gadgets-fullstack.vercel.app"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("CORS policy validation failed: origin not allowed! ❌"));
    }
  },
  credentials: true
}));

// 2. Payload Limit: Hacker periya data anuppi server-ah crash pannaama irukka limit (10kb) set panrom.
app.use(express.json({ limit: '10kb' })); 

// 3. Rate Limiter: DDoS & Spam Bot Protection. 
// Oru IP-la irunthu 15 nimishathukku 100 API requests thaan panna mudiyum.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes window
  limit: 100, 
  message: { 
    success: false, 
    message: "Too many requests from this IP, machan! Server shield activated. Try again after 15 minutes. 🛑" 
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Intha shield-ah namma API routes ellathukkum apply panrom
app.use("/api/", apiLimiter);


// ==========================================
// MySQL Database Connection (Aiven MySQL)
// ==========================================
let db: any = null; // Changed to 'any' to avoid TypeScript errors with Pool

if (process.env.DB_HOST) {
    try {
        db = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
            ssl: { rejectUnauthorized: false },
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        db.getConnection((err: any, connection: any) => {
            if (err) {
                console.error("MySQL Pool connection error ❌: ", err);
            } else {
                console.log("MySQL Database Pool Connected Successfully! 🔥");
                connection.release();
            }
        });
    } catch (e) {
        console.error("Failed to initialize MySQL Connection", e);
        db = null;
    }
} else {
    console.log("No MySQL connection environment variables found. Using default products.");
}

// ==========================================
// Automatic-ah Database Tables Create Panna Code
// ==========================================
if (db) {
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
    
    db.query(createTableQuery, (err: any, result: any) => {
        if (err) {
            console.error("Table create aagala ❌:", err);
        } else {
            console.log("Products Table Ready aagiduchu! 📦");

            // Database Indexes for optimized searching and range queries
            db.query("CREATE INDEX idx_products_name ON products(name)", (errIdxName: any) => {
                if (errIdxName && errIdxName.code !== "ER_DUP_KEYNAME") {
                    console.warn("Index idx_products_name creation skipped:", errIdxName.message);
                }
            });
            db.query("CREATE INDEX idx_products_price ON products(price)", (errIdxPrice: any) => {
                if (errIdxPrice && errIdxPrice.code !== "ER_DUP_KEYNAME") {
                    console.warn("Index idx_products_price creation skipped:", errIdxPrice.message);
                }
            });

            // Safely check and add columns
            const columnsToCheck = [
                { name: "category", query: "ALTER TABLE products ADD COLUMN category VARCHAR(255) DEFAULT 'Premier Watches'" },
                { name: "stock", query: "ALTER TABLE products ADD COLUMN stock INT DEFAULT 15" },
                { name: "specs", query: "ALTER TABLE products ADD COLUMN specs TEXT NULL" },
                { name: "gender", query: "ALTER TABLE products ADD COLUMN gender VARCHAR(50) DEFAULT 'Unisex'" },
                { name: "brand", query: "ALTER TABLE products ADD COLUMN brand VARCHAR(255) DEFAULT 'Other'" }
            ];
            
            columnsToCheck.forEach((col) => {
                db.query(`SHOW COLUMNS FROM products LIKE ?`, [col.name], (errCol: any, rows: any) => {
                    if (!errCol && rows && rows.length === 0) {
                        db.query(col.query, (errAlter: any) => {
                            if (errAlter) console.error(`Error adding column ${col.name}:`, errAlter);
                            else console.log(`Column ${col.name} added successfully to products table!`);
                        });
                    }
                });
            });

            // Automatic-ah Variations Table
            const createVariationsQuery = `
                CREATE TABLE IF NOT EXISTS product_variations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT,
                    color_name VARCHAR(50) NOT NULL,
                    color_code VARCHAR(50) NOT NULL,
                    image_url VARCHAR(500) NOT NULL,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
            `;
            db.query(createVariationsQuery, (errVarTable: any) => {
                if (errVarTable) console.error("Variations table create aagala ❌:", errVarTable);
                else {
                    console.log("Product Variations Table Ready aagiduchu! 🎨");
                    
                    // Users Table
                    const createUsersQuery = `
                        CREATE TABLE IF NOT EXISTS users (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            email VARCHAR(255) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            role VARCHAR(50) DEFAULT 'customer',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `;
                    db.query(createUsersQuery, (errUsr: any) => {
                        if (errUsr) console.error("Users table create aagala ❌:", errUsr);
                        else {
                            console.log("Users Table Ready! 👥");

                            // Orders Table
                            const createOrdersQuery = `
                                CREATE TABLE IF NOT EXISTS orders (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    user_id INT NOT NULL,
                                    total_amount DECIMAL(10, 2) NOT NULL,
                                    status VARCHAR(50) DEFAULT 'pending',
                                    shipping_address TEXT,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                                )
                            `;
                            db.query(createOrdersQuery, (errOrd: any) => {
                                if (errOrd) console.error("Orders table create aagala ❌:", errOrd);
                                else {
                                    console.log("Orders Table Ready! 🛍️");

                                    // Order Items Table
                                    const createOrderItemsQuery = `
                                        CREATE TABLE IF NOT EXISTS order_items (
                                            id INT AUTO_INCREMENT PRIMARY KEY,
                                            order_id INT NOT NULL,
                                            product_id INT NOT NULL,
                                            quantity INT NOT NULL DEFAULT 1,
                                            price DECIMAL(10, 2) NOT NULL,
                                            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                                            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                                        )
                                    `;
                                    db.query(createOrderItemsQuery, (errItm: any) => {
                                        if (errItm) console.error("Order items table create aagala ❌:", errItm);
                                        else {
                                            console.log("Order Items Table Ready! 📦");
                                            
                                            // One-time deletion of dummy/test products
                                            const dummyNames = [
                                                'Cosmograph Daytona Mastercopy',
                                                'Royal Oak Automatic High Copy',
                                                'Nautilus Blue Dial Mastercopy',
                                                'Submariner Date Ceramic Copy',
                                                'Seamaster 300M Master Plan',
                                                'Classic Roman Heritage Quartz',
                                                'sunglasses test',
                                                'OMEGA SEAMASTER AQUA TERRA'
                                            ];
                                            db.query("DELETE FROM products WHERE name IN (?)", [dummyNames], (errDel: any) => {
                                                if (errDel) console.error("Error cleaning dummy/test products:", errDel);
                                                else {
                                                    console.log("Dummy/test products cleaned successfully! 🧼");
                                                    
                                                    // Cleanup Jacob & Co products
                                                    const deleteJacobQuery = `
                                                        DELETE FROM products 
                                                        WHERE LOWER(name) LIKE '%jacob%' 
                                                           OR LOWER(name) LIKE '%jacon%' 
                                                           OR LOWER(brand) LIKE '%jacob%' 
                                                           OR LOWER(brand) LIKE '%jacon%'
                                                           OR LOWER(category) LIKE '%jacob%'
                                                           OR LOWER(category) LIKE '%jacon%'
                                                    `;
                                                    db.query(deleteJacobQuery, (errJacob: any, resJacob: any) => {
                                                        if (errJacob) {
                                                            console.error("Failed to delete Jacob products:", errJacob);
                                                        } else if (resJacob) {
                                                            console.log(`Deleted ${resJacob.affectedRows} Jacob/Jacon products from DB! 🧼`);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

// List of products to guide the AI chatbot
const PRODUCTS_INFO = [
  {
    id: "p1",
    name: "Cosmograph Daytona Mastercopy",
    price: 5499.0,
    category: "Chronograph",
    description: "Precision Quartz Chronograph featuring a stunning white dial, black sub-dials, scratchproof black Cerachrom bezel, and 40mm Oystersteel premium build.",
    specs: ["Movement: Precision Japanese Quartz with sweeping seconds", "Dial: Pristine White & Deep Black Chrono Rings", "Diameter: 40mm Oystersteel case", "Bezel: Black scratchproof tachymeter scale"],
  },
  {
    id: "p2",
    name: "Royal Oak Automatic High Copy",
    price: 6499.0,
    category: "Luxury Automatic",
    description: "Iconic octagonal luxury timepiece with signature steel screws, textured Grande Tapisserie dark-slate dial, and fully automatic custom self-winding sweep.",
    specs: ["Movement: Calibre 3120 Premium Japanese Automatic sweep", "Dial: Dark-slate waffle texture", "Bezel: Hexagonal steel bezel screws", "Strap: Tapered integrated luxury steel bracelet"],
  },
  {
    id: "p3",
    name: "Nautilus Blue Dial Mastercopy",
    price: 5999.0,
    category: "Luxury Automatic",
    description: "Elegant rounded octagonal blue dial mastercopy with dynamic embossed horizontal grooves. Finished with scratch-resistant sapphire crystal.",
    specs: ["Movement: Self-winding 324 SC custom sweep", "Dial: Ocean-blue horizontal gradient", "Glass: Multi-coated Sapphire crystal", "Case: Slim 40mm profile comfort wear"],
  },
  {
    id: "p4",
    name: "Submariner Date Ceramic Copy",
    price: 4999.0,
    category: "Sports Diver",
    description: "Classic black-ceramic professional diving layout. Heavy Oyster bracelet with glide-lock clasp adjustability and bright-luminous markers.",
    specs: ["Movement: High-torque automatic with quick-set date", "Dial: Sub-zero deep black gloss", "Bezel: Uni-directional 120-click rotatable ceramic", "Crown: Screw-down triple-lock waterproof simulation"],
  },
  {
    id: "p5",
    name: "Seamaster 300M Master Plan",
    price: 4499.0,
    category: "Sports Diver",
    description: "Fierce ocean adventure watch with laser-engraved wave design dial, heavy steel skeleton hands, and ultra-comfortable curved black sports strap.",
    specs: ["Movement: Co-Axial winding high-precision mastercopy", "Dial: Ocean waves design deep pattern", "Bezel: Blue polished ceramic rotatable", "Strap: Solid raw high-density black rubber strap"],
  },
  {
    id: "p6",
    name: "Classic Roman Heritage Quartz",
    price: 2999.0,
    category: "Classic Dress",
    description: "Retro minimal display watch with vintage Roman numeral index, blued-steel sword hands, ivory white finish, and a textured genuine chocolate brown leather strap.",
    specs: ["Movement: Slim Japanese quartz dual-hand precision", "Dial: Roman numeral index ivory dial", "Hands: Classic midnight-blue custom steel hands", "Strap: Premium textured brown leather strap with buckle"],
  }
];

// Lazy Gemini AI Init
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (aiInstance) return aiInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  aiInstance = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  return aiInstance;
}

// System instruction setup for assistant response
const SYSTEM_PROMPT = `You are "Madurai Gadgets AI Guide", a highly polite, friendly, and expert shopping advisor for "Madurai Gadgets 58" - our premium mastercopy watches shop.

Our Catalog:
${PRODUCTS_INFO.map(p => `- ${p.name} (₹${p.price.toLocaleString("en-IN")}): ${p.description} Subcategory: ${p.category}`).join("\n")}

Personality & Directives:
1. Warmth & Tone: The user might call you "machan" (a friendly Tamil/Tanglish word for bro/mate) or "da". Reply back warmly! You can say things like "Vanakkam machan! Best mastercopy watches for you!" or "Sure bro, I can help you with that." Keep the Tamil-friendly retail vibe!
2. Be highly conversational, extremely polite, and concise.
3. Recommend our best-selling automatic models like "Royal Oak Automatic High Copy" or "Nautilus Blue Dial Mastercopy" for premium design, or "Cosmograph Daytona Mastercopy" for chronographs.
4. If they negotiate or ask for a discount, happily let them know they can use coupon "MACHAN" for a special 15% discount, or "WELCOME" for 10% discount during checkout.
5. Keep markdown clean: Use bolding and simple bullet points. Avoid giant heading tags so it fits beautifully in the small chat sidebar. Never stray from our 6 watch options.`;

// Memory cache setup for production scaling
interface ProductsCache {
  data: any;
  timestamp: number;
}
let memoryCache: ProductsCache | null = null;
const CACHE_TTL_MS = 60 * 1000; // Cache products for 60 seconds

// API routes
app.get("/api/products", (req, res) => {
  const page = req.query.page ? Number(req.query.page) : null;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const isPaginated = page !== null && limit !== null;

  // Serve from cache if unpaginated and cache is valid
  if (!isPaginated && memoryCache && (Date.now() - memoryCache.timestamp < CACHE_TTL_MS)) {
    return res.json(memoryCache.data);
  }

  if (db) {
    let sql = "SELECT id, name, price, description, image_url, category, stock, specs, gender, brand FROM products ORDER BY id DESC";
    let params: any[] = [];
    if (isPaginated) {
      const offset = (page! - 1) * limit!;
      sql += " LIMIT ? OFFSET ?";
      params.push(limit, offset);
    }

    db.query(sql, params, (err: any, productsList: any) => {
      if (err) {
        console.error("Error fetching from MySQL:", err);
        // Fallback to defaults
        const fallbackList = PRODUCTS_INFO.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          image_url: p.id === "p1" ? "daytona" : p.id === "p2" ? "royaloak" : p.id === "p3" ? "nautilus" : p.id === "p4" ? "submariner" : p.id === "p5" ? "seamaster" : "dresswatch",
          variations: p.id === "p1" ? [
            { color: "#FFFFFF", image: "daytona" },
            { color: "#1E1E1E", image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop" }
          ] : p.id === "p2" ? [
            { color: "#E5E7EB", image: "royaloak" },
            { color: "#D97706", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop" }
          ] : p.id === "p3" ? [
            { color: "#2563EB", image: "nautilus" },
            { color: "#F9FAFB", image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=600&auto=format&fit=crop" }
          ] : p.id === "p4" ? [
            { color: "#059669", image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600&auto=format&fit=crop" },
            { color: "#111827", image: "submariner" }
          ] : p.id === "p5" ? [
            { color: "#1E40AF", image: "seamaster" },
            { color: "#4B5563", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop" }
          ] : []
        }));
        return res.json(fallbackList);
      }
      
      db.query("SELECT * FROM product_variations", (errVar: any, variationsList: any) => {
        if (errVar) {
          console.error("Error fetching variations:", errVar);
          return res.json(productsList.map((p: any) => ({ ...p, variations: [] })));
        }
        
        // Group variations by product_id
        const variationsMap: Record<number, any[]> = {};
        variationsList.forEach((v: any) => {
          if (!variationsMap[v.product_id]) {
            variationsMap[v.product_id] = [];
          }
          variationsMap[v.product_id].push({
            color: v.color_code || v.color_name,
            image: v.image_url
          });
        });
        
        // Attach variations to products
        const productsWithVariations = productsList.map((p: any) => ({
          ...p,
          variations: variationsMap[p.id] || []
        }));

        // Cache the unpaginated full list to reduce database traffic
        if (!isPaginated) {
          memoryCache = {
            data: productsWithVariations,
            timestamp: Date.now()
          };
        }
        
        res.json(productsWithVariations);
      });
    });
  } else {
    // Return formatted PRODUCTS_INFO as fallback
    const fallbackList = PRODUCTS_INFO.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      image_url: p.id === "p1" ? "daytona" : p.id === "p2" ? "royaloak" : p.id === "p3" ? "nautilus" : p.id === "p4" ? "submariner" : p.id === "p5" ? "seamaster" : "dresswatch",
      variations: p.id === "p1" ? [
        { color: "#FFFFFF", image: "daytona" },
        { color: "#1E1E1E", image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop" }
      ] : p.id === "p2" ? [
        { color: "#E5E7EB", image: "royaloak" },
        { color: "#D97706", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop" }
      ] : p.id === "p3" ? [
        { color: "#2563EB", image: "nautilus" },
        { color: "#F9FAFB", image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=600&auto=format&fit=crop" }
      ] : p.id === "p4" ? [
        { color: "#059669", image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600&auto=format&fit=crop" }
      ] : []
    }));
    res.json(fallbackList);
  }
});

app.post("/api/products", (req, res) => {
  const { name, price, description, image_url, category, stock, specs, gender, brand, variations } = req.body;

  // Invalidate cache immediately on catalog write
  memoryCache = null;

  // Strict Input Validation
  if (!name || name.trim() === "" || !price || isNaN(Number(price)) || !image_url || image_url.trim() === "") {
    return res.status(400).json({ error: "Invalid input values: Name, numeric price, and image URL are required! ❌" });
  }

  if (!db) {
    return res.status(500).json({ error: "Database not connected" });
  }

  let formattedSpecs = "";
  if (specs) {
    if (Array.isArray(specs)) {
      formattedSpecs = specs.join("\n");
    } else if (typeof specs === "string") {
      formattedSpecs = specs;
    }
  }

  const sqlInsert = "INSERT INTO products (name, price, description, image_url, category, stock, specs, gender, brand) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sqlInsert, [name.trim(), Number(price), description || "", image_url.trim(), category || "Premier Watches", stock || 15, formattedSpecs, gender || "Unisex", brand || "Other"], (err: any, result: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Product save aagala macha" });
    }
    
    const productId = result.insertId;
    
    if (variations && Array.isArray(variations) && variations.length > 0) {
      const variationInserts = variations.map((v: any) => [
        productId,
        v.color_name || v.color || "Color Variation",
        v.color_code || v.color || "#000000",
        v.image_url || v.image || image_url
      ]);
      
      db.query("INSERT INTO product_variations (product_id, color_name, color_code, image_url) VALUES ?", [variationInserts], (errVar: any) => {
        if (errVar) {
          console.error("Error saving variations:", errVar);
        }
        res.status(201).json({ message: "Product and variations saved successfully!", productId });
      });
    } else {
      res.status(201).json({ message: "Product super-ah add aayiduchu!", productId });
    }
  });
});

// Update an existing product in MySQL database
app.put("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const { name, price, description, image_url, category, stock, specs, gender, brand } = req.body;

  // Invalidate cache immediately on catalog update
  memoryCache = null;

  // Strict Input Validation
  if (!name || name.trim() === "" || !price || isNaN(Number(price)) || !image_url || image_url.trim() === "") {
    return res.status(400).json({ error: "Invalid input values: Name, numeric price, and image URL are required! ❌" });
  }

  if (!db) {
    return res.status(500).json({ error: "Database not connected" });
  }

  let formattedSpecs = "";
  if (specs) {
    if (Array.isArray(specs)) {
      formattedSpecs = specs.join("\n");
    } else if (typeof specs === "string") {
      formattedSpecs = specs;
    }
  }

  const sqlUpdate = `
    UPDATE products 
    SET name = ?, price = ?, description = ?, image_url = ?, category = ?, stock = ?, specs = ?, gender = ?, brand = ?
    WHERE id = ?
  `;
  db.query(
    sqlUpdate, 
    [name.trim(), Number(price), description || "", image_url.trim(), category || "Premier Watches", stock || 15, formattedSpecs, gender || "Unisex", brand || "Other", productId], 
    (err: any, result: any) => {
      if (err) {
        console.error("Error updating product in MySQL:", err);
        return res.status(500).json({ error: "Product update failed in MySQL" });
      }
      res.json({ message: "Product updated successfully in MySQL!", productId });
    }
  );
});

// Delete a product from MySQL database
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;

  // Invalidate cache immediately on catalog delete
  memoryCache = null;

  if (!db) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const sqlDelete = "DELETE FROM products WHERE id = ?";
  db.query(sqlDelete, [productId], (err: any, result: any) => {
    if (err) {
      console.error("Error deleting product from MySQL:", err);
      return res.status(500).json({ error: "Product delete failed in MySQL" });
    }
    res.json({ message: "Product deleted successfully from MySQL!", productId });
  });
});

// ==========================================
// E-Commerce Backend Routes (Auth & Orders)
// ==========================================

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!db) return res.status(500).json({ error: "Database not connected" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err: any, result: any) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email already exists" });
        return res.status(500).json({ error: "Registration failed" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Auth: Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!db) return res.status(500).json({ error: "Database not connected" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err: any, results: any[]) => {
    if (err || !results || results.length === 0) return res.status(400).json({ error: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// Orders: Place Order
app.post("/api/orders", (req, res) => {
  const { user_id, items, total_amount, shipping_address } = req.body;
  if (!db) return res.status(500).json({ error: "Database not connected" });
  if (!items || items.length === 0) return res.status(400).json({ error: "Order must have items" });

  db.query(
    "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)",
    [user_id, total_amount, shipping_address || ""],
    (err: any, result: any) => {
      if (err) return res.status(500).json({ error: "Order creation failed" });
      
      const orderId = result.insertId;
      const orderItemsData = items.map((item: any) => [orderId, item.product_id, item.quantity, item.price]);
      
      db.query("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?", [orderItemsData], (errItems: any) => {
        if (errItems) return res.status(500).json({ error: "Failed to save order items" });
        res.status(201).json({ message: "Order placed successfully", orderId });
      });
    }
  );
});

// Orders: Get User Orders
app.get("/api/orders/:userId", (req, res) => {
  const { userId } = req.params;
  if (!db) return res.status(500).json({ error: "Database not connected" });

  db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId], (err: any, orders: any[]) => {
    if (err) return res.status(500).json({ error: "Failed to fetch orders" });
    res.json(orders);
  });
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages body format" });
  }

  try {
    const ai = getGeminiClient();

    // Map client messages to format expected by GoogleGenAI
    const formattedContents = messages.map((m: any) => {
      return {
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    const botResponseText = response.text || "I am here to guide you, bro. How else can I help today?";
    res.json({ reply: botResponseText });
  } catch (error: any) {
    console.error("Gemini Assistant Route Error:", error.message);

    // Dynamic smart fallback if API key is not yet set by the user in AI Studio UI
    const lastUserMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
    let fallbackReply = "Vanakkam machan! Welcome to Madurai Gadgets 58. How can I help you find your premium watch today?";

    if (lastUserMessage.includes("discount") || lastUserMessage.includes("coupon") || lastUserMessage.includes("offer") || lastUserMessage.includes("poguma") || lastUserMessage.includes("kammi")) {
      fallbackReply = "Aama machan! Use coupon code **MACHAN** to get 15% off on your watch order! Or use **WELCOME** for 10% off. Enter it during checkout.";
    } else if (lastUserMessage.includes("daytona") || lastUserMessage.includes("cosmograph") || lastUserMessage.includes("chrono")) {
      fallbackReply = "The **Cosmograph Daytona Mastercopy** goes for ₹5,499. It features high-precision Japanese quartz, sweeping seconds, and a premium 40mm Oystersteel bezel. Absolute stunner, bro!";
    } else if (lastUserMessage.includes("royal") || lastUserMessage.includes("oak") || lastUserMessage.includes("ap")) {
      fallbackReply = "Our **Royal Oak Automatic High Copy** (₹6,499) showcases the iconic octagonal steel bezel with signature screws and a textured dark waffle dial. Japanese self-winding sweep, pure class, machan!";
    } else if (lastUserMessage.includes("nautilus") || lastUserMessage.includes("blue dial") || lastUserMessage.includes("patek")) {
      fallbackReply = "The **Nautilus Blue Dial Mastercopy** is ₹5,999. Elegant rounded octagonal bezel with ocean-blue textured finish, multi-coated sapphire glass, and automatic custom-finish winding.";
    } else if (lastUserMessage.includes("submariner") || lastUserMessage.includes("rolex") || lastUserMessage.includes("ceramic")) {
      fallbackReply = "That's our hot **Submariner Date Ceramic Copy** (₹4,999). Deep ceramic rotatable bezel with date magnifier and heavy high-adjust Oyster bracelet. Looks authentic on your wrist!";
    } else if (lastUserMessage.includes("seamaster") || lastUserMessage.includes("omega") || lastUserMessage.includes("rubber")) {
      fallbackReply = "The **Seamaster 300M Master Plan** (₹4,499) features laser-engraved waves on the dial and a super durable black sports rubber strap. Perfect blend of tactical and style, bro!";
    } else if (lastUserMessage.includes("classic") || lastUserMessage.includes("roman") || lastUserMessage.includes("leather") || lastUserMessage.includes("dress")) {
      fallbackReply = "The **Classic Roman Heritage Quartz** is ₹2,999. Super sleek ivory-white dial with Roman numerals, blued hands, and a chocolate-brown genuine textured leather strap. Pure formal elegance.";
    } else if (lastUserMessage.includes("hi") || lastUserMessage.includes("hello") || lastUserMessage.includes("bro") || lastUserMessage.includes("machan") || lastUserMessage.includes("da")) {
      fallbackReply = "Vanakkam machan! Welcome to Madurai Gadgets 58. We have premium custom mastercopy wristwatches (Daytona, AP Royal Oak, Nautilus, Submariner, Seamaster, and Classic Leather). Which one caught your eye?";
    } else {
      fallbackReply = "Machan, I can definitely recommend the perfect wristwatch to level up your formal or casual style! We offer free delivery and instant order placement tracking. Let me know if you want detailed specifications for and comparison between any model!";
    }

    if (error.message === "GEMINI_API_KEY_NOT_CONFIGURED") {
      fallbackReply += "\n\n*(Note: To connect the live Gemini 3.5 API, please add your real API key in the 'Secrets' panel in the Google AI Studio UI. For now, I'm assisting you with our built-in rules!)*";
    }

    res.json({ reply: fallbackReply });
  }
});

app.post("/api/send-order-email", async (req, res) => {
  const { order } = req.body;

  if (!order) {
    return res.status(400).json({ success: false, message: "Order data is required, machan!" });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = Number(process.env.EMAIL_PORT) || 465;

  if (!emailUser || !emailPass || emailUser.trim() === "" || emailPass.trim() === "") {
    console.warn("EMAIL_USER or EMAIL_PASS environment variables not configured. Skipping email send.");
    return res.json({ 
      success: true, 
      message: "Order placed, but email was not sent because SMTP credentials are not configured in your .env file, machan." 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const itemsHtml = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; font-weight: bold; color: #1f2937;">${item.product.name}</td>
        <td style="padding: 12px; text-align: center; color: #4b5563;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #1f2937; font-family: monospace;">₹${item.product.price.toLocaleString("en-IN")}</td>
        <td style="padding: 12px; text-align: right; color: #1f2937; font-family: monospace; font-weight: bold;">₹${(item.product.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const discountHtml = order.discount > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a; font-weight: bold;">
        <span>Promo Discount:</span>
        <span>-₹${order.discount.toLocaleString("en-IN")}</span>
      </div>
    ` : "";

    const paymentDetailsHtml = order.paymentMethod === "upi" ? `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; margin-top: 20px;">
        <h4 style="margin-top: 0; color: #111827; font-family: sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">UPI Direct Payment Details</h4>
        <p style="margin: 4px 0; font-size: 13px; color: #4b5563;"><strong>Payment Method:</strong> UPI Direct Pay (to 9688616838)</p>
        <p style="margin: 4px 0; font-size: 13px; color: #4b5563;"><strong>UPI ID Transferred:</strong> dineshdev5227-2@okhdfcbank</p>
        <p style="margin: 4px 0; font-size: 13px; color: #4b5563;"><strong>UTR / Transaction Reference No:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; font-weight: bold;">${order.utr || "N/A"}</code></p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #b45309; font-style: italic;">👉 Your order will be approved for shipping as soon as we verify the UTR number with our HDFC bank account, machan!</p>
      </div>
    ` : `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; margin-top: 20px;">
        <h4 style="margin-top: 0; color: #15803d; font-family: sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">WhatsApp Order Registration</h4>
        <p style="margin: 4px 0; font-size: 13px; color: #166534;"><strong>Payment Status:</strong> Pending QR Scan Verification</p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #166534; font-style: italic;">👉 We will send you our official GPay/PhonePe QR code on your WhatsApp shortly to complete the transfer, machan!</p>
      </div>
    `;

    const emailHtml = `
      <div style="background-color: #ffffff; border-left: 16px solid #d97706; border-right: 1px solid #e5e7eb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; max-width: 600px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
        
        <!-- Header brand details -->
        <div style="background-color: #09090b; padding: 24px; color: #ffffff; margin-bottom: 25px; relative;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <h2 style="margin: 0; font-size: 20px; font-weight: 900; tracking-widest: 0.1em; color: #ffffff; text-transform: uppercase;">
                  MADURAI GADGETS <span style="color: #f59e0b;">58</span>
                </h2>
                <p style="margin: 5px 0 0 0; font-size: 9px; font-family: monospace; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.2em;">
                  OFFICIAL RETAIL WATCH PASS &amp; ORDER PERMIT
                </p>
                <p style="margin: 10px 0 0 0; font-size: 8px; color: #71717a; font-family: sans-serif; line-height: 1.4;">
                  Simmakkal Outlet &bull; Premium Replica Timepieces &bull; A+ Certified Grade-A
                </p>
              </td>
              <td style="text-align: right; vertical-align: top; font-family: monospace; width: 150px;">
                <span style="font-size: 10px; color: #f59e0b; font-weight: bold; display: block; text-transform: uppercase;">
                  ID: ${order.id}
                </span>
                <span style="font-size: 7px; color: #71717a; display: block; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.1em;">
                  SECURE BILLING TICKET
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Details Section -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5; margin-bottom: 25px;">
          <tr>
            <td style="width: 50%; padding-right: 15px; vertical-align: top;">
              <h4 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 0 0 10px 0; color: #a1a1aa; font-family: monospace; font-size: 9px; letter-spacing: 0.15em; font-weight: bold;">CUSTOMER DETAILS</h4>
              <div style="color: #4b5563;">
                <p style="margin: 3px 0;">Name: <strong style="color: #111827;">${order.shipping.fullName}</strong></p>
                <p style="margin: 3px 0;">Contact Phone: <strong style="color: #111827;">${order.shipping.phone}</strong></p>
                <p style="margin: 3px 0;">Contact Email: <strong style="color: #111827;">${order.shipping.email}</strong></p>
                <p style="margin: 3px 0;">Delivery Address: <strong style="color: #111827;">${order.shipping.address}, ${order.shipping.city} - ${order.shipping.zipCode}</strong></p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 15px; vertical-align: top;">
              <h4 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 0 0 10px 0; color: #a1a1aa; font-family: monospace; font-size: 9px; letter-spacing: 0.15em; font-weight: bold;">ORDER &amp; SHIPPING INFO</h4>
              <div style="color: #4b5563;">
                <p style="margin: 3px 0;">Outlet Location: <strong style="color: #d97706;">Simmakkal Showroom</strong></p>
                <p style="margin: 3px 0;">Purchase Date: <strong style="color: #111827;">${order.date.includes(" at ") ? order.date.split(" at ")[0] : order.date.split(",")[0]}</strong></p>
                <p style="margin: 3px 0;">Purchase Time: <strong style="color: #111827;">${order.date.includes(" at ") ? order.date.split(" at ")[1] : (order.date.split(",")[1] || "12:00 PM")}</strong></p>
                <p style="margin: 3px 0;">Fulfillment Status: <strong style="color: #111827;">${order.status} (Verified)</strong></p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Billing Table -->
        <h4 style="margin: 0 0 8px 0; color: #a1a1aa; font-family: monospace; font-size: 9px; letter-spacing: 0.15em; font-weight: bold;">BILLING DETAILS &amp; FEE COMPILATION</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #f3f4f6; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-family: monospace; font-size: 9px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">
              <th style="padding: 10px; text-align: left;">Charge Description</th>
              <th style="padding: 10px; text-align: right; width: 140px;">Pricing (INR)</th>
            </tr>
          </thead>
          <tbody style="color: #374151;">
            ${order.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px;">
                  <strong style="color: #111827; display: block;">${item.product.name} (x${item.quantity})</strong>
                  <span style="font-size: 9px; color: #9ca3af; font-family: monospace;">${item.product.category} &bull; Premium Quality Mastercopy</span>
                </td>
                <td style="padding: 10px; text-align: right; font-family: monospace; font-weight: bold; color: #111827;">
                  INR ${Math.round(item.product.price * item.quantity).toLocaleString("en-IN")}
                </td>
              </tr>
            `).join("")}
            <tr style="color: #6b7280; font-size: 11px; font-family: monospace;">
              <td style="padding: 6px 10px;">Subtotal (Excl. Tax)</td>
              <td style="padding: 6px 10px; text-align: right;">
                INR ${Math.round(order.total / 1.08 + (order.discount || 0)).toLocaleString("en-IN")}
              </td>
            </tr>
            ${order.discount > 0 ? `
              <tr style="color: #16a34a; font-size: 11px; font-family: monospace; font-weight: bold;">
                <td style="padding: 6px 10px;">Promo Discount</td>
                <td style="padding: 6px 10px; text-align: right;">-INR ${order.discount.toLocaleString("en-IN")}</td>
              </tr>
            ` : ""}
            <tr style="color: #6b7280; font-size: 11px; font-family: monospace;">
              <td style="padding: 6px 10px;">SGST &amp; CGST Surcharge (8%)</td>
              <td style="padding: 6px 10px; text-align: right;">
                INR ${Math.round(order.total - (order.total / 1.08)).toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total Paid block -->
        <div style="background-color: #d97706; color: #ffffff; padding: 14px; font-weight: bold; font-size: 12px; text-align: left; margin-bottom: 20px; overflow: auto;">
          <span style="float: left; font-family: sans-serif;">TOTAL PAID AMOUNT IN FULL</span>
          <span style="float: right; font-family: monospace; font-size: 14px;">INR ${Math.round(order.total).toLocaleString("en-IN")}</span>
        </div>

        <!-- Barcode & Stamp Row -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 20px; margin-bottom: 25px;">
          <tr>
            <td style="vertical-align: middle; padding-bottom: 15px;">
              <p style="margin: 0 0 5px 0; font-family: monospace; font-size: 8px; color: #a1a1aa; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">GATE-PASS SECURITY BARCODE</p>
              <svg width="220" height="35" style="fill: #111827;">
                <rect x="0" y="0" width="3" height="35" />
                <rect x="5" y="0" width="1" height="35" />
                <rect x="8" y="0" width="4" height="35" />
                <rect x="14" y="0" width="1" height="35" />
                <rect x="17" y="0" width="2" height="35" />
                <rect x="21" y="0" width="1" height="35" />
                <rect x="24" y="0" width="3" height="35" />
                <rect x="29" y="0" width="2" height="35" />
                <rect x="33" y="0" width="1" height="35" />
                <rect x="36" y="0" width="5" height="35" />
                <rect x="43" y="0" width="1" height="35" />
                <rect x="46" y="0" width="2" height="35" />
                <rect x="50" y="0" width="1" height="35" />
                <rect x="53" y="0" width="3" height="35" />
                <rect x="58" y="0" width="1" height="35" />
                <rect x="61" y="0" width="2" height="35" />
                <rect x="65" y="0" width="4" height="35" />
                <rect x="71" y="0" width="1" height="35" />
                <rect x="74" y="0" width="5" height="35" />
                <rect x="81" y="0" width="2" height="35" />
                <rect x="85" y="0" width="1" height="35" />
                <rect x="88" y="0" width="3" height="35" />
                <rect x="93" y="0" width="1" height="35" />
                <rect x="96" y="0" width="2" height="35" />
                <rect x="100" y="0" width="4" height="35" />
                <rect x="106" y="0" width="1" height="35" />
                <rect x="109" y="0" width="5" height="35" />
                <rect x="116" y="0" width="2" height="35" />
                <rect x="120" y="0" width="1" height="35" />
                <rect x="123" y="0" width="3" height="35" />
                <rect x="128" y="0" width="1" height="35" />
                <rect x="131" y="0" width="2" height="35" />
                <rect x="135" y="0" width="4" height="35" />
                <rect x="141" y="0" width="1" height="35" />
                <rect x="144" y="0" width="5" height="35" />
                <rect x="151" y="0" width="2" height="35" />
                <rect x="155" y="0" width="1" height="35" />
                <rect x="158" y="0" width="3" height="35" />
                <rect x="163" y="0" width="1" height="35" />
                <rect x="166" y="0" width="2" height="35" />
                <rect x="170" y="0" width="4" height="35" />
                <rect x="176" y="0" width="1" height="35" />
                <rect x="179" y="0" width="5" height="35" />
                <rect x="186" y="0" width="2" height="35" />
                <rect x="190" y="0" width="1" height="35" />
                <rect x="193" y="0" width="3" height="35" />
                <rect x="198" y="0" width="1" height="35" />
                <rect x="201" y="0" width="2" height="35" />
                <rect x="205" y="0" width="4" height="35" />
                <rect x="211" y="0" width="1" height="35" />
                <rect x="214" y="0" width="5" height="35" />
              </svg>
              <span style="font-size: 7px; font-family: monospace; color: #71717a; display: block; margin-top: 2px;">*${order.id}-VERIFIED*</span>
            </td>
            <td style="vertical-align: middle; text-align: right; width: 180px; padding-bottom: 15px;">
              ${order.paymentStatus === 'Paid' ? `
                <div style="border: 2px solid #10b981; background-color: #f0fdf4; padding: 10px; text-align: center; font-size: 11px;">
                  <strong style="color: #047857; display: block; letter-spacing: 0.05em; font-weight: bold; text-transform: uppercase;">RESERVED &amp; PAID</strong>
                  <span style="color: #059669; font-size: 6px; display: block; margin-top: 2px; font-weight: bold; letter-spacing: 0.05em;">VERIFIED VIA FIRESTORE</span>
                </div>
              ` : `
                <div style="border: 2px solid #ef4444; background-color: #fdf2f2; padding: 10px; text-align: center; font-size: 11px;">
                  <strong style="color: #b91c1c; display: block; letter-spacing: 0.05em; font-weight: bold; text-transform: uppercase;">UNPAID &amp; PENDING</strong>
                  <span style="color: #dc2626; font-size: 6px; display: block; margin-top: 2px; font-weight: bold; letter-spacing: 0.05em;">WAITING TO RECEIVE</span>
                </div>
              `}
            </td>
          </tr>
        </table>

        <!-- Store Regulations Code of Conduct -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; font-size: 10px; color: #6b7280; line-height: 1.5; margin-bottom: 25px;">
          <h5 style="margin: 0 0 6px 0; color: #374151; font-family: monospace; font-size: 10px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase;">STORE REGULATIONS &amp; TERMS OF CONDUCT</h5>
          <ol style="margin: 0; padding-left: 15px;">
            <li style="margin-bottom: 4px;">All products are Grade-A premium copy timepieces featuring Japanese sweeping quartz/automatic movements.</li>
            <li style="margin-bottom: 4px;">Secure delivery is complimentary. Registered order details are instantly synced to our tracking ledger.</li>
            <li style="margin-bottom: 4px;">For warranty claims or returns, customers must present this generated invoice ticket to our support channels.</li>
            <li style="margin-bottom: 4px;">Order status inquiries, cancellations or custom updates can be verified directly via our WhatsApp portal.</li>
          </ol>
        </div>

        <!-- Footer block -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 9px; color: #9ca3af; line-height: 1.6;">
          <p style="margin: 2px 0;">🏛️ <strong>Madurai Gadgets 58 Flagship Showroom:</strong> Vakkil New Street, Simmakkal, Madurai - TN 625001</p>
          <p style="margin: 2px 0;">📞 WhatsApp Support: +91 95859 69334 | Email: nandharx420@gmail.com</p>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Wear Peak, Master Your Style! ⌚🌟</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Madurai Gadgets 58" <${emailUser}>`,
      to: order.shipping.email,
      bcc: ["nandharx420@gmail.com", emailUser],
      subject: `[MG58] Order Placed Successfully - Invoice #${order.id}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Order placement receipt email sent successfully: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId, message: "Order placed & invoice email sent successfully, machan! 📬" });
  } catch (error: any) {
    console.error("Failed to send order placement email:", error);
    res.status(500).json({ success: false, error: error.message, message: "Order saved, but receipt email transfer failed." });
  }
});

// ==========================================
// Global Error Handler Middleware
// ==========================================
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Critical Server Error 🚨: ", err.stack);
    
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server, but we are still alive! 🔥",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Configure Vite middleware or production build output
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server middleware mode initiating...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production state: serving compiled static assets from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running at http://0.0.0.0:${PORT} 🚀🛡️`);
  });
}

startServer();
