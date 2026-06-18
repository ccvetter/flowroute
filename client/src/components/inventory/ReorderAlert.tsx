// inline alert when a SKU drops below a threshold
import React from 'react';
import { ActionButton } from '../shared/ActionButton.js';
import { MonoID } from '../shared/MonoID.js';
import { Timestamp } from '../shared/Timestamp.js';
import { SectionLabel } from '../shared/SectionLabel.js';

/**
 * Types
 */
export type ReorderAlertVariant =
    | 'inline'  // single-line row - for lists and table rows
    | 'banner'  // full-width dismissible bar - for page/section headers
    | 'card'    // self-contained card - for inventory panels
    | 'toast';  // notification-style - triggered programmatically

export type ReorderAlertUrgency =
    | 'critical'  // at or below out-of-stock threshold
    | 'warning'   // at or below reorder threshold
    | 'scheduled'; // above threshold but a PO is due soon

export interface ReorderAlertProps {
    /** SKU identifier. */
    sku: string;
    /** Product display name. */
    name: string;
    /** Current stock level. */
    stockLevel: number;
    /** Reorder threshold - stock at or below this triggers a warning. */
    reorderThreshold: number;
    /** Out-of-stock threshold - stock at or below this triggers critical. Defaults to 0. */
    outOfStockThreshold?: number;
    /** Suggested reorder quantity. */
    reorderQty?: number;
    /** Unit of measure. Defaults to 'ea'. */
    uom?: string;
    /**
     * Override the derived urgency level.
     * Auto-derived from stockLevel vs thresholds when omitted.
     */
    urgency?: ReorderAlertUrgency;
    /**
     * When the alert is triggered - shown as a relative timestamp.
     */
    triggeredAt?: Date | string | number;
    /**
     * Expected delivery date of pending inbound stock.
     * When present, shows "Inbound: X units - arriving [date]".
     */
    inboundQty?: number;
    inboundEta?: Date | string | number;
    /** Visual variant. Defaults to 'inline'. */
    variant?: ReorderAlertVariant;
    /**
     * Whether the alert can be dismissed by the user.
     * Defaults to true for banner/toast, false for inline/card.
     */
    dismissible?: boolean;
    /** Called when the user clicks "Reorder". */
    onReorder?: (sku: string, qty: number) => void;
    /** Called when the user dismisses the alert. */
    onDismiss?: (sku: string) => void;
    /** Called when the user clicks "View SKU". */
    onViewSKU?: (sku: string) => void;
    /**
     * Loading state - shows a spinner on the reorder button.
     * Use while a PO is being created.
     */
    loading?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Helpers
 */
function deriveUrgency(
    level: number,
    reorder: number,
    outOfStock: number,
): ReorderAlertUrgency {
    if (level <= outOfStock) return 'critical';
    if (level <= reorder) return 'warning';
    return 'scheduled';
}

function defaultReorderQty(
    level: number,
    reorder: number,
    urgency: ReorderAlertUrgency,
): number {
    // Suggest enough to reach 2x the reorder threshold
    const target = reorder * 2;
    const needed = Math.max(target - level, reorder);
    if (urgency === 'critical') return Math.max(needed * 2, reorder * 3);
    return needed;
}

/**
 * Tokens
 */
interface UrgencyTokens {
    accentColor: string;
    accentBg: string;
    accentText: string;
    trackBg: string;
    icon: React.ReactNode;
    defaultLabel: string;
    ariaLive: 'assertive' | 'polite';
}

const URGENCY_TOKENS: Record<ReorderAlertUrgency, UrgencyTokens> = {
    critical: {
        accentColor: '#D85A30',
        accentBg: '#FAECE7',
        accentText: '#712B13',
        trackBg: 'rgba(216,90,48,0.10)',
        ariaLive: 'assertive',
        defaultLabel: 'Out of stock',
        icon: (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.7" fill="currentColor" />
            </svg>
        ),
    },
    warning: {
        accentColor: '#BA7517',
        accentBg: '#FAEEDA',
        accentText: '#633806',
        trackBg: 'rgba(186,117,23,0.10)',
        ariaLive: 'polite',
        defaultLabel: 'Low stock',
        icon: (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="13" r="1" fill="currentColor" />
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    scheduled: {
        accentColor: '#0F6E56',
        accentBg: '#E1F5EE',
        accentText: '#085041',
        trackBg: 'rgba(15,110,86,0.08)',
        ariaLive: 'polite',
        defaultLabel: 'Reorder due',
        icon: (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.5v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
};

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-reorder-alert';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-reorder { font-family: 'IBM Plex Mono', monospace; }

        /* -- Inline -- */
        .fr-reorder--inline {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid transparent;
        }
        .fr-reorder--inline .fr-reorder__icon  { flex-shrink: 0; display: flex; }
        .fr-reorder--inline .fr-reorder__body  { flex: 1, min-width: 0, display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .fr-reorder--inline .fr-reorder__label { font-size: 11px; font-weight: 500; white-space: nowrap; }
        .fr-reorder--inline .fr-reorder__meta  { font-size: 10px; opacity: 0.75; white-space: nowrap; }
        .fr-reorder--inline .fr-reorder__sep   { opacity: 0.3; }
        .fr-reorder--inline .fr-reorder__actions { display: flex; gap: 4px; flex-shrink: 0; }

        /* -- Banner -- */
        .fr-reorder--banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            border-bottom: 1px solid transparent;
            border-top: 3px solid transparent;
        }
        .fr-reorder--banner .fr-reorder__icon   { flex-shrink: 0; display: flex; }
        .fr-reorder--banner .fr-reorder__body   { flex: 1; min-width: 0; }
        .fr-reorder--banner .fr-reorder__title  {
            font-size: 12px; font-weight: 500; margin-bottom: 1px; line-height: 1.3;
        }
        .fr-reorder--banner .fr-reorder__desc   {
            font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; opacity: 0.8; line-height: 1.5;
        }
        .fr-reorder--banner .fr-reorder__actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
        .fr-reorder--banner .fr-reorder__dismiss {
            background: none; border: none; cursor: pointer; padding: 4px; display: flex;
            opacity: 0.4; transition: opacity 120ms ease; color: inherit;
        }
        .fr-reorder--banner .fr-reorder__dismiss:hover { opacity: 0.9; }

        /* -- Card -- */
        .fr-reorder--card {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            border: 1px solid transparent;
            border-radius: 10px;
            border-left-width: 4px;
        }
        .fr-reorder--card .fr-reorder__card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
        }
        .fr-reorder--card .fr-reorder__icon-wrap {
            width: 32px; height: 32px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .fr-reorder--card .fr-reorder__title {
            font-size: 13px; font-weight: 500; line-height: 1.3; margin-bottom: 2px;
        }
        .fr-reorder--card .fr-reorder__name {
            font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; opacity: 0.75;
        }
        .fr-reorder--card .fr-reorder__stats {
            display: flex; gap: 0;
            border: 1px solid rgba(60,60,58,0.08); border-radius: 6px; overflow: hidden;
        }
        .fr-reorder--card .fr-reorder__stat {
            flex: 1; display: flex; flex-direction: column; align-items: center;
            padding: 6px 4px; background: rgba(60,60,58,0.02);
            border-right: 1px solid rgba(60,60,58,0.07);
        }
        .fr-reorder--card .fr-reorder__stat-label {
            font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em;
            color: #888780; margin-top: 2px;
        }
        .fr-reorder--card .fr-reorder__inbound {
            display: flex; align-items: center; gap: 6px;
            padding: 6px 8px; border-radius: 5px; font-size: 11px;
        }
        .fr-reorder--card .fr-reorder__actions {
            display: flex; gap: 6px;
        }

        /* -- Toast -- */
        .fr-reorder--toast {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 14px;
            border-radius: 8px;
            background: #1A1A18;
            border-left: 3px solid transparent;
            box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10);
            min-width: 280px;
            max-width: 360px;
            animation: fr-reorder-toast-in 220ms cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes fr-reorder-toast-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1, transform: translateY(0); }
        }
        .fr-reorder--toast .fr-reorder__icon   { flex-shrink: 0; margin-top: 1px; }
        .fr-reorder--toast .fr-reorder__body   { flex: 1, min-width: 0; }
        .fr-reorder--toast .fr-reorder__title  {
            font-size: 12px; font-weight: 500; color: #F1EFE8;
            margin-bottom: 2px; line-height: 1.4;
        }
        .fr-reorder--toast .fr-reorder__desc   {
            font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 500;
            text-decoration: underline; text-underline-offset: 2px;
            padding: 0; margin-top: 5px; display: inline-block;
        }
        .fr-reorder--toast .fr-reorder__action-link:hover { opacity: 0.8; }
        .fr-reorder--toast .fr-reorder__dismiss {
            background: none; border: none; cursor: pointer; color: rgba(241,239,232,0.35);
            padding: 0; display: flex; flex-shrink: 0; margin-top: 1px;
            transition: color 120ms ease;
        }
        .fr-reorder--toast .fr-reorder__dismiss:hover { color: rgba(241,239,232,0.8); }
    `;
    document.head.appendChild(el);
}

/**
 * Close icon
 */
const CloseIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Variant renderers
 */
interface VariantProps {
    sku: string;
    name: string;
    stockLevel: number;
    reorderThreshold: number;
    resolvedQty: number;
    uom: string;
    urgency: ReorderAlertUrgency;
    ut: UrgencyTokens;
    inboundQty?: number | undefined;
    inboundEta?: Date | string | number | undefined;
    triggeredAt?: Date | string | number | undefined;
    dismissible: boolean;
    loading: boolean;
    onReorder?: ((sku: string, qty: number) => void) | undefined;
    onDismiss?: ((sku: string) => void) | undefined;
    onViewSKU?: ((sku: string) => void) | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}

const InlineVariant: React.FC<VariantProps> = ({
    sku, name, stockLevel, reorderThreshold, resolvedQty, uom,
    urgency, ut, triggeredAt, dismissible, loading,
    onReorder, onDismiss, className, style,
}) => (
    <div
        className={['fr-reorder', 'fr-reorder--inline', className].filter(Boolean).join(' ')}
        style={{
            background: ut.accentBg,
            color: ut.accentText,
            borderColor: `${ut.accentColor}30`,
            ...style,
        }}
        role="alert"
        aria-live={ut.ariaLive}
        aria-label={`${ut.defaultLabel}: ${name} - ${stockLevel} ${uom} remaining`}
    >
        <span className="fr-reorder__icon" style={{ color: ut.accentColor }}>
            {ut.icon}
        </span>
        <div className="fr-reorder__body">
            <span className="fr-reorder__label">{ut.defaultLabel}</span>
            <span className="fr-reorder__sep">·</span>
            <MonoID id={sku} variant="sku" size="xs" copyable={false} />
            <span className="fr-reorder__meta">
                {stockLevel} / {reorderThreshold} {uom}
            </span>
            {triggeredAt && (
                <>
                    <span className="fr-reorder__sep">·</span>
                    <Timestamp value={triggeredAt} format="relative" size="xs" />
                </>
            )}
        </div>
        <div className="fr-reorder__actions">
            {onReorder && (
                <ActionButton
                    intent="primary"
                    size="sm"
                    loading={loading}
                    onClick={() => onReorder(sku, resolvedQty)}
                >
                    Reorder
                </ActionButton>
            )}
            {dismissible && onDismiss && (
                <ActionButton intent="ghost" size="sm" onClick={() => onDismiss(sku)}>
                    <CloseIcon size={12} />
                </ActionButton>
            )}
        </div>
    </div>
);

const BannerVariant: React.FC<VariantProps> = ({
    sku, name, stockLevel, reorderThreshold, resolvedQty, uom,
    urgency, ut, inboundQty, inboundEta, triggeredAt, dismissible, loading,
    onReorder, onDismiss, onViewSKU, className, style,
}) => (
    <div
        className={['fr-reorder', 'fr-reorder--banner', className].filter(Boolean).join(' ')}
        style={{
            background: ut.accentBg,
            color: ut.accentText,
            borderTopColor: ut.accentColor,
            borderBottomColor: `${ut.accentColor}20`,
            ...style,
        }}
        role="alert"
        aria-live={ut.ariaLive}
    >
        <span className="fr-reorder__icon" style={{ color: ut.accentColor, fontSize: 18 }}>
            {ut.icon}
        </span>
        <div className="fr-reorder__body">
            <div className="fr-reorder__title">
                {ut.defaultLabel} - {name}
                {' '}
                <MonoID id={sku} variant="sku" size="xs" copyable={false} />
            </div>
            <div className="fr-reorder__desc">
                {stockLevel} {uom} remaining (threshold: {reorderThreshold} {uom})
                {inboundQty && inboundEta && (
                    <> · {inboundQty} {uom} inbound - <Timestamp value={inboundEta} format="absolute-short" size="xs" /></>
                )}
                {triggeredAt && (
                    <> · <Timestamp value={triggeredAt} format="relative" size="xs" /></>
                )}
            </div>
        </div>
        <div className="fr-reorder__actions">
            {onViewSKU && (
                <ActionButton intent="ghost" size="sm" onClick={() => onViewSKU(sku)}>
                    View SKU
                </ActionButton>
            )}
            {onReorder && (
                <ActionButton intent="primary" size="sm" loading={loading} onClick={() => onReorder(sku, resolvedQty)}>
                    Reorder {resolvedQty} {uom}
                </ActionButton>
            )}
            {dismissible && onDismiss && (
                <button
                    type="button"
                    className="fr-reorder__dismiss"
                    style={{ color: ut.accentText }}
                    onClick={() => onDismiss(sku)}
                    aria-label="Dismiss alert"
                >
                    <CloseIcon />
                </button>
            )}
        </div>
    </div>
);

const CardVariant: React.FC<VariantProps> = ({
    sku, name, stockLevel, reorderThreshold, resolvedQty, uom,
    urgency, ut, inboundQty, inboundEta, triggeredAt, dismissible, loading,
    onReorder, onDismiss, onViewSKU, className, style,
}) => (
    <div
        className={['fr-reorder', 'fr-reorder--card', className].filter(Boolean).join(' ')}
        style={{
            background: ut.accentBg,
            borderColor: `${ut.accentColor}25`,
            borderLeftColor: ut.accentColor,
            ...style,
        }}
        role="alert"
        aria-live={ut.ariaLive}
        aria-label={`Reorder alert for ${name}`}
    >
        {/* Card header */}
        <div className="fr-reorder__card-header">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div
                    className="fr-reorder__icon-wrap"
                    style={{ background: `${ut.accentColor}18`, color: ut.accentColor }}
                >
                    {ut.icon}
                </div>
                <div>
                    <div className="fr-reorder__title" style={{ color: ut.accentText }}>
                        {ut.defaultLabel}
                    </div>
                    <div className="fr-reorder__name" style={{ color: ut.accentText }}>
                        {name}
                    </div>
                    <MonoID id={sku} variant="sku" size="xs" copyable={false} style={{ marginTop: 3 }} />
                </div>
            </div>
            {dismissible && onDismiss && (
                <button
                    type="button"
                    className="fr-reorder__dismiss"
                    style={{ color: ut.accentText }}
                    onClick={() => onDismiss(sku)}
                    aria-label="Dismiss alert"
                >
                    <CloseIcon />
                </button>
            )}
        </div>

        {/* Stats row */}
        <div className="fr-reorder__stats">
            {[
                { label: 'In stock', val: stockLevel, color: ut.accentColor },
                { label: 'Threshold', val: reorderThreshold, color: '#888780' },
                { label: 'Reorder', val: resolvedQty, color: ut.accentColor },
            ].map(s => (
                <div className="fr-reorder__stat" key={s.label}>
                    <span className="fr-reorder__stat-val" style={{ color: s.color }}>
                        {s.val.toLocaleString()}
                    </span>
                    <span className="fr-reorder__stat-label">{s.label}</span>
                </div>
            ))}
        </div>

        {/* Inbound info */}
        {inboundQty && inboundEta && (
            <div
                className="fr-reorder__inbound"
                style={{ background: '#E1F5EE', color: '#085041' }}
            >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px' }}>
                    {inboundQty.toLocaleString()} {uom} inbound
                </span>
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '11px', opacity: 0.75 }}>
                    - arriving <Timestamp value={inboundEta} format="absolute-short" size="xs" />
                </span>
            </div>
        )}

        {/* Triggered at */}
        {triggeredAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SectionLabel size="xs" muted>Alert triggered</SectionLabel>
                <Timestamp value={triggeredAt} format="relative" size="xs" />
            </div>
        )}

        {/* Actions */}
        <div className="fr-reorder__actions">
            {onViewSKU && (
                <ActionButton intent="secondary" size="sm" onClick={() => onViewSKU(sku)}>
                    View SKU
                </ActionButton>
            )}
            {onReorder && (
                <ActionButton
                    intent="primary"
                    size="sm"
                    fullWidth={!onViewSKU}
                    loading={loading}
                    onClick={() => onReorder(sku, resolvedQty)}
                >
                    Reorder {resolvedQty.toLocaleString()} {uom}
                </ActionButton>
            )}
        </div>
    </div>
);

const ToastVariant: React.FC<VariantProps> = ({
    sku, name, stockLevel, reorderThreshold, resolvedQty, uom,
    urgency, ut, dismissible, loading,
    onReorder, onDismiss, onViewSKU, className, style,
}) => (
    <div
        className={['fr-reorder', 'fr-reorder--toast', className].filter(Boolean).join(' ')}
        style={{ borderLeftColor: ut.accentColor, ...style }}
        role="alert"
        aria-live={ut.ariaLive}
        aria-atomic="true"
    >
        <span className="fr-reorder__icon" style={{ color: ut.accentColor }}>
            {ut.icon}
        </span>
        <div className="fr-reorder__body">
            <div className="fr-reorder__title">
                {ut.defaultLabel} - {name}
            </div>
            <div className="fr-reorder__desc">
                {stockLevel} {uom} remaining · threshold {reorderThreshold} {uom}
            </div>
            {(onReorder || onViewSKU) && (
                <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
                    {onViewSKU && (
                        <button
                            type="button"
                            className="fr-reorder__action-link"
                            style={{ color: '#B4B2A9' }}
                            onClick={() => onViewSKU(sku)}
                        >
                            View SKU
                        </button>
                    )}
                    {onReorder && (
                        <button
                            type="button"
                            className="fr-reorder__action-link"
                            style={{ color: ut.accentColor }}
                            onClick={() => onReorder(sku, resolvedQty)}
                        >
                            Reorder now
                        </button>
                    )}
                </div>
            )}
        </div>
        {dismissible && onDismiss && (
            <button 
                type="button"
                className="fr-reorder__dismiss"
                onClick={() => onDismiss(sku)}
                aria-label="Dismiss alert"
            >
                <CloseIcon />
            </button>
        )}
    </div>
);

/**
 * Component
 */
export const ReorderAlert: React.FC<ReorderAlertProps> = ({
    sku,
    name,
    stockLevel,
    reorderThreshold,
    outOfStockThreshold = 0,
    reorderQty,
    uom = 'ea',
    urgency: urgencyProp,
    triggeredAt,
    inboundQty,
    inboundEta,
    variant = 'inline',
    dismissible,
    loading = false,
    onReorder,
    onDismiss,
    onViewSKU,
    className,
    style,
}) => {
    const [dismissed, setDismissed] = React.useState(false);

    React.useEffect(() => { ensureStyles(); }, []);

    if (dismissed) return null;

    const urgency = urgencyProp ?? deriveUrgency(stockLevel, reorderThreshold, outOfStockThreshold);
    const ut = URGENCY_TOKENS[urgency];
    const resolvedQty = reorderQty ?? defaultReorderQty(stockLevel, reorderThreshold, urgency);
    const isDismissible = dismissible ?? (variant === 'banner' || variant === 'toast');

    function handleDismiss() {
        setDismissed(true);
        onDismiss?.(sku);
    }

    const variantProps: VariantProps = {
        sku, name, stockLevel, reorderThreshold, resolvedQty, uom,
        urgency, ut, inboundQty, inboundEta, triggeredAt,
        dismissible: isDismissible,
        loading,
        onReorder,
        onDismiss: handleDismiss,
        onViewSKU,
        className,
        style,
    };

    switch (variant) {
        case 'banner': return <BannerVariant {...variantProps} />;
        case 'card':   return <CardVariant   {...variantProps} />;
        case 'toast':  return <ToastVariant  {...variantProps} />;
        default:       return <InlineVariant {...variantProps} />;
    }
};

ReorderAlert.displayName = 'ReorderAlert';

export default ReorderAlert;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================

/*
 
// --- Urgency levels (auto-derived) ---
<ReorderAlert sku="SKU-00412" name="Nike Air Max 90" stockLevel={0}  reorderThreshold={10} />  // critical
<ReorderAlert sku="SKU-00412" name="Nike Air Max 90" stockLevel={6}  reorderThreshold={10} />  // warning
<ReorderAlert sku="SKU-00412" name="Nike Air Max 90" stockLevel={15} reorderThreshold={10} />  // scheduled (above threshold)
 
// --- Variants ---
<ReorderAlert variant="inline"  sku="SKU-00412" name="Nike Air Max 90" stockLevel={6} reorderThreshold={10} />
<ReorderAlert variant="banner"  sku="SKU-00412" name="Nike Air Max 90" stockLevel={6} reorderThreshold={10} />
<ReorderAlert variant="card"    sku="SKU-00412" name="Nike Air Max 90" stockLevel={6} reorderThreshold={10} />
<ReorderAlert variant="toast"   sku="SKU-00412" name="Nike Air Max 90" stockLevel={6} reorderThreshold={10} />
 
// --- With all data ---
<ReorderAlert
  variant="card"
  sku="SKU-00412"
  name="Nike Air Max 90 — Size 10"
  stockLevel={4}
  reorderThreshold={20}
  outOfStockThreshold={0}
  reorderQty={100}
  uom="ea"
  triggeredAt={new Date()}
  inboundQty={60}
  inboundEta="2026-06-10T09:00:00Z"
  onReorder={(sku, qty) => createPurchaseOrder(sku, qty)}
  onViewSKU={(sku)      => navigateTo(`/inventory/${sku}`)}
  onDismiss={(sku)      => muteAlert(sku)}
/>
 
// --- With loading state (PO being created) ---
const [loading, setLoading] = React.useState(false);
<ReorderAlert
  variant="card"
  sku="SKU-00412"
  name="Nike Air Max 90"
  stockLevel={4}
  reorderThreshold={20}
  loading={loading}
  onReorder={async (sku, qty) => {
    setLoading(true);
    await createPO(sku, qty);
    setLoading(false);
  }}
/>
 
// --- Dismissible banner (page header) ---
<ReorderAlert
  variant="banner"
  sku="SKU-00412"
  name="Nike Air Max 90"
  stockLevel={0}
  reorderThreshold={20}
  dismissible
  onDismiss={(sku) => muteAlertFor(sku, '24h')}
  onReorder={(sku, qty) => createPO(sku, qty)}
/>
 
// --- Inline in a SKUCard or inventory list row ---
<SKUCard ... />
<ReorderAlert
  variant="inline"
  sku={sku.id}
  name={sku.name}
  stockLevel={sku.stock}
  reorderThreshold={sku.threshold}
  onReorder={handleReorder}
/>
 
// --- Toast (triggered by a webhook / real-time event) ---
const { toast } = useToast();
// On stock drop event from server:
// Instead of a raw toast, render a ReorderAlert in toast variant:
<ToastContainer>
  <ReorderAlert
    variant="toast"
    sku="SKU-00412"
    name="Nike Air Max 90"
    stockLevel={0}
    reorderThreshold={20}
    onReorder={(sku, qty) => createPO(sku, qty)}
    onViewSKU={(sku)      => navigateTo(`/inventory/${sku}`)}
    onDismiss={(sku)      => setDismissed(true)}
  />
</ToastContainer>
 
// --- Multiple alerts in an inventory panel ---
<div style={{ display:'flex', flexDirection:'column', gap:8 }}>
  {lowStockItems.map(item => (
    <ReorderAlert
      key={item.sku}
      variant="inline"
      sku={item.sku}
      name={item.name}
      stockLevel={item.stock}
      reorderThreshold={item.threshold}
      onReorder={handleReorder}
    />
  ))}
</div>
 
*/
