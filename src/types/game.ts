export type SwipeAction = 'FAVORITE' | 'SKIP';

export interface Game {
    id: string;
    steamAppId: number;
    name: string;
    shortDescription: string | null;
    headerImage: string | null;
    screenshots: string[];
    trailerUrl: string | null;
    priceInitial: number;
    priceFinal: number;
    discountPercent: number;
    isOnSale: boolean;
    isFree: boolean;
    developers: string[];
    publishers: string[];
    genres: string[];
    categories: string[];
}

export interface FavoriteItem {
    swipedAt: string;
    game: Game;
}

export interface DeckFilters {
    genres?: string;
    categories?: string;
    developer?: string;
    publisher?: string;
    maxPrice?: number;
    minDiscount?: number;
    limit?: number;
}