// staff-facing ordered list of pick tasks, sortable by priority, with filters for status and picker
import React from 'react';
import { PickTask } from './PickTask.js';
import { EmptyState } from '../shared/EmptyState.js';
import { Timestamp } from '../shared/Timestamp.js';
import { Spinner } from '../shared/Spinner.js';
import type { PickTaskProps, PickTaskStatus } from './PickTask.js';

/**
 * Types
 */
export type PickQueueSort =
    | 'priority'    // high → medium → low, then by due date
    | 'due-asc'     // soonest due first
    | 'due-desc'    // latest due first
    | 'order'       // natural insertion order

export type PickQueueFilter = 
    | 'all'
    | 'pending'
    | 'active'
    | 'exceptions';

export interface PickQueueTask
    extends Omit<PickTaskProps, 'onComplete' | 'onException' | 'onSkip' | 'onScan'> {
        /** Internal sort key - lower = higher priority. Auto-derived from priority if omitted. */
        sortOrder?: number;
    }

export interface PickQueueStats {
    total:      number;
    pending:    number;
    active:     number;
    confirmed:  number;
    skipped:    number;
    exceptions: number;
}

export interface PickQueueProps {
    /** The list of tasks to render. */
    tasks: PickQueueTask[];
    /**
     * Title shown in the queue header.
     * Default to "Pick Queue".
     */
    title?: string;
    /** 
     * Assignee name - when provided, shown as a sub-heading 
     * and used to personalise the empty state. 
     */
    assignee?: string;
    /**
     * Last-refreshed timestamp - shown in the header.
     */
    lastUpdated?: Date | string | number;
    /**
     * Whether the queue is loading fresh data.
     * Shows a spinner in the header and disables interactions.
     */
    loading?: boolean;
    /**
     * Sort order applied to tasks before rendering.
     * Defaults to 'priority'.
     */
    sort?: PickQueueSort;
    /**
     * Active filter tab.
     * Defaults to 'all'.
     */
    filter?: PickQueueFilter;
    /** Allow the user to change the filter. Defaults to true. */
    filterable?: boolean;
    /** Allow the user to change the sort. Defaults to true. */
    sortable?: boolean;
    /** Size padded to every PickTask. Defaults to 'md'. */
    taskSize?: PickTaskProps['size'];
    /** Show bin map inside tasks. Defaults to false for queue context. */
    showMap?: boolean;
    /** Enable sound feedback on scan. */
    sound?: boolean;
    /** Enable haptic feedback on scan. */
    haptic?: boolean;
    /** Called when any task is completed. */
    onTaskComplete?: (taskId: string) => void;
    /** Called when any task is flagged as an exception. */
    onTaskException?: (taskId: string, reason?: string) => void;
    /** Called when any task is skipped. */
    onTaskSkip?: (taskId: string) => void;
    /**
     * Called when the user requests a queue refresh.
     */
    onRefresh?: () => void;
    /** Custom scan validator forwarded to every PickTask. */
    onScan?: PickTaskProps['onScan'];
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Helpers
 */
const PRIORITY_WEIGHT: Record<string, number> = {
    high:   0,
    medium: 1,
    low:    2,
    none:   3,
};

function deriveSortOrder(task: PickQueueTask): number {
    if (task.sortOrder !== undefined) return task.sortOrder;
    return PRIORITY_WEIGHT[task.priority ?? 'none'] ?? 3;
}

function sortTasks(tasks: PickQueueTask[], sort: PickQueueSort): PickQueueTask[] {
    const copy = [...tasks];
    switch (sort) {
        case 'priority':
            return copy.sort((a, b) => {
                const pw = deriveSortOrder(a) - deriveSortOrder(b);
                if (pw !== 0) return pw;
                // Tiebreak: soonest due first
                const [at, bt] = tiebreakSort(a.dueAt, b.dueAt);
                return at - bt;
            });
        case 'due-asc':
            return copy.sort((a, b) => {
                const [at, bt] = tiebreakSort(a.dueAt, b.dueAt);
                return at - bt;
            });
        case 'due-desc':
            return copy.sort((a, b) => {
                const [at, bt] = tiebreakSort(a.dueAt, b.dueAt);
                return bt - at;
            });
        case 'order':
        default:
            return copy;
    }
}

function tiebreakSort(a: string | number | Date | undefined , b: string | number | Date | undefined): Array<number> | [0, 0] {
    const at = a ? new Date(a as string).getTime() : Infinity;
    const bt = b ? new Date(b as string).getTime() : Infinity;
    return [at, bt];
}

function filterTasks(tasks: PickQueueTask[], filter: PickQueueFilter): PickQueueTask[] {
    switch (filter) {
        case 'pending':    return tasks.filter(t => !t.status || t.status === 'pending');
        case 'active':     return tasks.filter(t => t.status === 'active' || t.status === 'scanning');
        case 'exceptions': return tasks.filter(t => t.status === 'exception' || t.status === 'skipped');
        default:           return tasks;
    }
}

function computeStats(tasks: PickQueueTask[]): PickQueueStats {
    return tasks.reduce<PickQueueStats>(
        (acc, t) => {
            acc.total++;
            const s = t.status ?? 'pending';
            if (s === 'pending')                    acc.pending++;
            if (s === 'active' || s === 'scanning') acc.active++;
            if (s === 'confirmed')                  acc.confirmed++;
            if (s === 'skipped')                    acc.skipped++;
            if (s === 'exception')                  acc.exceptions++;
            return acc;
        },
        { total: 0, pending: 0, active: 0, confirmed: 0, skipped: 0, exceptions: 0 },
    );
}

/**
 * Tokens
 */
const FILTER_LABELS: Record<PickQueueFilter, string> = {
    all:        'All',
    pending:    'Pending',
    active:     'Active',
    exceptions: 'Exceptions',
};

const SORT_LABELS: Record<PickQueueSort, string> = {
    priority:   'Priority',
    'due-asc':  'Due ↑',
    'due-desc': 'Due ↓',
    order:      'Order',
};

/** 
 * Style injection
*/
const STYLE_ID = 'flowroute-pick-queue';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-queue {
            display: flex;
            flex-direction: column;
            background: #F8F7F2;
            border: 1px solid rgba(60,60,58,0.12);
            border-radius: 12px;
            overflow: hidden;
        }

