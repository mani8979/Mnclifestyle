'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';
import { ADJUSTMENT_TYPES } from '@/lib/validations/inventory';
import InventorySubNav from './InventorySubNav';

interface MovementRow {
  _id: string;
  timestamp: string;
  sku: string;
  productName: string;
  adjustmentType: string;
  previousQuantity: number;
  quantityChanged: number;
  newQuantity: number;
  previousReserved?: number;
  newReserved?: number;
  reason?: string;
  notes?: string;
  adminName?: string;
}

export default function InventoryHistoryClient() {
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const reqSeqRef = useRef(0);

  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    const timer = window.setTimeout(() => setDebouncedSearch(search), 220);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadHistory = useCallback(async () => {
    const seq = ++reqSeqRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        type,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        page: page.toString(),
        limit: '20',
      });
      const res = await fetch(`/api/admin/inventory/history?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (controller.signal.aborted || seq !== reqSeqRef.current) return;

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load movement history');
      }
      setMovements(data.movements || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) return;
      setErrorMsg(err.message || 'Unable to load movement log');
    } finally {
      if (seq === reqSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearch, type, startDate, endDate, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <InventorySubNav
        title="Inventory Movement History"
        description="Immutable audit ledger of every stock replenishment, reduction, hold reservation, release, and sale."
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-4 relative">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search Ledger</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 bottom-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search SKU, product name, or reason..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Movement Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Adjustment Types</option>
            {ADJUSTMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="lg:col-span-1">
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setType('all');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <span className="text-xs text-slate-500">Loading movement audit trail...</span>
          </div>
        ) : movements.length === 0 ? (
          <div className="py-16 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No inventory movements match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Stock Delta</th>
                  <th className="py-3.5 px-4">Reserved</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movements.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{m.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{m.sku}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium">
                        {m.adjustmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-slate-500">{m.previousQuantity}</span> →{' '}
                      <span className="font-bold text-slate-900">{m.newQuantity}</span>{' '}
                      <span
                        className={
                          m.quantityChanged > 0
                            ? 'text-emerald-600 font-semibold'
                            : m.quantityChanged < 0
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-400'
                        }
                      >
                        ({m.quantityChanged >= 0 ? `+${m.quantityChanged}` : m.quantityChanged})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {m.previousReserved ?? 0} → {m.newReserved ?? 0}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-800 truncate" title={m.reason || ''}>
                        {m.reason || '—'}
                      </div>
                      {m.notes && (
                        <div className="text-[10px] text-slate-400 truncate">{m.notes}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{m.adminName || 'Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} movements
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
