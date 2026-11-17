import type { DeckFilters, FavoriteItem, Game, SwipeAction } from '@/types/game';
import { getGuestId } from './guest-id';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            'x-guest-id': getGuestId(),
            ...init?.headers,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}

export function fetchDeck(filters: DeckFilters = {}): Promise<Game[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    }
    const query = params.toString();
    return apiFetch<Game[]>(`/games/deck${query ? `?${query}` : ''}`);
}

export function sendSwipe(gameId: string, action: SwipeAction) {
    return apiFetch('/swipes', {
        method: 'POST',
        body: JSON.stringify({ gameId, action }),
    });
}

export function fetchFavorites(): Promise<FavoriteItem[]> {
    return apiFetch<FavoriteItem[]>('/favorites');
}

export function removeFavorite(gameId: string) {
    return apiFetch<{ deleted: boolean; gameId: string }>(`/favorites/${gameId}`, {
        method: 'DELETE',
    });
}

export function formatBaht(satang: number): string {
    return `฿${(satang / 100).toLocaleString('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

export function undoLastSwipe() {
    return apiFetch<{ undoneAction: SwipeAction; game: Game }>('/swipes/last', {
        method: 'DELETE',
    });
}

export function resetSkipped() {
    return apiFetch<{ resetCount: number }>('/swipes/skipped', {
        method: 'DELETE',
    });
}

export function syncMoreGames() {
    return apiFetch<{ created: number; skipped?: boolean }>('/steam-sync/more', {
        method: 'POST',
    });
}