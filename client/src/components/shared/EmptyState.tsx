// icon + message for zero-result views
import React from 'react';
import { ActionButton, type ActionButtonProps } from './ActionButton.js';

/**
 * Types
 */
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export type EmptyStateVariant =
    | 'no-results'    // search/filter returned nothing
    | 'no-orders'     // order list is empty
    | 'no-tasks'      // pick queue is empty
    | 'no-carriers'   // no carriers configured
    | 'no-inventory'  // no SKUs in catalog
    | 'error'         // something went wrong
    | 'offline'       // lost connection
    | 'custom';       // caller supplies their own icon

export interface EmptyStateAction {
    label: string;
    onClick: () => void;
    intent?: ActionButtonProps['intent'];
    icon?: React.ReactNode;
}

export interface EmptyStateProps {
    /**
     * Preset that drives the icon and default title/description.
     * Defaults to 'no-results'.
     */
    variant?: EmptyStateVariant;
    /** Override the heading text. */
    title?: string;
    /** Override the supporting description. */
    description?: string | React.ReactNode;
    /**
     * Primary CTA. Rendered as an ActionButton below the description.
     */
    action?: EmptyStateAction;
    /**
     * Secondary CTA. Rendered as a ghost button beside the primary.
     */
    secondaryAction?: EmptyStateAction;
    /**
     * Custom icon - required when variant is 'custom'.
     * Optional override for any other variant.
     */
    icon?: React.ReactNode;
    /** Size of the empty state block. Defaults to 'md'. */
    size?: EmptyStateSize;
    /**
     * Render inside a card surface with border and padding.
     * Defaults to false - use true when the empty state replaces a
     * card or table that would normally be present.
     */
    contained?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
interface VariantConfig {
    defaultTitle: string;
    defaultDescription: string;
    icon: React.ReactNode;
}

const sw = 1.5; // shared stroke width for all preset icons

const VARIANT_CONFIG: Record<EmptyStateVariant, VariantConfig> = {
    'no-results': {
        defaultTitle: 'No results found',
        defaultDescription: 'Try adjusting your filters or search term.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="22" cy="22" r="13" stroke="currentColor" strokeWidth={sw} />
                <path d="M31 31l8 8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
                <path d="M17 22h10M22 17v10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
            </svg>
        ),
    },
    'no-orders': {
        defaultTitle: 'No orders yet',
        defaultDescription: 'Orders will appear here once they come in from your connected channels.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="8" y="20" width="32" height="22" rx="2" stroke="currentColor" strokeWidth={sw} />
                <path d="M8 20L24 11l16 9" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
                <line x1="24" y1="11" x2="24" y2="20" stroke="currentColor" strokeWidth={sw} opacity="0.4" />
                <path d="M18 30h12M18 35h7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
            </svg>
        ),
    },
    'no-tasks': {
        defaultTitle: 'Queue is clear',
        defaultDescription: 'All picks tasks have been completed. Nice work.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="10" y="8" width="28" height="32" rx="3" stroke="currentColor" strokeWidth={sw} />
                <path d="M17 2014 4 10-8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 30h14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.3" />
                <path d="M17 35h9" stroke="currentColor" strokeWidth="sw" strokeLinecap="round" opacity="0.3" />
            </svg>
        ),
    },
    'no-carriers': {
        defaultTitle: 'No carriers connected',
        defaultDescription: 'Connect a carrier to start generating shipping labels and tracking shipments.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="4" y="20" width="30" height="20" rx="2" stroke="currentColor" strokeWidth={sw} />
                <path d="M34 28h5l5 6v6h-10V28z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
                <circle cx="12" cy="40" r="3.5" stroke="currentColor" strokeWidth={sw} />
                <circle cx="36" cy="40" r="3.5" stroke="currentColor" strokeWidth={sw} />
                <path d="M4 28h30" stroke="currentColor" strokeWidth={sw} opacity="0.35" />
                <path d="M16 14v-4M24 14v-4M20 10h-8M20 10h8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
            </svg>
        ),
    },
    'no-inventory': {
        defaultTitle: 'No SKUs in catalog',
        defaultDescription: 'Add products to your catalog to start tracking inventory and fulfilling orders.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="6" y="26" width="36" height="16" rx="2" stroke="currentColor" strokeWidth={sw} />
                <rect x="12" y="16" width="24" height="12" rx="2" stroke="currentColor" strokeWidth={sw} />
                <rect x="18" y="8" width="12" height="10" rx="2" stroke="currentColor" strokeWidth={sw} />
                <path d="M20 38h8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
            </svg>
        ),
    },
    'error': {
        defaultTitle: 'Something went wrong',
        defaultDescription: 'We hit an unexpected error. Try refreshing, or contact support if it persists.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth={sw} />
                <path d="M24 14v12" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
                <circle cx="24" cy="32" r="1.25" fill="currentColor" />
            </svg>
        ),
    },
    'offline': {
        defaultTitle: 'No connection',
        defaultDescription: 'Check your network and try again. Live updates will resume automatically.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M6 12l36 24" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.3" />
                <path d="M8 20a22 22 0 0 1 12-6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
                <path d="M28 16a22 22 0 0 1 12 12" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
                <path d="M14 28a12 12 0 0 1 6-4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
                <path d="M28 26a2 12 0 0 1 6 6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
                <circle cx="24" cy="38" r="2.5" fill="currentColor" />
            </svg>
        ),
    },
    'custom': {
        defaultTitle: 'Nothing here',
        defaultDescription: 'There is nothing to show right now.',
        icon: (
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth={sw} opacity="0.4" />
            </svg>
        ),
    },
};

