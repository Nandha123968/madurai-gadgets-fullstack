import { Product } from "../types";

// Dynamic procedural generation of premium Indian replica/mastercopy watches with realistic descriptions and specs.
const BASE_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Cosmograph Daytona Mastercopy (Men's)",
    price: 5499.0,
    rating: 4.8,
    reviewsCount: 124,
    category: "Premier Watches",
    description: "Precision Quartz Chronograph featuring a stunning white dial, black sub-dials, scratchproof black Cerachrom bezel, and 40mm Oystersteel premium build.",
    specs: [
      "Movement: Precision Japanese Quartz with sweeping seconds",
      "Dial: Pristine White & Deep Black Chrono Rings",
      "Diameter: 40mm Oystersteel robust build",
      "Bezel: Black scratchproof ceramic tachymeter scale"
    ],
    image: "daytona",
    stock: 8,
    gender: "Men"
  },
  {
    id: "p2",
    name: "Royal Oak Automatic High Copy (Men's)",
    price: 6499.0,
    rating: 4.9,
    reviewsCount: 88,
    category: "Premier Watches",
    description: "Iconic octagonal luxury timepiece with signature steel screws, textured Grande Tapisserie dark-slate dial, and fully automatic custom self-winding steel sweep.",
    specs: [
      "Movement: Calibre 3120 Premium Japanese Automatic sweep",
      "Dial: Dark-slate waffle texture design",
      "Bezel: Hexagonal steel bezel bolts",
      "Strap: Tapered integrated luxury steel bracelet layout"
    ],
    image: "royaloak",
    stock: 5,
    gender: "Men"
  },
  {
    id: "p3",
    name: "Nautilus Blue Dial Mastercopy (Men's)",
    price: 5999.0,
    rating: 4.7,
    reviewsCount: 215,
    category: "Premier Watches",
    description: "Elegant rounded octagonal blue dial mastercopy with dynamic embossed horizontal grooves. Finished with scratch-resistant premium sapphire crystal.",
    specs: [
      "Movement: Self-winding 324 SC custom sweep",
      "Dial: Ocean-blue horizontal gradient finish",
      "Glass: Multi-coated Sapphire crystal",
      "Case: Slim 40mm profile comfort wear layout"
    ],
    image: "nautilus",
    stock: 6,
    gender: "Men"
  },
  {
    id: "p4",
    name: "Submariner Date Ceramic Copy (Men's)",
    price: 4999.0,
    rating: 4.6,
    reviewsCount: 64,
    category: "Premier Watches",
    description: "Classic black-ceramic professional diving layout. Heavy Oyster steel bracelet with glide-lock clasp adjustability and bright-luminous midnight dials.",
    specs: [
      "Movement: High-torque automatic with quick-set date window",
      "Dial: Sub-zero deep black gloss layout",
      "Bezel: Uni-directional 120-click rotatable ceramic ring",
      "Crown: Screw-down triple-lock waterproof simulation"
    ],
    image: "submariner",
    stock: 12,
    gender: "Men"
  },
  {
    id: "p5",
    name: "Seamaster 300M Master Plan (Men's)",
    price: 4499.0,
    rating: 4.8,
    reviewsCount: 93,
    category: "Premier Watches",
    description: "Fierce ocean adventure watch with laser-engraved wave design dial, heavy steel skeleton hands, and ultra-comfortable curved black sports strap.",
    specs: [
      "Movement: Co-Axial winding high-precision mastercopy engine",
      "Dial: Ocean waves design deep horizontal layout",
      "Bezel: Blue polished ceramic rotatable outer dial",
      "Strap: Solid raw high-density black rubber strap with buckle"
    ],
    image: "seamaster",
    stock: 10,
    gender: "Men"
  },
  {
    id: "p6",
    name: "Classic Roman Heritage Quartz (Unisex)",
    price: 2999.0,
    rating: 4.5,
    reviewsCount: 72,
    category: "Japanese Model Watches",
    description: "Retro minimal display watch with vintage Roman numeral index, blued-steel sword hands, ivory white finish, and a textured genuine chocolate brown leather strap.",
    specs: [
      "Movement: Slim Japanese quartz dual-hand precision",
      "Dial: Roman numeral index ivory dial face",
      "Hands: Classic midnight-blue custom steel hands",
      "Strap: Premium textured brown leather strap with buckle"
    ],
    image: "dresswatch",
    stock: 15,
    gender: "Unisex"
  },
  {
    id: "p7",
    name: "JBL Charge 5 Premium Copy",
    price: 3499.0,
    rating: 4.8,
    reviewsCount: 154,
    category: "Bluetooth Speakers",
    description: "Incredible replica of the premium portable Bluetooth speaker. Delivers deep bass, crisp highs, and dual passive radiators. Fully shockproof wrap.",
    specs: [
      "Driver: 52mm x 90mm dome-woofer with twin passive radiator vents",
      "Power: Solid 40W heavy acoustic amplification layout",
      "Battery: Up to 12 Hrs playback replication on a single charge",
      "Features: Built-in powerbank support to charge accessories"
    ],
    image: "speaker",
    stock: 20
  },
  {
    id: "p8",
    name: "Marshall Emberton II High Copy",
    price: 4999.0,
    rating: 4.9,
    reviewsCount: 112,
    category: "Bluetooth Speakers",
    description: "Vintage retro styling meets modern heavy sound copy. Compact, multi-directional audio, textured vinyl shell with solid brass control knob.",
    specs: [
      "Acoustics: Absolute 360-degree True Stereophonic sound signature",
      "Cabinet: Premium vulcanized retro vinyl chassis texture",
      "Controls: Dynamic multi-directional heavy gold control knob",
      "Battery: USB-C fast charging carrying dynamic capacity"
    ],
    image: "speaker",
    stock: 14
  },
  {
    id: "p9",
    name: "Ray-Ban Aviator Classic Copy",
    price: 1999.0,
    rating: 4.7,
    reviewsCount: 224,
    category: "Sunglasses",
    description: "Classic high-copy gold metal aviators with scratchproof dark-green G-15 glass lenses. Highly protective under heavy sunlight, machan!",
    specs: [
      "Glass: Dark-green G-15 protective crystal lens setup",
      "Frame: High-grade golden wire-frame with carbon plating",
      "Nosepads: Soft dynamic adjustable comfort gel pads",
      "Protection: Double-coated UV400 radiation shielding"
    ],
    image: "sunglass",
    stock: 25
  },
  {
    id: "p10",
    name: "Cartier C Décor Gold Sunglass Copy",
    price: 3299.0,
    rating: 4.9,
    reviewsCount: 95,
    category: "Sunglasses",
    description: "Ultra-premium rimless luxury copy sunglasses with signature Cartier gold double C temple hinge accenting. Truly editorial fashion, machan!",
    specs: [
      "Lenses: Gradient brown twilight protection tint",
      "Temple: Rimless gold-colored titanium frame wings",
      "Accenting: Double 'C' metal brandmark embellishment",
      "Includes: Red leather hard protection box cover"
    ],
    image: "sunglass",
    stock: 11
  },
  {
    id: "p11",
    name: "Heavyweight Boxy Tee (Black)",
    price: 999.0,
    rating: 4.6,
    reviewsCount: 180,
    category: "Fashion",
    description: "Premium oversized graphic-print heavy cotton street tee. Ultra durable thick collar ribbing, cozy drop-shoulder street fit.",
    specs: [
      "Material: 100% Cotton combed heavy 240GSM luxury fabric",
      "Fit: Oversized drop-shoulder block fitment",
      "Detailing: Clean minimalist typography chest microprint",
      "Style: Premium street aesthetics with durable stitch detailing"
    ],
    image: "tshirt",
    stock: 35
  },
  {
    id: "p12",
    name: "Oversized Vintage Anime Tee",
    price: 1199.0,
    rating: 4.8,
    reviewsCount: 210,
    category: "Fashion",
    description: "Epic heavy washed streetwear t-shirt with classic distressed vintage graphics. Soft premium breathability for summer fashion.",
    specs: [
      "Material: Premium vintage-washed 100% pre-shrunk soft cotton",
      "Aesthetics: Distressed high-definition retro streetwear graphic printing",
      "Sizing: Genderless relax fit suitable for all styles",
      "Wash: Machine wash friendly with crack-resistant ink coats"
    ],
    image: "tshirt",
    stock: 40
  }
];

