// search, date range, status filters, carrier filters, and export button for order data
import React from 'react';
import { ActionButton } from '../shared/ActionButton.js';
import { SectionLabel } from '../shared/SectionLabel.js';

/**
 * Types
 */
export type OrderFilterField =
    | 'status'
    | 'priority'
    | 'carrier'
    | 'assignee'
    | 'dateRange'
    | 'search';

export type OrderStatusFilter =
    | 'all'
    | 'pending'
    | 'allocated'
    | 'picking'
    | 'packing'
    | 'shipped'
    | 'delivered'
    | 'exception'
    | 'cancelled';

export type OrderPriorityFilter = 'all' | 'high' | 'medium' | 'low';

export interface DateRange {
    from: Date | string | null;
    to:   Date | string | null;
}

export interface OrderFilters {
    search?:    string;
    status?:    OrderStatusFilter;
    priority?:  OrderPriorityFilter;
    carrier?:   string | undefined;
    assignee?:  string | undefined;
    dateRange?: DateRange;
}

export interface OrderFilterBarProps {
    /** Current filter state. */
    filters?: OrderFilters;
    /** Called whenever any filter changes. */
    onChange?: (filters: OrderFilters) => void;
    /** Available carrier names for the carrier dropdown. */
    carriers?: string[];
    /** Available assignee names for the assignee dropdown. */
    assignees?: string[];
    /** Total result count - shown beside the search field. */
    resultCount?: number;
    /**
     * Which filter fields to render.
     * Defaults to all fields.
     */
    fields?: OrderFilterField[];
    /**
     * Show the active filter chips below the bar.
     * Defaults to true.
     */
    showChips?: boolean;
    /**
     * Show a "Clear all" button when any filter is active.
     * Defaults to true.
     */
    clearable?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Defaults + helpers
 */
const DEFAULT_FIELDS: OrderFilterField[] = [
    'search', 'status', 'priority', 'carrier', 'assignee', 'dateRange',
];

const STATUS_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
    { value: 'all',       label: 'All statuses' },
    { value: 'pending',   label: 'Pending'      },
    { value: 'allocated', label: 'Allocated'    },
    { value: 'picking',   label: 'Picking'      },
    { value: 'packing',   label: 'Packing'      },
    { value: 'shipped',   label: 'Shipped'      },
    { value: 'delivered', label: 'Delivered'    },
    { value: 'exception', label: 'Exception'    },
    { value: 'cancelled', label: 'Cancelled'    },
];

const PRIORITY_OPTIONS: { value: OrderPriorityFilter; label: string }[] = [
    { value: 'all',    label: 'All priorities' },
    { value: 'high',   label: 'High'           },
    { value: 'medium', label: 'Medium'         },
    { value: 'low',    label: 'Low'            },
];

const STATUS_COLORS: Partial<Record<OrderStatusFilter, string>> = {
    exception: '#D85A30',
    picking:   '#BA7517',
    packing:   '#BA7517',
    shipped:   '#0F6E56',
    delivered: '#3B6D11',
};

function hasActiveFilters(filters: OrderFilters): boolean {
    return !!(
        (filters.search   && filters.search.trim())      ||
        (filters.status   && filters.status   !== 'all') ||
        (filters.priority && filters.priority !== 'all') ||
        filters.carrier ||
        filters.assignee ||
        filters.dateRange?.from ||
        filters.dateRange?.to
    );
}

