import React, { useState } from "react";
import { Loader2, Play, Pause, Square, CheckCircle, AlertTriangle, RefreshCw, Clipboard, Download } from "lucide-react";
import { Product } from "../types";

interface BulkUploadViewProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;
  triggerToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function BulkUploadView({
  products,
  setProducts,
  fetchProducts,
  triggerToast,
}: BulkUploadViewProps) {
  const [urlsInput, setUrlsInput] = useState<string>("");
  const [baseName, setBaseName] = useState<string>("Premium Sunglass Model");
  const [defaultPrice, setDefaultPrice] = useState<number>(1999);
  const [defaultCategory, setDefaultCategory] = useState<string>("Sunglasses");
  const [defaultBrand, setDefaultBrand] = useState<string>("Other");
  const [defaultStock, setDefaultStock] = useState<number>(15);
  const [defaultDescription, setDefaultDescription] = useState<string>(
    "A+ Grade premium quality sunglasses with complete UV400 protection and luxury style detailing."
  );
  const [defaultGender, setDefaultGender] = useState<"Men" | "Women" | "Unisex">("Unisex");

  // Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<{
    total: number;
    current: number;
    success: number;
    failed: number;
    activeName: string;
  }>({ total: 0, current: 0, success: 0, failed: 0, activeName: "" });

  const [logs, setLogs] = useState<{ id: string; type: "success" | "error" | "info"; message: string }[]>([]);
  const [cancelUpload, setCancelUpload] = useState<boolean>(false);

  // Parse URLs helper
  const getParsedUrls = (): string[] => {
    return urlsInput
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => {
        if (!url) return false;
        // Basic URL validation
        return url.startsWith("http://") || url.startsWith("https://") || url.includes("cloudinary.com");
      });
  };

  const handleStartBulkUpload = async () => {
    const urls = getParsedUrls();
    if (urls.length === 0) {
      triggerToast("Please paste valid image URLs (one per line)!", "warning");
      return;
    }

    setIsUploading(true);
    setIsPaused(false);
    setCancelUpload(false);
    setLogs([]);
    setCurrentProgress({
      total: urls.length,
      current: 0,
      success: 0,
      failed: 0,
      activeName: "",
    });

    addLog("info", `Starting bulk upload session for ${urls.length} sunglasses... 🚀`);

    // We loop and post each product
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < urls.length; i++) {
      // Check if user clicked Cancel
      if (cancelUpload) {
        addLog("info", "Upload process cancelled by Admin. 🛑");
        break;
      }

      // Handle pause state
      while (isPaused && !cancelUpload) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (cancelUpload) {
        addLog("info", "Upload process cancelled by Admin. 🛑");
        break;
      }

      const imageUrl = urls[i];
      const prodName = `${baseName} ${products.length + successCount + 1}`;

      setCurrentProgress((prev) => ({
        ...prev,
        current: i + 1,
        activeName: prodName,
      }));

      addLog("info", `Uploading product ${i + 1}/${urls.length}: ${prodName}...`);

      const productPayload = {
        name: prodName,
        price: defaultPrice,
        description: defaultDescription,
        image_url: imageUrl,
        category: defaultCategory,
        brand: defaultBrand,
        stock: defaultStock,
        gender: defaultGender,
        variations: [], // Standard variation list empty or custom
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });

        if (response.ok) {
          successCount++;
          setCurrentProgress((prev) => ({ ...prev, success: successCount }));
          addLog("success", `✅ Success: "${prodName}" added successfully.`);
        } else {
          failedCount++;
          setCurrentProgress((prev) => ({ ...prev, failed: failedCount }));
          addLog("error", `❌ Failed: Server responded with error status for "${prodName}".`);
        }
      } catch (err: any) {
        failedCount++;
        setCurrentProgress((prev) => ({ ...prev, failed: failedCount }));
        addLog("error", `❌ Error: Connection failed for "${prodName}" (${err.message}).`);
      }

      // Visual delay to make it smooth and avoid spamming MySQL too hard
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsUploading(false);
    triggerToast(`Bulk upload finished! Success: ${successCount}, Failed: ${failedCount}`, "success");
    addLog("success", `🎉 Bulk upload completed. Refreshing product directory...`);
    
    // Refresh products in the global state
    await fetchProducts();
  };

  const addLog = (type: "success" | "error" | "info", message: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        type,
        message: `[${new Date().toLocaleTimeString()}] ${message}`,
      },
      ...prev,
    ]);
  };

  const handlePauseToggle = () => {
    setIsPaused((p) => {
      const next = !p;
      addLog("info", next ? "Upload session paused. ⏸️" : "Upload session resumed. ▶️");
      return next;
    });
  };

  const handleCancelUpload = () => {
    setCancelUpload(true);
    addLog("info", "Requesting cancellation... please wait for current item to finish. ⏳");
  };

  const loadSampleUrls = () => {
    const samples = [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop"
    ];
    setUrlsInput(samples.join("\n"));
    triggerToast("Sample links loaded! Try hitting upload to test.", "info");
  };

  const parsedCount = getParsedUrls().length;

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-sm space-y-8 text-gray-800 shadow-sm" id="bulk-upload-dashboard">
      <div className="border-b border-gray-200 pb-4">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">
          Database Automation Engine 🚀
        </span>
        <h3 className="text-xl font-display font-black text-gray-900 mt-2 uppercase tracking-wide">
          SMART BULK CATALOG UPLOADER
        </h3>
        <p className="text-xs text-gray-500 font-medium">
          Macha, use this control board to instantly seed all 528 sunglasses into your MySQL database in one go! No manual entry required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                Base Name Template
              </label>
              <input
                type="text"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-sans focus:outline-none focus:border-amber-500"
                placeholder="e.g. Premium Sunglass Model"
                disabled={isUploading}
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Products will be named: <strong>{baseName} #</strong> (e.g. {baseName} {products.length + 1})
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                  Default Price (₹)
                </label>
                <input
                  type="number"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                  placeholder="1999"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                  Category
                </label>
                <select
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-sans focus:outline-none focus:border-amber-500"
                  disabled={isUploading}
                >
                  <option value="Sunglasses">Sunglasses 😎</option>
                  <option value="Premier Watches">Premier Watches ⌚</option>
                  <option value="Normal Watches">Normal Watches 💸</option>
                  <option value="Japanese Model Watches">Japanese Model Watches 🇯🇵</option>
                  <option value="Bluetooth Speakers">Bluetooth Speakers 🔊</option>
                  <option value="Accessories">Accessories 🎒</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                  Brand Name
                </label>
                <select
                  value={defaultBrand}
                  onChange={(e) => setDefaultBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                  disabled={isUploading}
                >
                  {["Rolex", "Omega", "Audemars Piguet", "Patek Philippe", "Casio", "Other"].map((br) => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                  Sub-Category / Gender
                </label>
                <select
                  value={defaultGender}
                  onChange={(e) => setDefaultGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-sans focus:outline-none focus:border-amber-500"
                  disabled={isUploading}
                >
                  <option value="Unisex">Unisex 🌟</option>
                  <option value="Men">Men 👨</option>
                  <option value="Women">Women 👩</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  value={defaultStock}
                  onChange={(e) => setDefaultStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                  placeholder="15"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
                Product Description
              </label>
              <textarea
                value={defaultDescription}
                onChange={(e) => setDefaultDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-sans focus:outline-none focus:border-amber-500"
                placeholder="Product description template..."
                disabled={isUploading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                  Image links (Cloudinary / Unsplash / Web links - One per line)
                </label>
                <button
                  type="button"
                  onClick={loadSampleUrls}
                  className="text-[10px] text-amber-600 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                  disabled={isUploading}
                >
                  ✨ Load sample links
                </button>
              </div>
              <textarea
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 bg-zinc-50 border border border-zinc-250 font-mono text-xs focus:outline-none focus:border-amber-500 leading-relaxed placeholder-zinc-300"
                placeholder="https://res.cloudinary.com/demo/image/upload/sunglasses_01.jpg&#10;https://res.cloudinary.com/demo/image/upload/sunglasses_02.jpg&#10;https://res.cloudinary.com/demo/image/upload/sunglasses_03.jpg"
                disabled={isUploading}
              />
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1.5 font-mono">
                <span>Lines detected: {urlsInput.split("\n").filter(Boolean).length}</span>
                <span className="font-bold text-amber-600">Valid images to import: {parsedCount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isUploading ? (
              <button
                type="button"
                onClick={handleStartBulkUpload}
                disabled={parsedCount === 0}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Start Bulk Upload ({parsedCount} Items) 🚀
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePauseToggle}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Resume ▶️
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-white" />
                      Pause ⏸️
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Stop / Cancel 🛑
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Live Progress & Status Monitoring */}
        <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 p-5 rounded-sm flex flex-col h-[520px]">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-3 flex items-center justify-between">
            <span>🔴 Live Progress Stream</span>
            {isUploading && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing...
              </span>
            )}
          </h4>

          {/* Progress Indicators */}
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white border border-zinc-200 p-2.5 shadow-sm">
                <span className="block text-[9px] font-mono text-zinc-400 uppercase">Processed</span>
                <span className="text-lg font-bold font-mono text-zinc-900">
                  {currentProgress.current} <span className="text-xs text-zinc-400">/ {currentProgress.total}</span>
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-2.5 shadow-sm">
                <span className="block text-[9px] font-mono text-emerald-600 uppercase">Success</span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  {currentProgress.success}
                </span>
              </div>
              <div className="bg-red-50 border border-red-100 p-2.5 shadow-sm">
                <span className="block text-[9px] font-mono text-red-500 uppercase">Failed</span>
                <span className="text-lg font-bold font-mono text-red-600">
                  {currentProgress.failed}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {currentProgress.total > 0 && (
              <div className="space-y-1">
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{
                      width: `${(currentProgress.current / currentProgress.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Progress Ratio:</span>
                  <span>
                    {Math.round((currentProgress.current / currentProgress.total) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {currentProgress.activeName && (
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-sm text-xs space-y-1">
                <p className="font-semibold text-zinc-800">Current Target Item:</p>
                <p className="font-mono text-amber-700 font-bold">{currentProgress.activeName}</p>
              </div>
            )}
          </div>

          {/* Log Monitor Console */}
          <div className="flex-1 bg-zinc-900 rounded-sm p-3.5 font-mono text-[10px] overflow-y-auto leading-relaxed space-y-2 text-zinc-300">
            {logs.length === 0 ? (
              <div className="text-zinc-500 text-center py-16">
                <p>&gt; System Idle.</p>
                <p className="text-[9px] mt-2">Paste links and hit Start to stream status records.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "error"
                      ? "text-red-400"
                      : "text-zinc-400"
                  }
                >
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
