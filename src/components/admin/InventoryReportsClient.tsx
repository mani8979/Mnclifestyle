'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  TrendingUp,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatINR } from '@/utils/currency';
import InventorySubNav from './InventorySubNav';
import InventoryAdjustModal, { InventoryProductItem } from './InventoryAdjustModal';

interface AlertProduct extends InventoryProductItem {
  category: string;
  categoryLabel?: string;
  calculatedStatus: string;
}

export default function InventoryReportsClient() {
  const [stats, setStats] = useState<any>(null);
  const [alertItems, setAlertItems] = useState<AlertProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AlertProduct | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, oosRes, lowRes] = await Promise.all([
        fetch('/api/admin/inventory/stats'),
        fetch('/api/admin/inventory?status=out_of_stock&limit=50'),
        fetch('/api/admin/inventory?status=low_stock&limit=50'),
      ]);
      const [statsJson, oosJson, lowJson] = await Promise.all([
        statsRes.json(),
        oosRes.json(),
        lowRes.json(),
      ]);
      if (statsRes.ok && statsJson.success) setStats(statsJson.stats);
      const merged: AlertProduct[] = [
        ...(oosJson.products || []),
        ...(lowJson.products || []),
      ];
      setAlertItems(merged);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <InventorySubNav
        title="Inventory Valuation & Stock Reports"
        description="Inspect warehouse stock valuation, restock alert queues, and download sanitized CSV reports."
      />

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <span className="text-xs text-slate-500">Generating valuation report...</span>
        </div>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Total Retail Stock Valuation</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatINR(stats.totalRetailValuation || 0)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Across {stats.totalStockUnits} physical units ({stats.totalProducts} active SKUs)
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Estimated Inventory Cost Basis</span>
                  <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatINR(stats.totalCostValuation || 0)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Uses recorded costPrice when set (45% retail fallback otherwise)
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Estimated Gross Margin Potential</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {formatINR(stats.estimatedGrossProfitPotential || 0)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reserved holds: {stats.reservedStockUnits} units · Made-to-order SKUs: {stats.madeToOrderCount}
                </p>
              </div>
            </div>
          )}

          {/* Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stock & Valuation Ledger CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Includes physical, reserved, available, threshold, retail price, and cost status per SKU.
                </p>
              </div>
              <a
                href="/api/admin/inventory/reports/export?type=stock"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Movement Audit Trail CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formula-sanitized CSV log of all historical stock adjustments and reservations.
                </p>
              </div>
              <a
                href="/api/admin/inventory/reports/export?type=movements"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </a>
            </div>
          </div>

          {/* Low / Out of Stock Restock Priority */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Restock Alert Queue ({alertItems.length})
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Tracked items at or below threshold</span>
            </div>

            {alertItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                All tracked products are adequately stocked above their low-stock thresholds.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Available</th>
                      <th className="py-3 px-4">Threshold</th>
                      <th className="py-3 px-4">Alert State</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {alertItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-3 px-4 font-mono font-bold text-red-700">
                          {item.availableQuantity ?? 0}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {item.lowStockThreshold ?? 5}
                        </td>
                        <td className="py-3 px-4">
                          {item.calculatedStatus === 'out_of_stock' ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(item)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Replenish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {selectedProduct && (
        <InventoryAdjustModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => loadReports()}
        />
      )}
    </div>
  );
}
