// Product image, name, stock level, reorder threshold
import React from 'react';
import { MonoID } from '../shared/MonoID.js';
import { StatusBadge } from '../shared/StatusBadge.js';
import { SectionLabel } from '../shared/SectionLabel.js';
import { ActionButton } from '../shared/ActionButton.js';
import { Timestamp } from '../shared/Timestamp.js';
import type { StockStatus } from '../shared/StatusBadge.js';

/**
 * Types
 */
export type SKUCardSize = 'sm' | 'md' | 'lg';
export type SKUCardLayout = 'grid' | 'row';

export interface SKUCardProps {
    /** SKU identifier. */
    sku: string;
    /** Product display name. */
    name: string;
    /** Current units in stock. */
    stockLevel: number;
    /** Units below which a low-stock alert is shown. Defaults to 10. */
    reorderThreshold?: number;
    /** Units at or below which an out-of-stock alert is shown. Defaults to 0. */
    outOfStockThreshold?: number;
    /** Max stock capacity - used to render the fill bar. */
    maxStock?: number;
    /** Product image URL. Falls back to a placeholder illustration. */
    imageUrl?: string;
    /** Product category / type label. */
    category?: string;
    /** Unit of measure (e.g. "ea", "box", "pallet"). Defaults to "ea". */
    uom?: string;
    /** Weight per unit in kg. */
    weight?: number;
    /** Bin location(s) where this SKU is stored. */
    binLocations?: string[];
    /** When the stock level was last updated. */
    lastUpdated?: Date | string | number;
    /** Pending inbound units (e.g. on a PO). */
    inbound?: number;
    /** Units reserved / allocated to open orders. */
    reserved?: number;
    /** Size variant. Defaults to 'md'. */
    size?: SKUCardSize;
    /** Layout variant. Defaults to 'grid' (vertical card). */
    layout?: SKUCardLayout;
    /**
     * Show the stock fill bar.
     * Only visible when `maxStock` is provided. Defaults to true.
     */
    showBar?: boolean;
    /** Called when the user clicks "Reorder". */
    onReorder?: (sku: string) => void;
    /** Called when the user clicks "Adjust stock". */
    onAdjust?: (sku: string) => void;
    /** Called when the card itself is clicked. */
    onClick?: (sku: string) => void;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Helpers
 */
function resolveStockStatus(
    level: number,
    reorder: number,
    outOfStock: number,
): StockStatus {
    if (level <= outOfStock) return 'out-of-stock';
    if (level <= reorder) return 'low-stock';
    return 'in-stock';
}

function stockFillPct(level: number, max: number): number {
    if (max <= 0) return 0;
    return Math.min(Math.round((level / max) * 100), 100);
}

function fillColor(status: StockStatus): string {
    if (status === 'out-of-stock') return '#D85A30';
    if (status === 'low-stock')    return '#BA7517';
    return '#0F6E56;
}

function formatQty(n: number, uom: string): string {
    return `${n.toLocaleString()} ${uom}`;
}

/**
 * Tokens
 */
interface SizeTokens {
    imageSize: number;
    imageRadius: string;
    nameFontSize: string;
    metaFontSize: string;
    qtyFontSize: string;
    padding: string;
    gap: number;
    barHeight: number;
    radius: string;
}

const SIZE_TOKENS: Record<SKUCardSize, SizeTokens> = {
    sm: { imageSize: 48, imageRadius: '6px', nameFontSize: '12px', metaFontSize: '10px', qtyFontSize: '18px', padding: '12px', gap: 8, barHeight: 3, radius: '8px' },
    
}