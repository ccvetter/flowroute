import React from 'react';

/**
 * Types
 */
export type ChevronDirection = 'right' | 'left' | 'up' | 'down';
export type ChevronSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ChevronWeight = 'light' | 'regular' | 'bold';

export interface ChevronRightIconProps {
    /** Direction the chevron points. Defaults to 'right'. */
    direction?: ChevronDirection;
    /** Named size preset. Defaults to 'md'. */
    size?: ChevronSize;
    /** Explicit pixel override - overrides `size`. */
    px?: number;
    /** Stroke weight. Defaults to 'regular'. */
    weight?: ChevronWeight;
    /** Stroke color. Defaults to 'currentColor'. */
    color?: string;
    /**
     * Animate rotation when `direction` changes.
     * Useful for expand/collapse toggles. Defaults to false.
     */
    animated?: boolean;
    /** Accessible label. Set when icon is not decorative. */
    label?: string;
    /** Hide from assistive technology when purely decorative. Defaults to true. */
    decorative?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
const SIZE_PX: Record<ChevronSize, number> = {
    xs: 10,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
};

const STROKE_WIDTH: Record<ChevronWeight, number> = {
    light: 1.25,
    regular: 1.75,
    bold: 2.5,
};

// CSS rotation per direction
const DIRECTION_DEG: Record<ChevronDirection, number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
};

const DEFAULT_LABELS: Record<ChevronDirection, string> = {
    right: 'Next',
    left: 'Previous',
    up: 'Collapse',
    down: 'Expand',
};

/**
 * Style injection (animation)
 */
const STYLE_ID = 'flowroute-chevron';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-chevron {
            flex-shrink: 0;
            display: inline-block;
        }
        .fr-chevron--animated {
            transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
}

/**
 * Component
 */
export const ChevronRightIcon = React.forwardRef<SVGSVGElement, ChevronRightIconProps>(
    (
        {
            direction = 'right',
            size = 'md',
            px,
            weight = 'regular',
            color = 'currentColor',
            animated = false,
            label,
            decorative = true,
            className,
            style,
        },
        ref,
    ) => {
        React.useEffect(() => { ensureStyles(); }, []);

        const diameter = px ?? SIZE_PX[size];
        const sw = STROKE_WIDTH[weight];
        const rotateDeg = DIRECTION_DEG[direction];
        const resolvedLabel = label ?? DEFAULT_LABELS[direction];

        const classes = [
            'fr-chevron',
            animated ? 'fr-chevron--animated' : '',
            className ?? '',
        ].filter(Boolean).join(' ');

        const computedStyle: React.CSSProperties = {
            transform: `rotate(${rotateDeg}deg)`,
            ...style,
        };

        return (
            <svg
                ref={ref}
                width={diameter}
                height={diameter}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={classes}
                style={computedStyle}
                aria-label={decorative ? undefined : resolvedLabel}
                aria-hidden={decorative ? true : undefined}
                role={decorative ? undefined : 'img'}
            >
                <path
                    d="M6 3.5L10.5 8L6 12.5"
                    stroke={color}
                    strokeWidth={sw}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    },
);

ChevronRightIcon.displayName = 'ChevronRightIcon';

/**
 * Convenience re-exports for explicit directional usage
 */
export const ChevronLeftIcon = React.forwardRef<SVGSVGElement, Omit<ChevronRightIconProps, 'direction'>>(
    (props, ref) => <ChevronRightIcon ref={ref} {...props} direction="left" />
);
ChevronLeftIcon.displayName = 'ChevronLeftIcon';

export const ChevronUpIcon = React.forwardRef<SVGSVGElement, Omit<ChevronRightIconProps, 'direction'>>(
    (props, ref) => <ChevronRightIcon ref={ref} {...props} direction="up" />
);
ChevronUpIcon.displayName = 'ChevronUpIcon';

export const ChevronDownIcon = React.forwardRef<SVGSVGElement, Omit<ChevronRightIconProps, 'direction'>>(
    (props, ref) => <ChevronRightIcon ref={ref} {...props} direction="down" />
);
ChevronDownIcon.displayName = 'ChevronDownIcon';

export default ChevronRightIcon;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Directions ---
<ChevronRightIcon direction="right" />   // default
<ChevronRightIcon direction="left"  />
<ChevronRightIcon direction="up"    />
<ChevronRightIcon direction="down"  />
 
// --- Named convenience exports ---
<ChevronRightIcon />
<ChevronLeftIcon  />
<ChevronUpIcon    />
<ChevronDownIcon  />
 
// --- Sizes ---
<ChevronRightIcon size="xs" />   // 10px — inside badges, tight rows
<ChevronRightIcon size="sm" />   // 14px — table row affordance
<ChevronRightIcon size="md" />   // 16px — default, nav items
<ChevronRightIcon size="lg" />   // 20px — section headers
<ChevronRightIcon size="xl" />   // 24px — hero / page-level
 
// --- Weight ---
<ChevronRightIcon weight="light"   />   // 1.25px — airy, secondary UI
<ChevronRightIcon weight="regular" />   // 1.75px — default
<ChevronRightIcon weight="bold"    />   // 2.5px  — strong affordance
 
// --- Animated expand/collapse toggle ---
const [open, setOpen] = React.useState(false);
<button onClick={() => setOpen(o => !o)}>
  Details
  <ChevronRightIcon
    direction={open ? 'up' : 'down'}
    animated
    size="sm"
    decorative
  />
</button>
 
// --- Inside ActionButton (trailing icon) ---
<ActionButton
  intent="secondary"
  icon={<ChevronRightIcon size="sm" decorative />}
  iconPosition="right"
>
  View order
</ActionButton>
 
// --- Inside a table row drill-down ---
<td className="col-actions">
  <ChevronRightIcon size="sm" color="#888780" decorative />
</td>
 
// --- Non-decorative (pagination) ---
<button aria-label="Next page">
  <ChevronRightIcon decorative={false} direction="right" label="Next page" />
</button>
 
// --- Sidebar nav item ---
<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
  <span>Fulfillment</span>
  <ChevronRightIcon size="xs" color="#888780" decorative />
</div>
 
*/
 