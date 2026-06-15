// 5-step progress indicator per order, showing current stage (picking, packing, shipping) and time in stage
import React from 'react';
import { StatusBadge } from '../shared/StatusBadge.js';
import { Timestamp } from '../shared/Timestamp.js';
import { SectionLabel } from '../shared/SectionLabel.js';
import { MonoID } from '../shared/MonoID.js';

/**
 * Types
 */
export type PipelineStage = 
    | 'received'
    | 'allocated'
    | 'picking'
    | 'packing'
    | 'dispatched';

export type PipelineStageStatus =
    | 'done'      // completed
    | 'active'    // currently in progress
    | 'pending'   // not yet reached
    | 'exception' // blocked / problem
    | 'skipped';  // bypassed (e.g. digital goods skip picking/packing)

export type PipelineOrientation = 'horizontal' | 'vertical';
export type PipelineSize        = 'sm' | 'md' | 'lg';
export type PipelineVariant     = 'minimal' | 'default' | 'detailed';

export interface PipelineStageMeta {
    stage:     PipelineStage;
    status:    PipelineStageStatus;
    /** ISO / Date / unix ms of when this stage was entered. */
    enteredAt?: Date | string | number;
    /**  ISO / Date / unix ms of when this stage was completed. */
    completedAt?: Date | string | number;
    /** Display name override. Defaults to the stage name. */
    label?: string;
    /** Short note shown in 'detailed' variant (e.g. "Assigned to Jamie Lee"). */
    note?: string;
    /** Actor who performed this stage (name or ID). */
    actor?: string;
}

