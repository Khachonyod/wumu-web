'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Heart } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-white">
                    <Flame className="h-5 w-5 text-emerald-400" />
                    <span>Steam Deals Tinder</span>
                </Link>

                <nav className="flex items-center gap-2 text-sm">
                    <Link
                        href="/"
                        className={`rounded-lg px-3 py-1.5 transition ${pathname === '/'
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        ปัดดีล
                    </Link>
                    <Link
                        href="/favorites"
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${pathname === '/favorites'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Heart className="h-4 w-4" />
                        Favorites
                    </Link>
                </nav>
            </div>
        </header>
    );
}