// Per-variant accent colors: [icon color, icon background]
const VARIANT_COLORS: Record<EmptyStateVariant, [string, string]> = {
    'no-results':   ['#B4B2A9', '#F1EFE8'],
    'no-orders':    ['#B4B2A9', '#F1EFE8'],
    'no-tasks':     ['#0F6E56', '#E1F5EE'],
    'no-carriers':  ['#B4B2A9', '#F1EFE8'],
    'no-inventory': ['#B4B2A9', '#F1EFE8'],
    'error':        ['#D85A30', '#FAECE7'],
    'offline':      ['#BA7517', '#FAEEDA'],
    'custom':       ['#B4B2A9', '#F1EFE8'],
};

interface SizeTokens {
    iconBox: number;
    titleSize: string;
    descSize: string;
    gap: number;
    padding: string;
}

const SIZE_TOKENS: Record<EmptyStateSize, SizeTokens> = {
    sm: { iconBox: 36, titleSize: '14px', descSize: '12px', gap: 10, padding: '24px 20px' },
    md: { iconBox: 48, titleSize: '16px', descSize: '13px', gap: 12, padding: '48px 32px' },
    lg: { iconBox: 64, titleSize: '20px', descSize: '14px', gap: 16, padding: '72px 48px' },
};

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-empty-state';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            width: 100%;
        }
        .fr-empty--contained {
            background: #FFFFFF;
            border: 1px solid rgba(60, 60, 58, 0.12);
            border-radius: 10px;
        }
        .fr-empty__icon-wrap {
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .fr-empty__title {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            color: #3C3C3A;
            margin: 0;
            line-height: 1.3;
        }
        .fr-empty__desc {
            font-family: 'IBM Plex Sans', sans-serif;
            color: #888780;
            line-height: 1.6;
            margin: 0;
            max-width: 320px;
        }
        .fr-empty__actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    variant = 'no-results',
    title,
    description,
    action,
    secondaryAction,
    icon,
    size = 'md',
    contained = false,
    className,
    style,
}) => {
    React.useEffect(() => { ensureStyles(); }, []);

    const config = VARIANT_CONFIG[variant];
    const sizeTok = SIZE_TOKENS[size];
    const [iconColor, iconBg] = VARIANT_COLORS[variant];

    const resolvedTitle = title ?? config.defaultTitle;
    const resolvedDesc = description ?? config.defaultDescription;
    const resolvedIcon = icon ?? config.icon;

    const hasActions = action || secondaryAction;

    return (
        <div
            className={[
                'fr-empty',
                contained ? 'fr-empty--contained' : '',
                className ?? '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                gap: sizeTok.gap,
                padding: sizeTok.padding,
                ...style,
            }}
            role="status"
            aria-label={resolvedTitle}
        >
            {/* Icon */}
            <div
                className="fr-empty__icon-wrap"
                style={{
                    width: sizeTok.iconBox,
                    height: sizeTok.iconBox,
                    background: iconBg,
                    color: iconColor,
                }}
            >
                {resolvedIcon}
            </div>

            {/* Title */}
            <h3 className="fr-empty__title" style={{ fontSize: sizeTok.titleSize }}>
                {resolvedTitle}
            </h3>

            {/* Description */}
            {resolvedDesc && (
                <p className="fr-empty__desc" style={{ fontSize: sizeTok.descSize }}>
                    {resolvedDesc}
                </p>
            )}

            {/* Actions */}
            {hasActions && (
                <div className="fr-empty__actions" style={{ marginTop: sizeTok.gap * 0.5 }}>
                    {secondaryAction && (
                        <ActionButton
                            intent={secondaryAction.intent ?? 'ghost'}
                            icon={secondaryAction.icon}
                            onClick={secondaryAction.onClick}
                            size={size === 'sm' ? 'sm' : 'md'}
                        >
                            {secondaryAction.label}
                        </ActionButton>
                    )}
                    {action && (
                        <ActionButton
                            intent={action.intent ?? 'primary'}
                            icon={action.icon}
                            onClick={action.onClick}
                            size={size === 'sm' ? 'sm' : 'md'}
                        >
                            {action.label}
                        </ActionButton>
                    )}
                </div>
            )}
        </div>
    );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Variants ---
<EmptyState variant="no-results"   />
<EmptyState variant="no-orders"    />
<EmptyState variant="no-tasks"     />   // teal accent — positive, queue clear
<EmptyState variant="no-carriers"  />
<EmptyState variant="no-inventory" />
<EmptyState variant="error"        />   // coral accent
<EmptyState variant="offline"      />   // amber accent
 
// --- Sizes ---
<EmptyState variant="no-results" size="sm" />   // inside a small panel or dropdown
<EmptyState variant="no-results" size="md" />   // default — replaces a table
<EmptyState variant="no-results" size="lg" />   // full-page empty screens
 
// --- Contained (renders its own card surface) ---
<EmptyState variant="no-orders" contained />
 
// --- With a primary action ---
<EmptyState
  variant="no-carriers"
  action={{ label: 'Connect carrier', onClick: openCarrierSetup }}
/>
 
// --- With primary + secondary actions ---
<EmptyState
  variant="no-results"
  action={{ label: 'Clear filters', onClick: clearFilters }}
  secondaryAction={{ label: 'New order', onClick: openNewOrder }}
/>
 
// --- Custom title + description ---
<EmptyState
  variant="no-orders"
  title="No orders for this date"
  description="Try selecting a different date range or removing active filters."
  action={{ label: 'Reset filters', onClick: resetFilters }}
/>
 
// --- Rich description ---
<EmptyState
  variant="error"
  title="Failed to load orders"
  description={
    <span>
      Request timed out. Check your connection or{' '}
      <a href="/support">contact support</a>.
    </span>
  }
  action={{ label: 'Retry', onClick: retryFetch }}
/>
 
// --- Custom icon ---
<EmptyState
  variant="custom"
  icon={<PackageIcon size="xl" variant="duotone" state="open" decorative />}
  title="No packages assigned"
  description="Packages will appear here once a pick task is assigned to you."
/>
 
// --- Inside a table (replacing rows) ---
<table>
  <thead>...</thead>
  <tbody>
    <tr>
      <td colSpan={6}>
        <EmptyState
          variant="no-results"
          size="sm"
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      </td>
    </tr>
  </tbody>
</table>
 
// --- Full-page empty screen ---
<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <EmptyState
    variant="offline"
    size="lg"
    action={{ label: 'Retry connection', onClick: retry }}
  />
</div>
 
*/