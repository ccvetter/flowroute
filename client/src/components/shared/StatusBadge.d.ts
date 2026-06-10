import React from 'react';
export type OrderStatus = 'pending' | 'allocated' | 'picking' | 'packing' | 'shipped' | 'delivered' | 'exception' | 'cancelled';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type PriorityStatus = 'high' | 'medium' | 'low';
export type BadgeVariant = 'order' | 'stock' | 'priority';
export type BadgeStatus = OrderStatus | StockStatus | PriorityStatus;
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeIconMode = 'icon' | 'dot' | 'none';
export interface StatusBadgeProps {
    status: BadgeStatus;
    /**
     * Which status group the badge belongs to.
     * Defaults to 'order' - drives color scheme and icon set.
     */
    variant?: BadgeVariant;
    /**
     * Controls the leading indicator.
     * - 'icon' -- SVG icon (default)
     * - 'dot'  -- small colored circle
     * - 'none' -- label only
     */
    iconMode?: BadgeIconMode;
    /** Override the label text. Defaults to the formatted status name. */
    label?: string;
    /** Badge size. Defaults to 'md'. */
    size?: BadgeSize;
    /**
     * Pulse the dot/icon for active in-progress states (picking, packing).
     * Defaults to true.
     */
    pulse?: boolean;
    /** Additional class names */
    className?: string;
    /** Accessible label override for screen readers */
    ariaLabel?: string;
}
export declare const StatusBadge: React.ForwardRefExoticComponent<StatusBadgeProps & React.RefAttributes<HTMLSpanElement>>;
export interface CountBadgeProps {
    count: number;
    /** Suppress display when count is 0. Defaults to true. */
    hideWhenZero?: boolean;
    /** Cap the displayed number. Defaults to 99. */
    max?: number;
    className?: string;
}
export declare const CountBadge: React.FC<CountBadgeProps>;
export default StatusBadge;
//# sourceMappingURL=StatusBadge.d.ts.map