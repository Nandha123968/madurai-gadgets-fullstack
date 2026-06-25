import React, { useState } from "react";
import { Search, Plus, Minus, Check, EyeOff, Sparkles, AlertCircle, TrendingDown, Layers, CheckCircle } from "lucide-react";
import { Product } from "../types";

interface StockManagementViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  saveStoredProducts: (updatedList: Product[]) => void;
  triggerToast: (msg: string, type?: "success" | "info" | "warning" | "error") => void;
  renderProductIllustration: (imageKey: string, sizeClass?: string) => React.ReactNode;
}

export default function StockManagementView({
  products,
  setProducts,
  saveStoredProducts,
  triggerToast,
  renderProductIllustration,
}: StockManagementViewProps) {
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [stockPage, setStockPage] = useState(1);

  // Filter items
  const filteredStockItems = products.filter((p) => {
    const q = stockSearchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStockItems.length / itemsPerPage) || 1;
  const startIndex = (stockPage - 1) * itemsPerPage;
  const activeItems = filteredStockItems.slice(startIndex, startIndex + itemsPerPage);

  // Update helper
  const updateStock = (prodId: string, newStock: number) => {
    const finalStock = Math.max(0, newStock);
    const updated = products.map((p) => {
      if (p.id === prodId) {
        return { ...p, stock: finalStock };
      }
      return p;
    });
    setProducts(updated);
    saveStoredProducts(updated);
  };

  // Status stats
  const totalModels = products.length;
  const adequatelyStocked = products.filter((p) => p.stock > 5).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const soldOut = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6 text-zinc-800" id="stock-control-suite">
      {/* 4-GRID STOCK STATS BOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Total Catalogue</span>
            <p className="text-xl font-display font-black text-zinc-900 mt-1">{totalModels} Models</p>
          </div>
          <div className="w-9 h-9 bg-zinc-100 rounded text-zinc-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest text-green-700">Healthy Stock</span>
            <p className="text-xl font-display font-black text-green-700 mt-1">{adequatelyStocked} Models</p>
          </div>
          <div className="w-9 h-9 bg-green-50 rounded text-green-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest text-yellow-600">Low stock Alert</span>
            <p className="text-xl font-display font-black text-yellow-600 mt-1">{lowStock} Warning</p>
          </div>
          <div className="w-9 h-9 bg-yellow-50 rounded text-yellow-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest text-red-600">Sold out</span>
            <p className="text-xl font-display font-black text-red-600 mt-1">{soldOut} Models</p>
          </div>
          <div className="w-9 h-9 bg-red-50 rounded text-red-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CORE STOCK INVENTORY WORKSPACE */}
      <div className="bg-white border border-zinc-200 p-5 rounded shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-base font-display font-black text-zinc-950 uppercase tracking-wide">
              Dedicated Stock Management Console 📊
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Maintain optimal stock levels. Mark watches sold-out or bulk refill with responsive action controls.
            </p>
          </div>

          {/* Quick Filter */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter stock directory..."
              value={stockSearchQuery}
              onChange={(e) => {
                setStockSearchQuery(e.target.value);
                setStockPage(1);
              }}
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-zinc-300 text-zinc-850 placeholder-zinc-400 focus:outline-none focus:border-yellow-500 rounded-sm text-xs font-bold"
            />
            {stockSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setStockSearchQuery("");
                  setStockPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* RECENT INVENTORY TABLE */}
        <div className="overflow-x-auto border border-zinc-200 rounded-sm">
          <table className="w-full text-left text-xs text-zinc-700 min-w-[700px]">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[9px] text-zinc-500 uppercase tracking-wider font-black">
              <tr>
                <th className="p-3 w-28">Reference ID</th>
                <th className="p-3 w-16 text-center">Visual</th>
                <th className="p-3">Model Watch Title</th>
                <th className="p-3 w-36">Category</th>
                <th className="p-3 w-32">Status Pill</th>
                <th className="p-3 w-36 text-center">Adjust stock Level</th>
                <th className="p-3 w-48 text-right">Quick Presets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {activeItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-400 italic font-bold">
                    No matching watch models found.
                  </td>
                </tr>
              ) : (
                activeItems.map((prod) => {
                  // Status values
                  const isSoldOut = prod.stock === 0;
                  const isLow = prod.stock > 0 && prod.stock <= 5;

                  return (
                    <tr key={prod.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-mono text-[10px] text-zinc-500 font-black">{prod.id}</td>
                      <td className="p-2 text-center">
                        <div className="w-9 h-9 bg-white border border-zinc-200 p-0.5 flex items-center justify-center rounded overflow-hidden mx-auto">
                          {renderProductIllustration(prod.image, "h-7")}
                        </div>
                      </td>
                      <td className="p-2 font-bold text-zinc-900 max-w-xs truncate" title={prod.name}>
                        {prod.name}
                      </td>
                      <td className="p-2 font-semibold font-mono text-[10px] text-zinc-500">{prod.category}</td>
                      <td className="p-2">
                        {isSoldOut ? (
                          <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                            Sold Out 🚫
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                            Low Alert ⚠️ ({prod.stock})
                          </span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                            In Stock ({prod.stock})
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              updateStock(prod.id, prod.stock - 1);
                              triggerToast(`Decremented "${prod.name}" stock level!`, "info");
                            }}
                            className="w-6 h-6 border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-800 rounded-sm cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            value={prod.stock}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              updateStock(prod.id, v);
                            }}
                            className="w-12 text-center border border-zinc-300 rounded-sm py-0.5 text-xs font-mono font-black focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateStock(prod.id, prod.stock + 1);
                              triggerToast(`Incremented "${prod.name}" stock level!`, "success");
                            }}
                            className="w-6 h-6 border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-800 rounded-sm cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateStock(prod.id, 0);
                              triggerToast(`Marked "${prod.name}" sold-out!`, "warning");
                            }}
                            className="px-2 py-1 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-700 text-[9px] font-black uppercase rounded-xs transition-colors cursor-pointer"
                          >
                            Zero Out
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateStock(prod.id, 15);
                              triggerToast(`Refilled "${prod.name}" stock to 15!`, "success");
                            }}
                            className="px-2 py-1 bg-green-50 hover:bg-green-500 hover:text-white border border-green-200 text-green-700 text-[9px] font-black uppercase rounded-xs transition-colors cursor-pointer"
                          >
                            Refill (15)
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs text-zinc-500 font-semibold font-mono">
            <p>
              Showing models {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStockItems.length)} of {filteredStockItems.length} items
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={stockPage === 1}
                onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-sm border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-[10px] font-bold cursor-pointer"
              >
                ◀ PREV
              </button>
              <span className="text-zinc-800 font-black px-1">
                PAGE {stockPage} OF {totalPages}
              </span>
              <button
                type="button"
                disabled={stockPage === totalPages}
                onClick={() => setStockPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-sm border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-[10px] font-bold cursor-pointer"
              >
                NEXT ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