        /* Header */
        .fr-queue__header {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            background: #FFFFFF;
            border-bottom: 1px solid rgba(60,60,58,0.08);
        }
        .fr-queue__header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .fr-queue__title {
            font-family: 'Syne', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #3C3C3A;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .fr-queue__subtitle {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #888780;
            margin: 0;
        }
        .fr-queue__header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Stats bar */
        .fr-queue__stats {
            display: flex;
            gap: 0;
            border: 1px solid rgba(60,60,58,0.1);
            border-radius: 7px;
            overflow: hidden;
        }
        .fr-queue__stat {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 7px 4px;
            background: #FFFFFF;
            border-right: 1px solid rgba(60,60,58,0.08);
        }
        .fr-queue__stat:last-child { border-right: none; }
        .fr-queue__stat-val {
            font-family: 'Syne', sans-serif;
            font-size: 16px;
            font-weight: 700;
            line-height: 1;
            color: #3C3C3A;
        }
        .fr-queue__stat-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888780;
            margin-top: 3px;
        }
        .fr-queue__stat--exceptions .fr-queue__stat-val { color: #D85A30; }
        .fr-queue__stat--confirmed  .fr-queue__stat-val { color: #0F6E56; }
        .fr-queue__stat--active     .fr-queue__stat-val { color: #BA7517; }

        /* Progress bar */
        .fr-queue__progress-track {
            height: 4px;
            background: rgba(60,60,58,0.08);
            border-radius: 2px;
            overflow: hidden;
        }
        .fr-queue__progress-fill {
            height: 100%;
            background: #0F6E56;
            border-radius: 2px;
            transition: width 400ms ease;
        }

        /* Toolbar */
        .fr-queue__toolbar {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            background: #FFFFFF;
            border-bottom: 1px solid rgba(60,60,58,0.08);
            flex-wrap: wrap;
        }

        /* Filter tabs */
        .fr-queue__filters {
            display: flex;
            gap: 4px;
            flex: 1;
        }
        .fr-queue__filter-btn {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.06em;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 5px;
            padding: 4px 10px;
            cursor: pointer;
            color: #888780;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
            white-space: nowrap;
        }
        .fr-queue__filter-btn:hover {
            background: #F1EFE8;
            color: #3C3C3A;
        }
        .fr-queue__filter-btn--active {
            background: #FAEEDA;
            color: #633806;
            border-color: rgba(186,117,23,0.3);
        }
        .fr-queue__filter-btn--exceptions.fr-queue__filter-btn--active {
            background: #FAECE7;
            color: #712B13;
            border-color: rgba(216,90,48,0.3);
        }
        .fr-queue__filter-count {
            background: currentColor;
            border-radius: 9999px;
            color: inherit;
            opacity: 0.15;
            min-width: 14px;
            height: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            padding: 0 3px;
            position: relative;
        }
        .fr-queue__filter-count-text {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
        }

        /* Sort select */
        .fr-queue__sort {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: #888780;
            background: transparent;
            border: 1px solid rgba(60,60,58,0.14);
            border-radius: 5px;
            padding: 4ps 24px 4px 8px;
            cursor: pointer;
            appearance: none;
            -webit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888780' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            outline: none;
            transition: border-color 120ms ease;
        }
        .fr-queue__sort:focus { border-color: #BA7517; }

        /* Task list */
        .fr-queue__list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            overflow-y: auto;
            flex: 1;
        }

        /* Refresh button */
        .fr-queue__refresh {
            background: none;
            border: 1px solid rgba(60,60,58,0.14);
            border-radius: 5px;
            padding: 4px 8px;
            cursor: pointer;
            color: #888780;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: color 120ms ease, border-color 120ms ease;
        }
        .fr-queue__refresh:hover { color: #3C3C3A; border-color: rgba(60,60,58,0.28); }
        .fr-queue__refresh:disabled { opacity: 0.4; cursor: not-allowed; }

        /* All-done banner */
        .fr-queue__done-banner {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 16px;
            background: #E1F5EE;
            border-top: 1px solid rgba(15,110,86,0.15);
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            font-weight: 500;
            color: #0F6E56;
            animation: fr-queue-banner-in 300ms cubic-bezier(0.22,1,0,0.36,1);
        }

        @keyframes fr-queue-banner-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* Loading overlay */
        .fr-queue__loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px;
            gap: 10px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #888780;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Sub-components
 */
const RefreshIcon: React.FC<{ spinning?: boolean }> = ({ spinning }) => (
    <svg
        width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
        style={ spinning ? { animation: 'fr-btn-spin 0.7s linear infinite' } : undefined }
    >
        <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5a5.5 5.5 0 0 1 4 1.72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 1v3.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckAllIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="#0F6E56" />
        <path d="M6.5 12.5l3.5 3.5 7-8" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface FilterBtnProps {
    label:   string;
    value:   PickQueueFilter;
    count:   number;
    active:  boolean;
    onClick: () => void;
}

const FilterBtn: React.FC<FilterBtnProps> = ({ label, value, count, active, onClick }) => (
    <button
        type="button"
        className={[
            'fr-queue__filter-btn',
            active ? 'fr-queue__filter-btn--active' : '',
            value === 'exceptions' ? 'fr-queue__filter-btn--exceptions' : '',
        ].filter(Boolean).join(' ')}
        onClick={onClick}
        aria-pressed={active}
    >
        {label}
        {count > 0 && (
            <span className="fr-queue__filter-count" aria-label={`${count} tasks`}>
                &nbsp;
                <span className="fr-queue__filter-count-text">{count > 99 ? '99+' : count}</span>
            </span>
        )}
    </button>
);

/**
 * Component
 */
export const PickQueue: React.FC<PickQueueProps> = ({
    tasks,
    title = 'Pick Queue',
    assignee,
    lastUpdated,
    loading = false,
    sort: controlledSort,
    filter: controlledFilter,
    filterable = true,
    sortable = true,
    taskSize = 'md',
    showMap = false,
    sound = false,
    haptic = false,
    onTaskComplete,
    onTaskException,
    onTaskSkip,
    onRefresh,
    onScan,
    className,
    style,
}) => {
    const [internalFilter, setInternalFilter] = React.useState<PickQueueFilter>('all');
    const [internalSort,   setInternalSort]   = React.useState<PickQueueSort>('priority');
    // Track status overrides driven by callbacks (uncontrolled mode)
    const [statusMap, setStatusMap] = React.useState<Record<string, PickTaskStatus>>({});

    React.useEffect(() => { ensureStyles(); }, []);

    const activeFilter = controlledFilter ?? internalFilter;
    const activeSort   = controlledSort   ?? internalSort;

    // Merge external status with local overrides
    const mergedTasks = tasks.map(t => ({
        ...t,
        status: (statusMap[t.taskId] ?? t.status) as PickTaskStatus,
    }));

    const stats = computeStats(mergedTasks);

    // Exception-first, then sort by active filter
    const exceptionFirst = [
        ...mergedTasks.filter(t => t.status === 'exception' || t.status === 'skipped'),
        ...mergedTasks.filter(t => t.status !== 'exception' && t.status !== 'skipped'),
    ];
    const filtered = filterTasks(exceptionFirst, activeFilter);
    const sorted = sortTasks(filtered, activeFilter === 'exceptions' ? 'order' : activeSort);

    const allConfirmed = stats.total > 0 && stats.confirmed === stats.total;
    const progressPct  = stats.total > 0
        ? Math.round((stats.confirmed / stats.total) * 100)
        : 0;

    function handleComplete(taskId: string) {
        setStatusMap(p => ({ ...p, [taskId]: 'confirmed' }));
        onTaskComplete?.(taskId);
    }

    function handleException(taskId: string, reason?: string) {
        setStatusMap(p => ({ ...p, [taskId]: 'exception' }));
        onTaskException?.(taskId, reason);
    }

    function handleSkip(taskId: string) {
        setStatusMap(p => ({ ...p, [taskId]: 'skipped'}));
        onTaskSkip?.(taskId);
    }

    const filterCounts: Record<PickQueueFilter, number> = {
        all:        stats.total,
        pending:    stats.pending,
        active:     stats.active,
        exceptions: stats.exceptions + stats.skipped,
    };

    return (
        <div
            className={['fr-queue', className].filter(Boolean).join(' ')}
            style={style}
            aria-label={`${title}${assignee ? ` - ${assignee}` : ''}`}
            aria-busy={loading}
        >
            {/* -- Header -------------------------------------- */}
            <div className="fr-queue__header">
                <div className="fr-queue__header-top">
                    <div>
                        <h2 className="fr-queue__title">
                            {title}
                            {loading && <Spinner size="xs" intent="muted" label="Refreshing..." />}
                        </h2>
                        {(assignee || lastUpdated) && (
                            <p className="fr-queue__subtitle">
                                {assignee && <span>{assignee}</span>}
                                {assignee && lastUpdated && <span> · </span>}
                                {lastUpdated && (
                                    <span>Updated <Timestamp value={lastUpdated} format="relative" size="xs" /></span>
                                )}
                            </p>
                        )}
                    </div>

                    <div className="fr-queue__header-actions">
                        {onRefresh && (
                            <button
                                type="button"
                                className="fr-queue__refresh"
                                onClick={onRefresh}
                                disabled={loading}
                                aria-label="Refresh queue"
                            >
                                <RefreshIcon spinning={loading} />
                                Refresh
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats bar */}
                <div className="fr-queue__stats" role="group" aria-label="Queue statistics">
                    {[
                        { key: 'total',      label: 'Total',      val: stats.total,      cls: '' },
                        { key: 'pending',    label: 'Pending',    val: stats.pending,    cls: '' },
                        { key: 'active',     label: 'Active',     val: stats.active,     cls: 'fr-queue__stat--active' },
                        { key: 'confirmed',  label: 'Done',       val: stats.confirmed,  cls: 'fr-queue__stat--confirmed' },
                        { key: 'exceptions', label: 'Exceptions', val: stats.exceptions + stats.skipped, cls: 'fr-queue__stat--exceptions' },
                    ].map(s => (
                        <div
                            key={s.key}
                            className={['fr-queue__stat', s.cls].filter(Boolean).join(' ')}
                            aria-label={`${s.label}: ${s.val}`}
                        >
                            <span className="fr-queue__stat-val">{s.val}</span>
                            <span className="fr-queue__stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                {stats.total > 0 && (
                    <div>
                        <div className="fr-queue__progress-track">
                            <div
                                className="fr-queue__progress-fill"
                                style={{ width: `${progressPct}%` }}
                                role="progressbar"
                                aria-valuenow={progressPct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${stats.confirmed} of ${stats.total} tasks complete`}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 4,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: '9px',
                            color: '#888780',
                        }}>
                            <span>{progressPct}% complete</span>
                            <span>{stats.confirmed}/{stats.total} tasks</span>
                        </div>
                    </div>
                )}
            </div>

            {/* -- Toolbar --------------------------------------------------------- */}
            {(filterable || sortable) && (
                <div className="fr-queue__toolbar">
                    {filterable && (
                        <div className="fr-queue__filters" role="group" aria-label="Filter tasks">
                            {(Object.keys(FILTER_LABELS) as PickQueueFilter[]).map(f => (
                                <FilterBtn
                                    key={f}
                                    label={FILTER_LABELS[f]}
                                    value={f}
                                    count={filterCounts[f]}
                                    active={activeFilter === f}
                                    onClick={() => {
                                        if (!controlledFilter) setInternalFilter(f);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {sortable && activeFilter !== 'exceptions' && (
                        <select
                            className="fr-queue__sort"
                            value={activeSort}
                            onChange={e => {
                                if (!controlledSort) setInternalSort(e.target.value as PickQueueSort);
                            }}
                            aria-label="Sort tasks"
                        >
                            {(Object.keys(SORT_LABELS) as PickQueueSort[]).map(s => (
                                <option key={s} value={s}>{SORT_LABELS[s]}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* -- Task list ------------------------------------------------------- */}
            {loading && sorted.length === 0 ? (
                <div className="fr-queue__loading">
                    <Spinner size="md" intent="muted" label="Loading tasks..." />
                    <span>Loading tasks...</span>
                </div>
            ) : sorted.length === 0 ? (
                <div style={{ padding: 12 }}>
                    <EmptyState
                        variant={activeFilter === 'exceptions' ? 'no-results' : 'no-tasks'}
                        size="sm"
                        title={
                            activeFilter === 'exceptions' ? 'No exceptions' :
                            activeFilter === 'active'     ? 'No active tasks' :
                            activeFilter === 'pending'    ? 'No pending tasks' :
                            allConfirmed                  ? 'All tasks complete' :
                            'Queue is clear'
                        }
                        description={
                            activeFilter !== 'all'
                                ? 'Try switching to a different filter.'
                                : allConfirmed
                                    ? `Great work${assignee ? `, ${assignee.split(' ')[0]}` : ''}! All tasks have been confirmed.`
                                    : 'No tasks have been assigned yet.'   
                        }
                    />
                </div>
            ) : (
                <div className="fr-queue__list" role="list" aria-label="Pick tasks">
                    {sorted.map(task => (
                        <div key={task.taskId} role="listitem">
                            <PickTask
                                {...task}
                                size={taskSize}
                                showMap={showMap}
                                sound={sound}
                                haptic={haptic}
                                onComplete={handleComplete}
                                onException={handleException}
                                onSkip={handleSkip}
                                onScan={onScan ?? ((sku: string, scannedValue: string) => false)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* -- All-done banner ------------------------------------------ */}
            {allConfirmed && stats.total > 0 && (
                <div className="fr-queue__done-banner" role="status" aria-live="polite">
                    <CheckAllIcon />
                    <span>
                        All {stats.total} task{stats.total === 1 ? '' : 's'} confirmed
                        {assignee ? ` - great work, ${assignee.split(' ')[0]}!` : '!'}
                    </span>
                </div>
            )}
        </div>
    );
};

PickQueue.displayName = 'PickQueue';

export default PickQueue;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Basic ---
<PickQueue
  tasks={[
    {
      taskId:  'PT-0291',
      orderId: '#FR-48291',
      items: [{
        id: 'li-1', sku: 'SKU-00412',
        name: 'Nike Air Max 90', qty: 1,
        bin: { zone: 'B', aisle: '04', bay: 'C', level: '2' },
      }],
    },
    {
      taskId:  'PT-0292',
      orderId: '#FR-48292',
      priority: 'high',
      dueAt: new Date(Date.now() + 10 * 60 * 1000),
      items: [
        { id: 'li-2', sku: 'SKU-00891', name: 'Wool Beanie', qty: 2, bin: 'A-02-A-1' },
        { id: 'li-3', sku: 'SKU-01123', name: 'Gym Bag',     qty: 1, bin: 'C-07-B-3' },
      ],
    },
  ]}
  onTaskComplete={(id) => console.log('Complete:', id)}
/>
 
// --- With assignee, last-updated, and refresh ---
<PickQueue
  title="My Tasks"
  assignee="Jamie Lee"
  lastUpdated={new Date()}
  tasks={tasks}
  onRefresh={refetchQueue}
  onTaskComplete={markDone}
  onTaskException={flagException}
  onTaskSkip={requeueTask}
/>
 
// --- Loading state ---
<PickQueue tasks={[]} loading />
 
// --- Controlled filter + sort ---
<PickQueue
  tasks={tasks}
  filter="exceptions"
  sort="due-asc"
  filterable={false}
  sortable={false}
/>
 
// --- Sound + haptic (floor tablets) ---
<PickQueue tasks={tasks} sound haptic />
 
// --- With bin map visible ---
<PickQueue tasks={tasks} showMap />
 
// --- Server-side scan validation ---
<PickQueue
  tasks={tasks}
  onScan={async (sku, scanned) => {
    const { valid } = await api.validateScan({ sku, scanned });
    return valid;
  }}
/>
 
// --- Compact size (dashboard widget) ---
<PickQueue
  tasks={tasks}
  taskSize="sm"
  filterable={false}
  sortable={false}
  title="Today's Queue"
  style={{ maxHeight: 480, overflowY: 'auto' }}
/>
 
*/