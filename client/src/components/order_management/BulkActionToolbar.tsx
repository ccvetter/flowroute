// appears on multi-select: assign, export, flag for review, bulk status update actions for selected orders
import React from 'react';
import { ActionButton } from '../shared/ActionButton.js';
import { SectionLabel } from '../shared/SectionLabel.js';
import { ConfirmModal } from '../shared/ConfirmModal.js';

/**
 * Types
 */
export type BulkAction =
    | 'assign'
    | 'flag-exception'
    | 'export'
    | 'print-labels'
    | 'cancel'
    | 'delete';

export interface BulkActionDefinition {
    /** Action key. */
    action: BulkAction | string;
    /** Button label. */
    label: string;
    /** Button intent. Defaults to 'secondary'. */
    intent?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-fill';
    /** Icon element. */
    icon?: React.ReactNode;
    /**
     * Require a ConfirmModal before firing onAction.
     * Destructive actions (cancel, delete) use this by default.
     */
    confirm?: {
        title: string;
        description: string;
        confirmLabel?: string;
        /** Require the user to type this phrase to confirm. */
        confirmPhrase?: string;
    };
    /** Disable this action regardless of selection. */
    disabled?: boolean;
    /** Show a loading spinner on this specific action button. */
    loading?: boolean;
}

export interface BulkActionToolbarProps {
    /** Number of currently selected rows. */
    selectedCount: number;
    /** Total rows in the table. */
    totalCount?: number;
    /**
     * Action buttons to render.
     * Defaults to: Assign, Flag exception, Export, Print labels.
     */
    actions?: BulkActionDefinition[];
    /** Called when an action button is clicked (and confirmed if required). */
    onAction?: (action: string, count: number) => void;
    /** Called when "Select all" is clicked. */
    onSelectAll?: () => void;
    /** Called when "Deselect all" / "Clear" is clicked. */
    onClear?: () => void;
    /**
     * Whether all rows are currently selected.
     * Used to toggle the "Select all" / "Deselect all" label.
     */
    allSelected?: boolean;
    /**
     * Animate the toolbar sliding in from the bottom.
     * Defaults to true.
     */
    animated?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Default actions
 */
const DEFAULT_ACTIONS: BulkActionDefinition[] = [
    {
        action: 'assign',
        label: 'Assign',
        intent: 'secondary',
        icon: (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M12.5 1v5M10 3.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        action: 'flag-exception',
        label: 'Flag exception',
        intent: 'danger',
        icon: (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 2v12M3 2h8l-2 4 2 4H3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        confirm: {
            title: 'Flag selected orders as exceptions?',
            description: 'Selected orders will be moved to the exception queue and assigned staff will be notified.',
            confirmLabel: 'Flag exceptions',
        },
    },
    {
        action: 'export',
        label: 'Export',
        intent: 'secondary',
        icon: (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="3" y="1" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 8H1v5h14V8h-2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <rect x="4" y="10" width="8" height="4" rx="0.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="12.5" cy="10" r="0.75" fill="currentColor" />
            </svg>
        ),
    },
];

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-bulk-toolbar';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-bulk {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            background: #FAEEDA;
            border: 1px solid rgba(186,117,23,0.25);
            border-radius: 8px;
            flex-wrap: wrap;
        }
        .fr-bulk--animated {
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }animation: fr-bulk-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes fr-bulk-in {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Count badge */
        .fr-bulk__count {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .fr-bulk__count-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 24px;
            padding: 0 6px;
            border-radius: 6px;
            background: #BA7517;
            color: #FFFFFF;
            font-family: 'Syne', sans-serif;
            font-size: 13px;
            font-weight: 700;
            line-height: 1;
        }
        .fr-bulk__count-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            font-weight: 500;
            color: #633806;
            white-space: nowrap;
        }

        /* Divider */
        .fr-bulk__divider {
            width: 1px;
            height: 20px;
            background: rgba(186,117,23,0.25);
            flex-shrink: 0;
        }

        /* Actions */
        .fr-bulk__actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
            flex: 1;
        }

