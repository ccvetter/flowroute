import React from 'react';
export type MonoIDVariant = 'order' | 'sku' | 'shipment' | 'carrier' | 'bin' | 'generic';
export type MonoIDSize = 'xs' | 'sm' | 'md' | 'lg';
export interface MonoIDProps {
    /** The ID string to display. */
    id: string;
    /**
     * Semantic context -- drives prefix color and copy-label phrasing.
     * Defaults to 'generic'.
     */
    variant?: MonoIDVariant;
    /** Text size. Defaults to 'sm'. */
    size?: MonoIDSize;
    /**
     * Show a copy-to-clipboard icon on hover.
     * Defaults to true
     */
    copyable?: boolean;
    /**
     * Truncate to N characters and show full ID in a tooltip.
     * Useful in narrow table columns
     */
    truncate?: number;
    /**
     * Highlight a substring within the ID (e.g. a search query match).
     * Case-insensitive.
     */
    highlight?: string;
    /**
     * Prefix to split from the rest of the ID for two-tone rendering.
     * Auto-detected from common patterns if not provided.
     */
    prefix?: string;
    /**
     * Render as a block element instead of inline.
     * Defaults to false
     */
    block?: boolean;
    /** Called when the copy action completes. */
    onCopy?: (id: string) => void;
    /** Additional CSS class names to apply. */
    className?: string;
    style?: React.CSSProperties;
}
export declare const MonoID: React.ForwardRefExoticComponent<MonoIDProps & React.RefAttributes<HTMLSpanElement>>;
export default MonoID;
//# sourceMappingURL=MonoID.d.ts.map