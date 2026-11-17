'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Heart, Loader2, Trash2 } from 'lucide-react';
import { GameDetailModal } from '@/components/GameDetailModal';
import { fetchFavorites, formatBaht, removeFavorite } from '@/lib/api';
import type { FavoriteItem, Game } from '@/types/game';

export default function FavoritesPage() {
    const [items, setItems] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    useEffect(() => {
        fetchFavorites()
            .then(setItems)
            .catch((err) =>
                setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'),
            )
            .finally(() => setLoading(false));
    }, []);

    async function handleRemove(gameId: string) {
        // ลบออกจากหน้าจอก่อน แล้วค่อยยิง DELETE ไปหลังบ้าน
        const previous = items;
        setItems((prev) => prev.filter((item) => item.game.id !== gameId));
        try {
            await removeFavorite(gameId);
        } catch (err) {
            setItems(previous);
            alert(err instanceof Error ? err.message : 'ลบไม่สำเร็จ');
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center text-zinc-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                กำลังโหลด Favorites...
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-12 text-center text-rose-400">
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Heart className="h-6 w-6 text-emerald-400" />
                    คลังเกมที่ถูกใจ ({items.length})
                </h1>
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
                    <p className="text-zinc-300">ยังไม่มีเกมในคลัง Favorite</p>
                    <Link
                        href="/"
                        className="mt-4 inline-block rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                    >
                        กลับไปปัดหาเกม
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(({ game }) => (
                        <div
                            key={game.id}
                            className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                        >
                            <div
                                onClick={() => setSelectedGame(game)}
                                className="relative aspect-[460/215] cursor-pointer bg-zinc-800"
                            >
                                {game.headerImage && (
                                    <img
                                        src={game.headerImage}
                                        alt={game.name}
                                        className="h-full w-full object-cover transition hover:scale-105"
                                    />
                                )}
                                {game.isOnSale ? (
                                    <span className="absolute top-2.5 right-2.5 rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-zinc-950">
                                        กำลังลดอยู่ -{game.discountPercent}%
                                    </span>
                                ) : (
                                    <span className="absolute top-2.5 right-2.5 rounded-md bg-zinc-800/90 px-2 py-0.5 text-xs font-semibold text-amber-300">
                                        หมดโปรแล้ว
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                                <div>
                                    <h2
                                        onClick={() => setSelectedGame(game)}
                                        className="line-clamp-1 cursor-pointer font-bold text-white hover:text-emerald-300"
                                    >
                                        {game.name}
                                    </h2>

                                    <div className="mt-1.5 flex items-baseline gap-2">
                                        {game.isFree ? (
                                            <span className="font-bold text-emerald-400">เล่นฟรี</span>
                                        ) : (
                                            <>
                                                <span className="text-lg font-bold text-emerald-400">
                                                    {formatBaht(game.priceFinal)}
                                                </span>
                                                {game.isOnSale && game.priceInitial > game.priceFinal && (
                                                    <span className="text-xs text-zinc-500 line-through">
                                                        {formatBaht(game.priceInitial)}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                                    <a
                                        href={`https://store.steampowered.com/app/${game.steamAppId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                                    >
                                        เปิด Steam
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>

                                    <button
                                        onClick={() => void handleRemove(game.id)}
                                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        ลบออก
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <GameDetailModal
                game={selectedGame}
                onClose={() => setSelectedGame(null)}
            />
        </div>
    );
}