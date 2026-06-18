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
    return '#0F6E56';
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
    md: { imageSize: 64, imageRadius: '8px', nameFontSize: '14px', metaFontSize: '11px', qtyFontSize: '22px', padding: '16px', gap: 10, barHeight: 4, radius: '10px' },
    lg: { imageSize: 80, imageRadius: '10px', nameFontSize: '16px', metaFontSize: '12px', qtyFontSize: '28px', padding: '20px', gap: 12, barHeight: 5, radius: '12px' },
};

// Row layout image sizes
const ROW_IMAGE_SIZE: Record<SKUCardSize, number> = {
    sm: 36,
    md: 48,
    lg: 56,
};

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-sku-card';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-sku {
            background: #FFFFFF;
            border: 1px solid rgba(60,60,58,0.12);
            display: flex;
            transition:
                border-color 140ms ease,
                box-shadow 140ms ease;
            position: relative;
            overflow: hidden;
        }
        .fr-sku--clickable { cursor: pointer; }
        .fr-sku--clickable:hover {
            border-color: rgba(60,60,58,0.24);
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .fr-sku--clickable:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(186,117,23,0.25);
            border-color: #BA7517;
        }
        .fr-sku--out-of-stock { border-color: rgba(216,90,48,0.25); }
        .fr-sku--low-stock    { border-color: rgba(186,117,23,0.3); }

        /* Grid layout (vertical card) */
        .fr-sku--grid { flex-direction: column; }

        /* Row layout (horizontal list item) */
        .fr-sku--row { flex-direction: row; align-items: center; }

        /* Image */
        .fr-sku__image-wrap {
            background: #F1EFE8;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
        }
        .fr-sku__image-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .fr-sku__image-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        /* Body */
        .fr-sku__body {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
        }

        /* Name */
        .fr-sku__name {
            font-family: 'IBM Plex Sans', sans-serif;
            font-weight: 500;
            color: #3C3C3A;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Quantity */
        .fr-sku__qty {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            color: #3C3C3A;
            line-height: 1;
        }
        .fr-sku__qty-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888780;
            margin-top: 2px;
        }

        /* Stock bar */
        .fr-sku__bar-track {
            background: rgba(60,60,58,0.08);
            border-radius: 2px;
            overflow: hidden;
            width: 100%;
        }
        .fr-sku__bar-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 400ms ease, background 300ms ease;
        }

        /* Meta row */
        .fr-sku__meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
        }
        .fr-sku__meta-item {
            font-family: 'IBM Plex Mono', monospace;
            color: #888780;
            display: flex;
            align-items: center;
            gap: 3px;
        }

        /* Sub-stats row (reserved / inbound) */
        .fr-sku__substats {
            display: flex;
            gap: 0;
            border: 1px solid rgba(60,60,58,0.08);
            border-radius: 6px;
            overflow: hidden;
        }
        .fr-sku__substat {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px 4px;
            background: #F8F7F2;
            border-right: 1px solid rgba(60,60,58,0.07);
        }
        .fr-sku__substat:last-child { border-right: none; }
        .fr-sku__substat-val {
            font-family: 'Syne', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #3C3C3A;
            line-height: 1;
        }
        .fr-sku__substat-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888780;
            margin-top: 2px;
        }
        .fr-sku__substat-val--inbound { color: #0F6E56; }
        .fr-sku__substat-val--reserved { color: #BA7517; }

        /* Bin tags */
        .fr-sku__bins {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        .fr-sku__bin-tag {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: #6B4FA0;
            background: #ED38F5;
            border-radius: 4px;
            padding: 2px 6px;
            border: 1px solid rgba(107,79,160,0.2);
        }

        /* Reorder alert stripe */
        .fr-sku__alert-stripe {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
        }

        /* Action footer */
        .fr-sku__actions {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        .fr-sku__divider {
            height: 1px;
            background: rgba(60,60,58,0.07);
        }
    `;
    document.head.appendChild(el);
}

/**
 * Placeholder SVG
 */
const PlaceholderIcon: React.FC<{ size: number}> = ({ size }) => (
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="1.5" stroke="B4B2A9" strokeWidth="1.4" />
        <path d="M3 8L12 3l9 5" stroke="#B4B2A9" strokeWidth="1.4" strokeLinejoin="round" />
        <line x1="12" y1="3" x2="12" y2="8" stroke="#B4B2A9" strokeWidth="1.4" />
        <path d="M8 14h8M8 17h5" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const ReorderIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2v10M3 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const AdjustIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Component
 */
export const SKUCard: React.FC<SKUCardProps> = ({
    sku,
    name,
    stockLevel,
    reorderThreshold = 10,
    outOfStockThreshold = 0,
    maxStock,
    imageUrl,
    category,
    uom = 'ea',
    weight,
    binLocations,
    lastUpdated,
    inbound,
    reserved,
    size = 'md',
    layout ='grid',
    showBar = true,
    onReorder,
    onAdjust,
    onClick,
    className,
    style,
}) => {
    const [imgError, setImgError] = React.useState(false);

    React.useEffect(() => { ensureStyles(); }, []);
    React.useEffect(() => { setImgError(false); }, [imageUrl]);

    const tok         = SIZE_TOKENS[size];
    const stockStatus = resolveStockStatus(stockLevel, reorderThreshold, outOfStockThreshold);
    const fillPct     = maxStock ? stockFillPct(stockLevel, maxStock) : null;
    const showImage   = imageUrl && !imgError;
    const isGrid      = layout === 'grid';
    const imgSize     = isGrid ? tok.imageSize : ROW_IMAGE_SIZE[size];
    const hasActions  = onReorder || onAdjust;
    const available   = reserved !== undefined
        ? Math.max(stockLevel - reserved, 0)
        : stockLevel;

    const cardClasses = [
        'fr-sku',
        isGrid ? 'fr-sku--grid' : 'fr-sku--row',
        onClick ? 'fr-sku--clickable' : '',
        stockStatus === 'out-of-stock' ? 'fr-sku--out-of-stock' : '',
        stockStatus === 'low-stock' ? 'fr-sku--low-stock' : '',
        className ?? '',
    ].filter(Boolean).join(' ');

    // -- Shared image block --------------------------------------------------- */
    const imageBlock = (
        <div
            className="fr-sku__image-wrap"
            style={{
                width: isGrid ? '100%' : imgSize,
                height: isGrid ? tok.imageSize + 16 : imgSize,
                borderRadius: isGrid
                    ? `${tok.radius} ${tok.radius} 0 0`
                    : `${tok.imageRadius} 0 0 ${tok.imageRadius}`,
                flexShrink: isGrid ? undefined : 0,
            }}
        >
            {showImage ? (
                <img
                    src={imageUrl}
                    alt={name}
                    draggable={false}
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="fr-sku__image-placeholder">
                    <PlaceholderIcon size={imgSize} />
                </div>
            )}
        </div>
    );

    // -- Stock quantity block ------------------------------------------------- */
    const qtyBlock = (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span 
                className="fr-sku__qty"
                style={{
                    fontSize: isGrid ? tok.qtyFontSize : `calc(${tok.qtyFontSize} * 0.8)`,
                    color: stockStatus === 'out-of-stock' ? '#D85A30'
                         : stockStatus === 'low-stock'    ? '#BA7517'
                         : '#3C3C3A',
                }}
            >
                {stockLevel.toLocaleString()}
            </span>
            <span className="fr-sku__qty-label">{uom} in stock</span>
        </div>
    );

    // -- Stock fill bar -------------------------------------------------------- */
    const barBlock = showBar && fillPct !== null && (
        <div>
            <div
                className="fr-sku__bar-track"
                style={{ height: tok.barHeight }}
                role="meter"
                aria-label={`Stock level: ${fillPct}%`}
                aria-valuenow={fillPct}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                className="fr-sku__bar-fill"
                style={{
                    width:      `${fillPct}%`,
                    background: fillColor(stockStatus),
                    height:     '100%',
                }}
                />
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 3,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                color: '#888780',
            }}>
                <span>{fillPct}% capacity</span>
                <span>{stockLevel.toLocaleString()} / {maxStock!.toLocaleString()}</span>
            </div>
        </div>
  );

  // -- Body content ------------------------------------------------------------ */
  const bodyContent = (
    <div
        className="fr-sku__body"
        style={{ padding: isGrid ? tok.padding : `0 ${tok.padding}`, gap: tok.gap }}
    >
        {/* Name + badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="fr-sku__name" style={{ fontSize: tok.nameFontSize }}>
                {name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <MonoID id={sku} variant="sku" size="xs" copyable={false} />
                <StatusBadge
                    status={stockStatus}
                    variant="stock"
                    size="sm"
                    iconMode="dot"
                />
                {category && (
                    <span className="fr-sku__meta-item" style={{ fontSize: '10px' }}>
                        {category}
                    </span>
                )}
            </div>
        </div>

        {/* Qty + bar */}
        {isGrid ? (
            <>
                {qtyBlock}
                {barBlock}
            </>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: tok.gap }}>
                {qtyBlock}
                {barBlock && (
                    <div style={{ flex: 1, minWidth: 60 }}>
                        {barBlock}
                    </div>
                )}
            </div>
        )}

        {/* Sub-stats (inbound / reserved / available) */}
        {isGrid && (inbound !== undefined || reserved !== undefined) && (
            <div className="fr-sku__substats">
                <div className="fr-sku__substat">
                    <span className="fr-sku__substat-val">{available.toLocaleString()}</span>
                    <span className="fr-sku__substat-label">Available</span>
                </div>
                {reserved !== undefined && (
                    <div className="fr-sku__substat">
                        <span className="fr-sku__substat-val fr-sku__substat-val--reserved">
                            {reserved.toLocaleString()}
                        </span>
                        <span className="fr-sku__substat-label">Reserved</span>
                    </div>
                )}
                {inbound !== undefined && (
                    <div className="fr-sku__substat">
                        <span className="fr-sku__substat-val fr-sku__substat-val--inbound">
                            +{inbound.toLocaleString()}
                        </span>
                        <span className="fr-sku__substat-label">
                            Inbound
                        </span>
                    </div>
                )}
            </div>
        )}

        {/* Meta row */}
        {(weight !== undefined || lastUpdated || binLocations?.length) && (
            <div className="fr-sku__meta" style={{ fontSize: tok.metaFontSize }}>
                {weight !== undefined && (
                    <span className="fr-sku__meta-item">{weight}kg / {uom}</span>
                )}
                {lastUpdated && (
                    <Timestamp value={lastUpdated} format="relative" size="xs" />
                )}
            </div>
        )}

        {/* Bin locations */}
        {isGrid && binLocations && binLocations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SectionLabel size="xs">Bin locations</SectionLabel>
                <div className="fr-sku__bins">
                    {binLocations.map(bin => (
                        <span key={bin} className="fr-sku__bin-tag">{bin}</span>
                    ))}
                </div>
            </div>
        )}

        {/* Actions */}
        {isGrid && hasActions && (
            <>
                <div className="fr-sku__divider" />
                <div className="fr-sku__actions">
                    {onAdjust && (
                        <ActionButton
                            intent="secondary"
                            size="sm"
                            icon={<AdjustIcon />}
                            onClick={(e) => { e.stopPropagation(); onAdjust(sku); }}
                        >
                            Adjust
                        </ActionButton>
                    )}
                    {onReorder && (
                        <ActionButton
                            intent={stockStatus !== 'in-stock' ? 'primary' : 'ghost'}
                            size="sm"
                            icon={<ReorderIcon />}
                            onClick={(e) => { e.stopPropagation(); onReorder(sku); }}
                        >
                            Reorder
                        </ActionButton>
                    )}
                </div>
            </>
        )}
    </div>
  );

  return (
    <div
        className={cardClasses}
        style={{ borderRadius: tok.radius, ...style }}
        onClick={onClick ? () => onClick(sku) : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
            onClick
                ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(sku); }
                : undefined
        }
        role={onClick ? 'button' : undefined}
        aria-label={`${name} - ${sku} - ${formatQty(stockLevel, uom)} ${stockStatus}`}
    >
        {/* Alert stripe at top */}
        {stockStatus !== 'in-stock' && (
            <div 
                className="fr-sku__alert-stripe"
                style={{ background: fillColor(stockStatus) }}
                aria-hidden="true"
            />
        )}

        {imageBlock}
        {bodyContent}
    </div>
  );
};

SKUCard.displayName = 'SKUCard';

export default SKUCard;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Basic ---
<SKUCard
  sku="SKU-00412"
  name="Nike Air Max 90 — Size 10"
  stockLevel={42}
/>
 
// --- With full inventory data ---
<SKUCard
  sku="SKU-00412"
  name="Nike Air Max 90 — Size 10"
  stockLevel={42}
  maxStock={200}
  reorderThreshold={20}
  inbound={60}
  reserved={8}
  category="Footwear"
  weight={0.9}
  uom="ea"
  binLocations={['B-04-C-2', 'B-04-C-3']}
  lastUpdated={new Date()}
  imageUrl="/products/air-max-90.jpg"
  onReorder={(sku) => openReorderForm(sku)}
  onAdjust={(sku)  => openAdjustDrawer(sku)}
  onClick={(sku)   => navigateTo(`/inventory/${sku}`)}
/>
 
// --- Stock states ---
<SKUCard sku="SKU-001" name="In stock item"    stockLevel={42}  reorderThreshold={10} />   // green
<SKUCard sku="SKU-002" name="Low stock item"   stockLevel={6}   reorderThreshold={10} />   // amber
<SKUCard sku="SKU-003" name="Out of stock"     stockLevel={0}                         />   // coral
 
// --- Sizes ---
<SKUCard sku="SKU-00412" name="Nike Air Max 90" stockLevel={42} size="sm" />
<SKUCard sku="SKU-00412" name="Nike Air Max 90" stockLevel={42} size="md" />   // default
<SKUCard sku="SKU-00412" name="Nike Air Max 90" stockLevel={42} size="lg" />
 
// --- Row layout (inventory list) ---
<SKUCard
  sku="SKU-00412"
  name="Nike Air Max 90"
  stockLevel={42}
  maxStock={200}
  layout="row"
  onClick={(sku) => openDetail(sku)}
/>
 
// --- No image (placeholder shown) ---
<SKUCard sku="SKU-00412" name="Widget Pro" stockLevel={15} />
 
// --- No fill bar ---
<SKUCard sku="SKU-00412" name="Widget Pro" stockLevel={15} showBar={false} />
 
// --- In a grid ---
<div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
  {skus.map(s => (
    <SKUCard
      key={s.sku}
      {...s}
      onReorder={handleReorder}
      onAdjust={handleAdjust}
      onClick={handleClick}
    />
  ))}
</div>
 
// --- In a list ---
<div style={{ display:'flex', flexDirection:'column', gap:6 }}>
  {skus.map(s => (
    <SKUCard key={s.sku} {...s} layout="row" onClick={handleClick} />
  ))}
</div>
 
*/