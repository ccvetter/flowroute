import React from 'react';

/**
 * Types
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerIntent = 'brand' | 'white' | 'muted' | 'danger' | 'success';

export interface SpinnerProps {
    /** Named size preset. Defaults to 'sm'. */
    size?: SpinnerSize;
    /** Explicit pixel size - overrides `size` preset. */
    px?: number;
    /** Color intent. Defaults to 'brand'. */
    intent?: SpinnerIntent;
    /** Explicit track color override. */
    trackColor?: string;
    /** Explicit spinner arc color override. */
    color?: string;
    /** Label announced to screen readers. Defaults to 'Loading...' */
    label?: string;
    /** Additional styles on the root element. */
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Tokens
 */
const SIZE_PX: Record<SpinnerSize, number> = {
    xs: 10,
    sm: 14,
    md: 20,
    lg: 28,
    xl: 40,
};

// [track, arc]
const INTENT_COLORS: Record<SpinnerIntent, [string, string]> = {
    brand:    ['rgba(186,117,23,0.20)',  '#BA7517'],
    white:    ['rgba(255,255,255,0.25)', '#FFFFFF'],
    muted:    ['rgba(60,60,58,0.12)',    '#888780'],
    danger:   ['rgba(216,90,48,0.18)',   '#D85A30'],
    success:  ['rgba(15,110,86,0.18)',   '#0F6E56'],
};

const STROKE_WIDTH: Record<SpinnerSize, number> = {
    xs: 1.5,
    sm: 1.75,
    md: 2,
    lg: 2.5,
    xl: 3,
};

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-spinner';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        @keyframes fr-spin {
            to { transform: rotate(360deg); }
        }
        .fr-spinner {
            animation: fr-spin 0.7s linear infinite;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
    (
        {
            size = 'sm',
            px,
            intent = 'brand',
            trackColor,
            color,
            label = 'Loading...',
            style,
            className,
        },
        ref,
    ) => {
        React.useEffect(() => { ensureStyles(); }, []);

        const diameter = px ?? SIZE_PX[size];
        const radius = (diameter - 2) / 2; // leave 1px each side for stroke
        const strokeW = STROKE_WIDTH[size] ?? 2;
        const [track, arc] = INTENT_COLORS[intent];
        const resolvedTrack = trackColor ?? track;
        const resolvedArc = color ?? arc;

        // Arc covers ~75% of the circle
        const circumference = 2 * Math.PI * radius;
        const dashArray = `${circumference * 0.75} ${circumference * 0.25}`;

        return (
            <svg
                ref={ref}
                className={['fr-spinner', className].filter(Boolean).join(' ')}
                width={diameter}
                height={diameter}
                viewBox={`0 0 ${diameter} ${diameter}`}
                fill="none"
                aria-label={label}
                role="status"
                style={style}
            >
                {/* Track - full circle, low opacity */}
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={resolvedArc}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    strokeDasharray={dashArray}
                    strokeDashoffset={0}
                    transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
                />
            </svg>
        );
    },
);

Spinner.displayName = 'Spinner';

export default Spinner;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Sizes ---
<Spinner size="xs" />
<Spinner size="sm" />    // default — used inside buttons
<Spinner size="md" />    // used in cards, list skeletons
<Spinner size="lg" />    // used in full-panel loading states
<Spinner size="xl" />    // used in full-page loading screens
 
// --- Explicit pixel size (matches arbitrary icon sizes) ---
<Spinner px={18} />
 
// --- Intents ---
<Spinner intent="brand"   />   // amber — default
<Spinner intent="white"   />   // on dark/filled backgrounds (primary button)
<Spinner intent="muted"   />   // neutral loading
<Spinner intent="danger"  />   // in error/exception states
<Spinner intent="success" />   // teal — completing / confirming
 
// --- Custom colors ---
<Spinner color="#6B4FA0" trackColor="rgba(107,79,160,0.15)" />
 
// --- Custom aria label ---
<Spinner label="Saving order…" />
 
// --- Inside a loading button (white on amber) ---
<ActionButton intent="primary" loading>
  Assign pick
</ActionButton>
// ActionButton passes intent="white" to Spinner automatically
 
// --- Full-panel loading state ---
<div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:48 }}>
  <Spinner size="lg" />
  <p>Loading orders…</p>
</div>
 
*/
