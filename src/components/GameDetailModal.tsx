'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { formatBaht } from '@/lib/api';
import type { Game } from '@/types/game';

interface GameDetailModalProps {
    game: Game | null;
    onClose: () => void;
}

export function GameDetailModal({ game, onClose }: GameDetailModalProps) {
    const [pickedImage, setPickedImage] = useState<{
        gameId: string;
        url: string;
    } | null>(null);

    useEffect(() => {
        if (!game) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [game, onClose]);

    if (!game) return null;

    const activeImage =
        pickedImage?.gameId === game.id
            ? pickedImage.url
            : (game.screenshots[0] ?? game.headerImage);

    const canPlayNativeVideo =
        game.trailerUrl &&
        (game.trailerUrl.includes('.mp4') || game.trailerUrl.includes('.webm'));

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-5 py-4 backdrop-blur">
                    <h2 className="pr-4 text-lg font-bold text-white">{game.name}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    {/* รูปหลัก / Screenshot ที่เลือก */}
                    {activeImage && (
                        <img
                            src={activeImage}
                            alt={game.name}
                            className="aspect-video w-full rounded-xl bg-zinc-950 object-cover"
                        />
                    )}

                    {/* แถบเลือก Screenshots */}
                    {game.screenshots.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {game.screenshots.slice(0, 8).map((shot) => (
                                <button
                                    key={shot}
                                    type="button"
                                    onClick={() => setPickedImage({ gameId: game.id, url: shot })}
                                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${activeImage === shot
                                            ? 'border-emerald-400'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={shot}
                                        alt=""
                                        className="h-14 w-24 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Trailer (รองรับ mp4/webm) */}
                    {canPlayNativeVideo && game.trailerUrl && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Trailer
                            </p>
                            <video
                                src={game.trailerUrl}
                                controls
                                className="w-full rounded-xl bg-black"
                            />
                        </div>
                    )}

                    {/* ราคา */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="flex items-baseline gap-3">
                            {game.isFree ? (
                                <span className="text-2xl font-bold text-emerald-400">เล่นฟรี</span>
                            ) : (
                                <>
                                    <span className="text-2xl font-extrabold text-emerald-400">
                                        {formatBaht(game.priceFinal)}
                                    </span>
                                    {game.priceInitial > game.priceFinal && (
                                        <span className="text-sm text-zinc-500 line-through">
                                            {formatBaht(game.priceInitial)}
                                        </span>
                                    )}
                                </>
                            )}
                            {game.isOnSale && game.discountPercent > 0 && (
                                <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-zinc-950">
                                    -{game.discountPercent}%
                                </span>
                            )}
                        </div>

                        <a
                            href={`https://store.steampowered.com/app/${game.steamAppId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                        >
                            ดูบน Steam
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>

                    {/* คำอธิบายเต็ม */}
                    {game.shortDescription && (
                        <p className="text-sm leading-relaxed text-zinc-300">
                            {game.shortDescription}
                        </p>
                    )}

                    {/* Genres & Categories */}
                    <div className="space-y-2">
                        {game.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {game.genres.map((g) => (
                                    <span
                                        key={g}
                                        className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200"
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}
                        {game.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {game.categories.slice(0, 8).map((c) => (
                                    <span
                                        key={c}
                                        className="rounded-md border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dev / Pub */}
                    <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                        {game.developers.length > 0 && (
                            <p>Developer: {game.developers.join(', ')}</p>
                        )}
                        {game.publishers.length > 0 && (
                            <p>Publisher: {game.publishers.join(', ')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}