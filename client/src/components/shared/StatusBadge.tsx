// Pending / Picking / Shipped / Exception / Delivered
import React from 'react';

// ===================================================
// Types
// ===================================================
export type OrderStatus =
    | 'pending'
    | 'allocated'
    | 'picking'
    | 'packing'
    | 'shipped'
    | 'delivered'
    | 'exception'
    | 'cancelled';

export type StockStatus =
    | 'in-stock'
    | 'low-stock'
    | 'out-of-stock';

export type PriorityStatus =
    | 'high'
    | 'medium'
    | 'low';

export type BadgeVariant = 'order' | 'stock' | 'priority';

export type BadgeStatus = OrderStatus | StockStatus | PriorityStatus;

export type BadgeSize = 'sm' | 'md' | 'lg';

export type BadgeIconMode = 'icon' | 'dot' | 'none';

export interface StatusBadgeProps {
    // The status value to display.
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

// ===================================================
// Config maps
// ===================================================
interface StatusConfig {
    cssModifier: string;   // maps to .badge--{modifier}
    label: string;         // default display label
    icon: React.ReactNode; // SVG icon element
    liveRegion?: boolean;  // Should this trigger an aria-live announcement?
    pulseByDefault?: boolean; // animate pulse without explicit prop
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
    pending: {
        cssModifier: 'pending',
        label: 'Pending',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.512 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    allocated: {
        cssModifier: 'picking',
        label: 'Allocated',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h12M8 2l4 6-4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    picking: {
        cssModifier: 'picking',
        label: 'Picking',
        pulseByDefault: true,
        liveRegion: true,
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 813 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="13" cy="3" r="2.5" fill="currentColor" opacity="0.4" />
            </svg>
        ),
    },
    packing: {
        cssModifier: 'packing',
        label: 'Packing',
        pulseByDefault: true,
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="7" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    shipped: {
        cssModifier: 'shipped',
        label: 'Shipped',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1 8h9m0-313 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="4.5" cy="13" r="1.5" fill="currentColor" />
                <circle cx="11.5" cy="13" r="1.5" fill="currentColor" />
                <path d="M10 5h2.512 3H10V5z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
    delivered: {
        cssModifier: 'delivered',
        label: 'Delivered',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2.5 8.513.5 3.5 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    exception: {
        cssModifier: 'exception',
        label: 'Exception',
        liveRegion: true,
        pulseByDefault: true,
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
        ),
    },
    cancelled: {
        cssModifier: 'pending',
        label: 'Cancelled',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 5.515 5M10.5 5.51-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
};

const STOCK_STATUS_CONFIG: Record<StockStatus, StatusConfig> = {
    'in-stock': {
        cssModifier: 'in-stock',
        label: 'In Stock',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2.5 8.513.5 3.5 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    'low-stock': {
        cssModifier: 'low-stock',
        label: 'Low Stock',
        pulseByDefault: true,
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v6M8 12v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    'out-of-stock': {
        cssModifier: 'out-of-stock',
        label: 'Out of Stock',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 5.515 5M10.5 5.51-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
};

const PRIORITY_STATUS_CONFIG: Record<PriorityStatus, StatusConfig> = {
    high: {
        cssModifier: 'high',
        label: 'High',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 314 5H414-5zM8 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    medium: {
        cssModifier: 'medium',
        label: 'Medium',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M3 5h10M3 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    low: {
        cssModifier: 'low',
        label: 'Low',
        icon: (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 13L4 8h81-4 5zM8 7V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
};

function getConfig(status: BadgeStatus, variant: BadgeVariant): StatusConfig {
    if (variant === 'stock')    return STOCK_STATUS_CONFIG[status as StockStatus];
    if (variant === 'priority') return PRIORITY_STATUS_CONFIG[status as PriorityStatus];
    return ORDER_STATUS_CONFIG[status as OrderStatus];
}

// ===================================================
// Inline styles
// ===================================================
const BASE_STYLES: Record<string, React.CSSProperties> = {
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: '4px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 500,
        whiteSpace: 'nowrap',
        lineHeight: 1.6,
        border: '1px solid transparent',
        userSelect: 'none',
    },
    dot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'currentColor',
        flexShrink: 0,
    },
};

const SIZE_STYLES: Record<BadgeSize, React.CSSProperties> = {
    sm: { fontSize: '10px', padding: '1px 5px', gap: '3px' },
    md: { fontSize: '11px', padding: '2px 7px', gap: '4px' },
    lg: { fontSize: '12px', padding: '3px 10px', gap: '5px' },
};

const COLOR_MAP: Record<string, React.CSSProperties> = {
    'pending':      { background: '#F1EFE8', color: '#5F5E5A', borderColor: 'rgba(60, 60, 58, 0.12)' },
    'picking':      { background: '#FAEEDA', color: '#633806' },
    'packing':      { background: '#FAEEDA', color: '#BA7517' },
    'shipped':      { background: '#E1F5EE', color: '#0F6E56' },
    'delivered':    { background: '#EAF3DE', color: '#3B6D11' },
    'exception':    { background: '#FCEBEB', color: '#A32D2D' },
    'in-stock':     { background: '#EAF3DE', color: '#3B6D11' },
    'low-stock':    { background: '#FAEEDA', color: '#633806' },
    'out-stock':    { background: '#FAECE7', color: '#712B13' },
    'high':         { background: '#FAECE7', color: '#712B13' },
    'medium':       { background: '#FAEEDA', color: '#633806' },
    'low':          { background: '#F1EFE8', color: '#5F5E5A' },
};

// ===================================================
// Pulse animation (injected once via a style tag)
// ===================================================
const PULSE_STYLE_ID = 'flowroute-badge-pulse';

function ensurePulseStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(PULSE_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PULSE_STYLE_ID;
    style.textContent = `
        @keyframes fr-badge-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }  }
        }
        .fr-badge-pulse-icon {
            animation: fr-badge-pulse 2s ease-in-out infinite;
        }
    
    `;
    document.head.appendChild(style);
}

// ===================================================
// Component
// ===================================================
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
    (
        {
            status,
            variant = 'order',
            iconMode = 'icon',
            label,
            size = 'md',
            pulse,
            className,
            ariaLabel,
        },
        ref,
    ) => {
        const config = getConfig(status, variant);
        const shouldPulse = pulse ?? config.pulseByDefault ?? false;
        const displayLabel = label ?? config.label;

        // Inject pulse keyframes on first render
        React.useEffect(() => { ensurePulseStyle(); }, []);

        const colorStyles = COLOR_MAP[config.cssModifier] ?? {};

        const badgeStyle: React.CSSProperties = {
            ...BASE_STYLES.badge,
            ...SIZE_STYLES[size],
            ...colorStyles,
        };

        // Icon / dot element
        let indicator: React.ReactNode = null;

        if (iconMode === 'dot') {
            indicator = (
                <span
                    style={BASE_STYLES.dot}
                    className={shouldPulse ? 'fr-badge-pulse-icon' : undefined}
                    aria-hidden="true"
                />
            );
        } else if (iconMode === 'icon') {
            indicator = (
                <span
                    className={shouldPulse ? 'fr-badge-pulse-icon' : undefined}
                    style={{ display: 'inline-flex', flexShrink: 0 }}
                    aria-hidden="true"
                >
                    {config.icon}
                </span>
            );
        }

        return (
            <span
                ref={ref}
                style={badgeStyle}
                className={className}
                role="status"
                aria-label={ariaLabel ?? 'Status: ${displayLabel}'}
                aria-live={config.liveRegion ? 'polite' : undefined}
            >
                {indicator}
                {displayLabel}
            </span>
        );
    },
);

StatusBadge.displayName = 'StatusBadge';

// ===================================================
// Compound: CountBadge (notification count pill)
// ===================================================
export interface CountBadgeProps {
    count: number;
    /** Suppress display when count is 0. Defaults to true. */
    hideWhenZero?: boolean;
    /** Cap the displayed number. Defaults to 99. */
    max?: number;
    className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
    count,
    hideWhenZero = true,
    max = 99,
    className,
}) => {
    if (hideWhenZero && count === 0) return null;

    const displayed = count > max ? `${max}+` : String(count);

    const style: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#BA7517',
        color: '#fff',
        borderRadius: '9999px',
        minWidth: '18px',
        height: '18px',
        padding: '0 4px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        fontWeight: 500,
        lineHeight: 1,
    };

    return (
        <span
            style={style}
            className={className}
            aria-label={`${count} notification${count === 1 ? '' : 's'}`}
            role="status"
        >
            {displayed}
        </span>
    );
};

CountBadge.displayName = 'CountBadge';

// ===================================================
// Exports
// ===================================================
export default StatusBadge;


// ===================================================
// Usage examples
// ===================================================
/*
 
// --- Order statuses ---
<StatusBadge status="pending"   />
<StatusBadge status="allocated" />
<StatusBadge status="picking"   />       // pulses by default
<StatusBadge status="packing"   />       // pulses by default
<StatusBadge status="shipped"   />
<StatusBadge status="delivered" />
<StatusBadge status="exception" />       // pulses + aria-live
<StatusBadge status="cancelled" />
 
// --- Stock statuses ---
<StatusBadge status="in-stock"     variant="stock" />
<StatusBadge status="low-stock"    variant="stock" />
<StatusBadge status="out-of-stock" variant="stock" />
 
// --- Priority ---
<StatusBadge status="high"   variant="priority" />
<StatusBadge status="medium" variant="priority" />
<StatusBadge status="low"    variant="priority" />
 
// --- Sizes ---
<StatusBadge status="shipped" size="sm" />
<StatusBadge status="shipped" size="md" />
<StatusBadge status="shipped" size="lg" />
 
// --- Icon modes ---
<StatusBadge status="picking" iconMode="icon" />   // default
<StatusBadge status="picking" iconMode="dot"  />   // minimal, good for dense tables
<StatusBadge status="picking" iconMode="none" />   // label only
 
// --- Custom label ---
<StatusBadge status="exception" label="Carrier delay" />
 
// --- Disable pulse ---
<StatusBadge status="picking" pulse={false} />
 
// --- Count badge ---
<CountBadge count={3}  />                 // shows "3"
<CountBadge count={120} max={99} />       // shows "99+"
<CountBadge count={0}  hideWhenZero />    // renders null
 
*/