// Helper to generate the unique watch, speaker, sunglasses & fashion deals
function generateExtendedCatalog(): Product[] {
  const catalog: Product[] = [...BASE_PRODUCTS];
  
  // 1. Generate Watches
  const watchBrands = [
    { name: "Rolex Daytona", category: "Premier Watches", baseModel: "daytona" },
    { name: "Audemars Piguet Royal Oak", category: "Premier Watches", baseModel: "royaloak" },
    { name: "Patek Philippe Nautilus", category: "Premier Watches", baseModel: "nautilus" },
    { name: "Rolex Submariner", category: "Premier Watches", baseModel: "submariner" },
    { name: "Omega Seamaster", category: "Premier Watches", baseModel: "seamaster" },
    { name: "Cartier Santos", category: "Premier Watches", baseModel: "dresswatch" },
    { name: "Hublot Classic Fusion", category: "Premier Watches", baseModel: "royaloak" },
    { name: "Franck Muller Vanguard", category: "Premier Watches", baseModel: "royaloak" },
    { name: "Richard Mille Tourbillon", category: "Premier Watches", baseModel: "royaloak" },
    { name: "Vacheron Constantin Overseas", category: "Premier Watches", baseModel: "nautilus" },
    { name: "Jaeger-LeCoultre Reverso", category: "Premier Watches", baseModel: "dresswatch" },
    { name: "Panerai Luminor Marina", category: "Premier Watches", baseModel: "submariner" },
    // Japanese/Standard Models
    { name: "Seiko Prospex Alpinist", category: "Japanese Model Watches", baseModel: "seamaster" },
    { name: "Casio Edifice Premium", category: "Japanese Model Watches", baseModel: "daytona" },
    { name: "Tissot PRX Powermatic", category: "Japanese Model Watches", baseModel: "dresswatch" },
    { name: "Tag Heuer Carrera", category: "Japanese Model Watches", baseModel: "daytona" },
    { name: "Breitling Navitimer", category: "Japanese Model Watches", baseModel: "daytona" },
    { name: "IWC Portugieser Chrono", category: "Japanese Model Watches", baseModel: "daytona" },
    { name: "Sevenfriday P-Series", category: "Japanese Model Watches", baseModel: "royaloak" },
    { name: "Rado Integral Ceramic", category: "Japanese Model Watches", baseModel: "dresswatch" }
  ];

  const watchSeriesModifiers = [
    "Stealth Carbon Special",
    "Panda White Limited Edition",
    "Rose Gold President Series",
    "Ocean Depth Wavemaker",
    "Steel-Skeleton Dual-Balance",
    "Cosmic Ice-Blue Dial Premium",
    "Vintage Toffee Leather Classic",
    "Glacier Diamond-Bolt Bezel",
    "Midnight Blue Sunburst Special",
    "Hunter Green Military Edition",
    "Full Matte Yellow Gold Copy",
    "Oreo Ceramic Tachymeter Edition",
    "Tiger-Eye Bronze Special Dial",
    "Silver Bullet Integrated Deluxe"
  ];

  const watchDetailModifiers = [
    {
      description: "Premium mastercopy featuring Japanese high-beat sweep seconds movement, crystal back window, and heavy Oystersteel finish details.",
      specs: ["Movement: Japanese sweep-second highbeat quartz caliber", "Dial: Multi-layered sunburst indices", "Bezel: Unidirectional 120-click rotatable outer ring", "Strap: Adjustable steel bracelet with twinlock foldover safety"]
    },
    {
      description: "A-Grade festival copies with luxury custom octagonal design, polished chamfers, waffle tapisserie pattern dials, and high-frequency self-winding flywheels.",
      specs: ["Movement: Customized 28800vph automatic winding simulator", "Glass: Triple AR-coated pristine sapphire crystal", "Crown: Hexagonal screw-locked layout", "Case: 41mm high-grade solid 316L steel profile"]
    },
    {
      description: "Limited edition custom build featuring Roman numeral markings, textured vintage alligator strap, luxury folding butterfly buckle, and sleek dress watch aesthetics.",
      specs: ["Movement: Caliber-grade ultra slim precision quartz", "Dial: Satin sunburst dial with sword-shaped steel hands", "Diameter: 39mm comfortable lightweight build", "Strap: Alligator grain genuine calfskin brown strap"]
    },
    {
      description: "Heavy-duty diver's simulation model with laser-textured wave patterns, ultra-bright glow green nightmarkers, high-density rubber sporty straps, and quickset calendars.",
      specs: ["Movement: Self-winding sweeping automatic custom gear", "Illumination: Super-LumiNova green glowing hand dials", "Bezel: Polished scratch-resistant ceramic ring profile", "Strap: Soft anti-dust black rubber buckle band"]
    }
  ];

  for (let i = 1; i <= 200; i++) {
    const brand = watchBrands[(i * 3) % watchBrands.length];
    const modifier = watchSeriesModifiers[(i * 7) % watchSeriesModifiers.length];
    const details = watchDetailModifiers[(i * 13) % watchDetailModifiers.length];
    
    const priceMultiplier = 2400 + ((i * 179) % 7500);
    const price = Math.round(priceMultiplier);
    const rating = Math.round((4.2 + ((i * 3) % 9) / 10) * 10) / 10;
    const reviewsCount = 12 + ((i * 19) % 400);
    const stock = 2 + ((i * 7) % 25);
    const watchGender = (i % 3 === 0) ? "Women" : "Men";

    catalog.push({
      id: `p-watch-dyn-${i}`,
      name: `${brand.name} ${modifier} (${watchGender === "Men" ? "Men's" : "Women's"})`,
      price: price,
      rating: rating,
      reviewsCount: reviewsCount,
      category: brand.category,
      description: `${details.description} Perfect replica crafted at scale. Model: ${brand.name} with ${modifier} theme. Includes Madurai Gadgets 1-Year replacement support guarantee.`,
      specs: [
        ...details.specs.slice(0, 3),
        `Serial Code: M-G58/W${2000 + i}`,
        `Support Service: Free video-call inspection available`
      ],
      image: brand.baseModel,
      stock: stock,
      gender: watchGender
    });
  }

  // 2. Generate Bluetooth Speakers (exactly 50 items)
  const speakerBrands = ["JBL Pulse", "Marshall Emberton", "JBL Charge", "Marshall Stanmore", "Bose SoundLink", "Sony SRS-XB", "Harman Kardon Onyx", "Boat Stone", "JBL Xtreme", "Marshall Kilburn"];
  const speakerModifiers = ["V4 Pro Waterproof Copy", "Signature Gold Edition", "Retro Vinyl Companion", "UltraBass Party Link", "Matte Sandstone Edition", "Rugged Outdoor Companion", "Steel Mesh Special", "Stealth Tactical Edition", "Dual-Radiator Loudspeaker", "Midnight Matte Finish"];
  
  for (let i = 1; i <= 50; i++) {
    const brand = speakerBrands[(i * 5) % speakerBrands.length];
    const modifier = speakerModifiers[(i * 11) % speakerModifiers.length];
    
    const price = 1999 + ((i * 137) % 6000);
    const rating = Math.round((4.3 + ((i * 2) % 8) / 10) * 10) / 10;
    const reviewsCount = 10 + ((i * 13) % 250);
    const stock = 20;

    catalog.push({
      id: `p-speaker-dyn-${i}`,
      name: `${brand} ${modifier} (High Copy)`,
      price: price,
      rating: rating,
      reviewsCount: reviewsCount,
      category: "Bluetooth Speakers",
      description: `Premium high-copy ${brand} portable Bluetooth speaker with ${modifier} style. Delivers rich passive radiator bass, crisp stereophonic sound, and incredible design similarity.`,
      specs: [
        "Acoustics: High-fidelity stereo drivers with passive bass thump",
        "Battery: Twin battery cell with up to 10-12 hours runtime replica",
        "Waterproofing: IPX7 splash-resistant sealed silicone casing",
        `Serial Code: M-G58/S${3000 + i}`,
        "Includes: Premium protective solid retail box"
      ],
      image: "speaker",
      stock: stock
    });
  }

  // 3. Generate Sunglasses (exactly 50 items)
  const glassBrands = ["Ray-Ban Aviator", "Ray-Ban Wayfarer", "Cartier C Décor", "Prada Runway Rimless", "Oakley Holbrook Sport", "Gucci Oversized Shield", "Chrome Hearts Dagger", "Prada Linea Rossa", "Gentle Monster Solo", "Louis Vuitton Millionaire"];
  const glassModifiers = ["Classic Polarized Glass", "Rimless Gold Titanium Frame", "Vintage Tortoiseshell Acetate", "Satin Black Metal Shield", "Gradient Ocean Blue Tint", "Silver Screw Emblem Special", "Gloss Cheetah Pattern Copy", "Dual-Tone Contrast Sports", "Midnight Anti-Glare Coating", "Ultra Lightweight Luxury Wing"];

  for (let i = 1; i <= 50; i++) {
    const brand = glassBrands[(i * 7) % glassBrands.length];
    const modifier = glassModifiers[(i * 13) % glassModifiers.length];
    
    const price = 1299 + ((i * 97) % 4000);
    const rating = Math.round((4.4 + ((i * 1) % 7) / 10) * 10) / 10;
    const reviewsCount = 15 + ((i * 11) % 300);
    const stock = 25;

    catalog.push({
      id: `p-sunglass-dyn-${i}`,
      name: `${brand} ${modifier} Copy`,
      price: price,
      rating: rating,
      reviewsCount: reviewsCount,
      category: "Sunglasses",
      description: `Classic premium quality high-copy sunglasses featuring high-rigidity frames, scratchproof polarized dynamic protection lenses, and polished luxury branding details.`,
      specs: [
        "Lenses: Curved scratchproof composite glass with UV400 filtration",
        "Frame: Ultra-light composite alloy with double-coated lacquer",
        "Hinges: Reinforced steel joints with comfort spring tensioners",
        `Serial Code: M-G58/G${4000 + i}`,
        "Includes: Padded brand case with microfibre lens wipe"
      ],
      image: "sunglass",
      stock: stock
    });
  }

  // 4. Generate Fashion (exactly 50 items)
  const shirtBrands = ["Travis Scott Cactus Jack", "Supreme Classic Box Logo", "Stussy International Tour", "Fear of God Essentials", "Balenciaga Speedhunters", "Represent Owners Club", "Off-White Caravaggio", "Rhude Rhegency", "Gallery Dept. Paint Splash", "Palm Angels Butterfly"];
  const shirtModifiers = ["Heavy Acid Wash Tee", "Vintage Distressed Streetwear", "Oversized Boxy Fit Knit", "Thick Collar Street Piece", "Retro Band Merch Variant", "Combed Cotton Vintage Dye", "Chest Microprint Premium", "High-Definition Back Print", "Unisex Drop-Shoulder Spec", "Luxury Heavyweight 240GSM"];

  for (let i = 1; i <= 50; i++) {
    const brand = shirtBrands[(i * 9) % shirtBrands.length];
    const modifier = shirtModifiers[(i * 17) % shirtModifiers.length];
    
    const price = 799 + ((i * 47) % 1500);
    const rating = Math.round((4.5 + ((i * 2) % 6) / 10) * 10) / 10;
    const reviewsCount = 20 + ((i * 17) % 400);
    const stock = 30;

    catalog.push({
      id: `p-tshirt-dyn-${i}`,
      name: `${brand} ${modifier}`,
      price: price,
      rating: rating,
      reviewsCount: reviewsCount,
      category: "Fashion",
      description: `Heavyweight premium cotton graphic tee with pre-shrunk washed finish. Perfect streetwear oversized slouchy drape and durable double-ribbed crew neck.`,
      specs: [
        "Material: 100% Ring-spun heavyweight combed cotton, 240+ GSM",
        "Fit: Oversized slouchy retro streetwear silhouette",
        "Print: High-definition crackproof plastisol screenprint",
        `Serial Code: M-G58/T${5000 + i}`,
        "Care: Wash cold inside-out, tumble dry low heat"
      ],
      image: "tshirt",
      stock: stock
    });
  }

  return catalog;
}

// Instantiate complete catalog
export const ALL_PRODUCTS: Product[] = generateExtendedCatalog();

// Local storage key for custom user database alterations
const STORAGE_CUSTOM_PRODUCTS_KEY = "madurai_gadgets_custom_products";

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return ALL_PRODUCTS;
  
  // Clean custom stored local storage first to prevent old stale categories from showing up
  const stored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
  if (!stored) return ALL_PRODUCTS;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate if the parsed products contain any old category structures
      const hasOldCategories = parsed.some(p => 
        ["Chronograph", "Luxury Automatic", "Sports Diver", "Classic Dress", "Fashion T-Shirts"].includes(p.category)
      );
      if (hasOldCategories) {
        // Automatically overwrite/clear old cache to reload correct categories
        localStorage.removeItem(STORAGE_CUSTOM_PRODUCTS_KEY);
        return ALL_PRODUCTS;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse custom local products", e);
  }
  return ALL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
}