export interface FulfillmentPipelineProps {
    /** Ordered list of stages with their statuses. */
    stages?: PipelineStageMeta[];
    /**
     * Convenience shorthand - the currently active stage.
     * When provided alongside no `stages`, the component auto-derives
     * all stage statuses from this single value.
     */
    activeStage?: PipelineStage;
    /** Order ID shown in the header (detailed variant). */
    orderId?: string;
    /** Orientation. Defaults to 'horizontal'. */
    orientation?: PipelineOrientation;
    /** Visual size. Defaults to 'md'. */
    size?: PipelineSize;
    /**
     * Variant controls information density.
     * - 'minimal'  - dots and labels only
     * - 'default'  - dots, labels, timestamps
     * - 'detailed' - full: icons, labels, timestamps, notes, actors
     */
    variant?: PipelineVariant;
    /**
     * Whether to animate the active stage dot with a pulse ring.
     * Defaults to true.
     */
    animated?: boolean;
    /** Called when a stage dot is clicked. */
    onStageClick?: (stage: PipelineStage) => void;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Defaults
 */
const DEFAULT_STAGE_ORDER: PipelineStage[] = [
    'received',
    'allocated',
    'picking',
    'packing',
    'dispatched',
];

const STAGE_LABELS: Record<PipelineStage, string> = {
    received: 'Received',
    allocated: 'Allocated',
    picking: 'Picking',
    packing: 'Packing',
    dispatched: 'Dispatched',
};

/** Derive all stage statuses from a single active stage. */
function deriveStages(activeStage: PipelineStage): PipelineStageMeta[] {
    const activeIdx = DEFAULT_STAGE_ORDER.indexOf(activeStage);
    return DEFAULT_STAGE_ORDER.map((stage, i) => ({
        stage,
        status:
            i < activeIdx ? 'done' :
            i === activeIdx ? 'active' : 
            'pending',
    }));
}

/**
 * Tokens
 */
interface SizeTokens {
    dotSize:      number;
    connectorW:   number; // horizontal connector height / vertical connector width
    connectorLen: number; // min length
    labelSize:    string;
    metaSize:     string;
    noteSize:     string;
    iconSize:     number;
    gap:          number;
    padding:      string;
}

const SIZE_TOKENS: Record<PipelineSize, SizeTokens> = {
    sm: { dotSize: 22, connectorW: 1.5, connectorLen: 24, labelSize: '10px', metaSize: '9px',  noteSize: '10px', iconSize: 10, gap: 4, padding: '12px' },
    md: { dotSize: 28, connectorW: 1.5, connectorLen: 32, labelSize: '11px', metaSize: '10px', noteSize: '11px', iconSize: 12, gap: 6, padding: '16px' },
    lg: { dotSize: 36, connectorW: 2,   connectorLen: 40, labelSize: '13px', metaSize: '11px', noteSize: '12px', iconSize: 16, gap: 8, padding: '20px' },
};

interface StatusTokens {
    dotBg:     string;
    dotBorder: string;
    dotColor:  string;
    connColor: string;
    labelColor: string;
}

const STATUS_TOKENS: Record<PipelineStageStatus, StatusTokens> = {
    done: {
        dotBg:      '#0F6E56',
        dotBorder:  '#0F6E56',
        dotColor:   '#FFFFFF',
        connColor:  '#0F6E56',
        labelColor: '#3C3C3A',
    },
    active: {
        dotBg:      '#BA7517',
        dotBorder:  '#BA7517',
        dotColor:   '#FFFFFF',
        connColor:  'rgba(60,60,58,0.15)',
        labelColor: '#BA7517',
    },
    pending: {
        dotBg:      '#F1EFE8',
        dotBorder:  'rgba(60,60,58,0.18)',
        dotColor:   '#888780',
        connColor:  'rgba(60,60,58,0.12)',
        labelColor: '#888780',
    },
    exception: {
        dotBg:      '#D85A30',
        dotBorder:  '#D85A30',
        dotColor:   '#FFFFFF',
        connColor:  'rgba(60,60,58,0.12)',
        labelColor: '#D85A30',
    },
    skipped: {
        dotBg:      '#F1EFE8',
        dotBorder:  'rgba(60,60,58,0.12)',
        dotColor:   '#B4B2A9',
        connColor:  'rgba(60,60,58,0.08)',
        labelColor: '#B4B2A9',
    },
};

/**
 * Icons (inline SVG per stage)
 */
const StageIcons: Record<PipelineStage, React.FC<{ size: number; color: string }>> = {
    received: ({ size, color }) => (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 7h12v7H2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M2 7L8 3l6 4" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
            <line x1="8" y1="3" x2="8" y2="7" stroke={color} strokeWidth="1.4" />
        </svg>
    ),
    allocated: ({ size, color }) => (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="5" r="2.5" stroke={color} strokeWidth="1.4" />
            <path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M11 7.5l1.5 1.5-1.5 1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    picking: ({ size, color }) => (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 4h10v2H3zM4 6v7h8V6" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M6 6v2a2 2 0 0 0 4 0V6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    packing: ({ size, color }) => (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="7" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.4" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
            <rect x="6" y="6" width="4" height="4" rx="0.5" fill={color} opacity="0.3" />
        </svg>
    ),
    dispatched: ({ size, color }) => (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 8h9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M7 5l3 3-3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="4.5" cy="13" r="1.5" fill={color} />
            <circle cx="11" cy="13" r="1.5" fill={color} />
            <path d="M10 5h2.5l2 3H10V5z" fill={color} opacity="0.25" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
    ),
};

const CheckIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ExclamIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 4v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="8" cy="12" r="0.75" fill="currentColor" />
    </svg>
);

const SkipDotIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <path d="M1 2l3 2-3 2V2zM6 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg> 
);

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-fulfillment-pipeline';

