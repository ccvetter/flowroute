// in-stock / low / out-of-stock indicator
import React from 'react';

/**
 * Types
 */
export type StockLevelStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type StockLevelBadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type StockLevelBadgeVariant =
    | 'badge'    // text label + dot, same family as StatusBadge
    | 'pill'     // rounded pill with quantity inside
    | 'bar'      // horizontal fill bar with label
    | 'gauge'    // segmented block gauge (5 blocks)
    | 'numeric'; // plain colored number, no container

export interface StockLevelBadgeProps {
    /** Current stock quantity. Required for non-badge variants. */
    stockLevel: number;
    /**
     * At or below this value the badge shows 'low-stock'.
     * Defaults to 10.
     */
    reorderThreshold?: number;
    /**
     * At or below this value the badge shows 'out-of-stock'.
     * Defaults to 0.
     */
    outOfStockThreshold?: number;
    /**
     * Max stock - required for 'bar' and 'gauge' variants.
     * Used to compute fill percentage.
     */
    maxStock?: number;
    /**
     * Override the derived status entirely.
     * Useful when the parent already knows the status.
     */
    status?: StockLevelStatus;
    /** Visual variant. Defaults to 'badge'. */
    variant?: StockLevelBadgeVariant;
    /** Size. Defaults to 'sm'. */
    size?: StockLevelBadgeSize;
    /** Unit of measure shown beside the quantity. Defaults to 'ea'. */
    uom?: string;
    /**
     * Show the numeric quantity inside the badge.
     * Defaults to true for pill/bar/gauge/numeric, false for badge.
     */
    showQuantity?: boolean;
    /**
     * Override the label text.
     * Defaults to  status-appropriate string.
     */
    label?: string;
    /** Animate the fill bar / gauge on mount. Defaults to true. */
    animated?: boolean;
    /** Hide from assistive technology when decorative. Defaults to false. */
    decorative?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Helpers
 */
function deriveStatus(
    level: number,
    reorder: number,
    outOfStock: number,
): StockLevelStatus {
    if (level <= outOfStock) return 'out-of-stock';
    if (level <= reorder) return 'low-stock';
    return 'in-stock';
}

function fillPct(level: number, max: number): number {
    if (max <= 0) return 0;
    return Math.min(Math.max(Math.round((level / max) * 100), 0), 100);
}

/**
 * Tokens
 */
interface StatusTokens {
    label:     string;
    dot:       string; // dot / accent color
    bg:        string; // badge background
    text:      string; // badge text
    fill:      string; // bar / gauge fill color
    fillBg:    string; // bar / gauge track color
    pillBg:    string;
    pillText:  string;
}

const STATUS_TOKENS: Record<StockLevelStatus, StatusTokens> = {
    'in-stock': {
        label:    'In stock',
        dot:      '#1D9E75',
        bg:       '#EAF3DE',
        text:     '#3B6D11',
        fill:     '#0F6E56',
        fillBg:   'rgba(15,110,86,0.12)',
        pillBg:   '#E1F5EE',
        pillText: '#085041',
    },
    'low-stock': {
        label:    'Low stock',
        dot:      '#BA7517',
        bg:       '#FAEEDA',
        text:     '#633806',
        fill:     '#BA7517',
        fillBg:   'rgba(186,117,23,0.12)',
        pillBg:   '#FAEEDA',
        pillText: '#633806',
    },
    'out-of-stock': {
        label:    'Out of stock',
        dot:      '#D85A30',
        bg:       '#FAECE7',
        text:     '#712B13',
        fill:     '#D85A30',
        fillBg:   'rgba(216,90,48,0.1)',
        pillBg:   '#FAECE7',
        pillText: '#712B13', 
    },
};

interface SizeTokens {
    fontSize:    string;
    dotSize:     number;
    pillH:       number;
    pillPad:     string;
    barH:        number;
    barW:        number;
    barRadius:   string;
    gaugeBlock:  number;
    gaugeGap:    number;
    numericSize: string;
}

const SIZE_TOKENS: Record<StockLevelBadgeSize, SizeTokens> = {
    xs: { fontSize: '9px',  dotSize: 5, pillH: 16, pillPad: '0 5px',  barH: 4, barW: 48, barRadius: '2px', gaugeBlock: 5, gaugeGap: 2, numericSize: '10px' },
    sm: { fontSize: '10px', dotSize: 6, pillH: 18, pillPad: '0 6px',  barH: 5, barW: 64, barRadius: '2px', gaugeBlock: 7, gaugeGap: 2, numericSize: '12px' },
    md: { fontSize: '11px', dotSize: 7, pillH: 22, pillPad: '0 8px',  barH: 6, barW: 80, barRadius: '3px', gaugeBlock: 9, gaugeGap: 3, numericSize: '14px' },
    lg: { fontSize: '13px', dotSize: 8, pillH: 26, pillPad: '0 10px', barH: 8, barW: 96, barRadius: '3px', gaugeBlock: 12, gaugeGap: 3, numericSize: '16px' },
};

const GAUGE_SEGMENTS = 5;

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-stock-badge';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-stock { display: inline-flex; align-items: center; gap: 4px; }

