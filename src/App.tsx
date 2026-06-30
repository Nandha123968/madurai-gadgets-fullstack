import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  Trash2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Send,
  Loader2,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Award,
  CircleAlert,
  MapPin,
  Phone,
  MessageCircle,
  Printer,
  FileText,
  Lock,
  Check,
  Clock,
  Instagram
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, CartItem, Message, Order } from "./types";
import { ALL_PRODUCTS, getStoredProducts, saveStoredProducts as originalSaveStoredProducts } from "./data/products";
import { 
  auth, 
  signInWithGoogle, 
  signOutUser,
  fetchProductsFromFirebase,
  saveProductToFirebase,
  deleteProductFromFirebase,
  seedProductsToFirebase,
  fetchOrdersFromFirebase,
  saveOrderToFirebase,
  updateOrderInFirebase,
  deleteOrderFromFirebase
} from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import EditProductModal from "./components/EditProductModal";
import StockManagementView from "./components/StockManagementView";
import BulkUploadView from "./components/BulkUploadView";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// AI Generated Category Images
// @ts-expect-error - Vite static asset
import catAllProductsImg from "./assets/images/cat_all_products_1782245171766.jpg";
// @ts-expect-error - Vite static asset
import catPremierWatchesImg from "./assets/images/cat_premier_watches_1782245184861.jpg";
// @ts-expect-error - Vite static asset
import catJapaneseWatchesImg from "./assets/images/cat_japanese_watches_1782245197053.jpg";
// @ts-expect-error - Vite static asset
import catSpeakersImg from "./assets/images/cat_speakers_1782245210665.jpg";
// @ts-expect-error - Vite static asset
import catSunglassesImg from "./assets/images/cat_sunglasses_1782245222120.jpg";
// @ts-expect-error - Vite static asset
import catFashionTshirtsImg from "./assets/images/cat_fashion_tshirts_1782245236969.jpg";
// @ts-expect-error - Vite static asset
import maduraiGadgetsLogoImg from "./assets/images/madurai_gadgets_logo_1782245851535.jpg";
// @ts-expect-error - Vite static asset
import rolexDaytonaGoldImg from "./assets/images/rolex_daytona_gold_1782246183144.jpg";
// @ts-expect-error - Vite static asset
import apRoyalOakSkeletonImg from "./assets/images/ap_royal_oak_skeleton_1782246198897.jpg";
// @ts-expect-error - Vite static asset
import patekNautilusBlueImg from "./assets/images/patek_nautilus_blue_1782246214873.jpg";

// AI-Generated Premier Showcase Watch List
const AI_SPOTLIGHT_WATCHES = [
  {
    id: "spotlight-daytona",
    name: "Rolex Daytona Gold Chrono",
    brand: "Rolex",
    originalNameKeyword: "Daytona",
    price: 7499,
    image: rolexDaytonaGoldImg,
    description: "An incredibly detailed replica of the Cosmograph Daytona in premium polished gold-plating with sharp midnight sub-dials. Powered by high-accuracy Japanese sweep-second mechanics, complete with tachymeter scale outer bezel and solid double flip-lock Oyster bracelet.",
    badge: "Most Popular Copy",
    specs: [
      "Movement: Japanese Sweeping Quartz Chronograph",
      "Dial: Rich Gold Plating with high-contrast active sub-dials",
      "Case: 40mm Solid 316L Surgical-Grade Steel Casing",
      "Strap: Heavy solid gold-plated links with safety latch"
    ]
  },
  {
    id: "spotlight-royaloak",
    name: "Audemars Piguet Royal Oak Skeleton",
    brand: "Audemars Piguet",
    originalNameKeyword: "Royal Oak",
    price: 8999,
    image: apRoyalOakSkeletonImg,
    description: "An elegant Royal Oak masterpiece copy featuring an exquisite dual-balance skeletonized dial with visible moving gear systems. Beautifully crafted with octagonal bezel screws, sharp hand-polished steel chamfers, and high-frequency movement visualization.",
    badge: "Master Artisan Choice",
    specs: [
      "Movement: Automated Self-Winding High-Beat Gear Simulator",
      "Dial: Open-Worked Transparent Skeleton Mechanical layout",
      "Case: 41mm high-end solid steel with signature octagonal bezel",
      "Glass: Curved double anti-reflective sapphire crystal"
    ]
  },
  {
    id: "spotlight-nautilus",
    name: "Patek Philippe Nautilus Ocean Blue Copy",
    brand: "Patek Philippe",
    originalNameKeyword: "Nautilus",
    price: 7999,
    image: patekNautilusBlueImg,
    description: "The crown jewel of luxury wear. Complete copy of the coveted Nautilus watch sporting the rich ocean blue embossed horizontal dial. Features a slim profile case, satin-brushed bezel edges, and a luxury butterfly deployment lock clasp.",
    badge: "Elite Executive Wear",
    specs: [
      "Movement: Calibre 324 SC Automatic sweep motor simulation",
      "Dial: Cobalt Ocean Blue horizontal deck pattern",
      "Diameter: 40.5mm Slim profile ergonomic design",
      "Strap: Integrated steel satin-brushed links with comfort safety"
    ]
  },
  {
    id: "spotlight-submariner",
    name: "Rolex Submariner President Green Copy",
    brand: "Rolex",
    originalNameKeyword: "Submariner",
    price: 6999,
    image: catPremierWatchesImg,
    description: "The timeless gold Submariner mastercopy. Fitted with a rich deep-green rotating ceramic countdown bezel scale, high-visibility green sunburst luminous hand indicators, and heavy solid-link Oyster extension comfort band.",
    badge: "Waterfront Legend",
    specs: [
      "Movement: Automatic sweep winding custom mechanical core",
      "Dial: Sunburst emerald green with Super-LumiNova markers",
      "Bezel: 120-click rotating ceramic dive timing scale",
      "Protection: Double-sealed waterproof gasket structure"
    ]
  }
];

export default function App() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingText, setLoadingText] = useState<string>("INITIALIZING 3D RENDER ENGINE...");
  const [loadingPercent, setLoadingPercent] = useState<number>(0);

  useEffect(() => {
    // Increment percent simulation
    const interval = setInterval(() => {
      setLoadingPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    // Dynamic sequential texts
    const texts = [
      "LOADING DYNAMIC 3D ASSETS FOR MG58...",
      "TUNING AUDIO ACOUSTICS & GLASS POLARIZATION...",
      "CALIBRATING SITE-WIDE FLAT 10% DISCOUNT VALUE...",
      "ESTABLISHING SECURE ENCRYPTED WHATSAPP LINK...",
      "SYNCHRONIZING MADURAI REPLICA STOCK MEMORY...",
      "PORTAL LOADED successfully. WELCOME MACHAN! ✨"
    ];
    let idx = 0;
    const textInterval = setInterval(() => {
      idx = (idx + 1) % texts.length;
      setLoadingText(texts[idx]);
    }, 450);

    const timer = setTimeout(() => {
      setInitialLoading(false);
      clearInterval(interval);
      clearInterval(textInterval);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  // Navigation tabs: 'shop' | 'tracker' | 'merchant' (Madurai Gadgets Suite)
  const [activeTab, setActiveTab] = useState<"shop" | "tracker" | "merchant">("shop");
  
  // Real-time local copy of the 500+ product catalog database
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());

  // Custom Firebase Sync Wrapper for products modifications
  const saveStoredProducts = (updatedList: Product[]) => {
    setProducts(updatedList);
    originalSaveStoredProducts(updatedList);
    
    // Incremental Diff Sync to Firebase to respect free-tier write quotas
    const previousMap = new Map(products.map(p => [p.id, p]));
    const updatedMap = new Map(updatedList.map(p => [p.id, p]));

    updatedList.forEach(p => {
      const prev = previousMap.get(p.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(p)) {
        saveProductToFirebase(p).catch(err => console.warn("Firebase product sync skipped:", err));
      }
    });

    products.forEach(p => {
      if (!updatedMap.has(p.id)) {
        deleteProductFromFirebase(p.id).catch(err => console.warn("Firebase product delete skipped:", err));
      }
    });
  };
  const [visibleCount, setVisibleCount] = useState<number>(16);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Custom hero image & layout configurations
  const [customHeroImage, setCustomHeroImage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("madurai_custom_hero_image") || "";
    }
    return "";
  });
  const [heroLayout, setHeroLayout] = useState<"showcase" | "backdrop">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("madurai_hero_layout") as "showcase" | "backdrop") || "showcase";
    }
    return "showcase";
  });

  // Admin access portals
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("madurai_admin_logged_in") === "true";
    }
    return false;
  });
  const [adminPinInput, setAdminPinInput] = useState<string>("");

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === "5858" || adminPinInput === "admin58") {
      setIsAdminLoggedIn(true);
      localStorage.setItem("madurai_admin_logged_in", "true");
      setAdminPinInput("");
      setActiveTab("merchant");
      triggerToast("Vanakkam Machan! Admin Session Unlocked successfully. ✨", "success");
    } else {
      triggerToast("Wrong PIN Code! Try again, machan.", "info");
    }
  };

  // States to add a new custom watch (Template choices included)
  const [templateSelect, setTemplateSelect] = useState<string>("");
  const [newWatchName, setNewWatchName] = useState<string>("");
  const [newWatchPrice, setNewWatchPrice] = useState<number>(4999);
  const [newWatchCategory, setNewWatchCategory] = useState<string>("Premier Watches");
  const [newWatchBrand, setNewWatchBrand] = useState<string>("Other");
  const [newWatchGender, setNewWatchGender] = useState<"Men" | "Women" | "Unisex">("Unisex");
  const [newWatchStock, setNewWatchStock] = useState<number>(10);
  const [newWatchDescription, setNewWatchDescription] = useState<string>("A+ Grade festival deal replica with dynamic dial and luxury packaging details.");
  const [newWatchSpecs, setNewWatchSpecs] = useState<string>("Movement: Japanese Quartz dual-hand precision chronograph\nDial: Lined sub-dials with glowing marks\nBezel: Scratch-resistant matte scale outer bezel\nStrap: Luxury raw solid bracelet with double lock custom safety");
  const [newWatchImage, setNewWatchImage] = useState<string>("daytona");
  const [variationsInput, setVariationsInput] = useState<{ color_name: string; color_code: string; image_url: string }[]>([]);
  const [cardActiveImages, setCardActiveImages] = useState<Record<number | string, string>>({});

  // Merchant search state & price operations
  const [merchantSubTab, setMerchantSubTab] = useState<"inventory" | "stock" | "orders" | "bulk">("inventory");
  const [merchantSearchQuery, setMerchantSearchQuery] = useState<string>("");
  const [merchantPage, setMerchantPage] = useState<number>(1);
  const [bulkPercent, setBulkPercent] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<"All" | "Men" | "Women">("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(""); // simple init
  const [sortBy, setSortBy] = useState<"relevance" | "low-high" | "high-low" | "rating">("relevance");
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [showMap, setShowMap] = useState<boolean>(false);

  // Auto rotate hero banners
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Deferred map loading to ensure high page performance scores
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Reset pagination count on filter, sorting or searching change
  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, searchQuery, showLowStockOnly, sortBy, selectedGender, selectedBrand]);

  // Product detail display state
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [activeDetailImage, setActiveDetailImage] = useState<string>("");

  useEffect(() => {
    if (detailedProduct) {
      setActiveDetailImage(detailedProduct.image);
    } else {
      setActiveDetailImage("");
    }
  }, [detailedProduct]);

  // AI Spotlight Showcase Action Handlers
  const handleSpotlightAddToCart = (item: typeof AI_SPOTLIGHT_WATCHES[0]) => {
    let matchingProduct = products.find((p) =>
      p.name.toLowerCase().includes(item.originalNameKeyword.toLowerCase())
    );
    if (!matchingProduct) {
      matchingProduct = products.find((p) => p.category === "Premier Watches");
    }

    if (matchingProduct) {
      addToCart(matchingProduct, 1);
    } else {
      triggerToast("Could not locate item in current catalogue, machan!", "info");
    }
  };

  const handleSpotlightWhatsAppBuy = (item: typeof AI_SPOTLIGHT_WATCHES[0]) => {
    const greeting = `*MADURAI GADGETS 58 - SPECIAL PREMIUM SHOWCASE ORDER* ⌚✨
---------------------------------------
Vanakkam Machan! I saw this premium mastercopy watch in your *AI Premier Spotlight Showcase* and I want to order it:

*Watch Name:* ${item.name} (${item.brand})
*Special Offer Price:* ₹${item.price.toLocaleString("en-IN")}
*Quality Certification:* A+ Certified Premium Replica

Please confirm availability and share GPay/PhonePe QR Code so I can secure it right away! 🚀✨`;

    const whatsappUrl = `https://wa.me/919585969334?text=${encodeURIComponent(greeting)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    triggerToast("Redirecting to WhatsApp to place order, machan! 🚀", "success");
  };

  const handleSpotlightViewDetails = (item: typeof AI_SPOTLIGHT_WATCHES[0]) => {
    let matchingProduct = products.find((p) =>
      p.name.toLowerCase().includes(item.originalNameKeyword.toLowerCase())
    );
    if (!matchingProduct) {
      matchingProduct = products.find((p) => p.category === "Premier Watches");
    }
    if (matchingProduct) {
      setDetailedProduct(matchingProduct);
    } else {
      triggerToast("Loading watch specifications...", "info");
    }
  };

  // Cart operations
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("madurai_default_discount");
      return stored ? Number(stored) : 0;
    }
    return 0;
  });
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  // checkout form fields
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: ""
  });
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "upi">("whatsapp");
  const [utrNumber, setUtrNumber] = useState<string>("");
  
  // Placed orders list (persisted in LocalStorage)
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  
  const [trackingSearchQuery, setTrackingSearchQuery] = useState<string>("");
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (deletingOrderId) {
      const timer = setTimeout(() => {
        setDeletingOrderId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingOrderId]);

  // Set page title during invoice printing for PDF naming
  useEffect(() => {
    if (printingOrder) {
      const oldTitle = document.title;
      document.title = "MADURAI_GADGETS_58_INVOICE";
      return () => {
        document.title = oldTitle;
      };
    }
  }, [printingOrder]);

  // AI chat bubble state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "assistant",
      text: "Vanakkam machan! Welcome to Madurai Gadgets 58. I'm your AI Shopping Assistant. Looking for premium mastercopy watches with first class premium design at affordable prices? Let me help you pick the perfect one! Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Toast notifier state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Hydrate order details from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("aura_shop_orders");
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
        if (parsed.length > 0) {
          setSelectedOrder(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
      }
    }

    const savedCart = localStorage.getItem("aura_shop_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, []);

  // Sync state changes to storage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("aura_shop_cart", JSON.stringify(newCart));
  };

  // WhatsApp Notification triggers
  const sendWhatsAppReceipt = (ord: Order) => {
    let cleanPhone = ord.shipping.phone?.replace(/\D/g, "") || "9585969334";
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
    else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = "91" + cleanPhone.substring(1);
    else if (cleanPhone.length > 10) cleanPhone = "91" + cleanPhone.slice(-10);
    else cleanPhone = "91" + cleanPhone;

    const itemsText = ord.items.map(item => 
      `◽ *${item.product.name}* (${item.quantity}x) - ₹${item.product.price.toLocaleString("en-IN")}`
    ).join("\n");
    
    const whatsappMsg = `*MADURAI GADGETS 58 - OFFICIAL DIGITAL RECEIPT* 📜⌚\n--------------------------------------\nVanakkam Machan! Your payment has been successfully verified! 💳✅\n\n*CUSTOMER DETAILS:*\n👤 *Name:* ${ord.shipping.fullName}\n📞 *Phone:* ${ord.shipping.phone || "Not specified"}\n📍 *Delivery Address:* ${ord.shipping.address}, ${ord.shipping.city} - ${ord.shipping.zipCode}\n\n*ORDER REFERENCES:*\n🆔 *Invoice ID:* ${ord.id}\n📅 *Registered Date:* ${ord.date}\n🌟 *Fulfillment Status:* APPROVED & SHIPPING PREPARED 📦🚀\n💵 *Payment Status:* PAID ✦\n\n--------------------------------------\n*YOUR PURCHASE:*\n${itemsText}\n\n💰 *GRAND TOTAL:* ₹${ord.total.toLocaleString("en-IN")}\n--------------------------------------\nYour premium watch package is certified and ready for dispatch. Thank you for shopping with Madurai Gadgets 58! Wear Peak, Master Your Style! ☄️✨`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`, "_blank", "noopener,noreferrer");
  };

  const sendWhatsAppShipped = (ord: Order) => {
    let cleanPhone = ord.shipping.phone?.replace(/\D/g, "") || "9585969334";
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
    else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = "91" + cleanPhone.substring(1);
    else if (cleanPhone.length > 10) cleanPhone = "91" + cleanPhone.slice(-10);
    else cleanPhone = "91" + cleanPhone;

    const courierText = ord.stCourierId 
      ? `Consignment ID: *${ord.stCourierId}* (ST Courier)`
      : "Consignment handed over to ST Courier for Express Delivery";

    const whatsappMsg = `*MADURAI GADGETS 58 - SHIPMENT DISPATCHED* 🚚📦\n--------------------------------------\nVanakkam Machan! Your premium watch package is in transit! 🌟✨\n\n🆔 *Invoice ID:* ${ord.id}\n📍 *Destination:* ${ord.shipping.city}\n🚚 *Shipping Partner:* ST Courier\n🎫 *Consignment Details:* ${courierText}\n\nTrack your live delivery progression directly on our website using your order tracker. Wear Peak, Master Your Style! ☄️⌚`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`, "_blank", "noopener,noreferrer");
  };

  const sendWhatsAppDelivered = (ord: Order) => {
    let cleanPhone = ord.shipping.phone?.replace(/\D/g, "") || "9585969334";
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
    else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = "91" + cleanPhone.substring(1);
    else if (cleanPhone.length > 10) cleanPhone = "91" + cleanPhone.slice(-10);
    else cleanPhone = "91" + cleanPhone;

    const whatsappMsg = `*MADURAI GADGETS 58 - DELIVERED SUCCESSFULLY* 🎉⌚\n--------------------------------------\nVanakkam Machan! Your order *${ord.id}* has been successfully delivered! ✅\n\nHope you love your premium timepiece. Wear with pride and tag us! Thank you for placing your trust in Madurai Gadgets 58! ✦✨`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`, "_blank", "noopener,noreferrer");
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("aura_shop_orders", JSON.stringify(newOrders));

    // Async diff write to Firebase to prevent quota waste
    const previousMap = new Map(orders.map(o => [o.id, o]));
    const updatedMap = new Map(newOrders.map(o => [o.id, o]));

    newOrders.forEach(o => {
      const prev = previousMap.get(o.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(o)) {
        saveOrderToFirebase(o).catch(err => console.warn("Firebase order sync skipped:", err));
      }
    });

    orders.forEach(o => {
      if (!updatedMap.has(o.id)) {
        deleteOrderFromFirebase(o.id).catch(err => console.warn("Firebase order delete skipped:", err));
      }
    });
  };

  // Un App.tsx kullaiye intha puthu function-ah podu
  const fetchProductsFromNodeBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (response.ok) {
        const mysqlData = await response.json();
        
        // Parallel load from Firebase Firestore
        let firebaseProducts: Product[] = [];
        try {
          firebaseProducts = await fetchProductsFromFirebase();
        } catch (fbErr) {
          console.warn("Failed to fetch product details from Firebase:", fbErr);
        }

        // Backend data-va Frontend format-ku maathurom
        const formattedProducts = mysqlData.map((mysqlItem: any) => {
          const fbItem = firebaseProducts.find((p) => p.id === mysqlItem.id.toString());
          const matchedStaticProduct = ALL_PRODUCTS.find((p) => p.id === mysqlItem.id.toString());

          const finalName = fbItem?.name || matchedStaticProduct?.name || `Watch #${mysqlItem.id}`;
          const finalPrice = fbItem?.price || matchedStaticProduct?.price || 4999;
          const finalDesc = fbItem?.description || matchedStaticProduct?.description || "A+ Quality premium wrist watch copy.";
          const finalCategory = fbItem?.category || matchedStaticProduct?.category || "Premier Watches";
          const finalGender = fbItem?.gender || matchedStaticProduct?.gender || "Unisex";
          const finalStock = fbItem?.stock ?? matchedStaticProduct?.stock ?? 10;
          const finalVariations = fbItem?.variations || matchedStaticProduct?.variations || [];
          
          let parsedSpecs: string[] = [];
          if (fbItem?.specs) {
            parsedSpecs = Array.isArray(fbItem.specs) ? fbItem.specs : fbItem.specs;
          } else if (matchedStaticProduct?.specs) {
            parsedSpecs = matchedStaticProduct.specs;
          } else {
            parsedSpecs = ["Premium Quality Mastercopy", "Complete UV Protection Glass", "High Grade Solid Build"];
          }

          return {
            id: mysqlItem.id.toString(),
            name: finalName,
            price: Number(finalPrice),
            description: finalDesc,
            image: mysqlItem.image_url ? mysqlItem.image_url.replace(/^http:\/\//i, "https://") : mysqlItem.image_url,
            rating: fbItem?.rating || matchedStaticProduct?.rating || 4.8, 
            reviewsCount: fbItem?.reviewsCount || matchedStaticProduct?.reviewsCount || 150,
            category: finalCategory, 
            gender: finalGender,
            specs: parsedSpecs,
            stock: finalStock,
            variations: finalVariations
          };
        });
        
        setProducts(formattedProducts); 
      }
    } catch (error) {
      console.error("Backend connect aagala macha:", error);
    }
  };

  // Itha un useEffect kulla podu (Component load aagum pothu run aaga)
  useEffect(() => {
    fetchProductsFromNodeBackend();
  }, []);

  // Background Cloud Database Synchronization with Firebase
  useEffect(() => {
    const syncDatabase = async () => {
      try {
        // 1. Sync catalog products with Cloud
        let fbProducts = await fetchProductsFromFirebase();
        if (fbProducts.length === 0) {
          // If Firestore is empty, seed it with the catalog base
          await seedProductsToFirebase(ALL_PRODUCTS);
          fbProducts = await fetchProductsFromFirebase();
        }
        if (fbProducts.length > 0) {
          setProducts(fbProducts);
          originalSaveStoredProducts(fbProducts);
        }

        // 2. Sync orders with Cloud
        const fbOrders = await fetchOrdersFromFirebase();
        if (fbOrders.length > 0) {
          setOrders(fbOrders);
          localStorage.setItem("aura_shop_orders", JSON.stringify(fbOrders));
          setSelectedOrder(fbOrders[0]);
        }
      } catch (err) {
        console.warn("Firebase sync deferred: active local offline storage operational.", err);
      }
    };

    syncDatabase();

    // Authenticated state persistence and listeners
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === "nandharx420@gmail.com") {
          setIsAdminLoggedIn(true);
          localStorage.setItem("madurai_admin_logged_in", "true");
          triggerToast("Vanakkam Machan! Admin session unlocked via Google. ⚡", "success");
        } else {
          triggerToast(`Logged in as ${user.displayName || user.email}.`, "success");
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Scroll chat bottom as messages load
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // Handle toast notification
  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Helper to extract or fallback a product's brand
  const getProductBrand = (p: Product): string => {
    if (p.brand && p.brand !== "Other") return p.brand;
    const nameLower = p.name.toLowerCase();
    if (nameLower.includes("jacob") || nameLower.includes("jacon")) return "Jacob & Co";
    if (nameLower.includes("rolex") || nameLower.includes("submariner") || nameLower.includes("daytona")) return "Rolex";
    if (nameLower.includes("omega") || nameLower.includes("seamaster") || nameLower.includes("aquaterra") || nameLower.includes("aqua terra")) return "Omega";
    if (nameLower.includes("patek") || nameLower.includes("nautilus")) return "Patek Philippe";
    if (nameLower.includes("royal oak") || nameLower.includes("audemars") || nameLower.includes("ap ")) return "Audemars Piguet";
    if (nameLower.includes("casio") || nameLower.includes("g-shock") || nameLower.includes("gshock")) return "Casio";
    if (nameLower.includes("cartier") || nameLower.includes("santos")) return "Cartier";
    if (nameLower.includes("tissot")) return "Tissot";
    return "Other";
  };

  // Filtered and sorted lists
  const filteredProducts = products.filter((product) => {
    // Hide Fashion category products since the category is closed for now
    if (product.category === "Fashion") return false;

    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesGender = selectedGender === "All" || !product.gender || product.gender === selectedGender;
    
    const productBrand = getProductBrand(product);
    const matchesBrand = selectedBrand === "All" || productBrand === selectedBrand;

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !showLowStockOnly || product.stock <= 5;
    return matchesCategory && matchesGender && matchesBrand && matchesSearch && matchesLowStock;
  }).sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // relevance (default)
  });

  // Performance-optimized pagination slice
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // Cart actions
  const addToCart = (product: Product, quantity: number = 1) => {
    const activeImg = cardActiveImages[product.id] || (detailedProduct && detailedProduct.id === product.id ? activeDetailImage : "") || product.image;
    const productWithSelectedImage = { ...product, image: activeImg };

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      const updatedQty = existing.quantity + quantity;
      if (updatedQty > product.stock) {
        triggerToast(`Apologies, only ${product.stock} items currently in stock.`, "info");
        return;
      }
      const updated = cart.map((item) =>
        item.product.id === product.id ? { ...item, product: { ...item.product, image: activeImg }, quantity: updatedQty } : item
      );
      saveCart(updated);
    } else {
      if (quantity > product.stock) {
        triggerToast(`Apologies, only ${product.stock} in stock.`, "info");
        return;
      }
      saveCart([...cart, { product: productWithSelectedImage, quantity }]);
    }
    triggerToast(`Added ${quantity} x ${product.name} to your Cart!`, "success");
  };

  const updateCartQty = (productId: string, delta: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    const targetQty = item.quantity + delta;
    if (targetQty <= 0) {
      // Remove item
      const filtered = cart.filter((i) => i.product.id !== productId);
      saveCart(filtered);
      triggerToast(`Removed ${item.product.name} from Cart`, "info");
    } else {
      // Validate stock
      if (targetQty > item.product.stock) {
        triggerToast(`Current stockpile cap reached for ${item.product.name}.`, "info");
        return;
      }
      const updated = cart.map((i) =>
        i.product.id === productId ? { ...i, quantity: targetQty } : i
      );
      saveCart(updated);
    }
  };

  const removeCartItem = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    const filtered = cart.filter((i) => i.product.id !== productId);
    saveCart(filtered);
    if (item) {
      triggerToast(`Removed ${item.product.name} from Cart`, "info");
    }
  };

  // Coupon processing codes
  const validatePromoCode = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "MACHAN") {
      setDiscountPercent(15);
      setCouponFeedback({
        msg: "Aama machan! 15% discount applied successfully! 😎",
        success: true
      });
      triggerToast("Special 15% Machan Code Applied!", "success");
    } else if (code === "WELCOME") {
      setDiscountPercent(10);
      setCouponFeedback({
        msg: "Welcome discount of 10% applied successfully! ✨",
        success: true
      });
      triggerToast("10% Welcome Discount Applied", "success");
    } else {
      setDiscountPercent(0);
      setCouponFeedback({
        msg: "Invalid coupon. Ask our AI Assistant bottom-right for a promo!",
        success: false
      });
    }
  };

  // Cart financial calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountUSD = (cartSubtotal * discountPercent) / 100;
  const deliveryFee = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 9.99;
  const taxEst = (cartSubtotal - discountUSD) * 0.08;
  const cartTotal = Math.max(0, cartSubtotal - discountUSD + deliveryFee + taxEst);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // WhatsApp-Based Checkout Submission
  const processCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerToast("Your cart is empty", "info");
      return;
    }

    setIsCheckingOut(true);

    const orderId = `MDU-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Compute formatted line items list
    const itemsText = cart.map(item => {
      const itemSub = item.product.price * item.quantity;
      return `◽ *${item.product.name}* (${item.quantity}x) - ₹${item.product.price.toLocaleString("en-IN")}`;
    }).join("\n");

    const paymentSection = paymentMethod === "upi" ?
`--------------------------------------
*PAYMENT STATUS (UPI DIRECT):*
💳 *Payment Method:* Direct UPI Transfer
💵 *Amount Paid:* ₹${cartTotal.toLocaleString("en-IN")}
🔢 *UTR / Ref No:* ${utrNumber}
✅ *Status:* Paid (Pending Verification)

