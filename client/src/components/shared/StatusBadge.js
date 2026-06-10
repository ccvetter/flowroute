import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Pending / Picking / Shipped / Exception / Delivered
import React from 'react';
const ORDER_STATUS_CONFIG = {
    pending: {
        cssModifier: 'pending',
        label: 'Pending',
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("circle", { cx: "8", cy: "8", r: "6.5", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M8 5v3.512 2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] })),
    },
    allocated: {
        cssModifier: 'picking',
        label: 'Allocated',
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M2 8h12M8 2l4 6-4 6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })),
    },
    picking: {
        cssModifier: 'picking',
        label: 'Picking',
        pulseByDefault: true,
        liveRegion: true,
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("path", { d: "M3 813 3 7-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("circle", { cx: "13", cy: "3", r: "2.5", fill: "currentColor", opacity: "0.4" })] })),
    },
    packing: {
        cssModifier: 'packing',
        label: 'Packing',
        pulseByDefault: true,
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "2", y: "7", width: "12", height: "8", rx: "1.5", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M5 7V5a3 3 0 0 1 6 0v2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] })),
    },
    shipped: {
        cssModifier: 'shipped',
        label: 'Shipped',
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("path", { d: "M1 8h9m0-313 3-3 3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("circle", { cx: "4.5", cy: "13", r: "1.5", fill: "currentColor" }), _jsx("circle", { cx: "11.5", cy: "13", r: "1.5", fill: "currentColor" }), _jsx("path", { d: "M10 5h2.512 3H10V5z", fill: "currentColor", opacity: "0.3", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" })] })),
    },
    delivered: {
        cssModifier: 'delivered',
        label: 'Delivered',
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M2.5 8.513.5 3.5 7-8", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })),
    },
    exception: {
        cssModifier: 'exception',
        label: 'Exception',
        liveRegion: true,
        pulseByDefault: true,
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("path", { d: "M8 1.5L14.5 13H1.5L8 1.5z", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }), _jsx("path", { d: "M8 6v3.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "currentColor" })] })),
    },
    cancelled: {
        cssModifier: 'pending',
        label: 'Cancelled',
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("circle", { cx: "8", cy: "8", r: "6.5", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M5.5 5.515 5M10.5 5.51-5 5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] })),
    },
};
const STOCK_STATUS_CONFIG = {
    'in-stock': {
        cssModifier: 'in-stock',
        label: 'In Stock',
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M2.5 8.513.5 3.5 7-8", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })),
    },
    'low-stock': {
        cssModifier: 'low-stock',
        label: 'Low Stock',
        pulseByDefault: true,
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M8 3v6M8 12v1", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) })),
    },
    'out-of-stock': {
        cssModifier: 'out-of-stock',
        label: 'Out of Stock',
        icon: (_jsxs("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("circle", { cx: "8", cy: "8", r: "6.5", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M5.5 5.515 5M10.5 5.51-5 5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] })),
    },
};
const PRIORITY_STATUS_CONFIG = {
    high: {
        cssModifier: 'high',
        label: 'High',
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M8 314 5H414-5zM8 9v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })),
    },
    medium: {
        cssModifier: 'medium',
        label: 'Medium',
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M3 8h10M3 5h10M3 11h6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) })),
    },
    low: {
        cssModifier: 'low',
        label: 'Low',
        icon: (_jsx("svg", { width: "10", height: "10", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M8 13L4 8h81-4 5zM8 7V3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })),
    },
};
function getConfig(status, variant) {
    if (variant === 'stock')
        return STOCK_STATUS_CONFIG[status];
    if (variant === 'priority')
        return PRIORITY_STATUS_CONFIG[status];
    return ORDER_STATUS_CONFIG[status];
}
// ===================================================
// Inline styles
// ===================================================
const BASE_STYLES = {
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
const SIZE_STYLES = {
    sm: { fontSize: '10px', padding: '1px 5px', gap: '3px' },
    md: { fontSize: '11px', padding: '2px 7px', gap: '4px' },
    lg: { fontSize: '12px', padding: '3px 10px', gap: '5px' },
};
const COLOR_MAP = {
    'pending': { background: '#F1EFE8', color: '#5F5E5A', borderColor: 'rgba(60, 60, 58, 0.12)' },
    'picking': { background: '#FAEEDA', color: '#633806' },
    'packing': { background: '#FAEEDA', color: '#BA7517' },
    'shipped': { background: '#E1F5EE', color: '#0F6E56' },
    'delivered': { background: '#EAF3DE', color: '#3B6D11' },
    'exception': { background: '#FCEBEB', color: '#A32D2D' },
    'in-stock': { background: '#EAF3DE', color: '#3B6D11' },
    'low-stock': { background: '#FAEEDA', color: '#633806' },
    'out-stock': { background: '#FAECE7', color: '#712B13' },
    'high': { background: '#FAECE7', color: '#712B13' },
    'medium': { background: '#FAEEDA', color: '#633806' },
    'low': { background: '#F1EFE8', color: '#5F5E5A' },
};
// ===================================================
// Pulse animation (injected once via a style tag)
// ===================================================
const PULSE_STYLE_ID = 'flowroute-badge-pulse';
function ensurePulseStyle() {
    if (typeof document === 'undefined')
        return;
    if (document.getElementById(PULSE_STYLE_ID))
        return;
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
export const StatusBadge = React.forwardRef(({ status, variant = 'order', iconMode = 'icon', label, size = 'md', pulse, className, ariaLabel, }, ref) => {
    const config = getConfig(status, variant);
    const shouldPulse = pulse ?? config.pulseByDefault ?? false;
    const displayLabel = label ?? config.label;
    // Inject pulse keyframes on first render
    React.useEffect(() => { ensurePulseStyle(); }, []);
    const colorStyles = COLOR_MAP[config.cssModifier] ?? {};
    const badgeStyle = {
        ...BASE_STYLES.badge,
        ...SIZE_STYLES[size],
        ...colorStyles,
    };
    // Icon / dot element
    let indicator = null;
    if (iconMode === 'dot') {
        indicator = (_jsx("span", { style: BASE_STYLES.dot, className: shouldPulse ? 'fr-badge-pulse-icon' : undefined, "aria-hidden": "true" }));
    }
    else if (iconMode === 'icon') {
        indicator = (_jsx("span", { className: shouldPulse ? 'fr-badge-pulse-icon' : undefined, style: { display: 'inline-flex', flexShrink: 0 }, "aria-hidden": "true", children: config.icon }));
    }
    return (_jsxs("span", { ref: ref, style: badgeStyle, className: className, role: "status", "aria-label": ariaLabel ?? 'Status: ${displayLabel}', "aria-live": config.liveRegion ? 'polite' : undefined, children: [indicator, displayLabel] }));
});
StatusBadge.displayName = 'StatusBadge';
export const CountBadge = ({ count, hideWhenZero = true, max = 99, className, }) => {
    if (hideWhenZero && count === 0)
        return null;
    const displayed = count > max ? `${max}+` : String(count);
    const style = {
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
    return (_jsx("span", { style: style, className: className, "aria-label": `${count} notification${count === 1 ? '' : 's'}`, role: "status", children: displayed }));
};
CountBadge.displayName = 'CountBadge';
// ===================================================
// Exports
// ===================================================
export default StatusBadge;
//# sourceMappingURL=StatusBadge.js.map