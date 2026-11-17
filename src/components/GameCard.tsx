'use client';

import { motion, useMotionValue, useTransform, type PanInfo, } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { formatBaht } from '@/lib/api';
import type { Game, SwipeAction } from '@/types/game';

interface GameCardProps {
    game: Game;
    isTop: boolean;
    stackIndex: number;
    custom?: 'left' | 'right';
    onSwipe: (action: SwipeAction) => void;
    onOpenDetail: () => void;
}

const cardVariants = {
    exit: (direction: 'left' | 'right') => ({
        x: direction === 'right' ? 500 : -500,
        rotate: direction === 'right' ? 18 : -18,
        opacity: 0,
        transition: { duration: 0.25 },
    }),
};

export function GameCard({ game, isTop, stackIndex, custom, onSwipe, onOpenDetail }: GameCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14]);
    const favoriteOpacity = useTransform(x, [30, 120], [0, 1]);
    const skipOpacity = useTransform(x, [-120, -30], [1, 0]);

    function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (info.offset.x > 110 || info.velocity.x > 500) {
            onSwipe('FAVORITE');
        } else if (info.offset.x < -110 || info.velocity.x < -500) {
            onSwipe('SKIP');
        }
    }

    return (
        <motion.div
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                zIndex: 20 - stackIndex,
            }}
            variants={cardVariants}
            initial={false}
            animate={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 10, opacity: 1, x: 0, rotate: 0, }}
            exit="exit"
            custom={custom}
            drag={isTop ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={isTop ? handleDragEnd : undefined}
            whileDrag={{ cursor: 'grabbing' }}
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl select-none ${isTop ? 'cursor-grab' : 'pointer-events-none'
                }`}
        >
            {/* รูปปก + ป้ายส่วนลด + ป้าย Stamp ตอนลาก */}
            <div className="relative aspect-[460/215] w-full shrink-0 bg-zinc-800">
                {game.headerImage ? (
                    <img
                        src={game.headerImage}
                        alt={game.name}
                        draggable={false}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                        ไม่มีรูปปก
                    </div>
                )}

                {game.discountPercent > 0 && (
                    <span className="absolute top-3 right-3 rounded-lg bg-emerald-500 px-2.5 py-1 text-sm font-bold text-zinc-950 shadow">
                        -{game.discountPercent}%
                    </span>
                )}

                {isTop && (
                    <>
                        <motion.div
                            style={{ opacity: favoriteOpacity }}
                            className="pointer-events-none absolute top-4 left-4 -rotate-12 rounded-lg border-4 border-emerald-400 px-3 py-1 text-xl font-black tracking-wider text-emerald-400"
                        >
                            FAVORITE
                        </motion.div>
                        <motion.div
                            style={{ opacity: skipOpacity }}
                            className="pointer-events-none absolute top-4 right-4 rotate-12 rounded-lg border-4 border-rose-500 px-3 py-1 text-xl font-black tracking-wider text-rose-500"
                        >
                            SKIP
                        </motion.div>
                    </>
                )}
            </div>

            {/* เนื้อหาในการ์ด */}
            <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-xl font-bold text-white">
                            {game.name}
                        </h2>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={onOpenDetail}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:border-zinc-500 hover:text-white"
                                title="ดูรายละเอียด & รูปเพิ่มเติม"
                            >
                                <Info className="h-4 w-4" />
                            </button>
                            <a
                                href={`https://store.steampowered.com/app/${game.steamAppId}`}
                                target="_blank"
                                rel="noreferrer"
                                onPointerDown={(e) => e.stopPropagation()}
                                className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:border-zinc-500 hover:text-white"
                                title="เปิดบน Steam Store"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* ราคา */}
                    <div className="flex items-baseline gap-2.5">
                        {game.isFree ? (
                            <span className="text-xl font-bold text-emerald-400">เล่นฟรี</span>
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
                    </div>

                    {/* Genres */}
                    {game.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {game.genres.slice(0, 4).map((genre) => (
                                <span
                                    key={genre}
                                    className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* คำอธิบายสั้น */}
                    {game.shortDescription && (
                        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
                            {game.shortDescription}
                        </p>
                    )}
                </div>

                {/* ผู้พัฒนา */}
                <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                    {game.developers[0] && <span>Dev: {game.developers[0]}</span>}
                    {game.developers[0] && game.publishers[0] && <span> • </span>}
                    {game.publishers[0] && <span>Pub: {game.publishers[0]}</span>}
                </div>
            </div>
        </motion.div>
    );
}