function formatDate(d: Date | string | null): string {
    if (!d) return '';
    return new Date(d as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function chipLabel(field: string, value: string): string {
    const map: Record<string, string> = {
        status:   `Status: ${value}`,
        priority: `Priority ${value}`,
        carrier:  `Carrier ${value}`,
        assignee: `Assignee ${value}`,
        search:   `"${value}"`,
        dateRange: `Date: ${value}`,
    };
    return map[field] ?? value;
}

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-order-filter-bar';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-filter { display: flex; flex-direction: column; gap: 8px; }

        /* Toolbar row */
        .fr-filter__bar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        /* Search input wrapper */
        .fr-filter__search-wrap {
            position: relative;
            flex: 1;
            min-width: 160px;
            max-width: 320px;
            display: flex;
            align-items: center;
        }
        .fr-filter__search-icon {
            position: absolute;
            left: 10px;
            color: #B4B2A9;
            pointer-events: none;
            display: flex;
        }
        .fr-filter__search-clear {
            position: absolute;
            right: 8px;
            background: none;
            border: none;
            cursor: pointer;
            color: #B4B2A9;
            padding: 2px;
            display: flex;
            border-radius: 3px;
            transition: color 120ms ease;
        }
        .fr-filter__search-clear:hover { color: #3C3C3A; }

        .fr-filter__input {
        		width: 100%;
          	height: 34px;
            padding: 0 30px 0 32px;
            border: 1px solid rgba(60,60,58,0.16);
            border-radius: 6px;
            background: #FFFFFF;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #3C3C3A;
            outline: none;
            transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .fr-filter__input::placeholder { color: #B4B2A9; }
        .fr-filter__input:focus {
            border-color: #BA7517;
          	box-shadow: 0 0 0 3px rgba(186,117,23,0.16);
        }

        /* Select inputs */
        .fr-filter__select {
        	height: 34px;
            padding: 0 28px 0 10px;
            border: 1px solid rgba(60,60,58,0.16);
            border-radius: 6px;
            background: #FFFFFF;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #3C3C3A;
            outline: none;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3svg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888780' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 9px center;
            transition: border-color 120ms ease, box-shadow 120ms ease;
            white-space: nowrap;
        }
        .fr-filter__select:focus {
        	border-color: #BA7517;
         	box-shadow: 0 0 0 3px rgba(186,117,23,0.16);
        }
        .fr-filter__select--active {
        	border-color: #BA7517;
         	background-color: #FAEEDA;
            color: #633806;
        }

        /* Date range wrapper */
        .fr-filter__date-wrap {
        	display: flex;
         	align-items: center;
         	gap: 4px;
        }
        .fr-filter__date-sep {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: #B4B2A9;
        }
        .fr-filter__date-input {
            height: 34px;
            padding: 0 8px;
            width: 116px;
            border: 1px solid rgba(60,60,58,0.16);
            border-radius: 6px;
            background: #FFFFFF;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #3C3C3A;
            outline: none;
            transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .fr-filter__date-input:focus {
            border-color: #BA7517;
            box-shadow: 0 0 0 3px rgba(186,117,23,0.16);
        }
        .fr-filter__date-input--active {
            border-color: #BA7517;
            background-color: #FAEEDA;
            color: #633806;
        }

        /* Result count */
        .fr-filter__count {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #888780;
            white-space: nowrap;
            margin-left: auto;
        }

        /* Active filter chips */
        .fr-filter__chips {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .fr-filter__chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            height: 22px;
            padding: 0 8px;
            border-radius: 4px;
            background: #FAEEDA;
            border: 1px solid rgba(186,117,23,0.25);
            color: #633806;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            white-space: nowrap;
        }
        .fr-filter__chip--exception {
            background: #FAECE7;
            border-color: rgba(216,90,48,0.25);
            color: #712B13;
        }
        .fr-filter__chip-remove {
            background: none;
            border: none;
            cursor: pointer;
            color: currentColor;
            padding: 0;
            opacity: 0.5;
            display: flex;
            line-height: 1;
            transition: opacity 120ms ease;
        }
        .fr-filter__chip-remove:hover { opacity: 1; }
    `;
    document.head.appendChild(el);
}

/**
 * Icons
 */
const SearchIcon: React.FC = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

const XSmallIcon: React.FC = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

/**
 * Component
 */
export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
    filters: controlledFilters,
    onChange,
    carriers = [],
    assignees = [],
    resultCount,
    fields = DEFAULT_FIELDS,
    showChips = true,
    clearable = true,
    className,
    style,
}) => {
    const [internalFilters, setInternalFilters] = React.useState<OrderFilters>({
        status: 'all',
        priority: 'all',
    });

    React.useEffect(() => { ensureStyles(); }, []);

    const filters = controlledFilters ?? internalFilters;
    const isActive = hasActiveFilters(filters);
    const showField = (f: OrderFilterField) => fields.includes(f);

    function update(patch: Partial<OrderFilters>) {
        const next = { ...filters, ...patch };
        if (!controlledFilters) setInternalFilters(next);
        onChange?.(next);
    }

    function clearAll() {
        const reset: OrderFilters = { status: 'all', priority: 'all' };
        if (!controlledFilters) setInternalFilters(reset);
        onChange?.(reset);
    }

    // Build active chips
    const chips: { key: string; label: string, isException?: boolean; onRemove: () => void }[] = [];

    if (filters.search?.trim()) {
        chips.push({
            key: 'search',
            label: chipLabel('search', filters.search.trim()),
            onRemove: () => update({ search: '' }),
        });
    }

    if (filters.status && filters.status !== 'all') {
        chips.push({
            key: 'status',
            label: chipLabel('status', filters.status),
            isException: filters.status === 'exception',
            onRemove: () => update({ status: 'all' }),
        });
    }

    if (filters.priority && filters.priority !== 'all') {
        chips.push({
            key: 'priority',
            label: chipLabel('priority', filters.priority),
            onRemove: () => update({ priority: 'all' }),
        });
    }

    if (filters.carrier) {
        chips.push({
            key: 'carrier',
            label: chipLabel('carrier', filters.carrier),
            onRemove: () => update({ carrier: undefined }),
        });
    }

    if (filters.assignee) {
        chips.push({
            key: 'assignee',
            label: chipLabel('assignee', filters.assignee),
            onRemove: () => update({ assignee: undefined }),
        });
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
        const from = formatDate(filters.dateRange.from ?? null);
        const to = formatDate(filters.dateRange.to ?? null);
        const val = [from, to].filter(Boolean).join(' → ');
        chips.push({
            key: 'dateRange',
            label: chipLabel('dateRange', val),
            onRemove: () => update({ dateRange: { from: null, to: null } }),
        });
    }

    const dateFrom = filters.dateRange?.from
        ? new Date(filters.dateRange.from as string).toISOString().split('T')[0]
        : '';
    const dateTo = filters.dateRange?.to
        ? new Date(filters.dateRange.to as string).toISOString().split('T')[0]
        : '';

    return (
        <div
            className={['fr-filter', className].filter(Boolean).join(' ')}
            style={style}
            role="search"
            aria-label="Filter orders"
        >
            {/* -- Toolbar row ---------------------- */}
            <div className="fr-filter__bar">
                {/* Search */}
                {showField('search') && (
                    <div className="fr-filter__search-wrap">
                        <span className="fr-filter__search-icon">
                            <SearchIcon />
                        </span>
                        <input
                            type="search"
                            className="fr-filter__input"
                            placeholder="Search orders, SKUs..."
                            value={filters.search ?? ''}
                            onChange={e => update({ search: e.target.value })}
                            aria-label="Search orders"
                        />
                        {filters.search && (
                            <button
                                type="button"
                                className="fr-filter__search-clear"
                                onClick={() => update({ search: '' })}
                                aria-label="Clear search"
                            >
                                <XSmallIcon />
                            </button>
                        )}
                    </div>
                )}

                {/* Status */}
                {showField('status') && (
                    <select
                        className={[
                            'fr-filter__select',
                            filters.status && filters.status !== 'all' ? 'fr-filter__select--active' : '',
                        ].filter(Boolean).join(' ')}
                        value={filters.status ?? 'all'}
                        onChange={e => update({ status: e.target.value as OrderStatusFilter })}
                        aria-label="Filter by status"
                    >
                        {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                )}

                {/* Priority */}
                {showField('priority') && (
                    <select
                        className={[
                            'fr-filter__select',
                            filters.priority && filters.priority !== 'all' ? 'fr-filter__select--active' : '',
                        ].filter(Boolean).join(' ')}
                        value={filters.priority ?? 'all'}
                        onChange={e => update({ priority: e.target.value as OrderPriorityFilter })}
                        aria-label="Filter by priority"
                    >
                        {PRIORITY_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                )}

                {/* Carrier */}
                {showField('carrier') && carriers.length > 0 && (
                    <select
                        className={[
                            'fr-filter__select',
                            filters.carrier ? 'fr-filter__select--active' : '',
                        ].filter(Boolean).join(' ')}
                        value={filters.carrier ?? ''}
                        onChange={e => update({ carrier: e.target.value || undefined })}
                        aria-label="Filter by carrier"
                    >
                        {carriers.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                )}

                {/* Assignee */}
                {showField('assignee') && assignees.length > 0 && (
                    <select
                        className={[
                            'fr-filter__select',
                            filters.assignee ? 'fr-filter__select--active' : '',
                        ].filter(Boolean).join(' ')}
                        value={filters.assignee ?? ''}
                        onChange={e => update({ assignee: e.target.value || undefined })}
                        aria-label="Filter by assignee"
                    >
                        <option value="">All assignees</option>
                        {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                )}

                {/* Date range */}
                {showField('dateRange') && (
                    <div className="fr-filter__date-wrap">
                        <input
                            type="date"
                            className={[
                                'fr-filter__date-input',
                                filters.dateRange?.from ? 'fr-filter__date-input--active' : '',
                            ].filter(Boolean).join(' ')}
                            value={dateFrom ?? ''}
                            onChange={e => update({
                                dateRange: { from: e.target.value || null, to: filters.dateRange?.to ?? null },
                            })}
                            aria-label="From date"
                        />
                        <span className="fr-filter__date-sep">→</span>
                        <input
                            type="date"
                            className={[
                                'fr-filter__date-input',
                                filters.dateRange?.to ? 'fr-filter__date-input--active' : '',
                            ].filter(Boolean).join(' ')}
                            value={dateTo ?? ''}
                            min={dateFrom ?? undefined}
                            onChange={e => update({
                                dateRange: { from: filters.dateRange?.from ?? null, to: e.target.value || null },
                            })}
                            aria-label="To date"
                        />
                    </div>
                )}

                {/* Result count */}
                {resultCount !== undefined && (
                    <span className="fr-filter__count" aria-live="polite" aria-atomic="true">
                        {resultCount.toLocaleString()} order{resultCount !== 1 ? 's' : ''}
                    </span>
                )}

                {/* Clear all */}
                {clearable && isActive && (
                    <ActionButton intent="ghost" size="sm" onClick={clearAll}>
                        Clear all
                    </ActionButton>
                )}
            </div>

            {/* -- Active filter chips --------------------------------------- */}
            {showChips && chips.length > 0 && (
                <div className="fr-filter__chips" role="list" aria-label="Active filters">
                    <SectionLabel size="xs" muted>Filtered by</SectionLabel>
                    {chips.map(chip => (
                        <span
                            key={chip.key}
                            role="listitem"
                            className={[
                                'fr-filter__chip',
                                chip.isException ? 'fr-filter__chip--exception' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            {chip.label}
                            <button
                                type="button"
                                className="fr-filter__chip-remove"
                                onClick={chip.onRemove}
                                aria-label={`Remove filter: ${chip.label}`}
                            >
                                <XSmallIcon />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

OrderFilterBar.displayName = 'OrderFilterBar';

export default OrderFilterBar;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Uncontrolled ---
<OrderFilterBar
  carriers={['UPS', 'FedEx', 'DHL']}
  assignees={['Jamie Lee', 'Sam Rivera', 'Morgan Chen']}
  resultCount={1482}
  onChange={(filters) => console.log(filters)}
/>
 
// --- Controlled ---
const [filters, setFilters] = React.useState<OrderFilters>({
  status: 'all', priority: 'all',
});
 
<OrderFilterBar
  filters={filters}
  onChange={setFilters}
  carriers={['UPS', 'FedEx', 'DHL']}
  assignees={['Jamie Lee', 'Sam Rivera']}
  resultCount={filteredOrders.length}
/>
 
// --- Subset of fields ---
<OrderFilterBar
  fields={['search', 'status']}
  onChange={handleChange}
/>
 
// --- No chips ---
<OrderFilterBar showChips={false} onChange={handleChange} />
 
// --- Pre-filtered (exceptions view) ---
<OrderFilterBar
  filters={{ status: 'exception' }}
  onChange={setFilters}
/>
 
// --- With OrderTable ---
<div style={{ display:'flex', flexDirection:'column', gap:12 }}>
  <OrderFilterBar
    filters={filters}
    onChange={setFilters}
    carriers={carriers}
    assignees={assignees}
    resultCount={visibleOrders.length}
  />
  <OrderTable
    orders={visibleOrders}
    onRowClick={openDrawer}
  />
</div>
 
*/

 