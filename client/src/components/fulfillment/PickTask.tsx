// single task card with SKU, bin location, quantity, and "mark as picked" button
import React from 'react';
import { StatusBadge } from '../shared/StatusBadge.js';
import { MonoID } from '../shared/MonoID.js';
import { ScanConfirmInput, type ScanConfirmState } from './ScanConfirmInput.js';
import { BinLocator, type BinAddress } from './BinLocator.js';
import { Timestamp } from '../shared/Timestamp.js';
import { SectionLabel } from '../shared/SectionLabel.js';
import { ActionButton } from '../shared/ActionButton.js';

/**
 * Types
 */
export type PickTaskStatus =
 | 'pending'  // not yet started
 | 'active'   // currently being picked
 | 'scanning' // awaiting scan confirmation
 | 'confirmed' // scan matched, ready to pass to packing
 | 'skipped'  // staff skipped - needs review
 | 'exception'; // problem flagged

export type PickTaskSize = 'sm' | 'md' | 'lg';

export interface PickTaskItem {
    /** Internal line-item ID. */
    id: string;
    /** SKU / barcode used for scan confirmation. */
    sku: string;
    /** Human-readable product name. */
    name: string;
    /** Quantity to pick. */
    qty: number;
    /** Unit of measure (e.g. "ea", "box", "kg"). Defaults to "ea". */
    uom?: string;
    /** Product image URL - shown as a small thumbnail. */
    imageUrl?: string;
    /** Bin location for this item. */
    bin: BinAddress | string;
    /** Weight in kg - shown when present. */
    weight?: number;
    /** Barcode value to validate against. Defaults to `sku`. */
    barcode?: string;
}

