import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Trash2, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  allowUrlTab?: boolean;
  helperText?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label,
  placeholder = "Paste direct image URL here...",
  allowUrlTab = true,
  helperText = "Select a PNG or JPEG photo. It will update instantly."
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"file" | "url">(value && !value.startsWith("data:") ? "url" : "file");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>(value && !value.startsWith("data:") ? value : "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload processing (direct to Cloudinary with secure signature or fallback to Base64)
  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file, machan!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Connecting to upload gateway...");

    try {
      // 1. Fetch Cloudinary signature from Express backend
      const sigResponse = await fetch("/api/cloudinary-signature");
      if (!sigResponse.ok) {
        throw new Error("Failed to load signature");
      }
      
      const sigData = await sigResponse.json();

      if (sigData.success) {
        setUploadStatus("Uploading to Cloudinary Cloud... ☁️");
        
        // 2. Direct upload to Cloudinary using secure signed payload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sigData.apiKey);
        formData.append("timestamp", sigData.timestamp.toString());
        formData.append("signature", sigData.signature);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          console.error("Cloudinary raw upload response:", errText);
          throw new Error("Cloudinary rejected the upload.");
        }

        const uploadData = await uploadResponse.json();
        
        if (uploadData.secure_url) {
          onChange(uploadData.secure_url);
        } else {
          throw new Error("No URL returned in Cloudinary payload.");
        }
      } else {
        // 3. Fallback: Cloudinary credentials missing in .env
        setUploadStatus("Optimizing photo to local Base64 uploader... ⚡");
        
        const base64Data = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            res(event.target?.result as string || "");
          };
          reader.readAsDataURL(file);
        });

        await new Promise((res) => setTimeout(res, 600)); // Aesthetic pause
        onChange(base64Data);
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local Base64:", err);
      setUploadStatus("Cloudinary unavailable. Compiling local Base64 backup... 🔧");
      await new Promise((resolve) => setTimeout(resolve, 800)); // Alert user visually

      // Fallback: Read as base64 on error
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 font-sans w-full">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
          {label}
        </label>
        {allowUrlTab && (
          <div className="flex bg-zinc-100 p-0.5 rounded-sm text-[10px] border border-zinc-200">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`px-2 py-0.5 rounded-xs font-mono font-bold cursor-pointer transition-colors ${
                activeTab === "file"
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/50"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-2 py-0.5 rounded-xs font-mono font-bold cursor-pointer transition-colors ${
                activeTab === "url"
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/50"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Web URL
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="optimizing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="border border-dashed border-yellow-400 bg-yellow-50/40 p-6 rounded-md flex flex-col items-center justify-center gap-2.5 min-h-[140px]"
            >
              <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
              <div className="text-center">
                <p className="text-xs font-mono font-bold text-yellow-800 uppercase tracking-wide">
                  Processing Media File
                </p>
                <p className="text-[10px] text-yellow-600 mt-0.5 font-medium">
                  {uploadStatus}
                </p>
              </div>
            </motion.div>
          ) : value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="border border-zinc-200 rounded-md p-3.5 bg-zinc-50 flex items-center gap-4 relative overflow-hidden text-left"
            >
              {/* Premium image preview box */}
              <div className="relative w-18 h-18 bg-white border border-zinc-200 rounded-sm overflow-hidden shrink-0 flex items-center justify-center group shadow-xs">
                <img
                  src={value}
                  alt="Uploader preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Preview Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-zinc-900 truncate">
                  {value.startsWith("data:") ? "Local Uploaded Image" : "Cloudinary/External Image"}
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 truncate mt-1">
                  {value.startsWith("data:") 
                    ? `Base64 String (${Math.round(value.length / 1024)} KB)` 
                    : value
                  }
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 flex items-center gap-1 text-[10px] font-mono font-black uppercase text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove Image
                </button>
              </div>
            </motion.div>
          ) : activeTab === "file" ? (
            <motion.div
              key="file-uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] ${
                isDragActive
                  ? "border-yellow-500 bg-yellow-50/30 scale-[1.01]"
                  : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-400"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud
                className={`w-8 h-8 mb-2 transition-transform duration-200 ${
                  isDragActive ? "text-yellow-600 scale-110" : "text-zinc-400 group-hover:scale-105"
                }`}
              />
              <p className="text-xs font-black text-zinc-700 tracking-tight">
                {isDragActive ? "Drop the file here, machan!" : "Click to upload, or drag & drop"}
              </p>
              <p className="text-[9px] text-zinc-400 mt-1">
                {helperText}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="url-uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-zinc-200 bg-zinc-50 p-4 rounded-md space-y-2 flex flex-col justify-center min-h-[140px]"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUrlSubmit();
                      }
                    }}
                    className="w-full bg-white border border-zinc-300 pl-8 pr-3 py-2 rounded-sm text-xs text-zinc-800 placeholder-zinc-400 focus:border-yellow-500 focus:outline-none font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-mono font-black uppercase tracking-wider rounded-sm cursor-pointer transition-colors border border-zinc-900"
                >
                  Apply
                </button>
              </div>
              <p className="text-[9px] text-zinc-400 text-left">
                Pasting a Cloudinary URL automatically enables smart compression and formatting optimizations in the store.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