function ensureStyles() {
    if (typeof document == 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-pipeline { font-family: 'IBM Plex Mono', monospace; }

        /* Horizontal layout */
        .fr-pipeline--h {
            display: flex;
            align-items: flex-start;
        }
        .fr-pipeline--h .fr-pipeline__step {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            flex: 1;
        }
        .fr-pipeline--h .fr-pipeline__track {
            display: flex;
            align-items: center;
            width: 100%;
        }
        .fr-pipeline--h .fr-pipeline__connector {
            flex: 1;
            height: var(--conn-w);
        }
        .fr-pipeline--h .fr-pipeline__dot-wrap {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .fr-pipeline--h .fr-pipeline__content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 6px;
            text-align: center;
        }

        /* Vertical layout */
        .fr-pipeline--v {
            display: flex;
            flex-direction: column;
        }
        .fr-pipeline--v .fr-pipeline__step {
            display: flex;
            gap: 12px;
        }
        .fr-pipeline--v .fr-pipeline__track {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
        }
        .fr-pipeline--v .fr-pipeline__connector {
            width: var(--conn-w);
            flex: 1;
            min-height: 20px;
        }
        .fr-pipeline--v .fr-pipeline__dot-wrap {
            flex-shrink: 0;
        }
        .fr-pipeline--v .fr-pipeline__content {
            flex: 1;
            padding-bottom: 16px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        /* Shared dot */
        .fr-pipeline__dot {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-style: solid;
            border-width: 1.5px;
            transition: background 200ms ease, border-color 200ms ease;
            position: relative;
            z-index: 1;
        }
        .fr-pipeline__dot--clickable { cursor: pointer; }
        .fr-pipeline__dot--clickable:hover { filter: brightness(1.08); }
        .fr-pipeline__dot--clickable:focus-visible {
            outline: 3px solid rgba(186,117,23,0.35);
            outline-offset: 2px;
        }

        /* Pulse ring for active stage */
        .fr-pipeline__pulse {
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 1.5px solid #BA7517;
            animation: fr-pipeline-pulse 2s ease-in-out infinite;
            pointer-events: none;
        }
        @keyframes fr-pipeline-pulse {
            0%,100% { opacity: 0.6; transform: scale(1); }
            50%     { opacity: 0,   transform: scale(1.45); }
        }

        /* Labels and meta */
        .fr-pipeline__label {
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            line-height: 1.2;
        }
        .fr-pipeline__meta {
            opacity: 0.75;
            margin-top: 2px;
            line-height: 1.4;
        }
        .fr-pipeline__note {
            font-family: 'IBM Plex Sans', sans-serif;
            color: #888780;
            margin-top: 3px;
            line-height: 1.5;
        }
        .fr-pipeline__actor {
            color: #888780;
            font-size: 9px;
            margin-top: 2px;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Dot renderer
 */
interface DotProps {
    stage:    PipelineStageMeta;
    tok:      SizeTokens;
    variant:  PipelineVariant;
    animated: boolean;
    onClick?: (() => void) | undefined;
}

const Dot: React.FC<DotProps> = ({ stage, tok, variant, animated, onClick }) => {
    const st = STATUS_TOKENS[stage.status];
    const Icon = StageIcons[stage.stage];
    const isActive = stage.status === 'active';

    const dotContent =
        stage.status === 'done' ? (
            <CheckIcon size={tok.iconSize} />
        ) : stage.status === 'exception' ? (
            <ExclamIcon size={tok.iconSize} />
        ) : stage.status === 'skipped' ? (
            <SkipDotIcon size={tok.dotSize} />
        ) : variant === 'minimal' ? null : (
            <Icon size={tok.iconSize} color={st.dotColor} />
        );

    return (
        <div
            className={[
                'fr-pipeline__dot',
                onClick ? 'fr-pipeline__dot--clickable' : '',
            ].filter(Boolean).join(' ')}
            style={{
                width: tok.dotSize,
                height: tok.dotSize,
                background: st.dotBg,
                borderColor: st.dotBorder,
                color: st.dotColor,
            }}
            onClick={onClick}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
            role={onClick ? 'button' : undefined}
            aria-label={`${STAGE_LABELS[stage.stage]}: ${stage.status}`}
        >
            {dotContent}
            {isActive && animated && (
                <span className="fr-pipeline__pulse" aria-hidden="true" />
            )}
        </div>
    );
};

/**
 * Stage content renderer
 */
interface StageContentProps {
    stage: PipelineStageMeta;
    tok: SizeTokens;
    variant: PipelineVariant;
    orientation: PipelineOrientation;
}

const StageContent: React.FC<StageContentProps> = ({ stage, tok, variant, orientation }) => {
    const st = STATUS_TOKENS[stage.status];

    return (
        <div className="fr-pipeline__content">
            {/* Label */}
            <span
                className="fr-pipeline__label"
                style={{ fontSize: tok.labelSize, color: st.labelColor }}
            >
                {stage.label ?? STAGE_LABELS[stage.stage]}
            </span>

            {/* Timestamps - default + detailed */}
            {variant !== 'minimal' && (
                <div className="fr-pipeline__meta" style={{ fontSize: tok.metaSize }}>
                    {stage.status === 'done' && stage.completedAt && (
                        <Timestamp value={stage.completedAt} format="compact" size="xs" />
                    )}
                    {stage.status === 'active' && stage.enteredAt && (
                        <Timestamp value={stage.enteredAt} format="relative" size="xs" icon />
                    )}
                    {(stage.status === 'pending' || stage.status === 'skipped') && (
                        <span style={{ color: '#B4B2A9' }}>-</span>
                    )}
                    {stage.status === 'exception' && (
                        <StatusBadge status="exception" size="sm" iconMode="dot" />
                    )}
                </div>
            )}

            {/* Note + actor - detailed only */}
            {variant === 'detailed' && stage.note && (
                <span className="fr-pipeline__note" style={{ fontSize: tok.noteSize }}>
                    {stage.note}
                </span>
            )}
            {variant === 'detailed' && stage.actor && (
                <span className="fr-pipeline__actor">
                    {stage.actor}
                </span>
            )}
        </div>
    );
};

/**
 * Component
 */
export const FulfillmentPipeline: React.FC<FulfillmentPipelineProps> = ({
    stages: stagesProp,
    activeStage,
    orderId,
    orientation = 'horizontal',
    size = 'md',
    variant = 'default',
    animated = true,
    onStageClick,
    className,
    style,
}) => {
    React.useEffect(() => { ensureStyles(); }, []);

    const tok = SIZE_TOKENS[size];

    // Resolve stages
    const stages: PipelineStageMeta[] =
        stagesProp ??
        (activeStage ? deriveStages(activeStage) : deriveStages('received'));

    // Active stage index (for connector coloring)
    const activeIdx = stages.findIndex(s => s.status === 'active');

    const isHorizontal = orientation === 'horizontal';

    return (
        <div
            className={[
                'fr-pipeline',
                isHorizontal ? 'fr-pipeline--h' : 'fr-pipeline--v',
                className ?? '',
            ].filter(Boolean).join(' ')}
            style={{
                '--conn-w': `${tok.connectorW}px`,
                padding: variant === 'minimal' ? 0 : tok.padding,
                ...style,
            } as React.CSSProperties}
            role="list"
            aria-label={`Fulfillment pipeline${orderId ? ` for order ${orderId}` : ''}`}
        >
            {/* Optional header (detailed variant) */}
            {variant === 'detailed' && orderId && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tok.gap * 2,
                    width: '100%',
                    paddingBottom: tok.gap,
                    borderBottom: '1px solid rgba(60,60,58,0.08)',
                }}>
                    <SectionLabel size="xs">Order pipeline</SectionLabel>
                    <MonoID id={orderId} variant="order" size="xs" copyable={false} />
                </div>
            )}

            {stages.map((stage, i) => {
                const isLast = i === stages.length - 1;
                const connDone = i < activeIdx;
                const connPartial = i === activeIdx;
                const connColor = 
                    connDone ? STATUS_TOKENS.done.connColor :
                    connPartial ? STATUS_TOKENS.active.connColor :
                    STATUS_TOKENS.pending.connColor;

                return (
                    <div
                        key={stage.stage}
                        className="fr-pipeline__step"
                        role="listitem"
                        aria-current={stage.status === 'active' ? 'step' : undefined}
                    >
                        {/* Track (dot + connector) */}
                        <div className="fr-pipeline__track">
                            {/* Left/top connector (not on first item) */}
                            {isHorizontal && i > 0 && (
                                <div
                                    className="fr-pipeline__connector"
                                    style={{ background: STATUS_TOKENS[stages[i - 1]!.status].connColor }}
                                    aria-hidden="true"
                                />
                            )}

                            <div className="fr-pipeline__dot-wrap">
                                <Dot
                                    stage={stage}
                                    tok={tok}
                                    variant={variant}
                                    animated={animated}
                                    onClick={onStageClick ? () => onStageClick(stage.stage) : undefined}
                                />
                            </div>

                            {/* Right/bottom connector (not on last item) */}
                            {!isLast && (
                                <div
                                    className="fr-pipeline__connector"
                                    style={{ background: connColor}}
                                    aria-hidden="true"
                                />
                            )}

                            {/* Vertical: connector continues below dot */}
                            {!isHorizontal && !isLast && (
                                <div
                                    className="fr-pipeline__connector"
                                    style={{ background: connColor }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        {/* Content below dot (horizontal) or beside track (vertical) */}
                        {variant !== 'minimal' && (
                            <StageContent
                                stage={stage}
                                tok={tok}
                                variant={variant}
                                orientation={orientation}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

FulfillmentPipeline.displayName = 'FulfillmentPipeline';

export default FulfillmentPipeline;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Shorthand (activeStage only) ---
<FulfillmentPipeline activeStage="picking" />
 
// --- Full stage control ---
<FulfillmentPipeline
  stages={[
    { stage: 'received',   status: 'done',   completedAt: '2026-05-28T07:00:00Z', actor: 'System' },
    { stage: 'allocated',  status: 'done',   completedAt: '2026-05-28T07:05:00Z', actor: 'System' },
    { stage: 'picking',    status: 'active', enteredAt:   '2026-05-28T07:30:00Z', actor: 'Jamie Lee', note: 'Zone B — 3 items' },
    { stage: 'packing',    status: 'pending' },
    { stage: 'dispatched', status: 'pending' },
  ]}
/>
 
// --- With exception ---
<FulfillmentPipeline
  stages={[
    { stage: 'received',   status: 'done'      },
    { stage: 'allocated',  status: 'done'      },
    { stage: 'picking',    status: 'exception', note: 'SKU-00412 out of stock' },
    { stage: 'packing',    status: 'pending'   },
    { stage: 'dispatched', status: 'pending'   },
  ]}
/>
 
// --- Variants ---
<FulfillmentPipeline activeStage="packing" variant="minimal"  />   // dots + labels only
<FulfillmentPipeline activeStage="packing" variant="default"  />   // + timestamps (default)
<FulfillmentPipeline activeStage="packing" variant="detailed" />   // + notes, actors
 
// --- Orientations ---
<FulfillmentPipeline activeStage="picking" orientation="horizontal" />   // default
<FulfillmentPipeline activeStage="picking" orientation="vertical"   />   // audit trail style
 
// --- Sizes ---
<FulfillmentPipeline activeStage="picking" size="sm" />   // compact cards, table rows
<FulfillmentPipeline activeStage="picking" size="md" />   // default
<FulfillmentPipeline activeStage="picking" size="lg" />   // order detail drawer header
 
// --- With order ID header (detailed) ---
<FulfillmentPipeline
  activeStage="picking"
  orderId="#FR-48291"
  variant="detailed"
  orientation="vertical"
/>
 
// --- Disable pulse animation ---
<FulfillmentPipeline activeStage="picking" animated={false} />
 
// --- Clickable stages (navigate to stage detail) ---
<FulfillmentPipeline
  activeStage="picking"
  onStageClick={(stage) => openStageDetail(stage)}
/>
 
// --- Skipped stage (e.g. digital goods bypass picking + packing) ---
<FulfillmentPipeline
  stages={[
    { stage: 'received',   status: 'done'    },
    { stage: 'allocated',  status: 'done'    },
    { stage: 'picking',    status: 'skipped', label: 'Pick (N/A)' },
    { stage: 'packing',    status: 'skipped', label: 'Pack (N/A)' },
    { stage: 'dispatched', status: 'active'  },
  ]}
/>
 
// --- In an order table row (minimal, sm) ---
<td>
  <FulfillmentPipeline
    activeStage={order.stage}
    size="sm"
    variant="minimal"
    animated={false}
  />
</td>
 
// --- In an order detail drawer header ---
<FulfillmentPipeline
  stages={order.pipelineStages}
  orderId={order.id}
  size="lg"
  variant="detailed"
  orientation="horizontal"
  onStageClick={(stage) => scrollToSection(stage)}
/>
 
// --- In the dashboard (compact, horizontal, no animation) ---
<FulfillmentPipeline
  activeStage="packing"
  size="sm"
  variant="default"
  animated={false}
/>
 
*/