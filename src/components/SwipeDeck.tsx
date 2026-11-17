'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, Loader2, RefreshCw, RotateCcw, Undo2, X } from 'lucide-react';
import {
    fetchDeck,
    sendSwipe,
    resetSkipped,
    syncMoreGames,
    undoLastSwipe,
} from '@/lib/api';
import { GameCard } from './GameCard';
import type { Game, SwipeAction, DeckFilters } from '@/types/game';
import { FilterBar } from './FilterBar';
import { GameDetailModal } from './GameDetailModal';



export function SwipeDeck() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exitDirection, setExitDirection] = useState<'left' | 'right'>('right');
    const [filters, setFilters] = useState<DeckFilters>({});
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [actionBusy, setActionBusy] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('กำลังโหลดดีลเกม Steam...');

    const reloadDeck = useCallback(
        async (activeFilters: DeckFilters, fetchFromSteamIfEmpty = false) => {
            setLoading(true);
            setLoadingMessage('กำลังโหลดดีลเกม Steam...');
            setError(null);
            try {
                let data = await fetchDeck({ ...activeFilters, limit: 20 });
                if (data.length === 0 && fetchFromSteamIfEmpty) {
                    setLoadingMessage('กำลังดึงเกมลดราคาเพิ่มจาก Steam (รอสักครู่)...');
                    await syncMoreGames();
                    data = await fetchDeck({ ...activeFilters, limit: 20 });
                }
                setGames(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        let cancelled = false;
        fetchDeck({ ...filters, limit: 20 })
            .then((data) => {
                if (!cancelled) {
                    setGames(data);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [filters]);

    function handleApplyFilters(next: DeckFilters) {
        setLoading(true);
        setError(null);
        setFilters(next);
    }

    // Preload รูปการ์ดถัดไป 3 ใบ ไม่ให้กระตุกตอนปัด
    useEffect(() => {
        for (const game of games.slice(1, 4)) {
            if (game.headerImage) {
                const img = new Image();
                img.src = game.headerImage;
            }
        }
    }, [games]);

    const handleSwipe = useCallback(
        (action: SwipeAction) => {
            const current = games[0];
            if (!current) return;

            setExitDirection(action === 'FAVORITE' ? 'right' : 'left');
            setGames((prev) => prev.slice(1));

            sendSwipe(current.id, action).catch((err) => {
                console.error('Swipe error:', err);
            });
        },
        [games],
    );

    async function handleUndo() {
        if (actionBusy) return;
        setActionBusy(true);
        try {
            const res = await undoLastSwipe();
            setGames((prev) => [
                res.game,
                ...prev.filter((g) => g.id !== res.game.id),
            ]);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'ไม่มีการ์ดให้ย้อนกลับ');
        } finally {
            setActionBusy(false);
        }
    }

    async function handleResetSkipped() {
        if (actionBusy) return;
        setActionBusy(true);
        try {
            await resetSkipped();
            await reloadDeck(filters);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'รีเซ็ตไม่สำเร็จ');
        } finally {
            setActionBusy(false);
        }
    }

    // กดลูกศรซ้าย-ขวาบนคีย์บอร์ด
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (selectedGame) return;
            if (e.key === 'ArrowLeft') handleSwipe('SKIP');
            if (e.key === 'ArrowRight') handleSwipe('FAVORITE');
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleSwipe, selectedGame]);

    return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-8">
            <FilterBar filters={filters} onApply={handleApplyFilters} />

            {loading ? (
                <div className="flex h-[500px] items-center justify-center text-zinc-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {loadingMessage}
                </div>
            ) : error ? (
                <div className="flex h-[500px] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-rose-400">{error}</p>
                    <button
                        onClick={() => void reloadDeck(filters)}
                        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
                    >
                        ลองใหม่
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative h-[500px] w-full">
                        {games.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-6 text-center">
                                <p className="text-lg font-semibold text-zinc-200">
                                    ปัดครบชุดนี้แล้ว!
                                </p>
                                <p className="text-sm text-zinc-400">
                                    ลองกดโหลดรอบใหม่ ย้อนกลับการ์ดล่าสุด หรือล้างเกมที่เคยข้าม
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button
                                        onClick={() => void reloadDeck(filters, true)}
                                        disabled={actionBusy}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        โหลดการ์ดเพิ่ม
                                    </button>
                                    <button
                                        onClick={() => void handleUndo()}
                                        disabled={actionBusy}
                                        className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                                    >
                                        <Undo2 className="h-4 w-4" />
                                        Undo ล่าสุด
                                    </button>
                                    <button
                                        onClick={() => void handleResetSkipped()}
                                        disabled={actionBusy}
                                        className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        ล้างเกมที่เคย Skip
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence custom={exitDirection}>
                                {games
                                    .slice(0, 3)
                                    .reverse()
                                    .map((game, idx, arr) => {
                                        const stackIndex = arr.length - 1 - idx;
                                        return (
                                            <GameCard
                                                key={game.id}
                                                game={game}
                                                isTop={stackIndex === 0}
                                                stackIndex={stackIndex}
                                                onSwipe={handleSwipe}
                                                onOpenDetail={() => setSelectedGame(game)}
                                            />
                                        );
                                    })}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* ปุ่ม Skip / Undo / Favorite ด้านล่าง */}
                    {games.length > 0 && (
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => handleSwipe('SKIP')}
                                className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/40 bg-zinc-900 text-rose-400 shadow-lg transition hover:scale-105 hover:bg-rose-500/15 active:scale-95"
                                title="ข้าม (ลูกศรซ้าย)"
                            >
                                <X className="h-7 w-7" />
                            </button>
                            <button
                                onClick={() => void handleUndo()}
                                disabled={actionBusy}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-lg transition hover:scale-105 hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
                                title="ย้อนกลับการ์ดล่าสุด (Undo)"
                            >
                                <Undo2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleSwipe('FAVORITE')}
                                className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-zinc-900 text-emerald-400 shadow-lg transition hover:scale-105 hover:bg-emerald-500/15 active:scale-95"
                                title="เก็บเข้า Favorites (ลูกศรขวา)"
                            >
                                <Heart className="h-7 w-7" />
                            </button>
                        </div>
                    )}
                </>
            )}

            <GameDetailModal
                game={selectedGame}
                onClose={() => setSelectedGame(null)}
            />
        </div>
    );
}