export interface PickTaskProps {
    /** Unique task identifier. */
    taskId: string;
    /** Order this task belongs to. */
    orderId: string;
    /** Line items to pick. Multi-item tasks show each item sequentially. */
    items: PickTaskItem[];
    /** Current task status. */
    status?: PickTaskStatus;
    /** Priority level shown as a badge. */
    priority?: 'high' | 'medium' | 'low';
    /** Due date / SLA deadline. */
    dueAt?: Date | string | number;
    /** Assignee display name. */
    assignee?: string;
    /** Size variant. Defaults to 'md'. */
    size?: PickTaskSize;
    /**
     * Show the BinLocator map panel.
     * Defaults to true for md/lg, false for sm.
     */
    showMap?: boolean;
    /**
     * Called when all items in the task are confirmed.
     * Receives the task ID.
     */
    onComplete?: (taskId: string) => void;
    /**
     * Called when the staff flags an exception.
     */
    onException?: (taskId: string, reason?: string) => void;
    /**
     * Called when the staff skips this task.
     */
    onSkip?: (taskId: string) => void;
    /**
     * Custom scan validator - if not provided, validates against item.barcode ?? item.sku.
     * Return true/false or a Promise<boolean>.
     */
    onScan?: (sku: string, scannedValue: string) => boolean | Promise<boolean>;
    /** Enable sound feedback on scan. Defaults to false. */
    sound?: boolean;
    /** Enable haptic feedback on scan. Defaults to false. */
    haptic?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
interface SizeTokens {
    padding: string;
    gap: number;
    binFontSize: string;
    nameFontSize: string;
    qtyFontSize: string;
    thumbSize: number;
    scanSize: 'sm' | 'md' | 'lg';
    mapSize:  'sm' | 'md' | 'lg';
    radius: string;
}

const SIZE_TOKENS: Record<PickTaskSize, SizeTokens> = {
    sm: { padding: '12px', gap: 8,  binFontSize: '18px', nameFontSize: '12px', qtyFontSize: '20px', thumbSize: 36, scanSize: 'sm', mapSize: 'sm', radius: '8px'  },
    md: { padding: '16px', gap: 12, binFontSize: '22px', nameFontSize: '14px', qtyFontSize: '26px', thumbSize: 48, scanSize: 'md', mapSize: 'sm', radius: '10px' },
    lg: { padding: '20px', gap: 16, binFontSize: '28px', nameFontSize: '15px', qtyFontSize: '32px', thumbSize: 60, scanSize: 'lg', mapSize: 'md', radius: '12px' },
};

const STATUS_BORDER: Record<PickTaskStatus, string> = {
    pending:   'rgba(60,60,58,0.12)',
    active:    '#BA7517',
    scanning:  '#BA7517',
    confirmed: '#0F6E56',
    skipped:   'rgba(60,60,58,0.12)',
    exception: '#D85A30',
};

const STATUS_BG: Record<PickTaskStatus, string> = {
    pending:    '#FFFFFF',
    active:     '#FFFFFF',
    scanning:   '#FFFFFF',
    confirmed:  '#F2FAF7',
    skipped:    '#F8F7F2',
    exception:  '#FDF4F1',
};

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-pick-task';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-pick {
            display: flex;
            flex-direction: column;
            border: 1.5px solid transparent;
            background: #FFFFFF;
            transition:
                border-color 160ms ease,
                background   160ms ease,
                box-shadow   160ms ease;
        }
        .fr-pick--active {
            box-shadow: 0 0 0 3px rgba(186,117,23,0.14);
        }
        .fr-pick--confirmed {
            box-shadow: 0 0 0 3px rgba(15,110,86,0.12);
        }
        .fr-pick--exception {
            box-shadow: 0 0 0 3px rgba(216,90,48,0.12);
        }

        /* Header row */
        .fr-pick__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
        }
        .fr-pick__header-left { display: flex; flex-direction: column; gap: 4px; }
        .fr-pick__header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

        /* Bin callout */
        .fr-pick__bin {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            color: #BA7517;
            letter-spacing: -0.01em;
            line-height: 1;
        }

        /* Item row */
        .fr-pick__item {
            display: flex;
            align-items: center;
        }
        .fr-pick__thumb {
            border-radius: 6px;
            background: #F1EFE8;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .fr-pick__thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .fr-pick__thumb-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        .fr-pick__item-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
        }
        .fr-pick__item-name {
            font-family: 'IBM Plex Sans', sans-serif;
            font-weight: 500;
            color: #3C3C3A;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }
        .fr-pick__item-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 2px;
            flex-wrap: wrap;
        }
        .fr-pick__qty-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
        }
        .fr-pick__qty {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            color: #3C3C3A;
            line-height: 1;
        }
        .fr-pick__qty-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888780;
            margin-top: 2px;
        }

        /* Progress bar (multi-item) */
        .fr-pick__progress-track {
            height: 3px;
            background: rgba(60,60,58,0.08);
            border-radius: 2px;
            overflow: hidden;
        }
        .fr-pick__progress-fill {
            height: 100%;
            border-radius: 2px;
            background: #0F6E56;
            transition: width 300ms ease;
        }

        /* Divider */
        .fr-pick__divider {
            height: 1px;
            background: rgba(60,60,58,0.07);
        }

        /* Actions footer */
        .fr-pick__actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .fr-pick__actions--right {
            margin-left: auto;
            display: flex;
            gap: 6px;
        }

        /* Confirmed overlay checkmark */
        .fr-pick__confirmed-check {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            color: #0F6E56;
            font-weight: 500;
        }

        /* Item step counter (multi-item) */
        .fr-pick__step {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: #888780;
        }

        @keyframes fr-pick-confirm {
            0%   { transform: scale(0.92); opacity: 0; }
            60%  { transform: scale(1.04); }
            100% { transform: scale(1); opacity: 1; }
        }
        .fr-pick__confirmed-check {
            animation: fr-pick-confirm 280ms cubic-bezier(0.22, 1, 0.36, 1);
        }
    `;
    document.head.appendChild(el);
}

/**
 * Thumbnail placeholder icon
 */
const BoxIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9h18v12H3z" stroke="#B4B2A9" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 9L12 4l9 5" stroke="#B4B2A9" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="12" y1="4" x2="12" y2="9" stroke="#B4B2A9" strokeWidth="1.5" />
    </svg>
);

const CheckCircleIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="#0F6E56" />
        <path d="M7.5 12.5l3 3 6-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SkipIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 4l6 4-6 4V4zM12 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FlagIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 2v12M3 2h8l-2 4 2 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Component 
 */
export const PickTask: React.FC<PickTaskProps> = ({
    taskId,
    orderId,
    items,
    status: controlledStatus,
    priority,
    dueAt,
    assignee,
    size = 'md',
    showMap,
    onComplete,
    onException,
    onSkip,
    onScan,
    sound = false,
    haptic = false,
    className,
    style,
}) => {
    const [internalStatus, setInternalStatus] = React.useState<PickTaskStatus>(
        controlledStatus ?? 'pending',
    );
    // Index of the item currently being picked (multi-item tasks)
    const [activeItemIdx, setActiveItemIdx] = React.useState(0);
    // Track which items are confirmed
    const [confirmedItems, setConfirmedItems] = React.useState<Set<string>>(new Set());
    const [scanState, setScanState] = React.useState<ScanConfirmState>('idle');

    React.useEffect(() => { ensureStyles(); }, []);

    const status = controlledStatus ?? internalStatus;
    const tok = SIZE_TOKENS[size];

    const resolvedShowMap = 
        showMap !== undefined ? showMap : size !== 'sm';

    const activeItem = items[activeItemIdx];
    const totalItems = items.length;
    const doneCount = confirmedItems.size;
    const isMulti = totalItems > 1;
    const allDone = doneCount === totalItems;

    // Activate task on first interaction
    function handleActivate() {
        if (status === 'pending') setInternalStatus('active');
    }

    async function handleScan(scannedValue: string): Promise<boolean> {
        if (!activeItem) return false;
        const expected = activeItem.barcode ?? activeItem.sku;

        let matched: boolean;
        if (onScan) {
            const result = onScan(activeItem.sku, scannedValue);
            matched = result instanceof Promise ? await result : result;
        } else {
            matched = scannedValue.trim() === expected.trim();
        }

        if (matched) {
            const next = new Set(confirmedItems).add(activeItem.id);
            setConfirmedItems(next);

            if (next.size === totalItems) {
                // All items confirmed
                setTimeout(() => {
                    setInternalStatus('confirmed');
                    onComplete?.(taskId);
                }, 400);
            } else {
                // Advance to next unconfirmed item
                setTimeout(() => {
                    setScanState('idle');
                    const nextIdx = items.findIndex((it, i) => i > activeItemIdx && !next.has(it.id));
                    if (nextIdx !== -1) setActiveItemIdx(nextIdx);
                }, 1200);
            }
        }

        return matched;
    }

    function handleSkip() {
        setInternalStatus('skipped');
        onSkip?.(taskId);
    }

    function handleException() {
        setInternalStatus('exception');
        onException?.(taskId);
    }

    const borderColor = STATUS_BORDER[status];
    const bgColor     = STATUS_BG[status];

    const cardClasses = [
        'fr-pick',
        status === 'active' || status === 'scanning' ? 'fr-pick--active' : '',
        status === 'confirmed' ? 'fr-pick--confirmed' : '',
        status === 'exception' ? 'fr-pick--exception' : '',
        className ?? '',
    ].filter(Boolean).join(' ');

    if (!activeItem) return null;

    return (
        <div 
            className={cardClasses}
            style={{
                borderColor,
                background: bgColor,
                borderRadius: tok.radius,
                padding: tok.padding,
                gap: tok.gap,
                ...style,
            }}
            onClick={handleActivate}
            aria-label={`Pick task ${taskId} - order ${orderId}`}
        >
            {/* -- Header ---------------------------- */}
            <div className="fr-pick__header">
                <div className="fr-pick__header-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MonoID id={orderId} variant="order" size="sm" copyable={false} />
                        {isMulti && (
                            <span className="fr-pick__step">
                                {doneCount + 1}/{totalItems} items
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {priority && (
                            <StatusBadge status={priority} variant="priority" size="sm" iconMode="dot" />
                        )}
                        {dueAt && (
                            <Timestamp value={dueAt} format="relative" size="xs" icon />
                        )}
                        {assignee && (
                            <span style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '10px',
                                color: '#888780',
                            }}>
                                {assignee}
                            </span>
                        )}
                    </div>
                </div>

                <div className="fr-pick__header-right">
                    <StatusBadge
                        status={
                            status === 'confirmed' ? 'delivered' :
                            status === 'exception' ? 'exception' :
                            status === 'skipped'   ? 'cancelled' :
                            status === 'active' || status === 'scanning' ? 'picking' :
                            'pending'
                        }
                        size="sm"
                        iconMode="dot"
                    />
                </div>
            </div>

            {/* Multi-item progress bar ------------------------- */}
            {isMulti && (
                <div className="fr-pick__progress-track">
                    <div
                        className="fr-pick__progress-fill"
                        style={{ width: `${doneCount / totalItems} items picked`}}
                        role="progressbar"
                        aria-valuenow={doneCount}
                        aria-valuemin={0}
                        aria-valuemax={totalItems}
                        aria-label={`${doneCount} of ${totalItems} items picked`}
                    />
                </div>
            )}

            <div className="fr-pick__divider" />

            {/* -- Active item ----------------------------------- */}
            {status !== 'confirmed' ? (
                <>
                    {/* Bin callout */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="fr-pick__bin" style={{ fontSize: tok.binFontSize }}>
                            {typeof activeItem.bin === 'string'
                                ? activeItem.bin
                                : `${(activeItem.bin as BinAddress).zone}-${(activeItem.bin as BinAddress).aisle}`}
                        </span>
                        <MonoID 
                            id={typeof activeItem.bin === 'string'
                                ? activeItem.bin
                                : `${(activeItem.bin as BinAddress).zone}-${(activeItem.bin as BinAddress).aisle}-${(activeItem.bin as BinAddress).bay}-${(activeItem.bin as BinAddress).level}`}
                                variant="bin"
                                size="xs"
                                copyable={false}
                        />
                    </div>

                    {/* Item row */}
                    <div className="fr-pick__item" style={{ gap: tok.gap }}>
                        {/* Thumbnail */}
                        <div
                            className="fr-pick__thumb"
                            style={{ width: tok.thumbSize, height: tok.thumbSize }}
                        >
                            {activeItem.imageUrl ? (
                                <img src={activeItem.imageUrl} alt={activeItem.name} draggable={false} />
                            ) : (
                                <div className="fr-pick__thumb-placeholder">
                                    <BoxIcon size={tok.thumbSize} />
                                </div>
                            )}
                        </div>

                        {/* Name + meta */}
                        <div className="fr-pick__item-info" style={{ gap: 2 }}>
                            <span className="fr-pick__item-name" style={{ fontSize: tok.nameFontSize }}>
                                {activeItem.name}
                            </span>
                            <div className="fr-pick__item-meta">
                                <MonoID id={activeItem.sku} variant="sku" size="xs" copyable={false} />
                                {activeItem.weight !== undefined && (
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#888780' }}>
                                        {activeItem.weight}kg
                                    </span>
                                )} 
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="fr-pick__qty-block" style={{ minWidth: 40 }}>
                            <span className="fr-pick__qty" style={{ fontSize: tok.qtyFontSize }}>
                                {activeItem.qty}
                            </span>
                            <span className="fr-pick__qty-label">
                                {activeItem.uom ?? 'ea'}
                            </span>
                        </div>
                    </div>

                    {/* BinLocator map */}
                    {resolvedShowMap && (
                        <>
                            <div className="fr-pick__divider" />
                            <BinLocator
                                bin={activeItem.bin}
                                size={tok.mapSize}
                                view="both"
                                style={{ border: 'none', borderRadius: 0, width: '100%' }}
                            />
                        </>
                    )}

                    <div className="fr-pick__divider" />

                    {/* Scan input */}
                    {(status === 'active' || status === 'scanning' || status === 'pending') && (
                        <ScanConfirmInput
                            label="Scan to confirm"
                            expectedValue={activeItem.barcode ?? activeItem.sku}
                            size={tok.scanSize}
                            scanState={status === 'pending' ? 'disabled' : scanState}
                            onScan={handleScan}
                            onConfirm={() => setScanState('success')}
                            onError={() => setScanState('error')}
                            sound={sound}
                            haptic={haptic}
                            resetDelay={1200}
                            autoFocus={status === 'active'}
                            successMessage={
                                isMulti && doneCount + 1 < totalItems
                                    ? `Item ${doneCount + 1} confirmed - next item ready`
                                    : 'Confirmed - ready for packing'
                            }
                            errorMessage="Barcode mismatch - check the item"
                        />
                    )}

                    {/* Exception / skip controls */}
                    {status !== 'skipped' && status !== 'exception' && (
                        <div className="fr-pick__actions">
                            <SectionLabel size="xs" muted>
                                {status === 'pending' ? 'Tap to start' : 'Need help?'}
                            </SectionLabel>
                            <div className="fr-pick__actions--right">
                                <ActionButton
                                    intent="ghost"
                                    size="sm"
                                    icon={<SkipIcon />}
                                    onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                                    disabled={status === 'pending'}
                                >
                                    Skip
                                </ActionButton>
                                <ActionButton
                                    intent="danger"
                                    size="sm"
                                    icon={<FlagIcon />}
                                    onClick={(e) => { e.stopPropagation(); handleException(); }}
                                    disabled={status === 'pending'}
                                >
                                    Flag
                                </ActionButton>
                            </div>
                        </div>
                    )}

                    {/* Skipped / exception message */}
                    {(status === 'skipped' || status === 'exception') && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: '11px',
                            color: status === 'exception' ? '#D85A30' : '#888780',
                        }}>
                            {status === 'exception' ? '⚠ Exception flagged - awaiting review' : '↷ Task skipped'}
                            <ActionButton
                                intent="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInternalStatus('active');
                                }}
                                style={{ marginLeft: 'auto' }}
                            >
                                Resume
                            </ActionButton>
                        </div>
                    )}
                </>
            ) : (
                /* -- Confirmed state ----------------------------------- */
                <div className="fr-pick__confirmed-check">
                    <CheckCircleIcon size={size === 'sm' ? 18 : size === 'md' ? 22 : 28} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: tok.nameFontSize, fontWeight: 500 }}>
                            {totalItems === 1
                                ? `${activeItem.name} confirmed`
                                : `All ${totalItems} items confirmed`}
                        </span>
                        <span style={{ fontSize: '10px', color: '#0F6E56', opacity: 0.8 }}>
                            Ready for packing
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

PickTask.displayName = 'PickTask';

export default PickTask;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Single item task ---
<PickTask
  taskId="PT-0291"
  orderId="#FR-48291"
  items={[{
    id:    'li-1',
    sku:   'SKU-00412',
    name:  'Nike Air Max 90 — Size 10',
    qty:   1,
    bin:   { zone: 'B', aisle: '04', bay: 'C', level: '2' },
  }]}
  onComplete={(id) => console.log('Done:', id)}
/>
 
// --- Multi-item task ---
<PickTask
  taskId="PT-0292"
  orderId="#FR-48292"
  items={[
    { id: 'li-1', sku: 'SKU-00412', name: 'Nike Air Max 90', qty: 1, bin: 'B-04-C-2' },
    { id: 'li-2', sku: 'SKU-00891', name: 'Wool Beanie',     qty: 2, bin: 'A-02-A-1' },
    { id: 'li-3', sku: 'SKU-01123', name: 'Gym Bag',         qty: 1, bin: 'C-07-B-3' },
  ]}
  onComplete={(id) => advanceToPackQueue(id)}
/>
 
// --- With priority, due date, assignee ---
<PickTask
  taskId="PT-0293"
  orderId="#FR-48293"
  priority="high"
  dueAt={new Date(Date.now() + 15 * 60 * 1000)}   // due in 15 min
  assignee="Jamie Lee"
  items={[...]}
/>
 
// --- Sizes ---
<PickTask size="sm" taskId="PT-0291" orderId="#FR-48291" items={[...]} />   // compact queue list
<PickTask size="md" taskId="PT-0291" orderId="#FR-48291" items={[...]} />   // default
<PickTask size="lg" taskId="PT-0291" orderId="#FR-48291" items={[...]} />   // full-screen pick mode
 
// --- Without bin map ---
<PickTask showMap={false} taskId="PT-0291" orderId="#FR-48291" items={[...]} />
 
// --- Custom scan validator (server-side) ---
<PickTask
  taskId="PT-0291"
  orderId="#FR-48291"
  items={[...]}
  onScan={async (sku, scanned) => {
    const res = await fetch(`/api/validate-scan?sku=${sku}&scanned=${scanned}`);
    const { valid } = await res.json();
    return valid;
  }}
/>
 
// --- Sound + haptic for floor devices ---
<PickTask
  taskId="PT-0291"
  orderId="#FR-48291"
  items={[...]}
  sound
  haptic
  onComplete={(id) => markPickComplete(id)}
  onException={(id) => openExceptionDrawer(id)}
  onSkip={(id) => requeueTask(id)}
/>
 
// --- Controlled status ---
<PickTask
  taskId="PT-0291"
  orderId="#FR-48291"
  status="confirmed"
  items={[...]}
/>
 
// --- In a PickQueue list ---
<div className="pick-queue">
  {tasks.map(task => (
    <PickTask
      key={task.id}
      taskId={task.id}
      orderId={task.orderId}
      items={task.items}
      priority={task.priority}
      dueAt={task.dueAt}
      size="md"
      sound
      haptic
      onComplete={handleComplete}
      onException={handleException}
      onSkip={handleSkip}
    />
  ))}
</div>
 
*/
 