Machan, I have transferred the amount to your UPI ID *dineshdev5227-2@okhdfcbank* (linked number *9688616838*). Please verify my payment using the UTR number above and ship my order! 🚀`
:
`--------------------------------------
*QR CODE REQUEST:*
Machan, please send me your *GPay / PhonePe / Paytm UPI QR Code* (for UPI ID: *dineshdev5227-2@okhdfcbank* or number *9688616838*) for *₹${cartTotal.toLocaleString("en-IN")}* to complete my payment! Once you send the QR, I will transfer and send the screenshot.`;

    // Grand invoice greeting for WhatsApp
    const greeting = 
`*MADURAI GADGETS 58 - NEW WATCH/ORDER REQUEST* 📦🛒
--------------------------------------
*Customer Details:*
👤 *Name:* ${shippingForm.fullName}
📧 *Email:* ${shippingForm.email}
📍 *Address:* ${shippingForm.address}, ${shippingForm.city} - ${shippingForm.zipCode}

--------------------------------------
*ORDER INVENTORY:*
${itemsText}

--------------------------------------
*SUMMARY ANALYSIS:*
💵 *Subtotal:* ₹${cartSubtotal.toLocaleString("en-IN")}
🧧 *Promo Custom Discount:* -₹${discountUSD.toLocaleString("en-IN")}
🚚 *Delivery:* FREE complimentary secure shipping
🏛️ *Estimated Surcharge (GST 8%):* ₹${taxEst.toLocaleString("en-IN")}
💰 *GRAND TOTAL PAYMENT:* ₹${cartTotal.toLocaleString("en-IN")}

${paymentSection}