        /* Badge variant */
        .fr-stock--badge {
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            border-radius: 4px;
            padding: 2px 6px;
            line-height: 1.6;
        }
        .fr-stock__dot {
            border-radius: 50%;
            flex-shrink: 0;
        }

        /* Pill variant */
        .fr-stock--pill {
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            border-radius: 9999px;
        }

        /* Bar variant */
        .fr-stock--bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 3px;
        }
        .fr-stock__bar-row {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
        }
        .fr-stock__bar-track {
            border-radius: 2px;
            overflow: hidden;
            flex: 1;
        }
        .fr-stock__bar-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 500ms cubic-bezier(0.4,0,0.2,1);
            transform-origin: left;
        }
        .fr-stock__bar-fill--animated {
            animation: fr-stock-bar-in 600ms cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fr-stock-bar-in {
            from { width: 0% !important; }
        }
        .fr-stock__bar-label {
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .fr-stock__bar-meta {
            display: flex;
            justify-content: space-between;
            font-family: 'IBM Plex Mono', monospace;
            width: 100%;
        }
        
        /* Gauge variant */
        .fr-stock--gauge {
            flex-direction: column;
            align-items: flex-start;
            gap: 3px;
        }
        .fr-stock__gauge-blocks {
            display: flex;
        }
        .fr-stock__guage-block {
            border-radius: 2px;
            transition: background 300ms ease;
        }
        .fr-stock__gauge-block--animated {
            animation: fr-stock-block-in 400ms ease both;
        }
        @keyframes fr-stock-block-in {
            from { opacity: 0; transform: scaleY(0.3); }
        }
        .fr-stock__gauge-label {
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
        }

        /* Numeric variant */
        .fr-stock--numeric {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            line-height: 1;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Variant renderers
 */
interface RenderProps {
    status:     StockLevelStatus;
    stockLevel: number;
    maxStock:   number | undefined;
    uom:        string;
    showQty:    boolean;
    label:      string;
    tok:        SizeTokens;
    animated:   boolean;
    ariaProps:  React.AriaAttributes & { role?: string };
    className?: string | undefined;
    style?:     React.CSSProperties | undefined;
}

const BadgeVariant: React.FC<RenderProps> = ({
    status, stockLevel, uom, showQty, label, tok, ariaProps, className, style,
}) => {
    const st = STATUS_TOKENS[status];
    return (
        <span
            className={['fr-stock', 'fr-stock--badge', className].filter(Boolean).join(' ')}
            style={{ fontSize: tok.fontSize, background: st.bg, color: st.text, ...style }}
            {...ariaProps}
        >
            <span 
                className="fr-stock__dot"
                style={{ width: tok.dotSize, height: tok.dotSize, background: st.dot }}
                aria-hidden="true"
            />
            {showQty ? `${stockLevel.toLocaleString()} ${uom}` : label}
        </span>
    );
};

const PillVariant: React.FC<RenderProps> = ({
    status, stockLevel, uom, showQty, label, tok, ariaProps, className, style,
}) => {
    const st = STATUS_TOKENS[status];
    return (
        <span 
            className={['fr-stock', 'fr-stock--pill', className].filter(Boolean).join(' ')}
            style={{
                fontSize:   tok.fontSize,
                height:     tok.pillH,
                padding:    tok.pillPad,
                background: st.pillBg,
                color:      st.pillText,
                ...style,
            }}
            {...ariaProps}
        >
            {showQty ? `${stockLevel.toLocaleString()} ${uom}` : label}
        </span>
    );
};

const BarVariant: React.FC<RenderProps> = ({
    status, stockLevel, maxStock, uom, label, tok, animated, ariaProps, className, style,
}) => {
    const st = STATUS_TOKENS[status];
    const pct = maxStock ? fillPct(stockLevel, maxStock) : 100;

    return (
        <div 
            className={['fr-stock', 'fr-stock--bar', className].filter(Boolean).join(' ')}
            style={{ width: tok.barW, ...style }}
            {...ariaProps}
        >
            <div className="fr-stock__bar-row">
                {/* Track + fill */}
                <div 
                    className="fr-stock__bar-track"
                    style={{ background: st.fillBg, height: tok.barH }}
                    role="meter"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className={[
                            'fr-stock__bar-fill',
                            animated ? 'fr-stock__bar-fill--animated' : '',
                        ].filter(Boolean).join(' ')}
                        style={{
                            width: `${pct}%`,
                            background: st.fill,
                            height: '100%',
                        }}
                    />
                </div>

                {/* Label */}
                <span 
                    className="fr-stock__bar-label"
                    style={{ fontSize: tok.fontSize, color: st.text }}
                >
                    {label}
                </span>
            </div>

            {/* Meta line */}
            {maxStock && (
                <div
                    className="fr-stock__bar-meta"
                    style={{ fontSize: `calc(${tok.fontSize} * 0.9)` }}
                >
                    <span style={{ color: st.text }}>
                        {stockLevel.toLocaleString()} {uom}
                    </span>
                    <span style={{ color: '#B4B2A9' }}>
                        / {maxStock.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

const GaugeVariant: React.FC<RenderProps> = ({
    status, stockLevel, maxStock, uom, showQty, label, tok, animated, ariaProps, className, style,
}) => {
    const st = STATUS_TOKENS[status];
    const pct = maxStock ? fillPct(stockLevel, maxStock) : (status === 'in-stock' ? 100 : status === 'low-stock' ? 40 : 0);

    // How many of the 5 segments are filled
    const filledCount = Math.round((pct / 100) * GAUGE_SEGMENTS);

    return (
        <div
            className={['fr-stock', 'fr-stock--gauge', className].filter(Boolean).join(' ')}
            style={style}
            {...ariaProps}
        >
            {/* Blocks */}
            <div 
                className="fr-stock__gauge-blocks"
                style={{ gap: tok.gaugeBlock }}
                role="meter"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Stock level: ${pct}%`}
            >
                {Array.from({ length: GAUGE_SEGMENTS }).map((_, i) => {
                    const filled = i < filledCount;
                    return (
                        <div
                            key={i}
                            className={[
                                'fr-stock__gauge-block',
                                animated ? 'fr-stock__gauge-block--animated' : '',
                            ].filter(Boolean).join(' ')}
                            style={{
                                width: tok.gaugeBlock,
                                height: tok.gaugeBlock * 1.4,
                                background: filled ? st.fill : st.fillBg,
                                animationDelay: animated ? `${i * 60}ms` : '0ms',
                            }}
                            aria-hidden="true"
                        />
                    );
                })}
            </div>

            {/* Label row */}
            <span
                className="fr-stock__gauge-label"
                style={{ fontSize: tok.fontSize, color: st.text }}
            >
                {showQty
                    ? `${stockLevel.toLocaleString()} ${uom}`
                    : label}
            </span>
        </div>
    );
};

const NumericVariant: React.FC<RenderProps> = ({
    status, stockLevel, uom, showQty, tok, ariaProps, className, style,
}) => {
    const st = STATUS_TOKENS[status];
    return (
        <span
            className={['fr-stock', 'fr-stock--numeric', className].filter(Boolean).join(' ')}
            style={{
                fontSize: tok.numericSize,
                color: st.fill,
                ...style,
            }}
            {...ariaProps}
        >
            {stockLevel.toLocaleString()}
            {showQty && (
                <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: `calc(${tok.numericSize} * 0.65)`,
                    fontWeight: 400,
                    marginLeft: 3,
                    color: '#888780',
                    fontStyle: 'normal',
                }}>
                    {uom}
                </span>
            )}
        </span>
    );
};

/**
 * Component
 */
export const StockLevelBadge = React.forwardRef<HTMLSpanElement | HTMLDivElement, StockLevelBadgeProps>(
    (
        {
            stockLevel,
            reorderThreshold = 10,
            outOfStockThreshold = 0,
            maxStock,
            status: statusProp,
            variant = 'badge',
            size = 'sm',
            uom = 'ea',
            showQuantity,
            label: labelProp,
            animated = true,
            decorative = false,
            className,
            style,
        },
        _ref,
    ) => {
        React.useEffect(() => { ensureStyles(); }, []);

        const status = statusProp ?? deriveStatus(stockLevel, reorderThreshold, outOfStockThreshold);
        const st = STATUS_TOKENS[status];
        const tok = SIZE_TOKENS[size];

        // Default showQuantity per variant
        const showQty = showQuantity ?? (variant !== 'badge');

        const label = labelProp ?? st.label;

        const ariaProps: React.AriaAttributes & { role?: string } = decorative
            ? { 'aria-hidden': true }
            : {
                role: 'status',
                'aria-label': `Stock: ${stockLevel.toLocaleString()} ${uom} - ${label}`,
            };

        const renderProps: RenderProps = {
            status,
            stockLevel,
            maxStock,
            uom,
            showQty,
            label,
            tok,
            animated,
            ariaProps,
            className,
            style,
        };

        switch (variant) {
            case 'pill':    return <PillVariant    {...renderProps} />;
            case 'bar':     return <BarVariant     {...renderProps} />;
            case 'gauge':   return <GaugeVariant   {...renderProps} />;
            case 'numeric': return <NumericVariant {...renderProps} />;
            default:        return <BadgeVariant   {...renderProps} />;
        }
    },
);

StockLevelBadge.displayName = 'StockLevelBadge';

export default StockLevelBadge;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Badge (default) ---
<StockLevelBadge stockLevel={42} />                  // "In stock"
<StockLevelBadge stockLevel={6}  />                  // "Low stock"  (amber)
<StockLevelBadge stockLevel={0}  />                  // "Out of stock" (coral)
 
// --- Badge with quantity ---
<StockLevelBadge stockLevel={42} showQuantity />      // "42 ea"
<StockLevelBadge stockLevel={6}  showQuantity />      // "6 ea" (amber)
 
// --- Pill ---
<StockLevelBadge stockLevel={42} variant="pill" />   // "In stock"
<StockLevelBadge stockLevel={42} variant="pill" showQuantity uom="boxes" />  // "42 boxes"
 
// --- Bar (needs maxStock) ---
<StockLevelBadge stockLevel={42} maxStock={200} variant="bar" />
<StockLevelBadge stockLevel={6}  maxStock={200} variant="bar" />   // amber fill
<StockLevelBadge stockLevel={0}  maxStock={200} variant="bar" />   // empty, coral
 
// --- Gauge (5 segments) ---
<StockLevelBadge stockLevel={42} maxStock={200} variant="gauge" />
<StockLevelBadge stockLevel={6}  maxStock={200} variant="gauge" />
<StockLevelBadge stockLevel={0}  maxStock={200} variant="gauge" />
 
// --- Numeric (plain colored number) ---
<StockLevelBadge stockLevel={42} variant="numeric" />         // large teal "42"
<StockLevelBadge stockLevel={42} variant="numeric" showQuantity uom="ea" />  // "42 ea"
<StockLevelBadge stockLevel={6}  variant="numeric" size="lg" />   // large amber "6"
 
// --- Sizes ---
<StockLevelBadge stockLevel={42} size="xs" />
<StockLevelBadge stockLevel={42} size="sm" />   // default
<StockLevelBadge stockLevel={42} size="md" />
<StockLevelBadge stockLevel={42} size="lg" />
 
// --- Custom thresholds ---
<StockLevelBadge
  stockLevel={25}
  reorderThreshold={30}      // low below 30
  outOfStockThreshold={5}    // out below 5
/>
 
// --- Override status ---
<StockLevelBadge stockLevel={42} status="low-stock" />   // force amber regardless of thresholds
 
// --- Custom label ---
<StockLevelBadge stockLevel={0} label="Backordered" />
 
// --- Disable animation ---
<StockLevelBadge stockLevel={42} maxStock={200} variant="bar" animated={false} />
 
// --- Decorative (inside SKUCard, StatusBadge handles the a11y) ---
<StockLevelBadge stockLevel={42} maxStock={200} variant="gauge" decorative />
 
// --- In a table column ---
<td>
  <StockLevelBadge stockLevel={row.stock} variant="pill" showQuantity size="xs" />
</td>
 
// --- In a SKUCard header (numeric) ---
<StockLevelBadge
  stockLevel={42}
  reorderThreshold={10}
  variant="numeric"
  size="lg"
  showQuantity
/>
 
// --- Beside a ReorderAlert ---
<div style={{ display:'flex', alignItems:'center', gap:8 }}>
  <StockLevelBadge stockLevel={4} variant="gauge" maxStock={100} size="sm" />
  <ReorderAlert sku="SKU-00412" stockLevel={4} threshold={10} />
</div>
 
*/
