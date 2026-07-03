import React, { useState, useEffect } from "react";
import { X, Save, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "../types";
import ImageUploader from "./ImageUploader";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category);
  const [brand, setBrand] = useState(product.brand || "Other");
  const [stock, setStock] = useState(product.stock);
  const [description, setDescription] = useState(product.description);
  const [gender, setGender] = useState<"Men" | "Women" | "Unisex">(product.gender || "Unisex");
  const [specsText, setSpecsText] = useState(Array.isArray(product.specs) ? product.specs.join("\n") : "");
  const [image, setImage] = useState(product.image);

  useEffect(() => {
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setBrand(product.brand || "Other");
    setStock(product.stock);
    setDescription(product.description);
    setGender(product.gender || "Unisex");
    setSpecsText(Array.isArray(product.specs) ? product.specs.join("\n") : "");
    setImage(product.image);
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const specsArray = specsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const updated: Product = {
      ...product,
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      brand,
      stock: Number(stock),
      description: description.trim(),
      gender,
      specs: specsArray,
      image,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        id="edit-product-modal-card" 
        className="bg-white border border-zinc-200 rounded-md w-full max-w-xl shadow-2xl relative flex flex-col text-zinc-900 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-yellow-100 rounded text-yellow-800 font-mono text-[9px] font-black">EDIT SYSTEM</span>
            <h3 className="font-display font-black text-sm uppercase tracking-wide text-zinc-900">
              Update Product Properties
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer text-zinc-500 hover:text-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Main Title Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Watch model name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-zinc-300 px-3 py-2 rounded-sm text-xs font-bold text-zinc-900 focus:border-yellow-500 focus:outline-none"
              placeholder="e.g. Rolex Submariner Date Gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Price (₹ INR)</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-zinc-300 px-3 py-2 rounded-sm text-xs font-mono font-bold text-zinc-900 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Stock Level */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Stock Inventory count</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={`w-full bg-white border px-3 py-2 rounded-sm text-xs font-mono font-bold focus:border-yellow-500 focus:outline-none ${
                  stock <= 5 ? "border-red-300 text-red-600 bg-red-50" : "border-zinc-300 text-zinc-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Category dropdown */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Category Class</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-zinc-300 px-2 py-2 rounded-sm text-xs font-bold text-zinc-900 focus:border-yellow-500 focus:outline-none cursor-pointer"
              >
                <option value="Premier Watches">Premier Watches</option>
                <option value="Japanese Model Watches">Japanese Model Watches</option>
                <option value="Normal Watches">Normal Watches (800 - 1500)</option>
                <option value="Bluetooth Speakers">Bluetooth Speakers</option>
                <option value="Sunglasses">Sunglasses</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Brand dropdown */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Brand Name</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white border border-zinc-300 px-2 py-2 rounded-sm text-xs font-bold text-zinc-900 focus:border-yellow-500 focus:outline-none cursor-pointer"
              >
                {["Rolex", "Omega", "Audemars Piguet", "Patek Philippe", "Casio", "Other"].map((br) => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>

            {/* Gender class */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Target Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "Men" | "Women" | "Unisex")}
                className="w-full bg-white border border-zinc-300 px-2 py-2 rounded-sm text-xs font-bold text-zinc-900 focus:border-yellow-500 focus:outline-none cursor-pointer"
              >
                <option value="Men">Men Only</option>
                <option value="Women">Women Only</option>
                <option value="Unisex">Unisex / Universal</option>
              </select>
            </div>
          </div>

          {/* Description text */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Product description (Live Shop tooltip)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white border border-zinc-300 px-3 py-2 rounded-sm text-xs text-zinc-800 focus:border-yellow-500 focus:outline-none"
              placeholder="Provide a compelling model overview..."
            />
          </div>

          {/* Specs List (textarea) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Technical Specifications (One line per bullet)</label>
            <textarea
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              rows={4}
              className="w-full bg-white border border-zinc-300 px-3 py-2 rounded-sm text-[11px] font-mono text-zinc-800 focus:border-yellow-500 focus:outline-none"
              placeholder="Movement: Japanese Chronograph&#10;Dial: Black textured with glowing hours&#10;Waterproof: Atmospheric insulation..."
            />
          </div>

          {/* Image Upload field */}
          <div className="space-y-1">
            <ImageUploader
              value={image}
              onChange={setImage}
              label="Product Watch Artwork/Image Source"
              placeholder="Paste direct watch image URL (https://...)"
              allowUrlTab={true}
              helperText="Drag & drop or click to upload a local image, or paste a link."
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-zinc-150 flex items-center justify-end gap-2 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-black uppercase tracking-wider rounded-sm cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-sm cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              Save Watch Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
