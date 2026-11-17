'use client';

import { useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { DeckFilters } from '@/types/game';

interface FilterBarProps {
    filters: DeckFilters;
    onApply: (next: DeckFilters) => void;
}

export function FilterBar({ filters, onApply }: FilterBarProps) {
    const [open, setOpen] = useState(false);
    const [genres, setGenres] = useState(filters.genres ?? '');
    const [maxPrice, setMaxPrice] = useState(
        filters.maxPrice !== undefined ? String(filters.maxPrice) : '',
    );
    const [minDiscount, setMinDiscount] = useState(
        filters.minDiscount !== undefined ? String(filters.minDiscount) : '',
    );
    const [developer, setDeveloper] = useState(filters.developer ?? '');

    const hasActiveFilter = Boolean(
        filters.genres ||
        filters.maxPrice !== undefined ||
        filters.minDiscount !== undefined ||
        filters.developer,
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onApply({
            genres: genres.trim() || undefined,
            maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
            minDiscount: minDiscount !== '' ? Number(minDiscount) : undefined,
            developer: developer.trim() || undefined,
        });
        setOpen(false);
    }

    function handleReset() {
        setGenres('');
        setMaxPrice('');
        setMinDiscount('');
        setDeveloper('');
        onApply({});
        setOpen(false);
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition ${hasActiveFilter
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                        }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    ตัวกรอง
                    {hasActiveFilter && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                </button>

                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        ล้างตัวกรอง
                    </button>
                )}
            </div>

            {open && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-3 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                    <div>
                        <label className="mb-1 block text-xs text-zinc-400">
                            แนวเกม (คั่นด้วย , เช่น แอ็คชัน,อินดี้ หรือ Action,RPG)
                        </label>
                        <input
                            type="text"
                            value={genres}
                            onChange={(e) => setGenres(e.target.value)}
                            placeholder="เช่น แอ็คชัน,อินดี้"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs text-zinc-400">
                                งบสูงสุด (บาท)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="เช่น 300"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-zinc-400">
                                ลดขั้นต่ำ (%)
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={minDiscount}
                                onChange={(e) => setMinDiscount(e.target.value)}
                                placeholder="เช่น 50"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-zinc-400">
                            ผู้พัฒนา (Developer)
                        </label>
                        <input
                            type="text"
                            value={developer}
                            onChange={(e) => setDeveloper(e.target.value)}
                            placeholder="ระบุชื่อผู้พัฒนา"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                        >
                            ใช้ตัวกรอง
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}