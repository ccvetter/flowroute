import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Styled span for order/SKU IDs in IBM Plex Mono font
import React from 'react';
const VARIANT_CONFIG = {
    order: {
        prefixColor: '#BA7517', // amber
        bodyColor: '#5F5E5A',
        copyLabel: 'Copy order ID',
        prefixPattern: /^(#?[A-Z]+-)/,
    },
    sku: {
        prefixColor: '#888780',
        bodyColor: '#3C3C3A',
        copyLabel: 'Copy SKU',
        prefixPattern: /^([A-Z]+-)/,
    },
    shipment: {
        prefixColor: '#0F6E56', // teal
        bodyColor: '#5F5E5A',
        copyLabel: 'Copy tracking ID',
        prefixPattern: /^([A-Z]+-)/,
    },
    carrier: {
        prefixColor: '#888780',
        bodyColor: '#3C3C3A',
        copyLabel: 'Copy carrier ref',
        prefixPattern: /^([A-Z]+-[A-Z]+-)/,
    },
    bin: {
        prefixColor: '#6B4FA0', // purple - warehouse zone
        bodyColor: '#3C3C3A',
        copyLabel: 'Copy bin location',
        prefixPattern: /^([A-Z]-)/,
    },
    generic: {
        prefixColor: '#888780',
        bodyColor: '#3C3C3A',
        copyLabel: 'Copy ID',
    },
};
const SIZE_STYLES = {
    xs: { fontSize: '10px', letterSpacing: '0.02em' },
    sm: { fontSize: '11px', letterSpacing: '0.02em' },
    md: { fontSize: '13px', letterSpacing: '0.01em' },
    lg: { fontSize: '15px', letterSpacing: '0.01em' },
};
// -- Helpers --
/** Split an ID into [prefix, body] using variant pattern or explicit prop. */
function splitID(id, variant, prefixProp) {
    if (prefixProp) {
        const idx = id.indexOf(prefixProp);
        if (idx === 0)
            return [prefixProp, id.slice(prefixProp.length)];
    }
    const pattern = VARIANT_CONFIG[variant].prefixPattern;
    if (pattern) {
        const match = id.match(pattern);
        if (match && match[1])
            return [match[1], id.slice(match[1].length)];
    }
    return ['', id];
}
/**
 * Truncate string to N chars, appending ellipsis.
 */
function truncateStr(str, max) {
    if (str.length <= max)
        return str;
    return str.slice(0, max) + '...';
}
/**
 * Split a string into segments around a highlighted substring.
 * Returns array of { text, highlighted } objects.
 */
function splitHighlight(str, query) {
    if (!query)
        return [{ text: str, highlighted: false }];
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = str.split(regex);
    return parts.map((part) => ({
        text: part,
        highlighted: regex.test(part),
    }));
}
// -- Style injection --
const STYLE_ID = 'flowroute-mono-id';
function ensureStyles() {
    if (typeof document === 'undefined')
        return;
    if (document.getElementById(STYLE_ID))
        return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .fr-mono-id {
            font-family: 'IBM Plex Mono', monospace;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            position: relative;
            line-height: 1.4;
            cursor: default;
        }
        .fr-mono-id--block {
            display: flex;
        }
        .fr-mono-id__copy-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            color: inherit;
            opacity: 0;
            transition: opacity 120ms ease;
            flex-shrink: 0;
            line-height: 1;
        }
        .fr-mono-id:hover .fr-mono-id__copy-btn {
            opacity: 0.5;
        }
        .fr-mono-id__copy-btn:hover {
            opacity: 1 !important;
        }
        .fr-mono-id__copy-btn:focus-visible {
            outline: 2px solid #BA7517;
            outline-offset: 2px;
            border-radius: 2px;
            opacity: 1 !important;
        }
        .fr-mono-id__highlight {
            background: rgba(186, 117, 23, 0.18);
            color: #633806;
            border-radius: 2px;
            padding: 0 1px;
        }
        .fr-mono-id__tooltip {
            position: absolute;
            bottom: calc(100% + 6px);
            left: 50%;
            transform: translateX(-50%);
            background: #F1EFE8;
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 120ms ease;
            z-index: 999;
            font-family: 'IBM Plex Mono', monospace;
        }
        .fr-mono-id__tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #1A1A18;
        }
        .fr-mono-id:hover .fr-mono-id__tooltip--truncated {
            opacity: 1;
        }
        .fr-mono-id__copied {
            position: absolute;
            bottom: calc(100% + 6px);
            left: 50%;
            transform: translateX(-50%);
            background: #0F6E56;
            color: #fff;
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
            font-family: 'IBM Plex Mono', monospace;
            animation: fr-copied-pop 1.4s ease forwards;
            z-index: 999;
        }
        @keyframes fr-copied-pop {
            0%   { opacity: 0; transform: translateX(-50%) translateY(4px); }
            15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
            70%  { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
// -- Icons --
const CopyIcon = ({ size }) => (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "5.5", y: "5.5", width: "8", height: "8", rx: "1.5", stroke: "currentColor", strokeWidth: "1.4" }), _jsx("path", { d: "M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9A1.5 1.5 0 0 0 3.5 10.5H5.5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })] }));
// -- Component --
export const MonoID = React.forwardRef(({ id, variant = 'generic', size = 'sm', copyable = true, truncate, highlight, prefix: prefixProp, block = false, onCopy, className, style, }, ref) => {
    const [copied, setCopied] = React.useState(false);
    React.useEffect(() => { ensureStyles(); }, []);
    const config = VARIANT_CONFIG[variant];
    const [prefix, body] = splitID(id, variant, prefixProp);
    // Apply truncation to the full id for display
    const displayFull = prefix + body;
    const isTruncated = truncate !== undefined && displayFull.length > truncate;
    const displayStr = isTruncated ? truncateStr(displayFull, truncate) : displayFull;
    // Re-split after potential truncation
    const [displayPrefix, displayBody] = isTruncated
        ? splitID(displayStr.replace('...', ''), variant, prefixProp).map((s, i) => (i === 1 && isTruncated ? s + '...' : s))
        : [prefix, body];
    // Highlight segments within the body portion
    const bodySegments = highlight
        ? splitHighlight(displayBody ?? '', highlight)
        : [{ text: displayBody, highlighted: false }];
    async function handleCopy(e) {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            onCopy?.(id);
            setTimeout(() => setCopied(false), 1500);
        }
        catch {
            // Fallback for environments without clipboard API
            const el = document.createElement('textarea');
            el.value = id;
            el.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            onCopy?.(id);
            setTimeout(() => setCopied(false), 1500);
        }
    }
    const iconSize = size === 'xs' ? 9 : size === 'sm' ? 10 : size === 'md' ? 12 : 14;
    const classes = [
        'fr-mono-id',
        block ? 'fr-mono-id--block' : '',
        className ?? '',
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsxs("span", { ref: ref, className: classes, style: { ...SIZE_STYLES[size], ...style }, title: isTruncated ? id : undefined, children: [displayPrefix && (_jsx("span", { style: { color: config.prefixColor, fontWeight: 500 }, children: displayPrefix })), _jsx("span", { style: { color: config.bodyColor }, children: bodySegments.map((seg, i) => seg.highlighted ? (_jsx("mark", { className: "fr-mono-id__highlight", children: seg.text }, i)) : (_jsx(React.Fragment, { children: seg.text }, i))) }), isTruncated && (_jsx("span", { className: "fr-mono-id__tooltip fr-mono-id__tooltip--truncated", children: id })), copyable && (_jsx("button", { type: "button", className: "fr-mono-id__copy-btn", onClick: handleCopy, "aria-label": `${config.copyLabel}: ${id}`, tabIndex: 0, children: _jsx(CopyIcon, { size: iconSize }) })), copied && (_jsx("span", { className: "fr-mono-id__copied", "aria-live": "polite", children: "copied" }))] }));
});
MonoID.displayName = 'MonoID';
export default MonoID;
//# sourceMappingURL=MonoID.js.map