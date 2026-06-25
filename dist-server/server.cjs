var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_mysql2 = __toESM(require("mysql2"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_cors = __toESM(require("cors"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "madurai_gadgets_super_secret";
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json());
var db = null;
if (process.env.DB_HOST) {
  try {
    db = import_mysql2.default.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      ssl: { rejectUnauthorized: false }
    });
    db.connect((err) => {
      if (err) {
        console.error("MySQL Database connection error \u274C: ", err);
        db = null;
      } else {
        console.log("MySQL Database Connected Successfully! \u{1F525}");
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
        db.query(createTableQuery, (err2, result) => {
          if (err2) {
            console.error("Table create aagala \u274C:", err2);
          } else {
            console.log("Products Table Ready aagiduchu! \u{1F4E6}");
            const columnsToCheck = [
              { name: "category", query: "ALTER TABLE products ADD COLUMN category VARCHAR(255) DEFAULT 'Premier Watches'" },
              { name: "stock", query: "ALTER TABLE products ADD COLUMN stock INT DEFAULT 15" },
              { name: "specs", query: "ALTER TABLE products ADD COLUMN specs TEXT NULL" },
              { name: "gender", query: "ALTER TABLE products ADD COLUMN gender VARCHAR(50) DEFAULT 'Unisex'" },
              { name: "brand", query: "ALTER TABLE products ADD COLUMN brand VARCHAR(255) DEFAULT 'Other'" }
            ];
            columnsToCheck.forEach((col) => {
              db.query(`SHOW COLUMNS FROM products LIKE ?`, [col.name], (errCol, rows) => {
                if (!errCol && rows && rows.length === 0) {
                  db.query(col.query, (errAlter) => {
                    if (errAlter) {
                      console.error(`Error adding column ${col.name}:`, errAlter);
                    } else {
                      console.log(`Column ${col.name} added successfully to products table!`);
                    }
                  });
                }
              });
            });
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
            db.query(createVariationsQuery, (errVarTable) => {
              if (errVarTable) {
                console.error("Variations table create aagala \u274C:", errVarTable);
              } else {
                console.log("Product Variations Table Ready aagiduchu! \u{1F3A8}");
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
                db.query(createUsersQuery, (err3) => {
                  if (err3) console.error("Users table create aagala \u274C:", err3);
                  else console.log("Users Table Ready! \u{1F465}");
                });
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
                db.query(createOrdersQuery, (err3) => {
                  if (err3) console.error("Orders table create aagala \u274C:", err3);
                  else console.log("Orders Table Ready! \u{1F6CD}\uFE0F");
                });
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
                db.query(createOrderItemsQuery, (err3) => {
                  if (err3) console.error("Order items table create aagala \u274C:", err3);
                  else console.log("Order Items Table Ready! \u{1F4E6}");
                });
                const dummyNames = [
                  "Cosmograph Daytona Mastercopy",
                  "Royal Oak Automatic High Copy",
                  "Nautilus Blue Dial Mastercopy",
                  "Submariner Date Ceramic Copy",
                  "Seamaster 300M Master Plan",
                  "Classic Roman Heritage Quartz",
                  "sunglasses test",
                  "OMEGA SEAMASTER AQUA TERRA"
                ];
                db.query("DELETE FROM products WHERE name IN (?)", [dummyNames], (errDel) => {
                  if (errDel) {
                    console.error("Error cleaning dummy/test products:", errDel);
                  } else {
                    console.log("Dummy/test products cleaned successfully! \u{1F9FC}");
                    const deleteJacobQuery = `
                      DELETE FROM products 
                      WHERE LOWER(name) LIKE '%jacob%' 
                         OR LOWER(name) LIKE '%jacon%' 
                         OR LOWER(brand) LIKE '%jacob%' 
                         OR LOWER(brand) LIKE '%jacon%'
                         OR LOWER(category) LIKE '%jacob%'
                         OR LOWER(category) LIKE '%jacon%'
                    `;
                    db.query(deleteJacobQuery, (errJacob, resJacob) => {
                      if (errJacob) {
                        console.error("Failed to delete Jacob products:", errJacob);
                      } else if (resJacob) {
                        console.log(`Deleted ${resJacob.affectedRows} Jacob/Jacon products from DB! \u{1F9FC}`);
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
  } catch (e) {
    console.error("Failed to initialize MySQL Connection", e);
    db = null;
  }
} else {
  console.log("No MySQL connection environment variables found. Using default products.");
}
var PRODUCTS_INFO = [
  {
    id: "p1",
    name: "Cosmograph Daytona Mastercopy",
    price: 5499,
    category: "Chronograph",
    description: "Precision Quartz Chronograph featuring a stunning white dial, black sub-dials, scratchproof black Cerachrom bezel, and 40mm Oystersteel premium build.",
    specs: ["Movement: Precision Japanese Quartz with sweeping seconds", "Dial: Pristine White & Deep Black Chrono Rings", "Diameter: 40mm Oystersteel case", "Bezel: Black scratchproof tachymeter scale"]
  },
  {
    id: "p2",
    name: "Royal Oak Automatic High Copy",
    price: 6499,
    category: "Luxury Automatic",
    description: "Iconic octagonal luxury timepiece with signature steel screws, textured Grande Tapisserie dark-slate dial, and fully automatic custom self-winding sweep.",
    specs: ["Movement: Calibre 3120 Premium Japanese Automatic sweep", "Dial: Dark-slate waffle texture", "Bezel: Hexagonal steel bezel screws", "Strap: Tapered integrated luxury steel bracelet"]
  },
  {
    id: "p3",
    name: "Nautilus Blue Dial Mastercopy",
    price: 5999,
    category: "Luxury Automatic",
    description: "Elegant rounded octagonal blue dial mastercopy with dynamic embossed horizontal grooves. Finished with scratch-resistant sapphire crystal.",
    specs: ["Movement: Self-winding 324 SC custom sweep", "Dial: Ocean-blue horizontal gradient", "Glass: Multi-coated Sapphire crystal", "Case: Slim 40mm profile comfort wear"]
  },
  {
    id: "p4",
    name: "Submariner Date Ceramic Copy",
    price: 4999,
    category: "Sports Diver",
    description: "Classic black-ceramic professional diving layout. Heavy Oyster bracelet with glide-lock clasp adjustability and bright-luminous markers.",
    specs: ["Movement: High-torque automatic with quick-set date", "Dial: Sub-zero deep black gloss", "Bezel: Uni-directional 120-click rotatable ceramic", "Crown: Screw-down triple-lock waterproof simulation"]
  },
  {
    id: "p5",
    name: "Seamaster 300M Master Plan",
    price: 4499,
    category: "Sports Diver",
    description: "Fierce ocean adventure watch with laser-engraved wave design dial, heavy steel skeleton hands, and ultra-comfortable curved black sports strap.",
    specs: ["Movement: Co-Axial winding high-precision mastercopy", "Dial: Ocean waves design deep pattern", "Bezel: Blue polished ceramic rotatable", "Strap: Solid raw high-density black rubber strap"]
  },
  {
    id: "p6",
    name: "Classic Roman Heritage Quartz",
    price: 2999,
    category: "Classic Dress",
    description: "Retro minimal display watch with vintage Roman numeral index, blued-steel sword hands, ivory white finish, and a textured genuine chocolate brown leather strap.",
    specs: ["Movement: Slim Japanese quartz dual-hand precision", "Dial: Roman numeral index ivory dial", "Hands: Classic midnight-blue custom steel hands", "Strap: Premium textured brown leather strap with buckle"]
  }
];
var aiInstance = null;
function getGeminiClient() {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }
  aiInstance = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  return aiInstance;
}
var SYSTEM_PROMPT = `You are "Madurai Gadgets AI Guide", a highly polite, friendly, and expert shopping advisor for "Madurai Gadgets 58" - our premium mastercopy watches shop.

Our Catalog:
${PRODUCTS_INFO.map((p) => `- ${p.name} (\u20B9${p.price.toLocaleString("en-IN")}): ${p.description} Subcategory: ${p.category}`).join("\n")}

Personality & Directives:
1. Warmth & Tone: The user might call you "machan" (a friendly Tamil/Tanglish word for bro/mate) or "da". Reply back warmly! You can say things like "Vanakkam machan! Best mastercopy watches for you!" or "Sure bro, I can help you with that." Keep the Tamil-friendly retail vibe!
2. Be highly conversational, extremely polite, and concise.
3. Recommend our best-selling automatic models like "Royal Oak Automatic High Copy" or "Nautilus Blue Dial Mastercopy" for premium design, or "Cosmograph Daytona Mastercopy" for chronographs.
4. If they negotiate or ask for a discount, happily let them know they can use coupon "MACHAN" for a special 15% discount, or "WELCOME" for 10% discount during checkout.
5. Keep markdown clean: Use bolding and simple bullet points. Avoid giant heading tags so it fits beautifully in the small chat sidebar. Never stray from our 6 watch options.`;
app.get("/api/products", (req, res) => {
  if (db) {
    db.query("SELECT * FROM products ORDER BY id DESC", (err, productsList) => {
      if (err) {
        console.error("Error fetching from MySQL:", err);
        const fallbackList = PRODUCTS_INFO.map((p) => ({
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
      db.query("SELECT * FROM product_variations", (errVar, variationsList) => {
        if (errVar) {
          console.error("Error fetching variations:", errVar);
          return res.json(productsList.map((p) => ({ ...p, variations: [] })));
        }
        const variationsMap = {};
        variationsList.forEach((v) => {
          if (!variationsMap[v.product_id]) {
            variationsMap[v.product_id] = [];
          }
          variationsMap[v.product_id].push({
            color: v.color_code || v.color_name,
            image: v.image_url
          });
        });
        const productsWithVariations = productsList.map((p) => ({
          ...p,
          variations: variationsMap[p.id] || []
        }));
        res.json(productsWithVariations);
      });
    });
  } else {
    const fallbackList = PRODUCTS_INFO.map((p) => ({
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
    res.json(fallbackList);
  }
});
app.post("/api/products", (req, res) => {
  const { name, price, description, image_url, category, stock, specs, gender, brand, variations } = req.body;
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
  db.query(sqlInsert, [name, price, description, image_url, category || "Premier Watches", stock || 15, formattedSpecs, gender || "Unisex", brand || "Other"], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Product save aagala macha" });
    }
    const productId = result.insertId;
    if (variations && Array.isArray(variations) && variations.length > 0) {
      const variationInserts = variations.map((v) => [
        productId,
        v.color_name || v.color || "Color Variation",
        v.color_code || v.color || "#000000",
        v.image_url || v.image || image_url
      ]);
      db.query("INSERT INTO product_variations (product_id, color_name, color_code, image_url) VALUES ?", [variationInserts], (errVar) => {
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
app.put("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const { name, price, description, image_url, category, stock, specs, gender, brand } = req.body;
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
    [name, price, description, image_url, category || "Premier Watches", stock || 15, formattedSpecs, gender || "Unisex", brand || "Other", productId],
    (err, result) => {
      if (err) {
        console.error("Error updating product in MySQL:", err);
        return res.status(500).json({ error: "Product update failed in MySQL" });
      }
      res.json({ message: "Product updated successfully in MySQL!", productId });
    }
  );
});
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  if (!db) {
    return res.status(500).json({ error: "Database not connected" });
  }
  const sqlDelete = "DELETE FROM products WHERE id = ?";
  db.query(sqlDelete, [productId], (err, result) => {
    if (err) {
      console.error("Error deleting product from MySQL:", err);
      return res.status(500).json({ error: "Product delete failed in MySQL" });
    }
    res.json({ message: "Product deleted successfully from MySQL!", productId });
  });
});
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!db) return res.status(500).json({ error: "Database not connected" });
  try {
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Email already exists" });
        return res.status(500).json({ error: "Registration failed" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!db) return res.status(500).json({ error: "Database not connected" });
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || !results || results.length === 0) return res.status(400).json({ error: "Invalid email or password" });
    const user = results[0];
    const isMatch = await import_bcryptjs.default.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });
    const token = import_jsonwebtoken.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});
app.post("/api/orders", (req, res) => {
  const { user_id, items, total_amount, shipping_address } = req.body;
  if (!db) return res.status(500).json({ error: "Database not connected" });
  if (!items || items.length === 0) return res.status(400).json({ error: "Order must have items" });
  db.query(
    "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)",
    [user_id, total_amount, shipping_address || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Order creation failed" });
      const orderId = result.insertId;
      const orderItemsData = items.map((item) => [orderId, item.product_id, item.quantity, item.price]);
      db.query("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?", [orderItemsData], (errItems) => {
        if (errItems) return res.status(500).json({ error: "Failed to save order items" });
        res.status(201).json({ message: "Order placed successfully", orderId });
      });
    }
  );
});
app.get("/api/orders/:userId", (req, res) => {
  const { userId } = req.params;
  if (!db) return res.status(500).json({ error: "Database not connected" });
  db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, orders) => {
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
    const formattedContents = messages.map((m) => {
      return {
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      };
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8
      }
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
      fallbackReply = "The **Cosmograph Daytona Mastercopy** goes for \u20B95,499. It features high-precision Japanese quartz, sweeping seconds, and a premium 40mm Oystersteel bezel. Absolute stunner, bro!";
    } else if (lastUserMessage.includes("royal") || lastUserMessage.includes("oak") || lastUserMessage.includes("ap")) {
      fallbackReply = "Our **Royal Oak Automatic High Copy** (\u20B96,499) showcases the iconic octagonal steel bezel with signature screws and a textured dark waffle dial. Japanese self-winding sweep, pure class, machan!";
    } else if (lastUserMessage.includes("nautilus") || lastUserMessage.includes("blue dial") || lastUserMessage.includes("patek")) {
      fallbackReply = "The **Nautilus Blue Dial Mastercopy** is \u20B95,999. Elegant rounded octagonal bezel with ocean-blue textured finish, multi-coated sapphire glass, and automatic custom-finish winding.";
    } else if (lastUserMessage.includes("submariner") || lastUserMessage.includes("rolex") || lastUserMessage.includes("ceramic")) {
      fallbackReply = "That's our hot **Submariner Date Ceramic Copy** (\u20B94,999). Deep ceramic rotatable bezel with date magnifier and heavy high-adjust Oyster bracelet. Looks authentic on your wrist!";
    } else if (lastUserMessage.includes("seamaster") || lastUserMessage.includes("omega") || lastUserMessage.includes("rubber")) {
      fallbackReply = "The **Seamaster 300M Master Plan** (\u20B94,499) features laser-engraved waves on the dial and a super durable black sports rubber strap. Perfect blend of tactical and style, bro!";
    } else if (lastUserMessage.includes("classic") || lastUserMessage.includes("roman") || lastUserMessage.includes("leather") || lastUserMessage.includes("dress")) {
      fallbackReply = "The **Classic Roman Heritage Quartz** is \u20B92,999. Super sleek ivory-white dial with Roman numerals, blued hands, and a chocolate-brown genuine textured leather strap. Pure formal elegance.";
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
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server middleware mode initiating...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production state: serving compiled static assets from dist/...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