My order is registered in the tracker with reference *${orderId}*. Thank you! 🙏✨`;

    const whatsappUrl = `https://wa.me/919585969334?text=${encodeURIComponent(greeting)}`;

    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      total: cartTotal,
      discount: discountUSD,
      shipping: { ...shippingForm },
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      status: "Processing",
      paymentStatus: "Unpaid",
      utr: paymentMethod === "upi" ? utrNumber : undefined,
      paymentMethod: paymentMethod
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    setSelectedOrder(newOrder);

    // Send invoice email notification to customer and CC to admin in background
    fetch(`${API_BASE_URL}/api/send-order-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        console.log("Invoice email sent successfully!");
      } else {
        console.warn("Invoice email warning:", resData.message);
      }
    })
    .catch(err => {
      console.warn("Could not dispatch invoice email:", err);
    });

    // Clean configurations
    saveCart([]);
    setShippingForm({ fullName: "", email: "", address: "", city: "", zipCode: "", phone: "" });
    setPaymentMethod("whatsapp");
    setUtrNumber("");
    setIsCheckingOut(false);
    setIsCartOpen(false);
    setActiveTab("tracker");
    const storedDefault = localStorage.getItem("madurai_default_discount");
    setDiscountPercent(storedDefault ? Number(storedDefault) : 0);
    setCouponCode("");
    setCouponFeedback(null);
    
    // Open WhatsApp Link safely & instantly
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    
    triggerToast("Redirecting to WhatsApp instantly! 🚀", "success");
  };

  // Send communication message to backend server (Gemini API Proxy / Fallback handler)
  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;

    // Append User message
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const payload = [...chatMessages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload })
      });

      if (!res.ok) {
        throw new Error("Local server response failure.");
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `m-${Date.now() + 1}`,
        sender: "assistant",
        text: data.reply || "Machan, I didn't catch that. Could you repeat please?",
        timestamp: new Date()
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI Communication Error:", err);
      // Safety emergency fallback if express route has a glitch
      const assistantMsg: Message = {
        id: `m-${Date.now() + 1}`,
        sender: "assistant",
        text: "Sorry machan, I had a slight connection hiccup! But we have some gorgeous mastercopy watches like AP Royal Oak, Rolex Submariner, Daytona, Nautilus, Seamaster, and Classic Roman Heritage. Use coupon code **MACHAN** to get 15% off!",
        timestamp: new Date()
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Helper template button clicker inside the assistant chat pane
  const handleChipClick = (promptText: string) => {
    setChatInput(promptText);
  };

  // Dynamic media optimizer helper for whitelisted Cloudinary asset structures
  const optimizeImageUrl = (url: string, width: number = 600): string => {
    if (url && url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
      return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
    }
    return url;
  };

  // Visual Product Vector Mock Art Renderer (To keep look premium & avoid external generic image links)
  const renderProductIllustration = (imageKey: string, sizeClass: string = "h-40", imgWidth: number = 600) => {
    if (imageKey && (imageKey.startsWith("data:") || imageKey.startsWith("http://") || imageKey.startsWith("https://"))) {
      const optimizedUrl = optimizeImageUrl(imageKey, imgWidth);
      return (
        <div className={`w-full ${sizeClass} bg-transparent rounded-none relative flex items-center justify-center overflow-hidden`}>
          <motion.img
            src={optimizedUrl}
            alt="Product Media"
            className="w-[96%] h-[96%] object-contain select-none"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            style={{
              imageRendering: "auto",
              WebkitFontSmoothing: "antialiased",
            }}
            decoding="async"
            loading="lazy"
          />
        </div>
      );
    }
    switch (imageKey) {
      case "daytona":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            {/* Subtle grid pattern background */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Stainless Steel Watch Bracelet lines */}
            <div className="absolute top-2 w-10 h-1/3 bg-gradient-to-b from-white/10 to-[#1e1e21] border-x border-white/10"></div>
            <div className="absolute bottom-2 w-10 h-1/3 bg-gradient-to-t from-white/10 to-[#1e1e21] border-x border-white/10"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Bezel Ring */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2a2a2e] to-[#121214] flex items-center justify-center shadow-2xl border-2 border-white/20 p-1">
                {/* Ceramic Bezel markings */}
                <div className="w-full h-full rounded-full border border-[#f59e0b]/20 bg-[#0a0a0b] relative flex items-center justify-center">
                  <span className="absolute top-0.5 text-[6px] font-mono font-bold text-white/40">TACHYMETRE</span>
                  <span className="absolute right-1 text-[5px] font-mono font-black text-white/30">400</span>
                  <span className="absolute left-1 text-[5px] font-mono font-black text-white/30">240</span>
                  
                  {/* Outer white dial ring */}
                  <div className="w-18 h-18 rounded-full bg-stone-100 flex items-center justify-center relative p-1 text-black">
                    {/* Dial indices */}
                    <div className="absolute inset-1.5 border border-black/10 rounded-full"></div>
                    <div className="absolute top-1 text-[6px] font-mono font-bold">12</div>
                    <div className="absolute bottom-1 text-[6px] font-mono font-bold">6</div>
                    
                    {/* Chrono sub-dials */}
                    <div className="flex gap-1 justify-center items-center z-10 mt-1">
                      <div className="w-4 h-4 rounded-full border border-black/30 bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-black/30 bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-black/30 bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                      </div>
                    </div>

                    {/* Sweeping hands */}
                    <div className="absolute w-0.5 h-6 bg-[#eb5757] origin-bottom rounded-full -mt-2"></div>
                    <div className="absolute w-1 h-5 bg-black origin-bottom rounded-full rotate-45 -mt-1.5"></div>
                  </div>
                </div>
              </div>
            </div>
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Japanese Chrono</span>
          </div>
        );
      case "royaloak":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Tapered integrated luxury steel bracelet */}
            <div className="absolute top-2 w-12 h-1/3 bg-gradient-to-b from-white/15 to-[#242428] border-x border-white/10 [clip-path:polygon(10%_0%,90%_0%,100%_100%,0%_100%)]"></div>
            <div className="absolute bottom-2 w-12 h-1/3 bg-gradient-to-t from-white/15 to-[#242428] border-x border-white/10 [clip-path:polygon(0%_0%,100%_0%,90%_100%,10%_100%)]"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Octagonal Bezel */}
              <div className="w-24 h-24 bg-[#2b2b30] flex items-center justify-center shadow-2xl border-2 border-white/20 p-1 relative [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]">
                {/* Scale bezel screws */}
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] top-1 left-7 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] top-1 right-7 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] bottom-1 left-7 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] bottom-1 right-7 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] top-7 left-1 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] bottom-7 left-1 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] top-7 right-1 border border-white/20"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#111] bottom-7 right-1 border border-white/20"></div>

                <div className="w-[84%] h-[84%] bg-[#1a1c22] rounded-full flex items-center justify-center relative border border-white/10 overflow-hidden">
                  {/* Grande Tapisserie Dark Waffle dial texture */}
                  <div className="absolute inset-0 bg-[#14151a] bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                  
                  {/* Golden hour indexes & hands */}
                  <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full z-10"></div>
                  <div className="absolute w-5 h-0.5 bg-[#f59e0b] origin-left rotate-[135deg] left-1/2"></div>
                  <div className="absolute w-7 h-0.5 bg-white origin-left rotate-30 left-1/2"></div>
                  
                  <span className="absolute top-1 text-[5px] font-mono tracking-widest text-[#f59e0b]">AUTOMATIC</span>
                </div>
              </div>
            </div>
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">8-Screw Octagon</span>
          </div>
        );
      case "nautilus":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Silver vertical center links band */}
            <div className="absolute top-2 w-11 h-1/3 bg-gradient-to-b from-white/15 to-[#2a2a2f] border-x border-white/5"></div>
            <div className="absolute bottom-2 w-11 h-1/3 bg-gradient-to-t from-white/15 to-[#2a2a2f] border-x border-white/5"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Rounded cushion shape with "hinge/wing" ears */}
              <div className="w-26 h-22 rounded-[30%] bg-gradient-to-r from-white/10 via-[#2f3136] to-white/10 p-1 flex items-center justify-center shadow-2xl border border-white/20 relative">
                
                {/* Inner Bezel Dial */}
                <div className="w-[82%] h-[82%] rounded-[25%] bg-[#0f1422] relative flex items-center justify-center border border-white/10">
                  {/* Ocean blue horizontal gradient and embossed striping layout */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1b315b] to-[#0a1223] flex flex-col justify-between py-1 px-2.5">
                    <div className="h-0.5 w-full bg-white/10"></div>
                    <div className="h-0.5 w-full bg-white/10"></div>
                    <div className="h-0.5 w-full bg-white/10"></div>
                    <div className="h-0.5 w-full bg-white/10"></div>
                    <div className="h-0.5 w-full bg-white/10"></div>
                  </div>
                  
                  {/* Luxury hands */}
                  <div className="w-1.5 h-1.5 bg-white rounded-full z-10"></div>
                  <div className="absolute w-6 h-0.5 bg-stone-200 origin-left rotate-[60deg] left-1/2"></div>
                  <div className="absolute w-8 h-0.5 bg-stone-300 origin-left rotate-[-45deg] left-1/2"></div>
                </div>
              </div>
            </div>
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Sapphire Classic</span>
          </div>
        );
      case "submariner":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Rugged OysterSteel Link straps */}
            <div className="absolute top-2 w-10 h-1/3 bg-gradient-to-b from-white/10 to-[#181a1c] border-x border-[#ffffff15]"></div>
            <div className="absolute bottom-2 w-10 h-1/3 bg-gradient-to-t from-white/10 to-[#181a1c] border-x border-[#ffffff15]"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Diver Bezel */}
              <div className="w-24 h-24 rounded-full bg-[#181a1c] flex items-center justify-center shadow-2xl border-2 border-emerald-500/30 p-1 relative">
                {/* Bezel markers */}
                <div className="absolute top-1 text-[7px] text-[#22c55e] font-sans font-bold">▲</div>
                <div className="absolute right-2 text-[5px] text-[#22c55e] font-mono uppercase font-black">15</div>
                <div className="absolute bottom-1 text-[5px] text-[#22c55e] font-mono uppercase font-black">30</div>
                <div className="absolute left-2 text-[5px] text-[#22c55e] font-mono uppercase font-black">45</div>

                <div className="w-full h-full rounded-full bg-[#070708] border border-white/10 flex items-center justify-center relative">
                  {/* Dial face */}
                  <div className="w-16 h-16 rounded-full bg-black relative flex items-center justify-center">
                    {/* Glowing round dot markers */}
                    <div className="absolute top-1.5 w-1 h-2 bg-emerald-400 rounded-sm"></div>
                    <div className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <div className="absolute left-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    
                    {/* Date magnifier lens at 3 o'clock */}
                    <div className="absolute right-1 w-4 h-3 bg-white/25 rounded-xs border border-white/30 text-[6px] text-white flex items-center justify-center font-bold font-mono">19</div>

                    {/* Luminous Hands */}
                    <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full z-10"></div>
                    <div className="absolute w-4 h-1 bg-white origin-left rotate-[105deg] left-1/2 rounded-full"></div>
                    <div className="absolute w-6 h-0.5 bg-white origin-left rotate-[190deg] left-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Ceramic Diver</span>
          </div>
        );
      case "seamaster":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Marine rubber black structured wrist strap */}
            <div className="absolute top-2 w-9 h-1/3 bg-[#0d0d0e] border-x border-white/5 rounded-t-sm">
              <div className="flex flex-col gap-1 justify-center items-center py-2 opacity-20">
                <div className="h-0.5 w-5 bg-white"></div>
                <div className="h-0.5 w-5 bg-white"></div>
                <div className="h-0.5 w-5 bg-white"></div>
              </div>
            </div>
            <div className="absolute bottom-2 w-9 h-1/3 bg-[#0d0d0e] border-x border-white/5 rounded-b-sm">
              <div className="flex flex-col gap-1 justify-center items-center py-2 opacity-20">
                <div className="h-0.5 w-5 bg-white"></div>
                <div className="h-0.5 w-5 bg-white"></div>
                <div className="h-0.5 w-5 bg-white"></div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Fluted watch bezel */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-900 to-indigo-950 flex items-center justify-center shadow-2xl border-2 border-white/10 p-1 relative">
                {/* Helium escape valve indicator */}
                <div className="absolute w-2 h-2 rounded-xs bg-[#151515] top-3 -right-0.5 border border-white/20"></div>

                {/* Ocean dynamic sea wave blue dial */}
                <div className="w-full h-full rounded-full bg-[#050c18] border border-[#f59e0b]/10 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-6 h-0.5 bg-blue-500/10 skew-y-3"></div>
                  <div className="absolute inset-x-0 top-10 h-0.5 bg-blue-500/15 -skew-y-3"></div>
                  <div className="absolute inset-x-0 top-14 h-0.5 bg-blue-500/10 skew-y-3"></div>

                  {/* Red seamaster logo accent */}
                  <span className="absolute top-4 text-[4px] font-sans text-rose-500 font-bold uppercase tracking-widest">SEAMASTER</span>

                  {/* Strong hands with white skeletal holes */}
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full z-10"></div>
                  <div className="absolute w-5 h-1 bg-[#f5f5f5] origin-left rotate-30 left-1/2 border border-blue-900"></div>
                  <div className="absolute w-7 h-0.5 bg-[#f5f5f5] origin-left rotate-[160deg] left-1/2"></div>
                </div>
              </div>
            </div>
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Sports Rubber</span>
          </div>
        );
      case "dresswatch":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Chocolate Genuine grain Leather bands */}
            <div className="absolute top-1 w-7 h-[42%] bg-amber-950 border-x border-amber-900 shadow-inner">
              <div className="w-full h-full bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
            </div>
            <div className="absolute bottom-1 w-7 h-[42%] bg-amber-950 border-x border-amber-900 shadow-inner">
              <div className="w-full h-full bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Ultra-slim classic Gold Bezel */}
              <div className="w-22 h-22 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6b12] flex items-center justify-center shadow-2xl border border-yellow-500/30 p-1">
                {/* Clean Ivory Face */}
                <div className="w-full h-full rounded-full bg-[#fdfdfc] flex items-center justify-center relative p-1 text-zinc-800">
                  <div className="absolute top-1.5 text-[6px] font-serif font-black tracking-tighter">XII</div>
                  <div className="absolute right-2 text-[5px] font-serif font-black">III</div>
                  <div className="absolute bottom-1.5 text-[6px] font-serif font-black">VI</div>
                  <div className="absolute left-2 text-[5px] font-serif font-black">IX</div>
                  
                  {/* Blued steel sword hands */}
                  <div className="w-1.5 h-1.5 bg-[#1b3d6c] rounded-full z-10"></div>
                  <div className="absolute w-5 h-0.5 bg-[#1b3d6c] origin-left rotate-[-75deg] left-1/2"></div>
                  <div className="absolute w-7 h-0.5 bg-[#1b3d6c] origin-left rotate-[-15deg] left-1/2"></div>
                </div>
              </div>
            </div>
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Roman Leather</span>
          </div>
        );
      case "speaker":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Audio speaker cabinet layout */}
            <div className="relative z-10 w-28 h-18 bg-[#1f1f23] rounded-xl border border-white/20 p-2 flex items-center justify-between shadow-2xl">
              {/* Speaker grill mesh */}
              <div className="absolute inset-1.5 rounded-lg bg-[#0e0e10] border border-white/5 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
              
              {/* Left Subwoofer driver */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2a2e] to-black border border-white/20 relative z-10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#171719] border border-[#f59e0b]/40 relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-inner animate-pulse"></div>
                </div>
              </div>
              
              {/* Right Subwoofer driver */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2a2e] to-black border border-white/20 relative z-10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#171719] border border-[#f59e0b]/40 relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-inner animate-pulse"></div>
                </div>
              </div>
              
              {/* Top controls */}
              <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#2a2a2e] px-2 py-0.5 rounded-full border border-white/10 z-20">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>
            
            {/* Dynamic sound wave lines */}
            <div className="absolute left-4 w-1 bg-[#f59e0b]/30 h-10 rounded-full animate-bounce"></div>
            <div className="absolute right-4 w-1 bg-[#f59e0b]/30 h-10 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Pro Acoustics</span>
          </div>
        );
      case "sunglass":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Sunglasses wire construction */}
            <div className="relative z-10 flex items-center">
              {/* Left Lens */}
              <div className="w-14 h-11 rounded-b-[45%] rounded-t-[30%] bg-gradient-to-b from-[#312316] to-[#0d0a08] border-2 border-yellow-500/50 shadow-2xl relative flex items-center justify-center">
                <div className="absolute top-1 left-2 w-3 h-0.5 bg-white/20 rounded-full rotate-[-15deg]"></div>
              </div>
              
              {/* Bridge */}
              <div className="w-6 h-1.5 border-t-2 border-yellow-500/50 relative top-[-6px]"></div>
              
              {/* Right Lens */}
              <div className="w-14 h-11 rounded-b-[45%] rounded-t-[30%] bg-gradient-to-b from-[#312316] to-[#0d0a08] border-2 border-yellow-500/50 shadow-2xl relative flex items-center justify-center">
                <div className="absolute top-1 left-2 w-3 h-0.5 bg-white/20 rounded-full rotate-[-15deg]"></div>
              </div>
            </div>
            
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">UV400 Luxury</span>
          </div>
        );
      case "tshirt":
        return (
          <div className={`w-full ${sizeClass} bg-[#141416] rounded-none relative flex items-center justify-center overflow-hidden border border-white/5`}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Minimalist tshirt layout */}
            <div className="relative z-10 flex flex-col items-center">
              <svg className="w-20 h-20 text-[#2c2c32] hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2H14.5C14.2 3.1 13.2 4 12 4C10.8 4 9.8 3.1 9.5 2H6L2 5V8.5L5 9.5V22H19V9.5L22 8.5V5L18 2M12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" />
              </svg>
              <span className="absolute top-[48px] text-[6px] font-mono font-bold tracking-widest text-[#f59e0b] bg-black/40 px-1 py-0.5 rounded-sm">240 GSM</span>
            </div>
            
            <span className="absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em] text-[#a1a1aa] bg-white/5 border border-white/10 px-2 py-0.5 uppercase font-medium">Boxy Fit</span>
          </div>
        );
      default:
        return (
          <div className={`w-full ${sizeClass} bg-[#161618] rounded-none flex items-center justify-center border border-white/5`}>
            <ShoppingCart className="w-8 h-8 text-white/20" />
          </div>
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {initialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-zinc-900 overflow-hidden select-none font-sans"
          >
            {/* Futuristic glowing particle background */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.04)_1px,transparent_1px)] [background-size:24px_24px]"></div>
            
            {/* Animated glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-[100px] animate-pulse [animation-delay:1.5s]"></div>

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8 text-center space-y-8">
              
              {/* Premium Circular Logo with Golden Glow (No Rotation Effect) */}
              <div className="w-40 h-40 sm:w-44 sm:h-44 relative flex items-center justify-center">
                {/* Golden glowing backdrop ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-400 opacity-20 blur-md"></div>
                
                {/* Custom Double Border Wrapper */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-yellow-500/80 p-1 bg-white shadow-[0_0_30px_rgba(234,179,8,0.2)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden border border-yellow-500/20">
                    <img 
                      src={maduraiGadgetsLogoImg} 
                      alt="Madurai Gadgets 58 Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      decoding="async"
                    />
                  </div>
                </div>
                
                {/* Elegant subtle pulse rings - strictly non-rotating */}
                <div className="absolute inset-0 rounded-full border border-yellow-500/20 animate-pulse"></div>
                <div className="absolute -inset-3 rounded-full border border-yellow-500/10 animate-pulse [animation-delay:1s]"></div>
              </div>

              <div className="space-y-3">
                {/* Main logo mark styled using inside display font style */}
                <h1 className="text-2xl sm:text-3xl font-display font-black tracking-[0.3em] text-zinc-900 bg-gradient-to-r from-zinc-900 via-yellow-600 to-zinc-900 bg-clip-text text-transparent">
                  MG<span className="text-yellow-600">58</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono font-medium">
                  Madurai Gadgets Suite
                </p>
              </div>

              {/* Progress Percent Bar */}
              <div className="w-full space-y-3.5">
                <div className="h-[2px] w-full bg-zinc-100 relative overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-500"
                    style={{ width: `${loadingPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  <span className="text-yellow-600 font-semibold">{loadingText}</span>
                  <span className="text-zinc-800 font-bold">{loadingPercent}%</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans selection:bg-yellow-400/30 selection:text-zinc-900 relative">
      
       {/* Toast Notifier Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            id="toast-notification"
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border text-sm max-w-sm bg-white/85 backdrop-blur-md text-zinc-900 border-zinc-250/50"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
            )}
            <span className="font-semibold tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Premium Navigation bar - Light Translucent Glass Theme */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-45 border-b border-zinc-200/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3.5 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo brandmark + Mobile Cart row */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Logo Brandmark Aeterna style */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] text-zinc-900 font-display uppercase whitespace-nowrap">
                MADURAI GADGETS <span className="font-extrabold text-yellow-500">58</span>
              </span>
              <div className="hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-mono">
                <span className="cursor-default text-yellow-600/85">essential for daily wear</span>
              </div>
            </div>

            {/* Mobile-only Cart Icon */}
            <div className="flex items-center gap-3 sm:hidden">
              <button
                id="cart-drawer-trigger-mobile"
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center bg-white text-zinc-850 transition-all hover:text-yellow-600 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-zinc-800" />
                {cartTotalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[9px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white"
                  >
                    {cartTotalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links Capsule */}
          <nav className="flex items-center justify-start sm:justify-center gap-1.5 bg-zinc-100 p-1.5 rounded-full border border-zinc-200 w-full sm:w-auto overflow-x-auto scrollbar-none px-3.5 sm:px-1.5 shadow-inner">
            <button
              id="shop-nav-tab"
              onClick={() => setActiveTab("shop")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "shop"
                  ? "bg-white text-zinc-900 font-bold border border-zinc-200 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Collections
            </button>
            <button
              id="tracker-nav-tab"
              onClick={() => {
                setActiveTab("tracker");
                if (orders.length > 0 && !selectedOrder) {
                  setSelectedOrder(orders[0]);
                }
              }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "tracker"
                  ? "bg-white text-zinc-900 font-bold border border-zinc-200 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Order Status 
              {orders.length > 0 && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>
          </nav>

          {/* Desktop-only Cart Icon trigger and quick controls */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              id="cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center bg-white text-zinc-800 hover:bg-zinc-50 transition-all hover:text-yellow-600 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-zinc-800" />
              {cartTotalItems > 0 && (
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[9px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white"
                >
                  {cartTotalItems}
                </motion.span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main body Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 py-4 sm:py-8">
        
        {/* SHOPPING SUBVIEW INDEX */}
        {activeTab === "shop" && (
          <div className="space-y-12">
            
            {/* Minimalist Hero spotlight with Loop Video Background */}
            <section className="bg-gradient-to-br from-white via-zinc-50 to-white rounded-md p-6 xs:p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-zinc-200 shadow-sm flex flex-col justify-between min-h-[500px]">
              
              {/* Loop Video Background (Native white background watch components) */}
              <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover opacity-65"
                >
                  <source src="https://res.cloudinary.com/drtndbcbu/video/upload/v1782845960/WhatsApp_Video_2026-06-30_at_12.07.48_PM_nntfpt.mp4" type="video/mp4" />
                </video>
                {/* Overlay gradient shroud for crisp text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/35 to-white/70"></div>
              </div>
              
              {/* Custom Hero backdrop image if active */}
              {customHeroImage && heroLayout === "backdrop" && (
                <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-10">
                  <img src={customHeroImage} alt="Hero Backdrop" className="w-full h-full object-cover filter blur-[1px]" referrerPolicy="no-referrer" decoding="async" loading="lazy" />
                </div>
              )}
 
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8 flex flex-col items-center w-full mt-[-15px] sm:mt-[-35px]"
              >
                <div className="space-y-2.5 sm:space-y-4">
                  <motion.span 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.4em] text-yellow-600 block font-mono font-bold"
                  >
                    ⚡ WELCOME TO THE FUTURE OF WATCH COLLECTION
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="select-none flex flex-col pt-1 font-syne uppercase"
                  >
                    <span className="bg-gradient-to-r from-amber-500 via-yellow-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent font-extrabold tracking-tight text-3xl xs:text-4xl sm:text-7xl lg:text-8xl leading-[1.1] mb-1 sm:mb-3 drop-shadow-[0_2px_8px_rgba(180,83,9,0.25)] select-none">
                      Madurai Gadgets
                    </span>
                    <span className="block text-zinc-900 font-bold tracking-[0.05em] text-lg xs:text-2xl sm:text-4xl lg:text-5xl leading-tight">
                      Wear Peak
                    </span>
                    <span className="block text-zinc-500 font-light tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-sm lg:text-base mt-1.5 sm:mt-2">
                      Master Your Style
                    </span>
                  </motion.h1>
                </div>
 
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex flex-wrap justify-center items-center gap-3 sm:gap-4"
                >
                  <button
                    onClick={() => {
                      document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3 sm:px-10 sm:py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black transition-all shadow-md cursor-pointer hover:scale-102 active:scale-95"
                  >
                    Explore Collection
                  </button>
                </motion.div>
              </motion.div>

              {/* Bottom micro trust metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-zinc-150 mt-16 text-xs text-zinc-500 relative z-10">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-800 uppercase tracking-wider text-[10px]">A+ Mastercopy</p>
                    <p className="text-[10px] text-zinc-500">First-Class Premium Quality</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-800 uppercase tracking-wider text-[10px]">Madurai Delivery</p>
                    <p className="text-[10px] text-zinc-500">Complimentary shipping pan India</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-800 uppercase tracking-wider text-[10px]">6-12 Months Warranty</p>
                    <p className="text-[10px] text-zinc-500">Covers machine sweep & battery</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-800 uppercase tracking-wider text-[10px]">Secure Checks</p>
                    <p className="text-[10px] text-zinc-500">WhatsApp confirmation support</p>
                  </div>
                </div>
              </div>
            </section>

            {/* AMAZON/FLIPKART VISUAL CIRCULAR CATEGORY DECK */}
            <div className="bg-white rounded-md border border-zinc-200 p-4 shadow-sm overflow-x-auto scrollbar-none" id="visual-category-deck">
              <div className="flex gap-4 sm:gap-10 md:gap-14 min-w-max sm:justify-center px-2">
                {[
                  { id: "All", label: "All Products", image: catAllProductsImg },
                  { id: "Premier Watches", label: "Premier Watches", image: catPremierWatchesImg },
                  { id: "Normal Watches", label: "Normal Watches", image: catPremierWatchesImg },
                  { id: "Japanese Model Watches", label: "Japanese Models", image: catJapaneseWatchesImg },
                  { id: "Bluetooth Speakers", label: "Speakers", image: catSpeakersImg },
                  { id: "Sunglasses", label: "Sunglasses", image: catSunglassesImg },
                  { id: "Fashion", label: "Fashion T-Shirts", image: catFashionTshirtsImg, isComingSoon: true }
                ].map((item) => {
                  const isActive = selectedCategory === item.id;
                  const isComingSoon = item.isComingSoon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (isComingSoon) {
                          triggerToast("👕 Fashion T-Shirts coming soon! Stay tuned, machan. ✨", "info");
                          return;
                        }
                        setSelectedCategory(item.id);
                        document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex flex-col items-center gap-2 group cursor-pointer transition-all relative"
                    >
                      <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center bg-white border-2 transition-all relative ${
                        isActive 
                          ? "border-yellow-400 scale-105 shadow-md" 
                          : isComingSoon
                            ? "border-zinc-200 opacity-60 grayscale-[30%]"
                            : "border-zinc-200 group-hover:border-yellow-300"
                      }`}>
                        <img 
                          src={item.image} 
                          alt={item.label}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          decoding="async"
                          loading="lazy"
                        />
                        {isComingSoon && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-[8px] sm:text-[9px] font-mono text-yellow-400 font-extrabold uppercase bg-black/70 px-1 py-0.5 rounded-xs tracking-wider">
                              Soon
                            </span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold font-sans tracking-tight relative ${
                        isActive 
                          ? "text-yellow-600 font-extrabold" 
                          : isComingSoon
                            ? "text-zinc-400"
                            : "text-zinc-650 group-hover:text-yellow-600"
                      }`}>
                        {item.label}
                        {isComingSoon && (
                          <span className="block text-[8px] text-yellow-500 font-extrabold uppercase tracking-wider mt-0.5 animate-pulse">
                            Coming Soon
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI PREMIER SPOTLIGHT - ANIMATED INTERACTIVE CAROUSEL */}
            <section className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-850 text-zinc-100 rounded-md border border-zinc-800/80 p-6 sm:p-10 relative overflow-hidden shadow-xl" id="ai-premier-spotlight">
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.06)_0%,transparent_75%)] pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left Side: Images with sliding animation */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative">
                  {/* Category Title Header for context */}
                  <div className="absolute -top-6 left-0 flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-yellow-450 animate-pulse" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-yellow-400">
                      PREMIER SHOWCASE
                    </span>
                  </div>

                  {/* Navigation & Large main product box frame wrapper */}
                  <div className="relative w-full max-w-[280px] sm:max-w-[340px] flex items-center justify-center px-4 mt-2">
                    {/* Left Navigation Arrow (Beautifully positioned glassmorphic control) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSpotlightIndex((prev) => (prev - 1 + AI_SPOTLIGHT_WATCHES.length) % AI_SPOTLIGHT_WATCHES.length);
                      }}
                      className="absolute -left-2 sm:-left-12 lg:-left-16 z-20 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-200 hover:text-white hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                      title="Previous Watch"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Main watch showcase container as a modern premium rounded rectangle/box */}
                    <div className="relative w-full aspect-square rounded-2xl p-3 bg-zinc-900/90 shadow-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {/* Subtle elegant inner gradient/aura */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
                      
                      {/* Round Grid Background behind the watch */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                        {/* Rotating outer dash circle */}
                        <div className="absolute w-[92%] h-[92%] rounded-full border border-dashed border-zinc-700/40 animate-[spin_100s_linear_infinite]" />
                        {/* Dot pattern/radar ring */}
                        <div className="absolute w-[76%] h-[76%] rounded-full border border-dotted border-yellow-500/20" />
                        {/* Slow reverse rotating dash circle */}
                        <div className="absolute w-[56%] h-[56%] rounded-full border border-dashed border-zinc-700/50 animate-[spin_60s_linear_infinite_reverse]" />
                        {/* Center circle target */}
                        <div className="absolute w-[36%] h-[36%] rounded-full border border-zinc-800" />
                        
                        {/* Horizontal & Vertical Crosshair Lines */}
                        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent" />
                        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-zinc-800/30 to-transparent" />
                        
                        {/* Glowing indicator dots */}
                        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-500/40 rounded-full animate-ping" />
                        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-500/40 rounded-full animate-ping [animation-delay:1.5s]" />
                      </div>
                      
                      {/* Smooth box content entrance and sliding animation container */}
                      <div className="w-full h-full rounded-xl overflow-hidden bg-transparent flex items-center justify-center p-4 relative z-10">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={spotlightIndex}
                            initial={{ opacity: 0, scale: 0.9, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.93, y: -15 }}
                            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                            src={AI_SPOTLIGHT_WATCHES[spotlightIndex].image}
                            alt={AI_SPOTLIGHT_WATCHES[spotlightIndex].name}
                            className="w-full h-full object-contain rounded-xl select-none"
                            style={{
                              imageRendering: "auto",
                              WebkitFontSmoothing: "antialiased",
                              filter: "contrast(1.03) saturate(1.03) drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
                            }}
                            referrerPolicy="no-referrer"
                          />
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Right Navigation Arrow (Beautifully positioned glassmorphic control) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSpotlightIndex((prev) => (prev + 1) % AI_SPOTLIGHT_WATCHES.length);
                      }}
                      className="absolute -right-2 sm:-right-12 lg:-right-16 z-20 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-200 hover:text-white hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                      title="Next Watch"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Watch category slide visual indicators */}
                  <div className="flex gap-2.5 mt-6">
                    {AI_SPOTLIGHT_WATCHES.map((watch, idx) => (
                      <button
                        key={watch.id}
                        type="button"
                        onClick={() => setSpotlightIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === spotlightIndex 
                            ? "w-8 bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]" 
                            : "w-2.5 bg-zinc-700 hover:bg-yellow-400/65"
                        }`}
                        title={watch.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Side: Details and checkout */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* Special Premium Copy Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-yellow-400 border border-yellow-500/20 bg-yellow-450/5 px-2 py-0.5 rounded-sm uppercase">
                        💎 {AI_SPOTLIGHT_WATCHES[spotlightIndex].badge}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-wider">
                        PREMIER COPIES COLLECTION
                      </span>
                    </div>

                    {/* Brand and Watch Title */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-yellow-400 font-bold">
                        {AI_SPOTLIGHT_WATCHES[spotlightIndex].brand} CERTIFIED REPLICA
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold sm:font-black uppercase tracking-tight text-white font-sans leading-tight">
                        {AI_SPOTLIGHT_WATCHES[spotlightIndex].name}
                      </h3>
                    </div>

                    {/* Pricing with instant discount display */}
                    <div className="flex items-baseline gap-3.5 pt-1">
                      <span className="text-2xl sm:text-3xl font-mono font-black text-yellow-400">
                        ₹{AI_SPOTLIGHT_WATCHES[spotlightIndex].price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm font-mono text-zinc-500 line-through">
                        ₹{(AI_SPOTLIGHT_WATCHES[spotlightIndex].price * 1.5).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-sans font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 uppercase tracking-wide">
                        33% OFF SALE
                      </span>
                    </div>

                    {/* Sales description */}
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {AI_SPOTLIGHT_WATCHES[spotlightIndex].description}
                    </p>

                    {/* Interactive Specs Checklist */}
                    <div className="bg-zinc-900/50 border border-zinc-800 p-3 sm:p-4 rounded-sm space-y-2.5 mt-2">
                      <p className="text-[9px] font-mono text-yellow-400 font-bold uppercase tracking-widest">
                        Technical Master Copy Specs:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {AI_SPOTLIGHT_WATCHES[spotlightIndex].specs.map((spec, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-[11px] text-zinc-300">
                            <span className="text-yellow-400 mt-0.5 shrink-0">✦</span>
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Core CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => handleSpotlightAddToCart(AI_SPOTLIGHT_WATCHES[spotlightIndex])}
                      className="flex-1 px-5 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-black text-[11px] uppercase tracking-widest transition-all shadow-md hover:shadow-yellow-500/10 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpotlightWhatsAppBuy(AI_SPOTLIGHT_WATCHES[spotlightIndex])}
                      className="flex-1 px-5 py-3.5 bg-transparent border border-yellow-400/50 text-yellow-450 hover:bg-yellow-400/10 hover:text-yellow-300 font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Phone className="w-4 h-4" />
                      WhatsApp Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpotlightViewDetails(AI_SPOTLIGHT_WATCHES[spotlightIndex])}
                      className="px-4 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      Specs ⚙️
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Flipkart-themed Category & Filter Action Bar */}
            <section className="space-y-6" id="catalog-section">
              
              <div className="bg-white rounded-md shadow-sm border border-zinc-200 p-4 sm:p-5 flex flex-col gap-4">
                
                {/* Header title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                      Explore watch Deals
                      <span className="text-[11px] font-sans font-bold bg-yellow-400/20 text-yellow-850 border border-yellow-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        Madurai Gadgets Copies
                      </span>
                    </h2>
                    <p className="text-zinc-500 text-xs font-medium">
                      Showing {filteredProducts.length} premium masterwatches under festival discount
                    </p>
                  </div>
                  
                </div>

                {/* Search input field row */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search 500+ premium watches... (e.g. Rolex, Royal Oak, Nautilus, Daytona, Gold President)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 rounded-sm text-sm text-zinc-900 placeholder-zinc-400 font-medium transition-all focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters container */}
                <div className="flex flex-col gap-4">
                  
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-2">Category:</span>
                    {["All", "Premier Watches", "Normal Watches", "Japanese Model Watches", "Bluetooth Speakers", "Sunglasses", "Fashion"].map((cat) => {
                      const isComingSoon = cat === "Fashion";
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            if (isComingSoon) {
                              triggerToast("👕 Fashion T-Shirts category coming soon! Stay tuned, machan. ✨", "info");
                              return;
                            }
                            setSelectedCategory(cat);
                          }}
                          className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all border cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-yellow-400 text-zinc-950 border-yellow-500 shadow-sm font-black"
                              : isComingSoon
                                ? "bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-50"
                                : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border-zinc-200"
                          }`}
                        >
                          {cat === "All" ? "All Products" : cat}
                          {isComingSoon && " (Coming Soon)"}
                        </button>
                      );
                    })}
                  </div>

                  {/* Gender Category Filter (Mens and Womens Watches) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-zinc-100">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-2">Gender:</span>
                    {[
                      { id: "All", label: "All Items / Unisex 🌟" },
                      { id: "Men", label: "Men's Special 👨" },
                      { id: "Women", label: "Women's Collection 👩" }
                    ].map((genderOption) => {
                      const isGenderActive = selectedGender === genderOption.id;
                      return (
                        <button
                          key={genderOption.id}
                          onClick={() => setSelectedGender(genderOption.id as any)}
                          className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all border cursor-pointer ${
                            isGenderActive
                              ? "bg-yellow-400 text-zinc-950 border-yellow-500 shadow-sm font-black"
                              : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border-zinc-200"
                          }`}
                        >
                          {genderOption.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sorting controls bar & stock */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1.5 border-t border-zinc-100">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1">Sort By:</span>
                      <button
                        onClick={() => setSortBy("relevance")}
                        className={`text-xs px-2.5 py-1 font-bold ${
                          sortBy === "relevance"
                            ? "text-yellow-600 border-b-2 border-yellow-500"
                            : "text-zinc-500 hover:text-yellow-600"
                        }`}
                      >
                        Popularity
                      </button>
                      <button
                        onClick={() => setSortBy("low-high")}
                        className={`text-xs px-2.5 py-1 font-bold ${
                          sortBy === "low-high"
                            ? "text-yellow-600 border-b-2 border-yellow-500"
                            : "text-zinc-500 hover:text-yellow-600"
                        }`}
                      >
                        Price: Low to High
                      </button>
                      <button
                        onClick={() => setSortBy("high-low")}
                        className={`text-xs px-2.5 py-1 font-bold ${
                          sortBy === "high-low"
                            ? "text-yellow-600 border-b-2 border-yellow-500"
                            : "text-zinc-500 hover:text-yellow-600"
                        }`}
                      >
                        Price: High to Low
                      </button>
                      <button
                        onClick={() => setSortBy("rating")}
                        className={`text-xs px-2.5 py-1 font-bold ${
                          sortBy === "rating"
                            ? "text-yellow-600 border-b-2 border-yellow-500"
                            : "text-zinc-500 hover:text-yellow-600"
                        }`}
                      >
                        Customer Rating
                      </button>
                    </div>

                    {/* Stock Checkbox filter */}
                    <div className="flex items-center gap-2 self-start lg:self-auto border-l-0 lg:border-l lg:pl-4 border-zinc-200 py-1">
                      <input
                        type="checkbox"
                        id="showLowStockCheckbox"
                        checked={showLowStockOnly}
                        onChange={(e) => setShowLowStockOnly(e.target.checked)}
                        className="w-4 h-4 text-yellow-600 bg-white rounded-sm border-zinc-200 focus:ring-yellow-500 focus:ring-2"
                      />
                      <label id="checkbox-label" htmlFor="showLowStockCheckbox" className="text-xs font-bold text-zinc-700 cursor-pointer select-none">
                        ⚡ Hard-to-Find / Low Stock Deals
                      </label>
                    </div>

                  </div>

                </div>

              </div>

              {/* Products list grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-zinc-200 bg-white rounded-md space-y-4 shadow-sm">
                  <CircleAlert className="w-10 h-10 text-zinc-300 mx-auto" />
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">No Matching Watches Found</h3>
                  <p className="text-xs text-zinc-500 font-medium max-w-xs mx-auto">Try customizing your search query, selecting another category, or unchecking the Low Stock filter.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedGender("All");
                      setShowLowStockOnly(false);
                      setSortBy("relevance");
                    }}
                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-black uppercase rounded-sm transition-all cursor-pointer shadow-md inline-block"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                  {visibleProducts.map((product) => {
                    const isLowStock = product.stock <= 5;
                    const marketPrice = Math.round(product.price / 0.88);
                    const discountPercentage = Math.round(((marketPrice - product.price) / marketPrice) * 100);
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white rounded-md border border-zinc-200 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-yellow-500 transition-all duration-300 relative overflow-hidden"
                      >
                        
                        {/* Artwork/Illustration container section with solid gray backplate */}
                        <div className="p-2 sm:p-3 bg-zinc-50 relative border-b border-zinc-200 flex flex-col items-center justify-center">
                          <button
                            onClick={() => setDetailedProduct(product)}
                            className="w-full block group-hover:rotate-2 group-hover:scale-[1.03] transition-transform duration-500 ease-out cursor-pointer text-center"
                          >
                            {renderProductIllustration(cardActiveImages[product.id] || product.image, "h-32 sm:h-56")}
                          </button>

                          {/* 4 Color Variations Grid */}
                          {product.variations && product.variations.length > 0 && (
                            <div className="flex gap-2 justify-center mt-2.5 mb-1 relative z-10">
                              {product.variations.map((v, i) => {
                                const isCurrent = (cardActiveImages[product.id] || product.image) === v.image;
                                return (
                                  <button 
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Avoid triggering detailedProduct specs modal
                                      setCardActiveImages(prev => ({ ...prev, [product.id]: v.image }));
                                    }} 
                                    className={`w-5 h-5 rounded-full border border-zinc-300 hover:scale-115 transition-all cursor-pointer shadow-xs ${
                                      isCurrent ? "ring-2 ring-yellow-400 ring-offset-1 scale-110" : ""
                                    }`}
                                    style={{ backgroundColor: v.color }} 
                                    title={v.color}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {/* Top Stock/Warranty/Discount Overlays */}
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-zinc-950 text-[8px] sm:text-[9px] font-black tracking-wider px-1 sm:px-1.5 py-0.5 rounded-sm italic uppercase shadow-xs">
                              M'Assured ✦
                            </span>
                            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-md uppercase tracking-wider animate-pulse">
                              🔥 {discountPercentage}% OFF
                            </span>
                          </div>

                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                            {isLowStock ? (
                              <span className="bg-red-50 text-red-650 border border-red-200 px-1 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase rounded-full">
                                {product.stock} Left!
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 border border-green-200 px-1 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase rounded-full">
                                Free Delivery
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metadata card details in premium dark layout */}
                        <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between bg-white text-zinc-900">
                          <div className="space-y-1.5 sm:space-y-2">
                            
                            {/* Star ratings and type pill */}
                            <div className="flex items-center gap-1 sm:gap-2">
                              {/* Green Rating pills exactly like Flipkart */}
                              <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 bg-green-600 text-white text-[9px] sm:text-[10px] font-extrabold rounded-sm">
                                {product.rating} <Star className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-white text-white shrink-0" />
                              </span>
                              <span className="text-[9px] sm:text-[11px] font-medium text-zinc-500 font-sans">
                                ({product.reviewsCount} Reviews)
                              </span>
                            </div>
                            
                            {/* Watch brand name heading */}
                            <button
                              onClick={() => setDetailedProduct(product)}
                              className="text-left block text-zinc-900 group-hover:text-yellow-600 transition-colors"
                            >
                              <h3 className="font-sans font-bold text-xs sm:text-base text-zinc-900 leading-snug line-clamp-2 h-8 sm:h-11">
                                {product.name}
                              </h3>
                            </button>

                            {/* Short descriptor - hide on mobile to keep compact view */}
                            <p className="text-zinc-500 text-[10px] sm:text-xs leading-relaxed line-clamp-2 h-7 sm:h-10 hidden sm:block">
                              {product.description}
                            </p>
                          </div>

                          <div className="space-y-2 sm:space-y-4 pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-zinc-100">
                            {/* Pricing and savings details exactly like Amazon/Flipkart */}
                            <div>
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <span className="text-sm sm:text-2xl font-black text-zinc-900 tracking-tight font-sans">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] sm:text-xs line-through text-zinc-400 font-sans">
                                  ₹{marketPrice.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] sm:text-xs text-green-600 font-extrabold font-sans">
                                  {discountPercentage}% off
                                </span>
                              </div>
                              <span className="text-[8px] sm:text-[10px] text-zinc-500 font-semibold block sm:font-bold">
                                Incl. of taxes
                              </span>
                            </div>

                            {/* Standard yellow/orange action controllers */}
                            <div className="grid grid-cols-2 gap-1 sm:gap-2">
                              <button
                                onClick={() => setDetailedProduct(product)}
                                className="w-full py-1.5 sm:py-2 border border-zinc-250 hover:border-zinc-350 bg-zinc-50 text-zinc-600 text-[9px] sm:text-xs font-bold uppercase rounded-sm transition-all cursor-pointer text-center"
                              >
                                Specs
                              </button>
                              {(() => {
                                const cartItem = cart.find(item => item.product.id === product.id);
                                if (cartItem) {
                                  return (
                                    <div className="w-full py-1 sm:py-1.5 bg-yellow-400 text-zinc-950 text-[10px] sm:text-xs font-bold uppercase rounded-sm shadow-sm flex items-center justify-between px-1.5 sm:px-2 border border-yellow-500">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateCartQty(product.id, -1);
                                        }}
                                        className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                      >
                                        <Minus className="w-3 h-3 stroke-[2.5]" />
                                      </button>
                                      <span className="font-mono font-bold text-xs sm:text-sm select-none">{cartItem.quantity}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateCartQty(product.id, 1);
                                        }}
                                        className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                      >
                                        <Plus className="w-3 h-3 stroke-[2.5]" />
                                      </button>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product, 1);
                                      }}
                                      className="w-full py-1.5 sm:py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 text-[9px] sm:text-xs font-black uppercase rounded-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1 border border-yellow-500/10"
                                    >
                                      <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-950" />
                                      Add
                                    </button>
                                  );
                                }
                              })()}
                            </div>

                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION DEALS LOADER */}
              {filteredProducts.length > visibleCount && (
                <div className="flex flex-col items-center justify-center pt-8 pb-4">
                  <p className="text-xs text-zinc-500 font-bold mb-3">
                    Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} premium watches matching your selection
                  </p>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-black uppercase tracking-wider rounded-sm shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    ⚡ Show More Premium Watches ⚡
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
          
          {/* ORDER TRACKING SUBVIEW PAGE */}
          {activeTab === "tracker" && (
            <div className="space-y-8 animate-fadeIn" id="order-tracker-portal">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="font-display font-black text-2xl tracking-[0.05em] uppercase text-gray-900">Order Delivery Status</h2>
                <p className="text-gray-500 text-xs font-semibold mt-1">Review current fulfillment logs, tracking updates, and invoices.</p>
              </div>

              {/* ST COURIER LIVE TRACKING SEARCH BAR CONSOLE */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-5 rounded-md shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse"></span>
                  <h3 className="text-xs font-mono font-black text-red-650 uppercase tracking-widest">ST Courier Pvt Ltd - Live Consignment Tracker</h3>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Enter your *MDU Order Reference ID* or *ST Courier Consignment Number* (e.g., ST940125) to track your watch parcel journey in real-time across Tamil Nadu:
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = trackingSearchQuery.trim();
                    if (!q) {
                      triggerToast("Please enter an Order ID or ST Courier ID, machan!", "info");
                      return;
                    }
                    const found = orders.find(
                      (o) =>
                        o.id.toLowerCase() === q.toLowerCase() ||
                        (o.stCourierId && o.stCourierId.toLowerCase() === q.toLowerCase())
                    );
                    if (found) {
                      setFoundOrder(found);
                      setSelectedOrder(found);
                      setIsSearched(true);
                      triggerToast("Shipment Located successfully! ✨", "success");
                    } else {
                      setFoundOrder(null);
                      setIsSearched(true);
                      triggerToast("No shipment matching this ID found.", "info");
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-2 max-w-xl"
                >
                  <input
                    type="text"
                    placeholder="Enter Order ID (MDU-xxxxxx) or ST Courier ID..."
                    value={trackingSearchQuery}
                    onChange={(e) => setTrackingSearchQuery(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 px-3.5 py-2.5 rounded-sm text-xs font-bold text-gray-950 focus:border-red-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-650 hover:bg-red-750 text-white font-black uppercase text-[10px] tracking-wider rounded-sm transition-all shadow-sm cursor-pointer"
                    >
                      🔍 Track Shipment
                    </button>
                    {isSearched && (
                      <button
                        type="button"
                        onClick={() => {
                          setTrackingSearchQuery("");
                          setFoundOrder(null);
                          setIsSearched(false);
                          if (orders.length > 0) {
                            setSelectedOrder(orders[0]);
                          } else {
                            setSelectedOrder(null);
                          }
                        }}
                        className="px-4 py-2.5 bg-gray-200 hover:bg-gray-350 text-gray-700 font-black uppercase text-[10px] tracking-wider rounded-sm transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* SEARCH ERROR CASE */}
              {isSearched && !foundOrder ? (
                <div className="py-12 px-6 text-center border border-dashed border-red-200 bg-red-50/50 rounded-md max-w-xl mx-auto space-y-4">
                  <CircleAlert className="w-10 h-10 text-red-500 mx-auto shrink-0" />
                  <h3 className="font-display font-black tracking-wide text-red-700 uppercase text-sm">NO CONSIGNMENT FOUND</h3>
                  <p className="text-xs text-gray-600 font-medium max-w-xs mx-auto leading-relaxed">
                    We couldn't locate any active watch package with tracking key <b className="text-gray-900 font-bold">"{trackingSearchQuery}"</b>. If your order was placed recently, the ST Courier consignment ID might still be pending assignment in our hub.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <a
                      href={`https://wa.me/919585969334?text=Vanakkam%20Machan!%20I%20placed%20an%20order%20and%20I%20need%20to%20know%20my%20ST%20Courier%20tracking%20id.%20My%20order%20reference%20key%20is%20${encodeURIComponent(trackingSearchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-650 hover:bg-emerald-750 text-white text-[10px] font-black uppercase tracking-wider rounded-sm transition-all inline-flex items-center gap-1"
                    >
                      💬 Ask on WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setTrackingSearchQuery("");
                        setFoundOrder(null);
                        setIsSearched(false);
                        if (orders.length > 0) {
                          setSelectedOrder(orders[0]);
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all"
                    >
                      Show All Registered Orders
                    </button>
                  </div>
                </div>
              ) : orders.length === 0 && !isSearched ? (
                <div className="py-20 text-center border border-dashed border-gray-300 bg-white rounded-md max-w-xl mx-auto space-y-4 shadow-sm">
                  <Truck className="w-10 h-10 text-gray-300 mx-auto shrink-0" />
                  <h3 className="font-display font-black tracking-wide text-gray-800 uppercase text-base">No active shipments catalogued</h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">You haven't checked out any items in this browser session yet. Select premium watches from the collections tab to start.</p>
                  <button
                    onClick={() => setActiveTab("shop")}
                    className="px-6 py-3 border border-gray-200 bg-white hover:bg-yellow-400 text-gray-800 hover:text-gray-950 hover:border-yellow-500 text-[11px] uppercase tracking-widest font-black transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Return to Store Shop
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Orders Left-sidebar list */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-[9px] font-bold tracking-[0.25em] text-gray-500 uppercase">Registered Deliveries ({orders.length})</h3>
                      {isSearched && (
                        <button
                          onClick={() => {
                            setTrackingSearchQuery("");
                            setFoundOrder(null);
                            setIsSearched(false);
                            if (orders.length > 0) setSelectedOrder(orders[0]);
                          }}
                          className="text-[9px] font-mono text-blue-600 hover:underline font-bold"
                        >
                          Show All
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {orders.map((o) => {
                        const isSelected = selectedOrder?.id === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => {
                              setSelectedOrder(o);
                              setFoundOrder(o);
                            }}
                            className={`w-full text-left p-4 rounded-sm border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? "bg-yellow-50/70 border-yellow-500 text-gray-900 shadow-sm font-bold"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold tracking-wider text-gray-900">{o.id}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{o.date.split(" at ")[0]}</span>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1">
                              <span className="text-xs text-gray-500 truncate max-w-[120px] font-medium">
                                {o.items.map((i) => i.product.name).join(", ")}
                              </span>
                              <span className="font-mono text-xs font-bold text-gray-900">
                                ₹{o.total.toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-mono text-gray-400 font-semibold">{o.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                                {o.stCourierId && (
                                  <span className="text-[9px] font-mono text-red-600 font-black">📦 ST: {o.stCourierId}</span>
                                )}
                              </div>
                              <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${
                                o.status === "Processing" ? "bg-yellow-50 text-yellow-800 border-yellow-200 font-bold" :
                                o.status === "Shipped" ? "bg-blue-50 text-blue-800 border-blue-200 font-bold" :
                                "bg-green-50 text-green-800 border-green-200 font-bold"
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracking Detail Panel */}
                  <div className="lg:col-span-8 font-normal">
                    {selectedOrder ? (
                      <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-8 space-y-8 shadow-sm">
                        
                        {/* Tracker Top Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                          <div>
                            <div className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-300 px-2.5 py-0.5 rounded-sm text-[10px] font-mono text-yellow-800 tracking-widest uppercase font-bold">
                              Tracker Active
                            </div>
                            <h3 className="font-display font-black text-xl text-gray-900 mt-3">Fulfillment Reference {selectedOrder.id}</h3>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">Receipt logged on: {selectedOrder.date}</p>
                          </div>
                          
                          <div className="text-left sm:text-right">
                            <p className="text-[9px] font-mono text-yellow-600 uppercase tracking-[0.2em] font-bold">Grand Total Payment</p>
                            <p className="font-mono text-2xl font-black tracking-tight text-gray-900">₹{selectedOrder.total.toLocaleString("en-IN")}</p>
                          </div>
                        </div>

                        {/* PDF Receipt Download Alert box */}
                        {selectedOrder.paymentStatus === "Paid" ? (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                            <div>
                              <p className="text-xs font-bold text-green-800 uppercase tracking-wider font-mono">Invoice Receipt Unlocked 📜</p>
                              <p className="text-[11px] text-green-700 mt-0.5 font-medium">Your payment is verified. You can now download the premium gold-bordered receipt PDF.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPrintingOrder(selectedOrder)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm text-xs font-mono font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Download Invoice PDF</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                            <div>
                              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">Verification Pending ⏳</p>
                              <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Your order is logged. Once payment is verified by our admin, your premium PDF receipt will unlock here.</p>
                            </div>
                            <a
                              href={`https://wa.me/919585969334?text=${encodeURIComponent(`Vanakkam Machan! I have placed order ${selectedOrder.id}. Please verify my payment reference/UTR so I can download my PDF receipt!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-sm text-xs font-mono font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors font-bold"
                            >
                              <MessageSquare className="w-4 h-4 text-gray-950" />
                              <span>Message Admin</span>
                            </a>
                          </div>
                        )}

                        {/* ST COURIER OFFICIAL SHIPPING TRACKING TICKET SLIP */}
                        {selectedOrder.stCourierId && (
                          <div className="border-2 border-dashed border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-white p-5 rounded-md text-xs space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-yellow-200 pb-3 gap-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-red-650 text-yellow-300 font-black px-2 py-1 text-xs tracking-tight rounded-sm">ST COURIER</div>
                                <span className="font-mono text-[10px] font-black text-gray-500">TAMIL NADU EXPRESS CARGO</span>
                              </div>
                              <span className="font-mono text-[11px] font-black text-red-650 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                CONSIGNMENT ID: {selectedOrder.stCourierId}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[10px] text-gray-700">
                              <div>
                                <span className="block text-[8px] text-gray-400 uppercase font-black">Origin Hub</span>
                                <span className="font-black text-gray-900">Madurai Branch (MDU)</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-gray-400 uppercase font-black">Destination Hub</span>
                                <span className="font-black text-gray-900">{(selectedOrder.shipping.city || "Madurai Office").toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-gray-400 uppercase font-black">Service Type</span>
                                <span className="font-black text-yellow-800">Priority Air Delivery</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-gray-400 uppercase font-black">Current Status</span>
                                <span className={`font-black uppercase ${
                                  selectedOrder.status === "Delivered" ? "text-green-600" : "text-blue-600 animate-pulse"
                                }`}>
                                  {selectedOrder.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Amazon/Flipkart Premium Step Progress Tracker */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-md space-y-8 select-none">
                          <p className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Live Shipment Progress Timelines</p>
                          
                          {/* Stepper Container */}
                          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                            {/* Horizontal Line connecting steps (Desktop) */}
                            <div className="absolute top-[22px] left-[5%] right-[5%] h-1 bg-zinc-200 hidden md:block z-0">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 via-yellow-450 to-green-600 transition-all duration-500" 
                                style={{ 
                                  width: selectedOrder.status === "Processing" ? "33%" : 
                                         selectedOrder.status === "Shipped" ? "66%" : "100%" 
                                }}
                              />
                            </div>

                            {/* Vertical Line connecting steps (Mobile) */}
                            <div className="absolute left-[22px] top-4 bottom-4 w-1 bg-zinc-200 block md:hidden z-0">
                              <div 
                                className="w-full bg-gradient-to-b from-green-500 via-yellow-450 to-green-600 transition-all duration-500" 
                                style={{ 
                                  height: selectedOrder.status === "Processing" ? "33%" : 
                                          selectedOrder.status === "Shipped" ? "66%" : "100%" 
                                }}
                              />
                            </div>

                            {/* Step 1: Registered */}
                            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1">
                              <div className="w-12 h-12 rounded-full bg-green-500 text-white border-4 border-white shadow-md flex items-center justify-center shrink-0">
                                <Check className="w-5 h-5 font-black stroke-[3]" />
                              </div>
                              <div className="md:pt-1">
                                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Ordered</h4>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Order Verified</p>
                              </div>
                            </div>

                            {/* Step 2: Quality Checked */}
                            {(() => {
                              const isPassed = selectedOrder.status !== "Processing";
                              const isActive = selectedOrder.status === "Processing";
                              return (
                                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1">
                                  <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                                    isPassed ? "bg-green-500 text-white" : 
                                    isActive ? "bg-yellow-450 text-gray-950 animate-pulse" : 
                                    "bg-zinc-200 text-zinc-400"
                                  }`}>
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  <div className="md:pt-1">
                                    <h4 className={`text-xs font-bold uppercase tracking-wide ${isActive ? "text-yellow-600 font-black" : isPassed ? "text-zinc-900" : "text-zinc-400"}`}>Packed</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Quality Verified</p>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Step 3: Shipped */}
                            {(() => {
                              const isPassed = selectedOrder.status === "Delivered";
                              const isActive = selectedOrder.status === "Shipped";
                              return (
                                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1">
                                  <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                                    isPassed ? "bg-green-500 text-white" : 
                                    isActive ? "bg-yellow-450 text-gray-950 animate-pulse" : 
                                    "bg-zinc-200 text-zinc-400"
                                  }`}>
                                    <Truck className={`w-5 h-5 ${isActive ? "animate-bounce" : ""}`} />
                                  </div>
                                  <div className="md:pt-1">
                                    <h4 className={`text-xs font-bold uppercase tracking-wide ${isActive ? "text-yellow-600 font-black" : isPassed ? "text-zinc-900" : "text-zinc-400"}`}>Shipped</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">In Transit</p>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Step 4: Delivered */}
                            {(() => {
                              const isActive = selectedOrder.status === "Delivered";
                              return (
                                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1">
                                  <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                                    isActive ? "bg-green-600 text-white shadow-green-200/50" : "bg-zinc-200 text-zinc-400"
                                  }`}>
                                    <Award className="w-5 h-5" />
                                  </div>
                                  <div className="md:pt-1">
                                    <h4 className={`text-xs font-bold uppercase tracking-wide ${isActive ? "text-green-600 font-black" : "text-zinc-400"}`}>Delivered</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Handed Over</p>
                                  </div>
                                </div>
                              );
                            })()}

                          </div>
                        </div>

                        {/* ST COURIER LIVE TRANSIT ACTIVITY LOGS */}
                        {selectedOrder.stCourierId && (
                          <div className="pt-6 border-t border-gray-100 space-y-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-red-600" />
                              <h4 className="font-mono text-[9px] font-bold tracking-[0.25em] text-gray-500 uppercase">ST Courier Live Transit Activity log</h4>
                            </div>
                            <div className="border border-gray-100 rounded-sm bg-gray-50 overflow-hidden divide-y divide-gray-150 font-mono text-[10px]">
                              {selectedOrder.status === "Delivered" && (
                                <div className="p-3 bg-green-50/50 flex flex-col sm:flex-row sm:justify-between text-green-800">
                                  <span className="font-black">✓ [DELIVERED] Handed over successfully to customer. Signed by recipient.</span>
                                  <span className="text-[9px] text-green-600 font-bold whitespace-nowrap">{(selectedOrder.shipping.city || "Madurai").toUpperCase()} HUB</span>
                                </div>
                              )}
                              {(selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered") && (
                                <>
                                  <div className="p-3 flex flex-col sm:flex-row sm:justify-between text-gray-800">
                                    <span className="font-semibold">✦ [OUT FOR DELIVERY] Parcel out for home delivery with courier executive.</span>
                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">{(selectedOrder.shipping.city || "Madurai").toUpperCase()} DEPOT</span>
                                  </div>
                                  <div className="p-3 flex flex-col sm:flex-row sm:justify-between text-gray-800">
                                    <span className="font-semibold">✦ [IN TRANSIT] Arrived at regional logistics sorting centre.</span>
                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">{(selectedOrder.shipping.city || "Madurai").toUpperCase()} JUNCTION</span>
                                  </div>
                                  <div className="p-3 flex flex-col sm:flex-row sm:justify-between text-gray-800">
                                    <span className="font-semibold">✦ [DISPATCHED] Dispatched from sorting office & loaded onto express air cargo.</span>
                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">MADURAI INT OFFICE</span>
                                  </div>
                                </>
                              )}
                              <div className="p-3 flex flex-col sm:flex-row sm:justify-between text-gray-700">
                                <span>✦ [BOOKED] Consignment booked at counter & transit bag sealed.</span>
                                <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">MADURAI HEAD QUARTERS</span>
                              </div>
                              <div className="p-3 flex flex-col sm:flex-row sm:justify-between text-gray-600">
                                <span>✦ [PROCESSING] Order catalogued & casing shock-insulated inside leatherette box.</span>
                                <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">MADURAI HUB OFFICE</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Items details breakdown */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                          <h4 className="font-mono text-[9px] font-bold tracking-[0.25em] text-gray-500 uppercase">Order Inventory Included</h4>
                          <div className="divide-y divide-gray-100">
                            {selectedOrder.items.map((item) => (
                              <div key={item.product.id} className="py-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-sm bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-mono font-bold text-gray-800">
                                    {item.quantity}x
                                  </span>
                                  <div>
                                    <p className="font-display font-bold text-xs text-gray-900">{item.product.name}</p>
                                    <p className="text-[10px] font-mono text-gray-400">Unit Price: ₹{item.product.price.toLocaleString("en-IN")}</p>
                                  </div>
                                </div>
                                <span className="font-mono text-xs font-bold text-gray-900">
                                  ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping details */}
                        <div className="bg-gray-50 p-5 rounded-sm border border-gray-250 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-800 leading-relaxed font-sans">
                          <div>
                            <p className="font-mono font-bold text-[9px] text-gray-400 uppercase tracking-[0.25em] mb-2">Recipient Profile</p>
                            <p className="font-bold text-gray-900">{selectedOrder.shipping.fullName}</p>
                            <p className="text-gray-500 mt-0.5">{selectedOrder.shipping.email}</p>
                            {selectedOrder.shipping.phone && (
                              <p className="text-amber-700 font-mono text-[10px] mt-1 font-bold">📞 Phone: {selectedOrder.shipping.phone}</p>
                            )}
                          </div>
                          <div>
                            <p className="font-mono font-bold text-[9px] text-gray-400 uppercase tracking-[0.25em] mb-2">Delivery Courier Address</p>
                            <p className="font-bold text-gray-900">{selectedOrder.shipping.address}</p>
                            <p className="text-gray-500 mt-0.5">{selectedOrder.shipping.city}, {selectedOrder.shipping.zipCode}</p>
                          </div>
                        </div>

                        {/* Payment verification details */}
                        {(selectedOrder.paymentStatus || selectedOrder.utr) && (
                          <div className="bg-zinc-50/50 p-5 rounded-sm border border-gray-250 border-t-0 text-xs text-zinc-800 leading-relaxed font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-8">
                            <div>
                              <p className="font-mono font-bold text-[9px] text-zinc-400 uppercase tracking-[0.25em] mb-2">Payment Verification</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 font-mono font-bold rounded-sm border ${
                                  (selectedOrder.paymentStatus || "Unpaid") === "Paid"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                  {(selectedOrder.paymentStatus || "Unpaid") === "Paid" ? "✓ PAID" : "✗ UNPAID (Awaiting Verification)"}
                                </span>
                              </div>
                            </div>
                            {selectedOrder.utr && (
                              <div className="text-left sm:text-right">
                                <span className="font-mono font-bold text-[9px] text-zinc-400 uppercase tracking-[0.25em] block mb-2">Transaction Reference (UTR)</span>
                                <span className="font-mono text-zinc-900 font-bold text-xs select-all">{selectedOrder.utr}</span>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* MERCHANT SUITE / SELLER ADMIN PANEL */}
        {activeTab === "merchant" && (
          <div className="space-y-8 animate-fadeIn" id="merchant-control-suite">
            {!isAdminLoggedIn ? (
              <div className="max-w-md w-full mx-auto bg-white border border-zinc-200 p-8 shadow-xl space-y-6 text-center my-12 rounded-sm">
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-full border border-yellow-250 bg-amber-50 flex items-center justify-center text-amber-500 mx-auto text-xl">
                    🔐
                  </div>
                  <h3 className="font-display font-bold text-lg text-zinc-900 uppercase tracking-widest">
                    ADMIN PORTAL LOGIN
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                    Access is restricted. Please enter your *Admin PIN* to manage products, catalog, and orders.
                  </p>
                </div>

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="w-full text-center py-3 bg-zinc-50 border border-zinc-300 text-xl font-mono text-zinc-900 tracking-[1em] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-zinc-300"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Unlock Session ⚡
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-black text-2xl tracking-[0.05em] uppercase text-gray-900 flex items-center gap-2">
                      Madurai Gadgets <span className="font-extrabold text-[#2874f0] font-sans">Admin Console</span>
                    </h2>
                <p className="text-gray-500 text-xs font-semibold mt-1">
                  Manage your massive catalog of {products.length} watches. Deploy new arrivals instantly using master templates.
                </p>
              </div>

              {/* Maintenance Utility Actions */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset the entire database of 500+ products? This will remove custom additions.")) {
                      localStorage.removeItem("madurai_gadgets_custom_products");
                      const fresh = getStoredProducts(); // will fall back to ALL_PRODUCTS
                      setProducts(fresh);
                      triggerToast("Catalog Database reset to original 506 watch items!", "info");
                    }
                  }}
                  className="px-3.5 py-2 border border-red-200 bg-red-50 hover:bg-red-500 hover:text-white text-red-700 transition-all text-[10px] uppercase font-black tracking-wider rounded-sm cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Catalog (506 items)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `madurai_watch_catalog_${products.length}_items.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                    triggerToast("Watch Catalogue exported successfully!", "success");
                  }}
                  className="px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 transition-all text-[10px] uppercase font-black tracking-wider rounded-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  Export Catalog JSON
                </button>
              </div>
            </div>

            {/* QUICK OVERVIEW STATS BOARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-800">
              <div className="bg-white p-5 border border-gray-200 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Total Watches</p>
                  <h3 className="text-2xl font-display font-black text-gray-900 mt-1">{products.length} Deal-Items</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-[#2874f0] flex items-center justify-center rounded-sm font-black text-lg font-mono">
                  Σ
                </div>
              </div>

              <div className="bg-white p-5 border border-gray-200 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Low Stock Warning</p>
                  <h3 className="text-2xl font-display font-black text-red-600 mt-1">
                    {products.filter(p => p.stock <= 5).length} Models
                  </h3>
                </div>
                <div className="w-10 h-10 bg-red-50 text-red-500 flex items-center justify-center rounded-sm font-bold">
                  ⚠️
                </div>
              </div>

              <div className="bg-white p-5 border border-gray-200 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Average Copy Price</p>
                  <h3 className="text-2xl font-display font-black text-[#2874f0] mt-1 font-mono">
                    ₹{Math.round(products.reduce((acc, p) => acc + p.price, 0) / (products.length || 1)).toLocaleString("en-IN")}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-[#2874f0] flex items-center justify-center rounded-sm font-black font-sans">
                  ₹
                </div>
              </div>

              <div className="bg-white p-5 border border-gray-200 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Top Rated Copies</p>
                  <h3 className="text-2xl font-display font-black text-green-600 mt-1">
                    {products.filter(p => p.rating >= 4.8).length} Models
                  </h3>
                </div>
                <div className="w-10 h-10 bg-green-50 text-green-650 flex items-center justify-center rounded-sm font-black">
                  ★
                </div>
              </div>
            </div>

            {/* SUB TAB CONTROLLERS FOR MERCHANT SUITE */}
            <div className="flex overflow-x-auto border-b border-gray-200 gap-2 pt-2 scrollbar-none whitespace-nowrap scroll-smooth">
              <button
                type="button"
                onClick={() => setMerchantSubTab("inventory")}
                className={`pb-3 px-4 text-xs uppercase tracking-widest font-mono transition-all border-b-2 shrink-0 ${
                  merchantSubTab === "inventory"
                    ? "border-yellow-500 text-gray-900 font-black"
                    : "border-transparent text-gray-500 hover:text-gray-950"
                }`}
              >
                Products Directory ({products.length}) 💼
              </button>
              <button
                type="button"
                onClick={() => setMerchantSubTab("stock")}
                className={`pb-3 px-4 text-xs uppercase tracking-widest font-mono transition-all border-b-2 shrink-0 ${
                  merchantSubTab === "stock"
                    ? "border-yellow-500 text-gray-900 font-black"
                    : "border-transparent text-gray-500 hover:text-gray-950"
                }`}
              >
                Stock Management ({products.filter(p => p.stock <= 5).length} Warning) 📊
              </button>
              <button
                type="button"
                onClick={() => setMerchantSubTab("orders")}
                className={`pb-3 px-4 text-xs uppercase tracking-widest font-mono transition-all border-b-2 shrink-0 ${
                  merchantSubTab === "orders"
                    ? "border-yellow-500 text-gray-900 font-black"
                    : "border-transparent text-gray-500 hover:text-gray-950"
                }`}
              >
                Fulfillment Hub ({orders.length} Orders) 📦
              </button>
              <button
                type="button"
                onClick={() => setMerchantSubTab("bulk")}
                className={`pb-3 px-4 text-xs uppercase tracking-widest font-mono transition-all border-b-2 shrink-0 ${
                  merchantSubTab === "bulk"
                    ? "border-yellow-500 text-gray-900 font-black"
                    : "border-transparent text-gray-500 hover:text-gray-950"
                }`}
              >
                Bulk Upload 🚀
              </button>
            </div>

            {merchantSubTab === "inventory" ? (
              <div className="space-y-8" id="merchant-inventory-view">
                {/* TWO-COLUMN LAYOUT: TEMPLATE ADD FORM & PRICE offset UTILITY */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-gray-700">
              
              {/* SECTION A: DEPLOY WATCH BY TEMPLATES (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-gray-200 p-6 rounded-sm space-y-6 shadow-sm">
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-2 py-0.5 rounded-sm">
                    Machan Custom templates
                  </span>
                  <h3 className="text-lg font-display font-black text-gray-900 mt-2 uppercase tracking-wide">
                    Deploy Watch Arrival
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Select a curated premium watch template below to auto-populate descriptions and art keys.
                  </p>
                </div>

                {/* CURATED TEMPLATE LIST DECK */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "submariner_date",
                      label: "Rolex Submariner Gold",
                      name: "Submariner Date 18ct Gold Copy",
                      price: 7499,
                      category: "Premier Watches",
                      image: "submariner",
                      desc: "Heavy 18ct Yellow Gold plated mastercopy. Black ceramic rotating bezel, midnight luminous hands, and solid-link glide-lock Oyster bracelet.",
                      specs: "Movement: High-torque automatic sweep winding\nDial: Luminous midnight deep indexing\nCase: 40mm 18ct Yellow Gold steel plating\nBezel: 120-click rotating ceramic rotatable scale"
                    },
                    {
                      id: "royaloak_skeleton",
                      label: "AP Royal Oak Skeleton",
                      name: "Royal Oak Skeleton Dual Balanced",
                      price: 8499,
                      category: "Premier Watches",
                      image: "royaloak",
                      desc: "Stunning visible automatic movement skeleton layout. Finished in premium brushed surgical steel with double-balance balance wheel assembly.",
                      specs: "Movement: Skeleton self-winding premium visible gears\nDial: Transparent mechanical exposure aesthetic\nGlass: Anti-reflective double sapphire crystal\nBezel: Polished hex bezel screws"
                    },
                    {
                      id: "nautilus_rosegold",
                      label: "Purity Nautilus Rose-Gold",
                      name: "Nautilus Chronograph Rose-Gold Copy",
                      price: 7999,
                      category: "Premier Watches",
                      image: "nautilus",
                      desc: "Beautiful warm 18ct Rose Gold comfort luxury mastercopy watch. Dark brown sunburst lined index with instant digital flip date window.",
                      specs: "Movement: Calibre 324 SC automatic sweep engine\nDial: Warm chocolate brown horizontal ripple\nCase: 40.5mm Slim profile Rose-Gold plating\nPackaging: Premium heavy varnished wooden chest box"
                    },
                    {
                      id: "cartier_stone",
                      label: "Cartier Santos Diamond index",
                      name: "Santos Dual-Tone Roman Diamond Copy",
                      price: 4899,
                      category: "Premier Watches",
                      image: "dresswatch",
                      desc: "Masterful square-style Roman index copy. Injected with CZ brilliant stone hour markers, blue stone crown cabochon, and vintage brown crocodile texturing.",
                      specs: "Movement: Ultra-slim Japanese quartz chronometer\nDial: Ivory white Roman dials with CZ diamonds\nStrap: Luxury brown alligator scale leather strip\nCabochon: Classic faceted Blue Sapphire crown insert"
                    },
                    {
                      id: "daytona_white",
                      label: "Cosmograph Daytona Panda",
                      name: "Cosmograph Daytona Panda Mastercopy",
                      price: 5999,
                      category: "Premier Watches",
                      image: "daytona",
                      desc: "Stunning high-contrast Panda dials layout. Triple-ring tachymeter stopwatch sweep, heavy Oystersteel bracelet, and double safety flip locks.",
                      specs: "Movement: Japanese sweeping quartz chronograph\nDial: Triple ring ceramic black chronograph zones\nCase: 40mm Solid raw 316L premium steel casing\nGlass: Scratch-proof hardened double glass lens"
                    },
                    {
                      id: "omega_seagreen",
                      label: "Omega Seamaster Sea-Green",
                      name: "Seamaster Green Co-Axial Copy",
                      price: 4999,
                      category: "Premier Watches",
                      image: "seamaster",
                      desc: "Curated dark military green wave profile. Laser-engraved ocean wave dial, heavy helium escape valve model, and dual safety diver lock clasp.",
                      specs: "Movement: Winding high-tension mechanical automatic\nDial: Olive green laser wave structured matte dial\nStrap: Smooth customized vulcanized green compound rubber strap\nWaterproof: Daily splashproof master guard seal"
                    }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setTemplateSelect(tpl.id);
                        setNewWatchName(tpl.name);
                        setNewWatchPrice(tpl.price);
                        setNewWatchCategory(tpl.category);
                        setNewWatchImage(tpl.image);
                        setNewWatchDescription(tpl.desc);
                        setNewWatchSpecs(tpl.specs);
                        triggerToast(`Loaded "${tpl.label}" Template!`, "info");
                      }}
                      className={`p-2 border text-left rounded-sm transition-all text-xs cursor-pointer ${
                        templateSelect === tpl.id
                          ? "border-yellow-500 bg-yellow-50 text-gray-900 font-bold shadow-xs"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <p className="font-bold">{tpl.label}</p>
                      <p className="text-[9px] font-mono text-yellow-600 mt-0.5 font-bold">₹{tpl.price} | {tpl.category}</p>
                    </button>
                  ))}
                </div>

                {/* NEW ARRIVAL EDIT FORM FIELDS */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newWatchName.trim()) {
                      alert("Please type a product name, machan!");
                      return;
                    }

                    try {
                      // 1. Send only image_url to MySQL backend
                      const response = await fetch(`${API_BASE_URL}/api/products`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image_url: newWatchImage })
                      });

                      if (response.ok) {
                        const result = await response.json();
                        const generatedId = result.productId.toString();

                        // 2. Save metadata details in Firebase Firestore using generated ID
                        const fbProduct: Product = {
                          id: generatedId,
                          name: newWatchName,
                          price: Number(newWatchPrice),
                          description: newWatchDescription,
                          image: newWatchImage,
                          category: newWatchCategory,
                          gender: newWatchGender,
                          specs: newWatchSpecs.split("\n").map(s => s.trim()).filter(s => s.length > 0),
                          stock: newWatchStock,
                          variations: variationsInput,
                          rating: 4.8,
                          reviewsCount: 150
                        };

                        try {
                          await saveProductToFirebase(fbProduct);
                          triggerToast(`Mass! "${newWatchName}" saved (MySQL image + Firebase details)! 🚀`, "success");
                          
                          // 3. Save aanathum list-ah automatic ah refresh panrom
                          fetchProductsFromNodeBackend();

                          // 4. Form fields-ah empty panrom
                          setTemplateSelect("");
                          setNewWatchName("");
                          setNewWatchPrice(4999);
                          setNewWatchDescription("A+ Grade festival deal replica with dynamic dial and luxury packaging details.");
                          setNewWatchImage("daytona"); 
                          setNewWatchGender("Unisex");
                          setNewWatchBrand("Other");
                          setVariationsInput([]);
                        } catch (fbErr) {
                          console.error("Firebase write failed. Purging MySQL record for consistency:", fbErr);
                          
                          // MySQL rollback
                          await fetch(`${API_BASE_URL}/api/products/${generatedId}`, {
                            method: "DELETE"
                          });

                          triggerToast("Aiyyo! Firebase details save failed. MySQL database rolled back ❌", "info");
                        }
                      } else {
                        triggerToast("Aiyyo! Database-la save aagala macha ❌", "info");
                      }
                    } catch (error) {
                      console.error("Error:", error);
                      triggerToast("Server connect aagala! Terminal-la node index.js run aagutha paaru 🔌", "info");
                    }
                  }}
                  className="space-y-4 text-xs font-sans text-gray-800"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Product Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Rolex GMT Master II Cola Copy"
                        value={newWatchName}
                        onChange={(e) => setNewWatchName(e.target.value)}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Category Classification</label>
                      <select
                        value={newWatchCategory}
                        onChange={(e) => setNewWatchCategory(e.target.value)}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-950 focus:outline-none focus:border-yellow-500 font-bold"
                      >
                        {["Premier Watches", "Normal Watches", "Japanese Model Watches", "Bluetooth Speakers", "Sunglasses", "Accessories"].map((cat) => (
                          <option key={cat} value={cat} className="bg-white text-gray-950 font-bold">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Brand Name</label>
                      <select
                        value={newWatchBrand}
                        onChange={(e) => setNewWatchBrand(e.target.value)}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-950 focus:outline-none focus:border-yellow-500 font-bold"
                      >
                        {["Rolex", "Omega", "Audemars Piguet", "Patek Philippe", "Casio", "Other"].map((br) => (
                          <option key={br} value={br} className="bg-white text-gray-950 font-bold">{br}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Target Gender</label>
                      <select
                        value={newWatchGender}
                        onChange={(e) => setNewWatchGender(e.target.value as "Men" | "Women" | "Unisex")}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-950 focus:outline-none focus:border-yellow-500 font-bold"
                      >
                        <option value="Unisex">Unisex 🌟</option>
                        <option value="Men">Men 👨</option>
                        <option value="Women">Women 👩</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Price (INR ₹)</label>
                      <input
                        type="number"
                        value={newWatchPrice}
                        onChange={(e) => setNewWatchPrice(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Initial Stock Count</label>
                      <input
                        type="number"
                        value={newWatchStock}
                        onChange={(e) => setNewWatchStock(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">
                        Product Media (Cloudinary URL) ☁️
                      </label>
                      <input
                        type="text"
                        placeholder="Paste Cloudinary Image Link here... (https://res.cloudinary.com/...)"
                        value={newWatchImage}
                        onChange={(e) => setNewWatchImage(e.target.value)}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Short Description</label>
                    <textarea
                      rows={2}
                      placeholder="Give a lovely marketing description for the buyers..."
                      value={newWatchDescription}
                      onChange={(e) => setNewWatchDescription(e.target.value)}
                      className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-bold"
                    />
                  </div>

                  {/* Color Variations Section */}
                  <div className="bg-zinc-50 p-4 rounded-sm border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                        Color Variations 🎨 (Multiple colors set panna 'Add' click pannunga)
                      </span>
                      <button
                        type="button"
                        onClick={() => setVariationsInput([...variationsInput, { color_name: "", color_code: "#000000", image_url: "" }])}
                        className="px-2.5 py-1 bg-zinc-900 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-sm hover:bg-zinc-800 transition-all cursor-pointer"
                      >
                        + Add Variation
                      </button>
                    </div>

                    {variationsInput.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">No custom color variations added yet. (Will deploy single watch variant)</p>
                    ) : (
                      <div className="space-y-3">
                        {variationsInput.map((v, index) => (
                          <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-white p-3 border border-zinc-200 rounded-xs relative">
                            <div className="sm:col-span-3">
                              <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1">Color Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Stealth Black"
                                value={v.color_name}
                                onChange={(e) => {
                                  const updated = [...variationsInput];
                                  updated[index].color_name = e.target.value;
                                  setVariationsInput(updated);
                                }}
                                className="w-full bg-white border border-gray-300 p-1.5 rounded-sm text-gray-900 text-xs focus:outline-none focus:border-yellow-500 font-bold"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1">Color Code</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={v.color_code}
                                  onChange={(e) => {
                                    const updated = [...variationsInput];
                                    updated[index].color_code = e.target.value;
                                    setVariationsInput(updated);
                                  }}
                                  className="w-8 h-7 bg-white border border-gray-300 p-0.5 rounded-sm cursor-pointer"
                                />
                                <input
                                  type="text"
                                  placeholder="#000000"
                                  value={v.color_code}
                                  onChange={(e) => {
                                    const updated = [...variationsInput];
                                    updated[index].color_code = e.target.value;
                                    setVariationsInput(updated);
                                  }}
                                  className="w-full bg-white border border-gray-300 p-1.5 rounded-sm text-gray-900 text-[10px] focus:outline-none focus:border-yellow-500 font-mono font-bold"
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-6">
                              <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1">Variation Image URL (Cloudinary / Unsplash)</label>
                              <input
                                type="text"
                                placeholder="Paste image link here..."
                                value={v.image_url}
                                onChange={(e) => {
                                  const updated = [...variationsInput];
                                  updated[index].image_url = e.target.value;
                                  setVariationsInput(updated);
                                }}
                                className="w-full bg-white border border-gray-300 p-1.5 rounded-sm text-gray-900 text-xs focus:outline-none focus:border-yellow-500 font-bold"
                              />
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setVariationsInput(variationsInput.filter((_, idx) => idx !== index))}
                                className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-sm transition-all cursor-pointer"
                                title="Remove Variation"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Technical Specifications (One key per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Movement: Japanese Quartz Sweep&#10;Dial: Matte Finish with Luminous markings"
                      value={newWatchSpecs}
                      onChange={(e) => setNewWatchSpecs(e.target.value)}
                      className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-mono text-xs leading-relaxed font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#f0c14b] border border-[#a88734] hover:bg-[#f3cd60] text-gray-950 font-black uppercase tracking-widest text-[11px] rounded-sm transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    🚀 DEPLOY ACTIVE ARRIVAL (Live to Store)
                  </button>
                </form>

              </div>

              {/* SECTION B: ACTIONS DECK & GLOBAL BULK ADJUSTMENTS (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* DEFAULT STORE DISCOUNT MANAGER CARD */}
                <div className="bg-white border border-gray-200 p-5 rounded-sm space-y-4 shadow-sm">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-805 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                      Store Discount Manager
                    </span>
                    <h3 className="text-sm font-display font-black text-gray-900 mt-1.5 uppercase tracking-wide">
                      Site-wide Default Discount
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Configure the default discount percentage applied automatically to all products at checkout.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs font-sans text-gray-700">
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Default Discount (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discountPercent}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, Number(e.target.value)));
                          setDiscountPercent(val);
                          localStorage.setItem("madurai_default_discount", val.toString());
                        }}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 font-mono font-bold"
                        placeholder="e.g. 0 for no discount"
                      />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 leading-normal">
                      💡 Tip: Set to <strong className="text-zinc-950">0</strong> to disable automatic store-wide discounts. Customers can still use promo codes like "MACHAN" (15% off) or "WELCOME" (10% off).
                    </p>
                  </div>
                </div>

                {/* GLOBAL PRICE OFFSET MANAGER CARD */}
                <div className="bg-white border border-gray-200 p-5 rounded-sm space-y-4 shadow-sm">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-yellow-800 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-sm">
                      Bulk Price Engine
                    </span>
                    <h3 className="text-sm font-display font-black text-gray-900 mt-1.5 uppercase tracking-wide">
                      Bulk Price Offset
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Increase or discount all {products.length} watch prices instantly using fractional weights.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs font-sans text-gray-700">
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Adjustment Margin (%)</label>
                      <input
                        type="number"
                        value={bulkPercent}
                        onChange={(e) => setBulkPercent(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 p-2.5 rounded-sm text-gray-900 font-mono font-bold"
                        placeholder="e.g. 10 for rise, -10 for discount"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (bulkPercent <= 0) {
                            alert("Please supply a positive weight percent, machan!");
                            return;
                          }
                          const updated = products.map((p) => {
                            const change = Math.round(p.price * (bulkPercent / 100));
                            return { ...p, price: Math.max(100, p.price - change) };
                          });
                          setProducts(updated);
                          saveStoredProducts(updated);
                          triggerToast(`Successfully discounted all watches by ${bulkPercent}% globally!`, "success");
                        }}
                        className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[10px] tracking-wider rounded-sm cursor-pointer transition-all shadow-sm"
                      >
                        📉 Apply {bulkPercent}% Discount
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (bulkPercent <= 0) {
                            alert("Please supply a positive weight percent, machan!");
                            return;
                          }
                          const updated = products.map((p) => {
                            const change = Math.round(p.price * (bulkPercent / 100));
                            return { ...p, price: p.price + change };
                          });
                          setProducts(updated);
                          saveStoredProducts(updated);
                          triggerToast(`Successfully increased all watch prices by ${bulkPercent}% globally!`, "success");
                        }}
                        className="w-full py-2.5 bg-[#2874f0] hover:bg-[#1259c7]/90 text-white font-black uppercase text-[10px] tracking-wider rounded-sm cursor-pointer transition-all shadow-sm"
                      >
                        📈 Add {bulkPercent}% Premium
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-400 italic leading-normal font-medium">
                      *Changes are written directly to LocalStorage. You can undo anytime by pressing the Red "Reset Catalog" button, machan!
                    </p>
                  </div>
                </div>

                {/* STOCK BALANCE CHEAT BOARD */}
                <div className="bg-white border border-gray-200 p-5 rounded-sm space-y-4 shadow-sm">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-green-800 bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm">
                      Merchant Fast Checks
                    </span>
                    <h3 className="text-sm font-display font-black text-gray-900 mt-1.5 uppercase tracking-wide">
                      Bulk Stocking Operations
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Set active stock counts across low-alert watches.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = products.map(p => {
                          if (p.stock <= 5) return { ...p, stock: 15 };
                          return p;
                        });
                        setProducts(updated);
                        saveStoredProducts(updated);
                        triggerToast("All low-stock watches bulk refilled to 15 items!", "success");
                      }}
                      className="py-3 border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all text-center cursor-pointer"
                    >
                      ⚡ REFILL ALL OUT-OF-STOCKS (To 15 count)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Simulate severe supply limit? This is great for showing low-stock tags!")) {
                          const updated = products.map((p, idx) => {
                            if (idx % 8 === 0) return { ...p, stock: 3 };
                            return p;
                          });
                          setProducts(updated);
                          saveStoredProducts(updated);
                          triggerToast("Scarcity demand simulation applied successfully!", "info");
                        }
                      }}
                      className="py-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all text-center cursor-pointer"
                    >
                      🎲 SIMULATE SCARCITY DEMAND
                    </button>
                  </div>
                </div>

                {/* EXCLUSIVE BRAND LOOKS & HERO CUSTOMIZATION */}
                <div className="bg-white border border-gray-200 p-5 rounded-sm space-y-4 shadow-sm">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#2874f0] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm inline-block font-black">
                      Machan Customize Control 🎨
                    </span>
                    <h3 className="text-sm font-display font-black text-gray-900 mt-1.5 uppercase tracking-wide">
                      Brand looks & Hero Picture
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Set custom brand imagery or a hero watch background file (`hero.png`).
                    </p>
                  </div>

                  <div className="space-y-4 text-xs text-gray-700">
                    {/* File Upload zone or base64 converter */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Select Custom Hero PNG/JPG</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                const base64Str = event.target.result as string;
                                setCustomHeroImage(base64Str);
                                localStorage.setItem("madurai_custom_hero_image", base64Str);
                                triggerToast("Premium Hero Image successfully set, machan! Check the store home.", "success");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 p-2 rounded-sm text-[10px] font-mono text-gray-800 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-black file:bg-[#2874f0] file:text-white hover:file:bg-[#1259c7] cursor-pointer"
                      />
                    </div>

                    {/* Pre-curated default options */}
                    <div className="space-y-2">
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Or Select Curated Watch Banners</label>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            const url = "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600&auto=format&fit=crop";
                            setCustomHeroImage(url);
                            localStorage.setItem("madurai_custom_hero_image", url);
                            triggerToast("Set gold Rolex backdrop preset!", "success");
                          }}
                          className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xs text-left truncate text-gray-700 font-bold cursor-pointer"
                        >
                          限制 Rolex Gold Spot
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop";
                            setCustomHeroImage(url);
                            localStorage.setItem("madurai_custom_hero_image", url);
                            triggerToast("Set premium chronograph backdrop preset!", "success");
                          }}
                          className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xs text-left truncate text-gray-700 font-bold cursor-pointer"
                        >
                          🕷️ Carbon Concept
                        </button>
                      </div>
                    </div>

                    {/* Hero Layout Mode options */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Display Presentation Layout</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHeroLayout("showcase");
                            localStorage.setItem("madurai_hero_layout", "showcase");
                            triggerToast("Hero layout: Showcase split-grid style!", "success");
                          }}
                          className={`py-1.5 rounded-sm font-black uppercase text-[9px] transition-all cursor-pointer border ${
                            heroLayout === "showcase"
                              ? "bg-yellow-400 text-gray-950 border-yellow-500"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:text-gray-900"
                          }`}
                        >
                          Split Showcase
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHeroLayout("backdrop");
                            localStorage.setItem("madurai_hero_layout", "backdrop");
                            triggerToast("Hero layout: Immersive faded background backdrop!", "success");
                          }}
                          className={`py-1.5 rounded-sm font-black uppercase text-[9px] transition-all cursor-pointer border ${
                            heroLayout === "backdrop"
                              ? "bg-yellow-400 text-gray-950 border-yellow-500"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:text-gray-900"
                          }`}
                        >
                          Backdrop Blend
                        </button>
                      </div>
                    </div>

                    {/* Clear/Reset button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomHeroImage("");
                        localStorage.removeItem("madurai_custom_hero_image");
                        triggerToast("Hero custom brand imagery cleared to default!", "info");
                      }}
                      className="w-full py-2 bg-red-50 border border-red-200 text-red-700 font-black hover:bg-red-100 text-[9px] uppercase tracking-wider rounded-sm cursor-pointer transition-all"
                    >
                      Clear Hero Customization
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* PERFORMANCE EXTREME CATALOG TABLE MANAGER WITH INLINE PAGINATION */}
            <div className="bg-white border border-gray-200 p-6 rounded-sm space-y-4 text-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-display font-black text-gray-900 uppercase tracking-wide">
                    Live Stock & Price Table
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    Fast searchable lookup table. Update price or stock inline for any watch instantly.
                  </p>
                </div>

                {/* Table search filter */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Fast search table (e.g. rolex, daytona)..."
                    value={merchantSearchQuery}
                    onChange={(e) => {
                      setMerchantSearchQuery(e.target.value);
                      setMerchantPage(1); // reset page
                    }}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-sm text-xs font-bold"
                  />
                  {merchantSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setMerchantSearchQuery("");
                        setMerchantPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Filtering logic specifically for the merchant table */}
              {(() => {
                const filteredTable = products.filter((p) => {
                  const q = merchantSearchQuery.toLowerCase();
                  return p.name.toLowerCase().includes(q) ||
                         p.category.toLowerCase().includes(q) ||
                         p.id.toLowerCase().includes(q) ||
                         p.description.toLowerCase().includes(q);
                });

                const tableLimit = 10;
                const totalTablePages = Math.ceil(filteredTable.length / tableLimit) || 1;
                const startIndex = (merchantPage - 1) * tableLimit;
                const activePageItems = filteredTable.slice(startIndex, startIndex + tableLimit);

                return (
                  <div className="space-y-4">
                    {/* Mobile View: Stacked Cards (block sm:hidden) */}
                    <div className="block sm:hidden space-y-4">
                      {activePageItems.length === 0 ? (
                        <p className="p-8 text-center text-gray-400 italic font-semibold">No products found matching "{merchantSearchQuery}"</p>
                      ) : (
                        activePageItems.map((prod) => (
                          <div key={prod.id} className="bg-white border border-zinc-200 p-4 rounded shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 p-1 flex items-center justify-center rounded overflow-hidden shrink-0">
                                {renderProductIllustration(prod.image, "h-10", 150)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-zinc-950 truncate text-xs">{prod.name}</h4>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{prod.id} &bull; {prod.category}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-b border-zinc-100 py-3 text-xs">
                              <div>
                                <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1 font-bold">Price (₹ INR)</label>
                                <input
                                  type="number"
                                  value={prod.price}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updatedList = products.map((item) => (item.id === prod.id ? { ...item, price: val } : item));
                                    setProducts(updatedList);
                                    saveStoredProducts(updatedList);
                                  }}
                                  className="w-full bg-white border border-zinc-300 px-2 py-1 rounded-sm text-zinc-900 font-mono focus:border-yellow-500 focus:outline-none font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1 font-bold">Stock Level</label>
                                <input
                                  type="number"
                                  value={prod.stock}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updatedList = products.map((item) => (item.id === prod.id ? { ...item, stock: val } : item));
                                    setProducts(updatedList);
                                    saveStoredProducts(updatedList);
                                  }}
                                  className={`w-full bg-white border px-2 py-1 rounded-sm text-zinc-900 font-mono focus:border-yellow-500 focus:outline-none font-bold ${
                                    prod.stock <= 5 ? "border-red-300 text-red-650 bg-red-50" : "border-zinc-300"
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  saveStoredProducts(products);
                                  triggerToast(`Watch ${prod.id} updated successfully!`, "success");
                                }}
                                className="px-3 py-1.5 bg-yellow-400 text-gray-950 rounded-sm hover:bg-yellow-500 text-[9px] font-black uppercase transition-all cursor-pointer font-bold"
                              >
                                ✓ Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProduct(prod)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-650 rounded-sm border border-blue-200 text-[9px] font-black uppercase transition-all cursor-pointer font-bold"
                              >
                                ✏ Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete "${prod.name}" permanently from the live catalog?`)) {
                                    const isNumericId = /^\d+$/.test(prod.id);
                                    try {
                                      if (isNumericId) {
                                        await fetch(`${API_BASE_URL}/api/products/${prod.id}`, { method: "DELETE" });
                                      }
                                      await deleteProductFromFirebase(prod.id);
                                    } catch (err) {
                                      console.error("Error deleting product:", err);
                                    }
                                    const updated = products.filter(p => p.id !== prod.id);
                                    setProducts(updated);
                                    saveStoredProducts(updated);
                                    triggerToast(`Watch "${prod.name}" deleted successfully! ✕`, "info");
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-650 rounded-sm border border-red-200 text-[9px] font-black uppercase transition-all cursor-pointer font-bold"
                              >
                                ✕ Del
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop View Table (hidden sm:block) */}
                    <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-sm">
                      <table className="w-full text-left text-xs font-sans text-gray-700 min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                          <tr>
                            <th className="p-3 w-28">Watch ID</th>
                            <th className="p-3 w-16 text-center">Artwork</th>
                            <th className="p-3">Model Title</th>
                            <th className="p-3 w-40">Category</th>
                            <th className="p-3 w-32">Price (₹ INR)</th>
                            <th className="p-3 w-28">Stock Level</th>
                            <th className="p-3 w-48 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {activePageItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-gray-400 italic font-semibold">
                                No products found matching "{merchantSearchQuery}" inside the merchant list.
                              </td>
                            </tr>
                          ) : (
                            activePageItems.map((prod) => {
                              return (
                                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-3 text-[10px] font-mono text-gray-500 font-bold">{prod.id}</td>
                                  <td className="p-2 text-center">
                                    <div className="w-10 h-10 bg-gray-50 border border-gray-200 flex items-center justify-center rounded-sm overflow-hidden p-0.5 mx-auto">
                                      {renderProductIllustration(prod.image, "h-8", 150)}
                                    </div>
                                  </td>
                                  <td className="p-2 font-bold text-gray-900 max-w-xs truncate" title={prod.name}>
                                    {prod.name}
                                  </td>
                                  <td className="p-2">
                                    <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-sm text-[10px] font-bold">
                                      {prod.category}
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 font-mono font-bold">₹</span>
                                      <input
                                        type="number"
                                        value={prod.price}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          const updatedList = products.map((item) => {
                                            if (item.id === prod.id) {
                                              return { ...item, price: val };
                                            }
                                            return item;
                                          });
                                          setProducts(updatedList);
                                          saveStoredProducts(updatedList);
                                        }}
                                        className="bg-white border border-gray-300 px-2 py-1 rounded-sm w-24 text-gray-900 font-mono focus:border-yellow-500 focus:outline-none font-bold"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={prod.stock}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const updatedList = products.map((item) => {
                                          if (item.id === prod.id) {
                                            return { ...item, stock: val };
                                          }
                                          return item;
                                        });
                                        setProducts(updatedList);
                                        saveStoredProducts(updatedList);
                                      }}
                                      className={`bg-white border px-2 py-1 rounded-sm w-20 text-gray-900 font-mono focus:border-yellow-500 focus:outline-none font-bold ${
                                        prod.stock <= 5 ? "border-red-300 text-red-600 bg-red-50" : "border-gray-300"
                                      }`}
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <div className="flex gap-1.5 justify-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          saveStoredProducts(products);
                                          triggerToast(`Watch ${prod.id} updated successfully!`, "success");
                                        }}
                                        className="px-2 py-1 bg-yellow-400 text-gray-950 rounded-sm hover:bg-yellow-500 text-[9px] font-black uppercase transition-all cursor-pointer"
                                        title="Save inline price/stock"
                                      >
                                        ✓ Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingProduct(prod)}
                                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-sm border border-blue-200 text-[9px] font-black uppercase transition-all cursor-pointer"
                                        title="Edit full properties"
                                      >
                                        ✏ Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (confirm(`Are you sure you want to delete "${prod.name}" permanently from the live catalog?`)) {
                                            const isNumericId = /^\d+$/.test(prod.id);
                                            try {
                                              if (isNumericId) {
                                                await fetch(`${API_BASE_URL}/api/products/${prod.id}`, {
                                                  method: "DELETE"
                                                });
                                              }
                                              await deleteProductFromFirebase(prod.id);
                                            } catch (err) {
                                              console.error("Error deleting from database/Firebase:", err);
                                            }
                                            const updated = products.filter(p => p.id !== prod.id);
                                            setProducts(updated);
                                            saveStoredProducts(updated);
                                            triggerToast(`Watch "${prod.name}" deleted successfully! ✕`, "info");
                                          }
                                        }}
                                        className="px-2 py-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-sm border border-red-200 text-[9px] font-black uppercase transition-all cursor-pointer"
                                        title="Delete watch permanently"
                                      >
                                        ✕ Del
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table simple paginator row */}
                    {totalTablePages > 1 && (
                      <div className="flex items-center justify-between pt-2 text-xs text-gray-500 font-semibold">
                        <p>
                          Showing rows {startIndex + 1} to {Math.min(startIndex + tableLimit, filteredTable.length)} of {filteredTable.length} items
                        </p>
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            type="button"
                            disabled={merchantPage === 1}
                            onClick={() => setMerchantPage((p) => Math.max(1, p - 1))}
                            className="px-2.5 py-1.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 select-none text-[10px] cursor-pointer text-gray-700 font-bold"
                          >
                            ◀ PREV
                          </button>
                          <span className="text-gray-800 font-black text-[10px] px-2">
                            PAGE {merchantPage} OF {totalTablePages}
                          </span>
                          <button
                            type="button"
                            disabled={merchantPage === totalTablePages}
                            onClick={() => setMerchantPage((p) => Math.min(totalTablePages, p + 1))}
                            className="px-2.5 py-1.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 select-none text-[10px] cursor-pointer text-gray-700 font-bold"
                          >
                            NEXT ▶
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              </div>
            </div>
            ) : merchantSubTab === "stock" ? (
              <StockManagementView
                products={products}
                setProducts={setProducts}
                saveStoredProducts={saveStoredProducts}
                triggerToast={triggerToast}
                renderProductIllustration={renderProductIllustration}
              />
            ) : merchantSubTab === "bulk" ? (
              <BulkUploadView
                products={products}
                setProducts={setProducts}
                fetchProducts={fetchProductsFromNodeBackend}
                triggerToast={triggerToast}
              />
            ) : (
              /* SECTION B: ORDER FULFILLMENT HUB */
              <div className="bg-white border border-gray-200 p-6 rounded-sm space-y-6 text-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="text-lg font-display font-black text-gray-900 uppercase tracking-wide">
                      Order Fulfillment center 📦
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Admin tracker control panel. Adjust shipment and packaging progression tags of client requests registered via WhatsApp.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const mockOrders: Order[] = [
                        {
                          id: "MDU-682143",
                          items: [{ product: products[0] || ALL_PRODUCTS[0], quantity: 1 }],
                          total: (products[0]?.price || 4999) + 400,
                          discount: 0,
                          shipping: {
                            fullName: "Prabu Dev",
                            email: "prabu.dev@gmail.com",
                            address: "12 Vakkil New Street, Simmakkal",
                            city: "Madurai",
                            zipCode: "625001",
                            phone: "9585969334"
                          },
                          date: "July 24, 2026 at 02:44 PM",
                          status: "Processing",
                          paymentStatus: "Unpaid"
                        },
                        {
                          id: "MDU-319504",
                          items: [{ product: products[1] || ALL_PRODUCTS[1], quantity: 2 }],
                          total: ((products[1]?.price || 4999) * 2) + 800,
                          discount: 500,
                          shipping: {
                            fullName: "Anisha Krishnan",
                            email: "anisha.k@yahoo.com",
                            address: "88 Gandhi Nagar Main Road, Adyar",
                            city: "Chennai",
                            zipCode: "600020",
                            phone: "9876543210"
                          },
                          date: "July 23, 2026 at 11:15 AM",
                          status: "Shipped",
                          paymentStatus: "Paid"
                        },
                        {
                          id: "MDU-905166",
                          items: [{ product: products[2] || ALL_PRODUCTS[2], quantity: 1 }],
                          total: (products[2]?.price || 4999) + 400,
                          discount: 1000,
                          shipping: {
                            fullName: "Karthik Raja",
                            email: "karthik.58@outlook.com",
                            address: "5/24 East Car Street, Tiruparankundram",
                            city: "Madurai",
                            zipCode: "625005",
                            phone: "9192939495"
                          },
                          date: "July 20, 2026 at 09:20 AM",
                          status: "Delivered",
                          paymentStatus: "Paid"
                        }
                      ];
                      saveOrders(mockOrders);
                      setSelectedOrder(mockOrders[0]);
                      triggerToast("Generated 3 realistic Tamil Nadu test orders successfully! ✨", "success");
                    }}
                    className="px-4 py-2 border border-yellow-300 bg-yellow-50 hover:bg-yellow-400 hover:text-gray-950 text-yellow-800 text-xs font-black tracking-widest uppercase rounded-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    ⚡ Generate 3 Tamil Nadu Test Orders
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-gray-200 bg-gray-50 rounded-sm space-y-4 shadow-inner">
                    <CircleAlert className="w-10 h-10 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">No Active Logged Orders</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">
                      Whenever prospective customers submit checkout forms, invoices are cached in their system reference files. Use the button above to seed sample test orders to inspect real-time progress timelines!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mobile View: Stacked Cards (block sm:hidden) */}
                    <div className="block sm:hidden space-y-4">
                      {orders.map((ord) => {
                        const isDeleting = deletingOrderId === ord.id;
                        return (
                          <div key={ord.id} className="bg-white border border-zinc-200 p-4 rounded shadow-sm space-y-4 relative">
                            {/* Header details */}
                            <div className="flex justify-between items-center border-b border-zinc-150 pb-2">
                              <span className="font-mono text-xs font-black text-zinc-900">{ord.id}</span>
                              <span className="text-[10px] text-zinc-400 font-bold font-mono">{ord.date.split(" at ")[0]}</span>
                            </div>

                            {/* Recipient Details */}
                            <div className="space-y-1 text-xs">
                              <p className="text-zinc-900 font-extrabold">{ord.shipping.fullName}</p>
                              {ord.shipping.phone && (
                                <a href={`tel:${ord.shipping.phone}`} className="text-[10px] text-yellow-600 font-mono font-black block mb-1">
                                  📞 {ord.shipping.phone}
                                </a>
                              )}
                              <p className="text-[10px] text-zinc-500 font-medium">{ord.shipping.city} ({ord.shipping.zipCode})</p>
                            </div>

                            {/* Items Breakdown inside Card */}
                            <div className="bg-zinc-50 p-3 rounded-sm border border-zinc-200 text-[11px] text-zinc-700 space-y-1">
                              <p className="font-mono text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Items Ordered:</p>
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between font-medium">
                                  <span className="truncate max-w-[190px]">{item.product.name} (x{item.quantity})</span>
                                  <span className="font-mono font-semibold">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                                </div>
                              ))}
                              <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold text-zinc-900 mt-1.5">
                                <span>Grand Total:</span>
                                <span className="font-mono text-xs text-yellow-600 font-black">₹{ord.total.toLocaleString("en-IN")}</span>
                              </div>
                            </div>

                            {/* Payment and Fulfillment Selectors */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1">Payment</label>
                                <select
                                  value={ord.paymentStatus || "Unpaid"}
                                  onChange={(e) => {
                                    const val = e.target.value as "Unpaid" | "Paid";
                                    const updated = orders.map((o) => (o.id === ord.id ? { ...o, paymentStatus: val } : o));
                                    saveOrders(updated);
                                    if (selectedOrder?.id === ord.id) setSelectedOrder({ ...selectedOrder, paymentStatus: val });
                                    triggerToast(`Bill of ${ord.id} marked as ${val}!`, "success");
                                    if (val === "Paid") {
                                      sendWhatsAppReceipt(ord);
                                    }
                                  }}
                                  className={`w-full text-[11px] border px-2 py-1.5 focus:outline-none font-mono font-black rounded-sm ${
                                    (ord.paymentStatus || "Unpaid") === "Paid"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}
                                >
                                  <option value="Unpaid" className="bg-white text-red-750 font-bold">❌ Unpaid</option>
                                  <option value="Paid" className="bg-white text-green-750 font-bold">✅ Paid</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1">Fulfillment Status</label>
                                <select
                                  value={ord.status}
                                  onChange={(e) => {
                                    const val = e.target.value as "Processing" | "Shipped" | "Delivered";
                                    const updated = orders.map((o) => (o.id === ord.id ? { ...o, status: val } : o));
                                    saveOrders(updated);
                                    if (selectedOrder?.id === ord.id) setSelectedOrder({ ...selectedOrder, status: val });
                                    triggerToast(`Status of ${ord.id} changed to ${val}!`, "success");
                                    if (val === "Shipped") {
                                      sendWhatsAppShipped(ord);
                                    } else if (val === "Delivered") {
                                      sendWhatsAppDelivered(ord);
                                    }
                                  }}
                                  className="w-full bg-white text-[11px] border border-zinc-200 px-2 py-1.5 focus:border-yellow-500 focus:outline-none text-zinc-900 font-mono font-black rounded-sm"
                                >
                                  <option value="Processing" className="bg-white text-yellow-750 font-bold">Processing 📦</option>
                                  <option value="Shipped" className="bg-white text-blue-750 font-bold font-mono">Shipped 🚚</option>
                                  <option value="Delivered" className="bg-white text-green-750 font-bold font-mono">Delivered ✅</option>
                                </select>
                              </div>
                            </div>

                            {/* ST Courier ID input */}
                            <div>
                              <label className="block text-[8px] font-mono text-zinc-400 uppercase font-black mb-1 font-bold">ST Courier Consignment ID</label>
                              <input
                                type="text"
                                placeholder="ST Courier ID (e.g. ST940381)"
                                defaultValue={ord.stCourierId || ""}
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  const updated = orders.map((o) => (o.id === ord.id ? { ...o, stCourierId: val } : o));
                                  saveOrders(updated);
                                  if (selectedOrder?.id === ord.id) setSelectedOrder({ ...selectedOrder, stCourierId: val });
                                  if (val) triggerToast(`ST Courier ID saved as ${val} for ${ord.id}!`, "success");
                                }}
                                className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-yellow-500 rounded-sm px-2.5 py-1.5 text-xs font-mono font-bold text-zinc-900 focus:outline-none w-full"
                              />
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex gap-2 justify-end border-t border-zinc-150 pt-3">
                              <button
                                type="button"
                                onClick={() => setPrintingOrder(ord)}
                                className="px-3.5 py-2 bg-white hover:bg-yellow-400 hover:text-gray-950 border border-zinc-250 hover:border-yellow-500 text-zinc-700 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-xs"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if ((ord.paymentStatus || "Unpaid") !== "Paid") {
                                    triggerToast("Mark order as PAID first to unlock receipt delivery!", "info");
                                    return;
                                  }
                                  let cleanPhone = ord.shipping.phone?.replace(/\D/g, "") || "9585969334";
                                  if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
                                  else if (cleanPhone.startsWith("0")) cleanPhone = "91" + cleanPhone.substring(1);
                                  const itemsText = ord.items.map(item => `◽ *${item.product.name}* (${item.quantity}x) - ₹${item.product.price.toLocaleString("en-IN")}`).join("\n");
                                  const whatsappMsg = `*MADURAI GADGETS 58 - OFFICIAL DIGITAL RECEIPT* 📜⌚\n--------------------------------------\nVanakkam Machan! Your payment has been successfully verified! 💳✅\n\n*CUSTOMER DETAILS:*\n👤 *Name:* ${ord.shipping.fullName}\n📞 *Phone:* ${ord.shipping.phone || "Not specified"}\n📍 *Delivery Address:* ${ord.shipping.address}, ${ord.shipping.city} - ${ord.shipping.zipCode}\n\n*ORDER REFERENCES:*\n🆔 *Invoice ID:* ${ord.id}\n📅 *Registered Date:* ${ord.date}\n🌟 *Fulfillment Status:* APPROVED & SHIPPING PREPARED 📦🚀\n💵 *Payment Status:* PAID ✦\n\n--------------------------------------\n*YOUR PURCHASE:*\n${itemsText}\n\n💰 *GRAND TOTAL:* ₹${ord.total.toLocaleString("en-IN")}\n--------------------------------------\nYour premium watch package is certified and ready for dispatch. Thank you for shopping with Madurai Gadgets 58! Wear Peak, Master Your Style! ☄️✨`;
                                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`, "_blank", "noopener,noreferrer");
                                  triggerToast("Redirecting to WhatsApp to send receipt!", "success");
                                }}
                                className={`px-3.5 py-2 border rounded-sm transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-xs ${
                                  (ord.paymentStatus || "Unpaid") === "Paid"
                                    ? "bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-400 hover:text-gray-950"
                                    : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-50"
                                }`}
                              >
                                {ord.paymentStatus === "Paid" ? <Send className="w-3.5 h-3.5 text-yellow-750" /> : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                                <span>Send</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!isDeleting) {
                                    setDeletingOrderId(ord.id);
                                  } else {
                                    const filtered = orders.filter(o => o.id !== ord.id);
                                    saveOrders(filtered);
                                    if (selectedOrder?.id === ord.id) setSelectedOrder(filtered[0] || null);
                                    setDeletingOrderId(null);
                                    triggerToast(`Deleted ${ord.id} file!`, "info");
                                  }
                                }}
                                className={`px-3.5 py-2 rounded-sm border transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-xs ${
                                  isDeleting 
                                    ? "bg-red-600 text-white border-red-700 hover:bg-red-700 animate-pulse" 
                                    : "bg-white hover:bg-red-50 text-red-600 border-zinc-250 hover:border-red-300"
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isDeleting ? "Sure?" : "Del"}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop View Table (hidden sm:block) */}
                    <div className="hidden sm:block overflow-x-auto border border-zinc-200 rounded-sm">
                      <table className="w-full text-left text-xs min-w-[800px]">
                        <thead className="bg-zinc-50 border-b border-zinc-200 uppercase tracking-wider text-zinc-500 font-mono text-[9px] font-bold">
                          <tr>
                            <th className="p-3.5">Reference ID</th>
                            <th className="p-3.5">Recipient Profile</th>
                            <th className="p-3.5">Total Bill</th>
                            <th className="p-3.5">Payment</th>
                            <th className="p-3.5">Purchase Order</th>
                            <th className="p-3.5">Fulfillment Status</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5 text-right">Invoice / Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {orders.map((ord) => {
                            const isDeleting = deletingOrderId === ord.id;
                            return (
                              <tr key={ord.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="p-3.5 font-mono text-zinc-900 font-bold">{ord.id}</td>
                                <td className="p-3.5 font-sans text-xs">
                                  <p className="text-zinc-950 font-bold leading-none mb-1">{ord.shipping.fullName}</p>
                                  {ord.shipping.phone && (
                                    <p className="text-[10px] text-yellow-600 font-mono font-black mb-1">📞 {ord.shipping.phone}</p>
                                  )}
                                  <p className="text-[10px] text-zinc-400 font-medium">{ord.shipping.city} ({ord.shipping.zipCode})</p>
                                </td>
                                <td className="p-3.5 font-mono text-zinc-900 text-xs font-black">
                                  ₹{ord.total.toLocaleString("en-IN")}
                                </td>
                                <td className="p-3.5">
                                  <select
                                    value={ord.paymentStatus || "Unpaid"}
                                    onChange={(e) => {
                                      const val = e.target.value as "Unpaid" | "Paid";
                                      const updated = orders.map((o) => (o.id === ord.id ? { ...o, paymentStatus: val } : o));
                                      saveOrders(updated);
                                      if (selectedOrder?.id === ord.id) setSelectedOrder({ ...selectedOrder, paymentStatus: val });
                                      triggerToast(`Bill of ${ord.id} marked as ${val}!`, "success");
                                      if (val === "Paid") {
                                        sendWhatsAppReceipt(ord);
                                      }
                                    }}
                                    className={`text-[11px] border px-2 py-1 focus:outline-none font-mono font-black rounded-sm ${
                                      (ord.paymentStatus || "Unpaid") === "Paid"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                                  >
                                    <option value="Unpaid" className="bg-white text-red-700 font-bold">❌ Unpaid</option>
                                    <option value="Paid" className="bg-white text-green-700 font-bold">✅ Paid</option>
                                  </select>
                                  {ord.utr && (
                                    <p className="text-[10px] text-zinc-500 font-mono mt-1.5 font-bold">
                                      UTR: <span className="text-zinc-900 select-all font-mono font-bold bg-zinc-100 px-1 py-0.5">{ord.utr}</span>
                                    </p>
                                  )}
                                </td>
                                <td className="p-3.5 max-w-[180px] truncate text-zinc-700 font-medium" title={ord.items.map(i => i.product.name).join(", ")}>
                                  {ord.items.map(i => `${i.product.name} (${i.quantity}x)`).join(", ")}
                                </td>
                                <td className="p-3.5">
                                  <select
                                    value={ord.status}
                                    onChange={(e) => {
                                      const val = e.target.value as "Processing" | "Shipped" | "Delivered";
                                      const updated = orders.map((o) => (o.id === ord.id ? { ...o, status: val } : o));
                                      saveOrders(updated);
                                      if (selectedOrder?.id === ord.id) setSelectedOrder({ ...selectedOrder, status: val });
                                      triggerToast(`Status of ${ord.id} changed to ${val}!`, "success");
                                      if (val === "Shipped") {
                                        sendWhatsAppShipped(ord);
                                      } else if (val === "Delivered") {
                                        sendWhatsAppDelivered(ord);
                                      }
                                    }}
                                    className="bg-white text-xs border border-zinc-200 px-2 py-1.5 focus:border-yellow-500 focus:outline-none text-zinc-900 font-mono font-black rounded-sm w-full"
                                  >
                                    <option value="Processing" className="bg-white text-yellow-750 font-bold">Processing 📦</option>
                                    <option value="Shipped" className="bg-white text-blue-750 font-bold">Shipped 🚚</option>
                                    <option value="Delivered" className="bg-white text-green-750 font-bold">Delivered ✅</option>
                                  </select>

                                  {/* ST Courier Tracking ID Input */}
                                  <div className="mt-2 flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="ST Courier ID (e.g. ST940381)"
                                      defaultValue={ord.stCourierId || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        const updated = orders.map((o) => (o.id === ord.id ? { ...o, stCourierId: val } : o));
                                        saveOrders(updated);
                                        if (selectedOrder?.id === ord.id) setSelectedOrder({ ...selectedOrder, stCourierId: val });
                                        if (val) triggerToast(`ST Courier ID saved as ${val} for ${ord.id}!`, "success");
                                      }}
                                      className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-yellow-500 rounded-sm px-1.5 py-1 text-[10px] font-mono font-bold text-zinc-900 focus:outline-none w-full"
                                    />
                                  </div>
                                </td>
                                <td className="p-3.5 text-zinc-400 font-mono text-[10px] whitespace-nowrap font-bold">{ord.date.split(" at ")[0]}</td>
                                <td className="p-3.5">
                                  <div className="flex items-center justify-end gap-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setPrintingOrder(ord)}
                                      className="p-1.5 bg-white hover:bg-yellow-400 hover:text-gray-950 border border-zinc-200 rounded-sm text-zinc-700 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-xs"
                                      title="Print Premium PDF Receipt Invoice"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>PDF</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if ((ord.paymentStatus || "Unpaid") !== "Paid") {
                                          triggerToast("Mark order as PAID first to unlock receipt delivery!", "info");
                                          return;
                                        }
                                        let cleanPhone = ord.shipping.phone?.replace(/\D/g, "") || "9585969334";
                                        if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
                                        else if (cleanPhone.startsWith("0")) cleanPhone = "91" + cleanPhone.substring(1);
                                        const itemsText = ord.items.map(item => `◽ *${item.product.name}* (${item.quantity}x) - ₹${item.product.price.toLocaleString("en-IN")}`).join("\n");
                                        const whatsappMsg = `*MADURAI GADGETS 58 - OFFICIAL DIGITAL RECEIPT* 📜\n...\n💰 *GRAND TOTAL:* ₹${ord.total.toLocaleString("en-IN")}`;
                                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`, "_blank", "noopener,noreferrer");
                                      }}
                                      className={`p-1.5 border rounded-sm transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-xs ${
                                        (ord.paymentStatus || "Unpaid") === "Paid"
                                          ? "bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-400 hover:text-gray-950"
                                          : "bg-zinc-150 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-50"
                                      }`}
                                    >
                                      {ord.paymentStatus === "Paid" ? <Send className="w-3.5 h-3.5 text-yellow-750" /> : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                                      <span>Send</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!isDeleting) {
                                          setDeletingOrderId(ord.id);
                                        } else {
                                          const filtered = orders.filter(o => o.id !== ord.id);
                                          saveOrders(filtered);
                                          if (selectedOrder?.id === ord.id) setSelectedOrder(filtered[0] || null);
                                          setDeletingOrderId(null);
                                          triggerToast(`Deleted ${ord.id} file!`, "info");
                                        }
                                      }}
                                      className={`p-1.5 border rounded-sm transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold shadow-xs ${
                                        isDeleting
                                          ? "bg-red-650 text-white border-red-750 hover:bg-red-750 animate-pulse"
                                          : "bg-white hover:bg-red-50 text-red-650 border-zinc-200 hover:border-red-300"
                                      }`}
                                      title="Delete order ticket"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      {isDeleting && <span>Sure?</span>}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {editingProduct && (
              <EditProductModal
                product={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSave={async (updatedProduct) => {
                  const isNumericId = /^\d+$/.test(updatedProduct.id);
                  const originalProduct = products.find(p => p.id === updatedProduct.id);
                  
                  try {
                    if (isNumericId && originalProduct) {
                      // 1. Update image link in MySQL
                      await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image_url: updatedProduct.image })
                      });
                    }

                    try {
                      // 2. Save metadata details to Firebase Firestore
                      await saveProductToFirebase(updatedProduct);
                    } catch (fbErr) {
                      console.error("Firebase update failed! Rolling back MySQL image...", fbErr);
                      if (isNumericId && originalProduct) {
                        // Rollback MySQL update to original image
                        await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ image_url: originalProduct.image })
                        });
                      }
                      throw fbErr;
                    }

                    const updatedList = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
                    setProducts(updatedList);
                    saveStoredProducts(updatedList);
                    setEditingProduct(null);
                    triggerToast(`Product "${updatedProduct.name}" updated successfully! 🚀`, "success");
                  } catch (err) {
                    console.error("Error updating product:", err);
                    triggerToast("Error updating product. Changes rolled back for consistency! ❌", "info");
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    )}

      {/* PERSISTENT GOOGLE MAPS STORE LOCATOR */}
      <section className="bg-zinc-50 border-t border-zinc-200 py-16 text-zinc-600" id="google-maps-store-locator">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 space-y-8 font-sans">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] text-amber-600 font-mono uppercase tracking-[0.2em] font-bold">Store Locator</p>
              <h2 className="text-2xl font-display font-bold text-zinc-900 uppercase tracking-widest mt-1">
                Visit Us in Madurai Outlet 🏛️
              </h2>
              <p className="text-zinc-500 text-xs font-light mt-1 max-w-lg">
                Come try premium replica watches and custom digital products directly in hand at our prime physical flagship showroom located in Simmakkal, Madurai.
              </p>
            </div>
            
            <div className="bg-white p-4 border border-zinc-200 space-y-1 text-xs text-zinc-800 shadow-sm">
              <p className="font-semibold text-amber-600 font-mono">📍 Flagship Location Address:</p>
              <p className="text-zinc-600">Madurai Gadgets 58, Vakkil New Street, Simmakkal, Madurai, TN - 625001</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">⏰ 10:30 AM to 09:30 PM (Sunday Closed)</p>
            </div>
          </div>

          <div className="w-full h-80 sm:h-96 border border-zinc-200 rounded-none overflow-hidden relative shadow-md bg-zinc-50 flex items-center justify-center">
            {showMap ? (
              <iframe
                title="Madurai Gadgets Official Map Location"
                src="https://maps.google.com/maps?q=Madurai%20gadgets,%2520Vakkil%2520New%2520Street,%2520Simmakkal&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full bg-white border-0"
                allowFullScreen={true}
                loading="lazy"
              />
            ) : (
              <div className="flex items-center gap-2 text-zinc-400 font-medium text-xs font-mono">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-yellow-500 border-t-transparent rounded-full shrink-0"></span>
                <span>Optimizing Map View...</span>
              </div>
            )}
          </div>

        </div>
      </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-200 py-12 mt-20 font-sans">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 text-white font-semibold flex items-center justify-center text-sm tracking-widest font-serif">M</div>
            <div>
              <p className="font-display font-bold text-base text-zinc-900 tracking-widest uppercase">
                MADURAI GADGETS <span className="font-bold text-amber-500">58</span>
              </p>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                premium mastercopy watches | essential for daily wear
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[10px] text-zinc-500 uppercase tracking-widest">
            <a href="https://wa.me/919585969334" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-all flex items-center gap-1.5 text-emerald-600 font-bold">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Support
            </a>
            <a href="https://www.google.com/maps/place/Madurai+gadgets/@9.9922292,78.143742,17z/data=!3m1!4b1!4m6!3m5!1s0x3b00c700009d03d3:0xfef509e87545f20!8m2!3d9.9922239!4d78.1463169!16s%2Fg%2F11lcv4slbg?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-all flex items-center gap-1.5 text-amber-600 font-bold">
              <MapPin className="w-3.5 h-3.5" /> Google Location
            </a>
            <a href="https://www.instagram.com/madurai_gadgets_58?igsh=MjgybWtsNWVzaGhi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-all flex items-center gap-1.5 text-rose-600 font-bold">
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </a>
            <button onClick={() => { setActiveTab("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-zinc-900 transition-colors cursor-pointer">Watch Catalog</button>
            <button onClick={() => { setActiveTab("tracker"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-zinc-900 transition-colors cursor-pointer">Order Status</button>
            {isAdminLoggedIn ? (
              <>
                <button 
                  onClick={() => {
                    setActiveTab("merchant");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }} 
                  className="hover:text-amber-600 text-amber-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  ⚙️ Admin Panel
                </button>
                <button 
                  onClick={async () => { 
                    setIsAdminLoggedIn(false); 
                    localStorage.removeItem("madurai_admin_logged_in"); 
                    setActiveTab("shop"); 
                    try {
                      await signOutUser();
                    } catch (e) {
                      console.warn("Sign out err:", e);
                    }
                    triggerToast("Admin Session Locked.", "info"); 
                  }} 
                  className="hover:text-zinc-900 opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                >
                  🔒 Lock Session
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setActiveTab("merchant");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className="hover:text-zinc-900 opacity-60 hover:opacity-100 transition-all cursor-pointer"
              >
                🔑 Admin Panel / Portal Login
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* IMMERSIVE PRODUCT DETAIL OVERLAY MODAL */}
      <AnimatePresence>
        {detailedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-md border border-zinc-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 relative flex flex-col gap-6"
            >
              {/* Close tool */}
              <button
                onClick={() => setDetailedProduct(null)}
                className="absolute right-4 top-4 p-2.5 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Main details row (two columns) */}
              <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* Left Column Art depiction */}
              <div className="md:w-1/2 space-y-4">
                {renderProductIllustration(activeDetailImage || detailedProduct.image, "h-56 sm:h-64", 900)}
                
                {/* Dynamic Color Variations circles */}
                {detailedProduct.variations && detailedProduct.variations.length > 0 && (
                  <div className="bg-zinc-50 p-3 rounded-sm border border-zinc-200 space-y-2">
                    <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none">Available Colors 🎨</span>
                    <div className="flex flex-wrap gap-2.5">
                      {detailedProduct.variations.map((v, idx) => {
                        const isSelected = (activeDetailImage || detailedProduct.image) === v.image;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveDetailImage(v.image)}
                            className={`w-7 h-7 rounded-full border-2 transition-all shadow-xs cursor-pointer ${
                              isSelected ? "border-yellow-500 scale-110 ring-2 ring-yellow-400/20" : "border-zinc-300 hover:scale-105"
                            }`}
                            style={{ backgroundColor: v.color }}
                            title={v.color}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="bg-zinc-50 p-4 rounded-sm border border-zinc-200 space-y-2.5 text-zinc-500 font-sans text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="font-semibold text-zinc-850">6 to 12 Months Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="font-semibold text-zinc-850">Complementary 30-Day Escrow Returns</span>
                  </div>
                </div>
              </div>

              {/* Right Column Specs and control */}
              <div className="md:w-1/2 flex flex-col justify-between space-y-5 font-light">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-700 px-2.5 py-0.5 rounded-sm font-mono uppercase tracking-widest">{detailedProduct.category}</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="font-extrabold text-zinc-900">{detailedProduct.rating}</span>
                      <span className="text-zinc-400">({detailedProduct.reviewsCount} verified)</span>
                    </div>
                  </div>

                  <h3 className="font-display font-medium text-2xl text-zinc-900 leading-tight">
                    {detailedProduct.name}
                  </h3>

                  <p className="text-zinc-600 text-xs leading-relaxed font-sans">
                    {detailedProduct.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-zinc-100">
                    <h4 className="font-mono text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Aesthetic & Technical Specifications</h4>
                    <ul className="space-y-1 text-xs text-zinc-600 font-medium">
                      {(() => {
                        const rawSpecs = detailedProduct.specs || (detailedProduct as any).technical_specifications;
                        let specsArray: string[] = [];

                        if (Array.isArray(rawSpecs)) {
                          specsArray = rawSpecs;
                        } else if (typeof rawSpecs === "string") {
                          specsArray = rawSpecs
                            .split("\n")
                            .map((line: string) => line.trim())
                            .filter((line: string) => line.length > 0);
                        }

                        // Fallback: If description contains multiline specs
                        if (specsArray.length === 0 && detailedProduct.description && detailedProduct.description.includes("\n")) {
                          specsArray = detailedProduct.description
                            .split("\n")
                            .map((line: string) => line.trim())
                            .filter((line: string) => line.length > 0);
                        }

                        // Ultimate fallback
                        if (specsArray.length === 0) {
                          specsArray = ["Premium Quality Mastercopy", "Complete UV Protection Glass", "High Grade Solid Build"];
                        }

                        return specsArray.map((spec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-4 mt-auto">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Pricing</span>
                    <p className="font-mono text-2xl font-bold text-zinc-900">₹{detailedProduct.price.toLocaleString("en-IN")}</p>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(detailedProduct);
                      setDetailedProduct(null);
                    }}
                    className="px-6 py-3 bg-yellow-400 text-gray-950 font-bold uppercase transition-all text-xs tracking-widest rounded-sm cursor-pointer hover:bg-yellow-300 shadow-md"
                  >
                    Add Watch to Cart
                  </button>
                </div>

              </div>
            </div>

            {/* Premium Upsell/Recommendation Section */}
            {(() => {
              // Upsell criteria: Find watches in the same category or overall, with a price > current product price
              // Sort them ascending (lowest up-charged item first) and display top 3 picks
              const upsellPicks = products
                .filter((p) => p.id !== detailedProduct.id && p.price > detailedProduct.price)
                .sort((a, b) => a.price - b.price)
                .slice(0, 3);

              if (upsellPicks.length === 0) return null;

              return (
                <div className="pt-5 border-t border-zinc-200 mt-2 space-y-3 font-sans w-full">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest leading-none">
                      🔥 Upgrade Your Style: Premium Picks You Might Love
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {upsellPicks.map((pick) => (
                      <button
                        key={pick.id}
                        onClick={() => {
                          setDetailedProduct(pick); // change modal focus
                          setActiveDetailImage(null); // reset variant selection
                        }}
                        className="group border border-zinc-200 hover:border-yellow-500 p-2 text-left bg-zinc-50 hover:bg-white rounded transition-all flex flex-col justify-between items-stretch cursor-pointer select-none"
                      >
                        <div className="h-16 sm:h-20 bg-transparent flex items-center justify-center p-0.5 overflow-hidden">
                          {renderProductIllustration(pick.image, "h-full", 150)}
                        </div>
                        <div className="mt-1 min-w-0">
                          <h4 className="font-bold text-[9px] sm:text-[10px] text-zinc-800 truncate leading-tight group-hover:text-yellow-600">
                            {pick.name}
                          </h4>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] font-mono text-zinc-950 font-bold">
                              ₹{pick.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[8px] font-mono text-emerald-600 font-bold">
                              +₹{(pick.price - detailedProduct.price).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLIDING CHECKOUT SHOPPING CART PANEL */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs" onClick={() => setIsCartOpen(false)}></div>
            
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 220, damping: 25 }}
                className="w-screen max-w-md bg-white shadow-2xl border-l border-zinc-200 flex flex-col h-full overflow-hidden"
              >
                
                {/* Header context */}
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-zinc-900 shrink-0" />
                    <h3 className="font-display text-lg text-zinc-900 tracking-widest uppercase font-bold">Your Basket</h3>
                    <span className="font-mono text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-full">{cartTotalItems} items</span>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body scroll listing */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center space-y-3 font-light">
                      <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto shrink-0" />
                      <p className="font-display font-bold tracking-wider text-zinc-900 text-base">Your cart is entirely empty</p>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">Explore our high-end chronographs, luxury automatic movements, and classic leather straps.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="px-6 py-3 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-zinc-900 text-[11px] uppercase tracking-widest font-bold transition-all cursor-pointer mt-4 shadow-sm"
                      >
                        Keep Browsing
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 divide-y divide-zinc-100">
                      {cart.map((item) => (
                        <div key={item.product.id} className="pt-4 first:pt-0 flex items-start gap-4">
                          <div className="w-16 shrink-0">
                            {renderProductIllustration(item.product.image, "h-16", 150)}
                          </div>

                          <div className="flex-1 space-y-1">
                            <h4 className="font-sans font-bold text-xs text-zinc-800 leading-tight">{item.product.name}</h4>
                            <p className="font-mono text-[11px] text-zinc-500 font-medium">₹{item.product.price.toLocaleString("en-IN")}</p>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 pt-1 font-mono">
                              <div className="flex items-center border border-zinc-200 bg-zinc-50 rounded-full">
                                <button
                                  onClick={() => updateCartQty(item.product.id, -1)}
                                  className="p-1 px-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="px-1 text-[11px] font-semibold text-zinc-800">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQty(item.product.id, 1)}
                                  className="p-1 px-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeCartItem(item.product.id)}
                                className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors cursor-pointer ml-1"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <span className="font-mono text-xs text-zinc-900 pt-1 font-bold">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}



                  {/* Interactive Shipping Address Submission form */}
                  {cart.length > 0 && (
                    <form onSubmit={processCheckoutSubmit} className="pt-6 border-t border-zinc-200 space-y-3 font-light">
                      <p className="font-mono text-[9px] font-bold tracking-[0.25em] text-zinc-500 uppercase">Shipment Address Profiles</p>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Good Name"
                          value={shippingForm.fullName}
                          onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="WhatsApp / Phone Number (e.g. 9585969334)"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                        />
                        <input
                          type="email"
                          required
                          placeholder="recipient@domain.com"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Full Street address"
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="City / Region"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Post / Zip"
                            value={shippingForm.zipCode}
                            onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                            className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                          />
                        </div>
                      </div>

                      {/* Checkout summary breakdown info */}
                      <div className="bg-zinc-50 p-5 rounded-none border border-zinc-200 text-xs space-y-2.5 font-mono text-zinc-500 pt-4 mt-4">
                        <div className="flex justify-between">
                          <span>Purchase Total:</span>
                          <span className="text-zinc-800">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Promo Discount (-{discountPercent}%):</span>
                            <span>-₹{discountUSD.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Estimated Shipping:</span>
                          <span className="text-zinc-800">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toLocaleString("en-IN")}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fulfillment Surcharge (Tax 8%):</span>
                          <span className="text-zinc-800">₹{taxEst.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-zinc-800 font-sans font-normal text-sm pt-2.5 border-t border-zinc-200">
                          <span>Total Payment:</span>
                          <span className="font-mono text-base font-bold text-zinc-900">₹{cartTotal.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="pt-6 border-t border-zinc-200 space-y-3 font-light">
                        <p className="font-mono text-[9px] font-bold tracking-[0.25em] text-zinc-500 uppercase">Select Payment Method</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("whatsapp")}
                            className={`py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                              paymentMethod === "whatsapp"
                                ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                : "bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            <MessageCircle className="w-4 h-4 shrink-0" />
                            <span>WhatsApp QR</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("upi")}
                            className={`py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                              paymentMethod === "upi"
                                ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                : "bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>UPI Direct Pay</span>
                          </button>
                        </div>
                      </div>

                      {/* Payment Content Panels */}
                      {paymentMethod === "whatsapp" ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-none text-[10px] text-emerald-700 font-mono leading-relaxed mt-4">
                          💡 *Machan Note:* We do not collect credit cards online. Clicking below registers your order details and opens WhatsApp directly to request our *official GPay/PhonePe payment QR code* (linked number: **9688616838**, UPI ID: **dineshdev5227-2@okhdfcbank**) for secure transfer!
                        </div>
                      ) : (
                        <div className="p-4 bg-zinc-50 border border-zinc-250 rounded-none space-y-4 mt-4">
                          <div className="text-center space-y-2">
                            <p className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">Scan to Pay via UPI</p>
                            <div className="space-y-3">
                              <a
                                href={`upi://pay?pa=dineshdev5227-2@okhdfcbank&pn=Dinesh%20DV`}
                                className="inline-block p-2 bg-white border border-zinc-200 shadow-xs hover:border-yellow-500 hover:ring-1 hover:ring-yellow-500 transition-all rounded-sm"
                                title="Click to Pay directly via App (GPay/PhonePe)"
                              >
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                                    `upi://pay?pa=dineshdev5227-2@okhdfcbank&pn=Dinesh%20DV`
                                  )}`}
                                  alt="UPI Payment QR Code"
                                  className="w-44 h-44 object-contain mx-auto"
                                  decoding="async"
                                  loading="lazy"
                                />
                              </a>
                              
                              <div>
                                <a
                                  href={`upi://pay?pa=dineshdev5227-2@okhdfcbank&pn=Dinesh%20DV`}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-yellow-450 hover:bg-yellow-500 text-gray-950 font-black uppercase text-[10px] tracking-wider rounded-sm text-center shadow-xs transition-all w-44 mx-auto font-mono active:scale-95 duration-200"
                                >
                                  ⚡ Pay Directly via App
                                </a>
                              </div>
                            </div>
                            <p className="text-xs font-sans text-zinc-800 font-medium">
                              Total Amount: <span className="font-mono font-bold text-zinc-900">₹{cartTotal.toLocaleString("en-IN")}</span>
                            </p>
                          </div>

                          <div className="space-y-2.5 border-t border-zinc-200 pt-3">
                            <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                              👉 Scan the QR using GPay, PhonePe, Paytm, or BHIM. Or transfer directly to UPI ID: <strong className="text-zinc-950 font-bold select-all">dineshdev5227-2@okhdfcbank</strong> or Number: <strong className="text-zinc-950 font-bold select-all">9688616838</strong>.
                              <br />
                              <span className="text-amber-600 font-bold">⚠️ Note: Enter the amount manually inside GPay/PhonePe to complete the transfer!</span>
                            </p>
                            <div className="p-2.5 bg-white border border-zinc-200 rounded-sm text-[10px] space-y-1 text-zinc-650 font-mono">
                              <p className="font-bold text-zinc-800">🏦 Bank Transfer Details:</p>
                              <p>Bank: <strong>HDFC BANK</strong></p>
                              <p>Account Number: <strong className="select-all text-zinc-950">50100483327828</strong></p>
                            </div>
                            
                            <div className="space-y-1">
                              <label htmlFor="utr-input" className="block font-mono text-[9px] font-bold text-zinc-500 uppercase">
                                Enter 12-Digit UPI UTR / Transaction ID *
                              </label>
                              <input
                                id="utr-input"
                                type="text"
                                required={paymentMethod === "upi"}
                                pattern="[0-9]{12}"
                                title="Transaction ID / UTR must be exactly 12 digits"
                                maxLength={12}
                                placeholder="e.g. 340912785634"
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isCheckingOut}
                        className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white text-[11px] uppercase tracking-[0.25em] font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                            Redirecting to WhatsApp...
                          </>
                        ) : (
                          <>
                            {paymentMethod === "upi" ? "Pay & Submit on WhatsApp 💬" : "Checkout on WhatsApp (Get Payment QR) 💬"}
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <a
        href="https://wa.me/919585969334?text=Vanakkam%20Madurai%20Gadgets%2058!%20I%20am%20looking%20for%20premium%20mastercopy%20watches%20and%20accessories.%20Let%20me%20know%20how%20to%20order."
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-widget"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#128C7E] text-white p-4.5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer border border-white/10"
      >
        {/* Pulsing ring effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping -z-10 group-hover:hidden"></span>
        
        {/* Subtle nice Tooltip */}
        <span className="absolute right-16 bg-[#111113] border border-white/10 text-[10px] text-white px-3 py-1.5 shadow-2xl tracking-widest font-mono uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-none">
          ⚡ Machan WhatsApp Chat Support 💬
        </span>

        {/* WhatsApp Icon */}
        <MessageCircle className="w-6 h-6 text-white shrink-0 fill-current" />
      </a>



      {/* PREMIUM PRINTABLE BILLING INVOICE MODAL */}
      <AnimatePresence>
        {printingOrder && (
          <div id="printable-invoice-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto border-t border-zinc-200">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                /* Hide browser headers/footers with @page margin rule */
                @page {
                  size: auto;
                  margin: 0mm !important;
                }
                /* Hide everything in the document */
                body * {
                  visibility: hidden !important;
                }
                /* Only show the invoice card and its contents */
                #printable-invoice-card, #printable-invoice-card * {
                  visibility: visible !important;
                }
                /* Place the card precisely at the top-left corner of the print window */
                #printable-invoice-card {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  height: auto !important;
                  border: none !important;
                  box-shadow: none !important;
                  padding: 24px !important;
                  margin: 0 !important;
                  background: #ffffff !important;
                  color: #111827 !important;
                  page-break-inside: avoid !important;
                  page-break-after: avoid !important;
                  page-break-before: avoid !important;
                }
                /* Print background colors properly and force a single page limit */
                html, body {
                  background: #ffffff !important;
                  color: #111827 !important;
                  height: 100vh !important;
                  overflow: hidden !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #printable-invoice-actions {
                  display: none !important;
                }
              }
            `}} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full my-8 text-gray-900"
            >
              <div id="printable-invoice-card" className="bg-white border-l-[16px] border-amber-500 p-8 text-zinc-900 relative shadow-2xl space-y-6 flex flex-col justify-between font-sans">
                
                {/* Header brand details */}
                <div className="bg-zinc-950 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
                  <div>
                    <h2 className="text-xl font-display font-black tracking-widest text-white leading-none uppercase">
                      MADURAI GADGETS <span className="text-amber-500 font-extrabold">58</span>
                    </h2>
                    <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-[0.2em] mt-1.5">
                      OFFICIAL RETAIL WATCH PASS &amp; ORDER PERMIT
                    </p>
                    <p className="text-[8px] text-zinc-500 font-sans mt-2.5 leading-relaxed">
                      Simmakkal Outlet &bull; Premium Replica Timepieces &bull; A+ Certified Grade-A
                    </p>
                  </div>
                  
                  <div className="text-right font-mono flex flex-col items-end gap-1.5 self-stretch sm:self-auto justify-between">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                      ID: {printingOrder.id}
                    </span>
                    <span className="text-[7px] text-zinc-500 mt-1 uppercase tracking-wider block">
                      SECURE BILLING TICKET
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-sans">
                  {/* Left Column: Customer details */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-[9px] font-black tracking-[0.15em] text-zinc-400 uppercase border-b border-zinc-200 pb-1">CUSTOMER DETAILS</h4>
                    <div className="space-y-1 text-xs">
                      <p className="text-zinc-500">Name: <strong className="text-zinc-900 font-bold">{printingOrder.shipping.fullName}</strong></p>
                      <p className="text-zinc-500">Contact Phone: <strong className="text-zinc-900 font-semibold">{printingOrder.shipping.phone}</strong></p>
                      <p className="text-zinc-500">Contact Email: <strong className="text-zinc-900 font-medium">{printingOrder.shipping.email}</strong></p>
                      <p className="text-zinc-500">Delivery Address: <strong className="text-zinc-900 font-medium font-sans">{printingOrder.shipping.address}, {printingOrder.shipping.city} - {printingOrder.shipping.zipCode}</strong></p>
                    </div>
                  </div>

                  {/* Right Column: Schedule / Order info */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-[9px] font-black tracking-[0.15em] text-zinc-400 uppercase border-b border-zinc-200 pb-1">ORDER &amp; SHIPPING INFO</h4>
                    <div className="space-y-1 text-xs">
                      <p className="text-zinc-500">Outlet Location: <strong className="text-amber-600 font-bold">Simmakkal Showroom (Madurai)</strong></p>
                      <p className="text-zinc-500">Purchase Date: <strong className="text-zinc-900 font-semibold">{printingOrder.date.includes(" at ") ? printingOrder.date.split(" at ")[0] : printingOrder.date.split(",")[0]}</strong></p>
                      <p className="text-zinc-500">Purchase Time: <strong className="text-zinc-900 font-semibold">{printingOrder.date.includes(" at ") ? printingOrder.date.split(" at ")[1] : (printingOrder.date.split(",")[1] || "12:00 PM")}</strong></p>
                      <p className="text-zinc-500">Fulfillment Status: <strong className="text-zinc-900 font-semibold">{printingOrder.status} (Verified)</strong></p>
                    </div>
                  </div>
                </div>

                {/* Billing Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-mono text-[9px] font-black tracking-[0.15em] text-zinc-400 uppercase">BILLING DETAILS &amp; FEE COMPILATION</h4>
                  
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-650 text-[9px] font-mono uppercase tracking-wider border-b border-zinc-200">
                        <th className="py-2 px-3">Charge Description</th>
                        <th className="py-2 px-3 text-right">Pricing (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-sans text-xs">
                      {printingOrder.items.map((item, idx) => (
                        <tr key={idx} className="text-zinc-800">
                          <td className="py-3 px-3">
                            <strong className="text-zinc-900 block font-bold">{item.product.name} (x{item.quantity})</strong>
                            <span className="text-[9px] text-zinc-500 block font-mono">{item.product.category} &bull; Premium Quality Mastercopy</span>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-zinc-900 font-mono">
                            INR {Math.round(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                      {/* Subtotal before tax */}
                      <tr className="text-zinc-500 text-[11px] font-mono">
                        <td className="py-2 px-3">Subtotal (Excl. Tax)</td>
                        <td className="py-2 px-3 text-right">
                          INR {Math.round(printingOrder.total / 1.08 + (printingOrder.discount || 0)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      {printingOrder.discount > 0 && (
                        <tr className="text-emerald-600 text-[11px] font-mono font-bold">
                          <td className="py-2 px-3">Promo discount code:</td>
                          <td className="py-2 px-3 text-right">
                            -INR {printingOrder.discount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      )}
                      <tr className="text-zinc-500 text-[11px] font-mono">
                        <td className="py-2 px-3">SGST &amp; CGST surcharge (8%):</td>
                        <td className="py-2 px-3 text-right">
                          INR {Math.round(printingOrder.total - (printingOrder.total / 1.08)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total Paid block */}
                <div className="bg-amber-600 p-4 text-white flex justify-between items-center select-none tracking-wide">
                  <span className="text-xs font-black font-sans uppercase">TOTAL PAID AMOUNT IN FULL</span>
                  <span className="text-sm font-bold font-mono">INR {Math.round(printingOrder.total).toLocaleString("en-IN")}</span>
                </div>

                {/* Barcode & Stamp Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
                  {/* Gate pass security barcode */}
                  <div className="space-y-1">
                    <p className="font-mono text-[8px] font-black tracking-wider text-zinc-400 uppercase">GATE-PASS SECURITY BARCODE</p>
                    <div className="flex flex-col items-start gap-1">
                      <svg className="w-60 h-10 text-zinc-900 fill-current" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <rect x="0" y="0" width="2" height="20" />
                        <rect x="3" y="0" width="1" height="20" />
                        <rect x="5" y="0" width="3" height="20" />
                        <rect x="10" y="0" width="1" height="20" />
                        <rect x="12" y="0" width="2" height="20" />
                        <rect x="15" y="0" width="1" height="20" />
                        <rect x="18" y="0" width="3" height="20" />
                        <rect x="22" y="0" width="2" height="20" />
                        <rect x="25" y="0" width="1" height="20" />
                        <rect x="28" y="0" width="4" height="20" />
                        <rect x="33" y="0" width="1" height="20" />
                        <rect x="35" y="0" width="2" height="20" />
                        <rect x="38" y="0" width="1" height="20" />
                        <rect x="41" y="0" width="3" height="20" />
                        <rect x="45" y="0" width="1" height="20" />
                        <rect x="47" y="0" width="2" height="20" />
                        <rect x="51" y="0" width="3" height="20" />
                        <rect x="55" y="0" width="1" height="20" />
                        <rect x="58" y="0" width="4" height="20" />
                        <rect x="63" y="0" width="2" height="20" />
                        <rect x="66" y="0" width="1" height="20" />
                        <rect x="69" y="0" width="3" height="20" />
                        <rect x="73" y="0" width="1" height="20" />
                        <rect x="76" y="0" width="2" height="20" />
                        <rect x="80" y="0" width="3" height="20" />
                        <rect x="84" y="0" width="1" height="20" />
                        <rect x="87" y="0" width="4" height="20" />
                        <rect x="92" y="0" width="2" height="20" />
                        <rect x="95" y="0" width="1" height="20" />
                        <rect x="98" y="0" width="2" height="20" />
                      </svg>
                      <span className="text-[7px] font-mono tracking-widest text-zinc-500">*{printingOrder.id}-VERIFIED*</span>
                    </div>
                  </div>

                  {/* Stamp status */}
                  <div>
                    {(printingOrder.paymentStatus || "Unpaid") === "Paid" ? (
                      <div className="border-2 border-emerald-500 p-2.5 text-center rounded-xs select-none min-w-44 bg-emerald-50/50">
                        <span className="text-[11px] font-black text-emerald-600 block tracking-wider">RESERVED &amp; PAID</span>
                        <span className="text-[6px] font-bold text-emerald-500 block mt-0.5 tracking-wider">VERIFIED VIA FIRESTORE</span>
                      </div>
                    ) : (
                      <div className="border-2 border-rose-500 p-2.5 text-center rounded-xs select-none min-w-44 bg-rose-50/50">
                        <span className="text-[11px] font-black text-rose-600 block tracking-wider">UNPAID &amp; PENDING</span>
                        <span className="text-[6px] font-bold text-rose-500 block mt-0.5 tracking-wider">WAITING TO RECEIVE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Store Regulations Code of Conduct */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 font-sans text-[10px] text-zinc-500 space-y-2.5">
                  <h5 className="font-mono font-black tracking-wider text-zinc-800 uppercase leading-none m-0">STORE REGULATIONS &amp; TERMS OF CONDUCT</h5>
                  <ol className="list-decimal list-inside space-y-1 font-light leading-normal pl-0.5 m-0">
                    <li>All products are Grade-A premium copy timepieces featuring Japanese sweeping quartz/automatic movements.</li>
                    <li>Secure delivery is complimentary. Registered order details are instantly synced to our tracking ledger.</li>
                    <li>For warranty claims or returns, customers must present this generated invoice ticket to our support channels.</li>
                    <li>Order status inquiries, cancellations or custom updates can be verified directly via our WhatsApp portal.</li>
                  </ol>
                </div>

                <div className="text-[9px] text-zinc-400 text-center leading-relaxed">
                  This is an electronically compiled validation slip. No signature is legally required.<br />
                  Thank you for shopping at Madurai Gadgets 58! "WEAR PEAK, MASTER YOUR STYLE"
                </div>

                {/* Operations Utility action panel button block */}
                <div id="printable-invoice-actions" className="flex gap-3 justify-end pt-4 border-t border-gray-200 font-sans">
                  <button
                    type="button"
                    onClick={() => setPrintingOrder(null)}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-900 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                  >
                    Close Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-950 text-xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    Print Receipt / Save PDF
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
}
