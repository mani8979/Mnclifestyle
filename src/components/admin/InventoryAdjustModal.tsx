'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  X,
  History,
  RotateCcw,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';

interface ProductItem {
  _id: string;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  costPrice?: number;
  reservedStock?: number;
  availableStock?: number;
}

interface InventoryAdjustModalProps {
  product: ProductItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InventoryAdjustModal({
  product,
  onClose,
  onSuccess,
}: InventoryAdjustModalProps) {
  const [activeTab, setActiveTab] = useState<'adjust' | 'reserve' | 'release' | 'settings'>('adjust');

  // Form states
  const [adjustmentType, setAdjustmentType] = useState('Stock Received');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSold, setIsSold] = useState(false);

  // Settings states
  const [trackInventory, setTrackInventory] = useState(product.trackInventory ?? false);
  const [allowBackorders, setAllowBackorders] = useState(product.allowBackorders ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(product.lowStockThreshold ?? 2);
  const [costPrice, setCostPrice] = useState(product.costPrice ?? 0);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Derived preview counts
  const currentPhysical = product.stockQuantity ?? 0;
  const currentReserved = product.reservedStock ?? 0;
  const currentAvailable = product.availableStock ?? Math.max(0, currentPhysical - currentReserved);

  const numQty = Number(quantity) || 0;

  let previewPhysical = currentPhysical;
  let previewReserved = currentReserved;

  if (activeTab === 'adjust') {
    if (['Stock Received', 'Manual Addition', 'Returned Goods'].includes(adjustmentType)) {
      previewPhysical += numQty;
    } else if (['Stock Sold', 'Manual Reduction', 'Damaged Goods'].includes(adjustmentType)) {
      previewPhysical = Math.max(0, previewPhysical - numQty);
    } else if (adjustmentType === 'Stock Correction') {
      previewPhysical = numQty;
    }
  } else if (activeTab === 'reserve') {
    previewReserved += numQty;
  } else if (activeTab === 'release') {
    previewReserved = Math.max(0, previewReserved - numQty);
    if (isSold) {
      previewPhysical = Math.max(0, previewPhysical - numQty);
    }
  }

  const previewAvailable = Math.max(0, previewPhysical - previewReserved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let endpoint = `/api/admin/products/${product._id}/inventory`;
      let payload: any = {};

      if (activeTab === 'adjust') {
        payload = {
          action: 'adjust',
          adjustmentType,
          quantity: numQty,
          reason,
          notes,
        };
      } else if (activeTab === 'reserve') {
        endpoint = `/api/admin/products/${product._id}/inventory/reserve`;
        payload = {
          quantity: numQty,
          reason,
          notes,
        };
      } else if (activeTab === 'release') {
        endpoint = `/api/admin/products/${product._id}/inventory/reserve`;
        payload = {
          action: 'release',
          quantity: numQty,
          isSold,
          reason,
          notes,
        };
      } else if (activeTab === 'settings') {
        endpoint = `/api/admin/products/${product._id}`;
        payload = {
          trackInventory,
          allowBackorders,
          lowStockThreshold,
          costPrice,
        };
      }

      const method = activeTab === 'settings' ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Action failed');
      }

      setSuccessMsg(data.message || 'Inventory updated successfully');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Manage Stock & Allocation
              </h3>
              <p className="text-xs text-slate-500">
                {product.name} · <span className="font-mono text-blue-600 font-semibold">{product.sku}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">Available</span>
            <span className="text-lg font-bold text-emerald-600">{currentAvailable}</span>
            <span className="text-[10px] text-slate-400 block">Units sellable</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">Reserved</span>
            <span className="text-lg font-bold text-amber-600">{currentReserved}</span>
            <span className="text-[10px] text-slate-400 block">Under hold</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">Physical Stock</span>
            <span className="text-lg font-bold text-slate-900">{currentPhysical}</span>
            <span className="text-[10px] text-slate-400 block">In warehouse</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('adjust')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'adjust'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Stock Adjustment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reserve')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'reserve'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Reserve Units
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('release')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'release'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Release Hold
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Policies & Valuation
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'adjust' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Adjustment Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="Stock Received">Stock Received (Atelier Replenishment)</option>
                  <option value="Manual Addition">Manual Addition</option>
                  <option value="Manual Reduction">Manual Reduction</option>
                  <option value="Stock Sold">Stock Sold (Direct Offline Sale)</option>
                  <option value="Damaged Goods">Damaged Goods (Defect Write-off)</option>
                  <option value="Returned Goods">Returned Goods (Restocked)</option>
                  <option value="Stock Correction">Stock Correction (Set Exact Count)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {adjustmentType === 'Stock Correction' ? 'New Exact Stock Count' : 'Quantity Units'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Visakhapatnam atelier delivery batch #204"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional inspection or logistics remarks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>
            </>
          )}

          {activeTab === 'reserve' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Units to Reserve (Hold)
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.trackInventory ? currentAvailable : 999}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Max reservable available: <span className="text-emerald-600 font-semibold">{currentAvailable} units</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reservation Reason / Customer
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Architect preview hold for Beach Road Villa client"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Hold valid until date or showroom reference..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>
            </>
          )}

          {activeTab === 'release' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Units to Release
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentReserved}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Currently reserved: <span className="text-amber-600 font-semibold">{currentReserved} units</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isSoldCheck"
                  checked={isSold}
                  onChange={(e) => setIsSold(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isSoldCheck" className="text-xs text-slate-800 cursor-pointer">
                  <span className="font-semibold block text-slate-900">Confirm as Sold (Deduct Physical Stock)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Check this if the client completed the purchase. This reduces physical warehouse inventory and releases the hold simultaneously.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fulfillment / Cancellation Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isSold ? 'Invoice #MNC-2026-88 paid' : 'Client released reservation'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Triggers low-stock amber alert</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Estimated Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Internal atelier valuation only</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Track Inventory (Ready Stock)</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Disable for Made-to-Order luxury pieces where each item is handcrafted on demand.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Allow Backorders</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Allow customers to place orders even when physical stock reaches zero.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowBackorders}
                    onChange={(e) => setAllowBackorders(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Dynamic Impact Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block mb-1.5">
              Live Impact Preview
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>
                Physical Stock: <b className="text-slate-900 font-semibold">{currentPhysical}</b> →{' '}
                <b className="text-blue-600 font-bold">{previewPhysical}</b>
              </span>
              <span>
                Reserved: <b className="text-slate-900 font-semibold">{currentReserved}</b> →{' '}
                <b className="text-amber-600 font-bold">{previewReserved}</b>
              </span>
              <span>
                Available: <b className="text-slate-900 font-semibold">{currentAvailable}</b> →{' '}
                <b className="text-emerald-600 font-bold">{previewAvailable}</b>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
