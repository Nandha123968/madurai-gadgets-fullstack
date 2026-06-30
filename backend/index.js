const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cloudinary = require('cloudinary').v2;
const { GoogleGenAI } = require('@google/genai');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Frontend-la irunthu vara JSON data-va padikka

// ==========================================
// 1. MySQL Database Connection (Pool)
// ==========================================
const db = mysql.createPool({
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

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection pool error ❌: ', err);
    } else {
        console.log('MySQL Database Connected Successfully via Pool! 🔥');
        connection.release();
        
        // Image-only schema query
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Check if old multi-column schema is present, if so migrate to clean schema
        db.query("SHOW COLUMNS FROM products LIKE 'name'", (err, rows) => {
            if (!err && rows && rows.length > 0) {
                console.log("Old multi-column MySQL schema detected. Dropping table to migrate to image-only schema...");
                db.query("DROP TABLE products", (dropErr) => {
                    db.query(createTableQuery, (createErr) => {
                        if (createErr) console.error('Table recreate failed ❌:', createErr);
                        else console.log('Products Table recreated successfully with image-only schema! 📦');
                    });
                });
            } else {
                db.query(createTableQuery, (createErr) => {
                    if (createErr) console.error('Table create failed ❌:', createErr);
                    else console.log('Products Table Ready with image-only schema! 📦');
                });
            }
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

// Route 1: Puthu Product-ah Add panna (POST - stores only image link)
app.post('/api/products', (req, res) => {
    const { image_url } = req.body;

    const sqlInsert = "INSERT INTO products (image_url) VALUES (?)";
    db.query(sqlInsert, [image_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Product image save failed in MySQL ❌" });
        }
        res.status(201).json({ message: "Product image link saved in MySQL! 📦", productId: result.insertId });
    });
});

// Route 2: Ellam Product image links-aiyum Edukka (GET)
app.get('/api/products', (req, res) => {
    const sqlSelect = "SELECT id, image_url FROM products";
    db.query(sqlSelect, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Could not fetch product image links from MySQL" });
        }
        res.status(200).json(results);
    });
});

// Route 3: Product details edit update (PUT - updates image in MySQL)
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { image_url } = req.body;

    const sqlUpdate = "UPDATE products SET image_url = ? WHERE id = ?";
    db.query(sqlUpdate, [image_url, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Could not update product image in MySQL ❌" });
        }
        res.status(200).json({ message: "Product image updated in MySQL! ✅" });
    });
});

// Route 4: Product deletion (DELETE - removes image row from MySQL)
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    const sqlDelete = "DELETE FROM products WHERE id = ?";
    db.query(sqlDelete, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Could not delete product image from MySQL ❌" });
        }
        res.status(200).json({ message: "Product image deleted from MySQL! 🗑️" });
    });
});

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
let aiInstance = null;

function getGeminiClient() {
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

const SYSTEM_PROMPT = `You are "Madurai Gadgets AI Guide", a highly polite, friendly, and expert shopping advisor for "Madurai Gadgets 58" - our premium mastercopy watches shop.

Our Catalog:
${PRODUCTS_INFO.map(p => `- ${p.name} (₹${p.price.toLocaleString("en-IN")}): ${p.description} Subcategory: ${p.category}`).join("\n")}

Personality & Directives:
1. Warmth & Tone: The user might call you "machan" (a friendly Tamil/Tanglish word for bro/mate) or "da". Reply back warmly! You can say things like "Vanakkam machan! Best mastercopy watches for you!" or "Sure bro, I can help you with that." Keep the Tamil-friendly retail vibe!
2. Be highly conversational, extremely polite, and concise.
3. Recommend our best-selling automatic models like "Royal Oak Automatic High Copy" or "Nautilus Blue Dial Mastercopy" for premium design, or "Cosmograph Daytona Mastercopy" for chronographs.
4. If they negotiate or ask for a discount, happily let them know they can use coupon "MACHAN" for a special 15% discount, or "WELCOME" for 10% discount during checkout.
5. Keep markdown clean: Use bolding and simple bullet points. Avoid giant heading tags so it fits beautifully in the small chat sidebar. Never stray from our 6 watch options.`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages body format" });
  }

  try {
    const ai = getGeminiClient();

    const formattedContents = messages.map((m) => {
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
  } catch (error) {
    console.error("Gemini Assistant Route Error:", error.message);

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
      fallbackReply += "\n\n*(Note: To connect the live Gemini 3.5 API, please add your real API key in your server environment variables. For now, I'm assisting you with our built-in rules!)*";
    }

    res.json({ reply: fallbackReply });
  }
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