        /* Right controls */
        .fr-bulk__right {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-left: auto;
            flex-shrink: 0;
        }

        /* Select all button */
        .fr-bulk__select-all {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: #888780;
            background: none;
            border: none;
            cursor: pointer;
            padding: 3px 6px;
            border-radius: 4px;
            white-space: nowrap;
            transition: color 120ms ease, background 120ms ease;
            text-decoration: underline;
            text-underline-offset: 2px;
        }
        .fr-bulk__select-all:hover {
            color: #3C3C3A;
            background: rgba(60,60,58,0.06);
        }

        /* Clear button */
        .fr-bulk__clear {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: #888780;
            background: none;
            border: 1px solid rgba(60,60,58,0.18);
            cursor: pointer;
            padding: 3px 8px;
            border-radius: 4px;
            white-space: nowrap;
            transition: color 120ms ease, border-color 120ms ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .fr-bulk__clear:hover {
            color: #3C3C3A;
            border-color: rgba(60,60,58,0.35);
        }
        .fr-bulk__clear:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(186,117,23,0.25);
        }
    `;
    document.head.appendChild(el);
}

/**
 * Icons
 */
const XIcon: React.FC = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

/**
 * Component
 */
export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
    selectedCount,
    totalCount,
    actions = DEFAULT_ACTIONS,
    onAction,
    onSelectAll,
    onClear,
    allSelected = false,
    animated = true,
    className,
    style,
}) => {
    const [confirmAction, setConfirmAction] = React.useState<BulkActionDefinition | null>(null);
    const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

    React.useEffect(() => { ensureStyles(); }, []);

    if (selectedCount === 0) return null;

    async function handleAction(def: BulkActionDefinition) {
        if (def.disabled) return;
        // Needs confirmation - open modal
        if (def.confirm) {
            setConfirmAction(def);
            return;
        }
        fireAction(def.action);
    }

    async function fireAction(action: string) {
        setLoadingAction(action);
        try {
            await onAction?.(action, selectedCount);
        } finally {
            setLoadingAction(null);
        }
    }

    async function handleConfirm() {
        if (!confirmAction) return;
        const action = confirmAction.action;
        setConfirmAction(null);
        fireAction(action);
    }

    const selectionLabel = totalCount
        ? `${selectedCount} of ${totalCount.toLocaleString()} selected`
        : `${selectedCount} selected`;

    return (
        <>
            <div
                className={[
                    'fr-bulk',
                    animated ? 'fr-bulk--animated' : '',
                    className ?? '',
                ].filter(Boolean).join(' ')}
                style={style}
                role="toolbar"
                aria-label={`Bulk actions - ${selectionLabel}`}
            >
                {/* Count */}
                <div className="fr-bulk__count">
                    <span className="fr-bulk__count-badge" aria-live="polite" aria-atomic="true">
                        {selectedCount}
                    </span>
                    <span className="fr-bulk__count-label">
                        {totalCount ? `of ${totalCount.toLocaleString()} ` : ''}
                        order{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                </div>

                <div className="fr-bulk__divider" aria-hidden="true" />

                {/* Action buttons */}
                <div className="fr-bulk__actions">
                    {actions.map(def => (
                        <ActionButton
                            key={def.action}
                            intent={def.intent ?? 'secondary'}
                            size="sm"
                            icon={def.icon}
                            disabled={def.disabled ?? false}
                            loading={loadingAction === def.action || def.loading}
                            onClick={() => handleAction(def)}
                            aria-label={`${def.label} ${selectedCount} order${selectedCount !== 1 ? 's' : ''}`}
                        >
                            {def.label}
                        </ActionButton>
                    ))}
                </div>

                {/* Right controls */}
                <div className="fr-bulk__right">
                    {onSelectAll && totalCount && !allSelected && (
                        <button
                            type="button"
                            className="fr-bulk__select-all"
                            onClick={onSelectAll}
                        >
                            Select all {totalCount.toLocaleString()}
                        </button>
                    )}
                    {onSelectAll && allSelected && (
                        <button
                            type="button"
                            className="fr-bulk__select-all"
                            onClick={onClear}
                        >
                            Deselect all
                        </button>
                    )}
                    {onClear && (
                        <button
                            type="button"
                            className="fr-bulk__clear"
                            onClick={onClear}
                            aria-label="Clear selection"
                        >
                            <XIcon />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Confirm modal */}
            {confirmAction?.confirm && (
                <ConfirmModal
                    open={!!confirmAction}
                    intent="warning"
                    title={confirmAction.confirm.title}
                    description={
                        <>
                            {confirmAction.confirm.description}
                            {' '}
                            <strong style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.95em' }}>
                                {selectedCount} order{selectedCount !== 1 ? 's' : ''}
                            </strong>
                            {' '}will be affected.
                        </>
                    }
                    confirmLabel={confirmAction.confirm.confirmLabel ?? confirmAction.label}
                    confirmPhrase={confirmAction.confirm.confirmPhrase}
                    loading={loadingAction === confirmAction.action}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </>
    );
};

BulkActionToolbar.displayName = 'BulkActionToolbar';

export default BulkActionToolbar;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Basic (default actions) ---
<BulkActionToolbar
  selectedCount={selectedIds.size}
  totalCount={orders.length}
  onAction={(action, count) => handleBulkAction(action, count)}
  onSelectAll={() => selectAll()}
  onClear={() => clearSelection()}
  allSelected={selectedIds.size === orders.length}
/>
 
// --- Custom actions ---
<BulkActionToolbar
  selectedCount={3}
  totalCount={100}
  actions={[
    {
      action: 'assign',
      label:  'Assign to me',
      intent: 'primary',
      icon:   <UserIcon />,
    },
    {
      action:  'cancel',
      label:   'Cancel orders',
      intent:  'danger',
      confirm: {
        title:        'Cancel selected orders?',
        description:  'Orders will be cancelled and customers notified.',
        confirmLabel: 'Cancel orders',
        confirmPhrase: 'CANCEL',
      },
    },
  ]}
  onAction={handleAction}
  onClear={clearSelection}
/>
 
// --- With async onAction (loading spinner per-button) ---
<BulkActionToolbar
  selectedCount={selectedIds.size}
  onAction={async (action, count) => {
    // The toolbar shows a spinner on the clicked button
    // until the promise resolves.
    await bulkUpdate(action, [...selectedIds]);
    clearSelection();
  }}
  onClear={clearSelection}
/>
 
// --- Disable specific action ---
<BulkActionToolbar
  selectedCount={2}
  actions={[
    { action: 'assign',       label: 'Assign',       intent: 'secondary' },
    { action: 'print-labels', label: 'Print labels', intent: 'secondary', disabled: !canPrint },
  ]}
  onAction={handleAction}
  onClear={clearSelection}
/>
 
// --- Without select-all / deselect ---
<BulkActionToolbar
  selectedCount={selectedIds.size}
  onAction={handleAction}
  onClear={clearSelection}
/>
 
// --- Disable slide-in animation ---
<BulkActionToolbar
  selectedCount={selectedIds.size}
  animated={false}
  onAction={handleAction}
  onClear={clearSelection}
/>
 
// --- Typical integration with OrderTable ---
<div style={{ display:'flex', flexDirection:'column', gap:8 }}>
  {selectedIds.size > 0 && (
    <BulkActionToolbar
      selectedCount={selectedIds.size}
      totalCount={orders.length}
      allSelected={selectedIds.size === orders.length}
      onAction={handleBulkAction}
      onSelectAll={selectAll}
      onClear={clearSelection}
    />
  )}
  <OrderTable
    orders={orders}
    selectedIds={selectedIds}
    onSelect={toggleSelect}
    onSelectAll={selectAll}
  />
</div>
 
*/