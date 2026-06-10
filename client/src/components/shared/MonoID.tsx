// Styled span for order/SKU IDs in IBM Plex Mono font
import React from 'react';

// -- Types --
export type MonoIDVariant = 
    | 'order'     // #FR-48291   -- amber prefix tint
    | 'sku'       // SKU-00412   -- neutral
    | 'shipment'  // SHP-9923A   -- teal tint
    | 'carrier'   // TRK-UPS-41  -- neutral
    | 'bin'       // A-12-C      -- purple tint (warehouse location)
    | 'generic';  // plain mono, no prefix styling

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

// -- Config --
interface VariantConfig {
    prefixColor: string;
    bodyColor: string;
    copyLabel: string;
    // Auto-detect prefix pattern (regex that captures prefix + separator)
    prefixPattern?: RegExp;
}

const VARIANT_CONFIG: Record<MonoIDVariant, VariantConfig> = {
    order: {
        prefixColor: '#BA7517',  // amber
        bodyColor:   '#5F5E5A',
        copyLabel:   'Copy order ID',
        prefixPattern: /^(#?[A-Z]+-)/,
    },
    sku: {
        prefixColor: '#888780',
        bodyColor:   '#3C3C3A',
        copyLabel:   'Copy SKU',
        prefixPattern: /^([A-Z]+-)/,
    },
    shipment: {
        prefixColor: '#0F6E56',  // teal
        bodyColor:   '#5F5E5A',
        copyLabel:   'Copy tracking ID',
        prefixPattern: /^([A-Z]+-)/,
    },
    carrier: {
        prefixColor: '#888780',
        bodyColor:   '#3C3C3A',
        copyLabel:   'Copy carrier ref',
        prefixPattern: /^([A-Z]+-[A-Z]+-)/,
    },
    bin: {
        prefixColor: '#6B4FA0',  // purple - warehouse zone
        bodyColor:   '#3C3C3A',
        copyLabel:   'Copy bin location',
        prefixPattern: /^([A-Z]-)/,
    },
    generic: {
        prefixColor: '#888780',
        bodyColor:   '#3C3C3A',
        copyLabel:   'Copy ID',
    },
};

const SIZE_STYLES: Record<MonoIDSize, React.CSSProperties> = {
    xs: { fontSize: '10px', letterSpacing: '0.02em' },
    sm: { fontSize: '11px', letterSpacing: '0.02em' },
    md: { fontSize: '13px', letterSpacing: '0.01em' },
    lg: { fontSize: '15px', letterSpacing: '0.01em' },
};

// -- Helpers --
/** Split an ID into [prefix, body] using variant pattern or explicit prop. */
function splitID(
    id: string,
    variant: MonoIDVariant,
    prefixProp?: string,
): [string, string] {
    if (prefixProp) {
        const idx = id.indexOf(prefixProp);
        if (idx === 0) return [prefixProp, id.slice(prefixProp.length)];
    }
    const pattern = VARIANT_CONFIG[variant].prefixPattern;
    if (pattern) {
        const match = id.match(pattern);
        if (match && match[1]) return [match[1], id.slice(match[1].length)];
    }
    return ['', id];
}

/**
 * Truncate string to N chars, appending ellipsis. 
 */
function truncateStr(str: string, max: number): string {
    if (str.length <= max) return str;
    return str.slice(0, max) + '...';
}

/**
 * Split a string into segments around a highlighted substring.
 * Returns array of { text, highlighted } objects.
 */
function splitHighlight(
    str: string,
    query?: string,
): { text: string, highlighted: boolean }[] {
    if (!query) return [{ text: str, highlighted: false }];
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = str.split(regex);
    return parts.map((part) => ({
        text: part,
        highlighted: regex.test(part),
    }));
}

// -- Style injection --
const STYLE_ID = 'flowroute-mono-id';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
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
const CopyIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9A1.5 1.5 0 0 0 3.5 10.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

// -- Component --
export const MonoID = React.forwardRef<HTMLSpanElement, MonoIDProps>(
    (
        {
            id,
            variant = 'generic',
            size = 'sm',
            copyable = true,
            truncate,
            highlight,
            prefix: prefixProp,
            block = false,
            onCopy,
            className,
            style,
        },
        ref,
    ) => {
        const [copied, setCopied] = React.useState(false);

        React.useEffect(() => { ensureStyles(); }, []);

        const config = VARIANT_CONFIG[variant];
        const [prefix, body] = splitID(id, variant, prefixProp);

        // Apply truncation to the full id for display
        const displayFull = prefix + body;
        const isTruncated = truncate !== undefined && displayFull.length > truncate;
        const displayStr = isTruncated ? truncateStr(displayFull, truncate!) : displayFull;

        // Re-split after potential truncation
        const [displayPrefix, displayBody] = isTruncated
            ? splitID(displayStr.replace('...', ''), variant, prefixProp).map(
                (s, i) => (i === 1 && isTruncated ? s + '...' : s),
            )
        : [prefix, body];

        // Highlight segments within the body portion
        const bodySegments = highlight
            ? splitHighlight(displayBody ?? '', highlight)
            : [{ text: displayBody, highlighted: false }];

        async function handleCopy(e: React.MouseEvent) {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(id);
                setCopied(true);
                onCopy?.(id);
                setTimeout(() => setCopied(false), 1500);
            } catch {
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

        return (
            <span
                ref={ref}
                className={classes}
                style={{ ...SIZE_STYLES[size], ...style }}
                title={isTruncated ? id : undefined }
            >
                {/* Two-tone prefix */}
                {displayPrefix && (
                    <span style={{ color: config.prefixColor, fontWeight: 500 }}>
                        {displayPrefix}
                    </span>
                )}

                {/* Body with optional highlight */}
                <span style={{ color: config.bodyColor }}>
                    {bodySegments.map((seg, i) => 
                        seg.highlighted ? (
                            <mark key={i} className="fr-mono-id__highlight">
                                {seg.text}
                            </mark>
                        ) : (
                            <React.Fragment key={i}>{seg.text}</React.Fragment>
                        ),
                    )}
                </span>

                {/* Truncation full-ID tooltip */}
                {isTruncated && (
                    <span className="fr-mono-id__tooltip fr-mono-id__tooltip--truncated">
                        {id}
                    </span>
                )}

                {/* Copy button */}
                {copyable && (
                    <button
                        type="button"
                        className="fr-mono-id__copy-btn"
                        onClick={handleCopy}
                        aria-label={`${config.copyLabel}: ${id}`}
                        tabIndex={0}
                    >
                        <CopyIcon size={iconSize} />
                    </button>
                )}

                {/* Copied confirmation */}
                {copied && (
                    <span className="fr-mono-id__copied" aria-live="polite">
                        copied
                    </span>
                )}
            </span>
        );
    },
);

MonoID.displayName = 'MonoID';

export default MonoID;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Variants ---
<MonoID id="#FR-48291"      variant="order"    />   // amber prefix
<MonoID id="SKU-00412"      variant="sku"      />   // neutral
<MonoID id="SHP-UPS-9923A"  variant="shipment" />   // teal prefix
<MonoID id="TRK-UPS-41882"  variant="carrier"  />   // neutral
<MonoID id="A-12-C"         variant="bin"      />   // purple prefix (zone)
<MonoID id="abc-123"        variant="generic"  />   // plain
 
// --- Sizes ---
<MonoID id="#FR-48291" size="xs" />
<MonoID id="#FR-48291" size="sm" />   // default — use in tables
<MonoID id="#FR-48291" size="md" />   // use in detail drawers
<MonoID id="#FR-48291" size="lg" />   // use in page headers
 
// --- Copyable (default on) ---
<MonoID id="#FR-48291" copyable={false} />
 
// --- Truncation (great for narrow table columns) ---
<MonoID id="TRK-FEDEX-88291-XTRA-LONG" truncate={16} />
// renders "TRK-FEDEX-88291…" with full ID in hover tooltip
 
// --- Search highlight ---
<MonoID id="#FR-48291" highlight="482" />
// "482" segment gets an amber background highlight
 
// --- Custom prefix split ---
<MonoID id="CUSTOM::ID-9922" prefix="CUSTOM::" />
 
// --- Block layout (fills container width) ---
<MonoID id="#FR-48291" block />
 
// --- Copy callback ---
<MonoID
  id="#FR-48291"
  onCopy={(id) => console.log('Copied:', id)}
/>
 
// --- In a table column ---
<td className="col-id">
  <MonoID id={order.id} variant="order" size="sm" truncate={12} />
</td>
 
// --- In an order detail drawer header ---
<MonoID id={order.id} variant="order" size="lg" />
 
*/