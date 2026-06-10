import React from 'react';

/**
 * Types
 */
export type PackageIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PackageIconVariant = 
    | 'outline'  // default - clean stroke icon
    | 'filled'   // solid fill with cutout details
    | 'duotone'; // two-tone: filled body + lighter lid/stripe

export type PackageIconState =
    | 'default'
    | 'open'      // lid ajar - used for "unpacked" or "received" states
    | 'sealed'    // tape stripe across center - used for "packed" / "ready"
    | 'exception' // exclamation badge - used for "exception" order state
    | 'delivered' // checkmark badge - used for "delivered" state
    | 'transit';  // motion lines - used for "shipped" / "in transit"

export interface PackageIconProps {
    /** Named size preset. Defaults to 'md'. */
    size?: PackageIconSize;
    /** Explicit pixel override - overrides `size`. */
    px?: number;
    /** Icon drawing style. Defaults to 'outline'. */
    variant?: PackageIconVariant;
    /** Semantic state - changes the icon detail. Defaults to 'default'. */
    state?: PackageIconState;
    /** Stroke / fill color. Defaults to 'currentColor'. */
    color?: string;
    /** Second color used in duotone variant for the lid / stripe. */
    secondaryColor?: string;
    /** Accessible label. Defaults to a state-aware string. */
    label?: string;
    /** Hide from assistive technology (when icon is decorative). Defaults to false. */
    decorative?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
const SIZE_PX: Record<PackageIconSize, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

const DEFAULT_LABELS: Record<PackageIconState, string> = {
    default:   'Package',
    open:      'Package open',
    sealed:    'Package sealed',
    exception: 'Package exception',
    delivered: 'Package delivered',
    transit:   'Package in transit',
};

// Stoke width scales with icon size
function strokeWidth(px: number): number {
    if (px <= 12) return 1.25;
    if (px <= 16) return 1.5;
    if (px <= 24) return 1.75;

    return 2;
}

/**
 * Sub-renderers - each draws into a 24x24 window
 */
interface DrawProps {
    color: string;
    secondary: string;
    sw: number;  // strokeWidth
    variant: PackageIconVariant;
}

/**
 * Shared geometry constants (24x24 grid)
 * Box body:   (3, 11) -> (21, 21)
 * Lid left:   (3, 11) -> (12, 6)
 * Lid right:  (12, 6) -> (21, 11)
 * Center seam: x=12, y=6 to y=11
 */

function DrawDefault({ color, secondary, sw, variant }: DrawProps) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    const detailOpacity = variant === 'filled' ? 0 : 1;
 
    return (
        <g>
        {/* Box body */}
        <path
            d="M3 11h18v10H3z"
            fill={fill}
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
        />
        {/* Lid — left panel */}
        <path
            d="M3 11 L12 6 L21 11"
            fill={lidFill}
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
        />
        {/* Centre seam */}
        <line x1="12" y1="6" x2="12" y2="11" stroke={color} strokeWidth={sw} opacity={detailOpacity} />
        {/* Horizontal centre stripe on body */}
        <line x1="3" y1="15" x2="21" y2="15" stroke={variant === 'duotone' ? secondary : color} strokeWidth={sw * 0.75} opacity={variant === 'filled' ? 0 : 0.45} strokeDasharray="0" />
        </g>
    );
}

function DrawOpen({ color, secondary, sw, variant }: DrawProps) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : 'none';

    return (
        <g>
            {/* Box body */}
            <path
                d="M3 13h18v8H3z"
                fill={fill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {/* Open lid - left flap, rotated back */}
            <path
                d="M3 13 L10 7 L12 8"
                fill={lidFill}
                stroke={color}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Open lid - right flap, rotated back */}
            <path
                d="M21 13 L14 7 L12 8"
                fill={lidFill}
                stroke={color}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Inside shadow line */}
            <line x1="3" y1="13" x2="21" y2="13" stroke={color} strokeWidth={sw} opacity={0.3} />
        </g>
    );
}

function DrawSealed({ color, secondary, sw, variant }: DrawProps) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    const tapeFill = variant === 'outline' ? 'none' : secondary;
    const tapeStroke = variant === 'outline' ? color : secondary;

    return (
        <g>
            {/* Box body */}
            <path
                d="M3 11h18v10H3z"
                fill={fill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {/* Lid */}
            <path
                d="M3 11 L12 6 L21 11"
                fill={lidFill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {/* Tape strip - runs from lid down across seam */}
            <rect
                x="10" y="7" width="4" height="8"
                rx="0.5"
                fill={tapeFill}
                stroke={tapeStroke}
                strokeWidth={sw * 0.75}
                opacity={0.85}
            />
        </g>
    );
}

function DrawException({ color, secondary, sw, variant }: DrawProps) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;

    return (
        <g>
            {/* Box - slightly shifted left to make room for badge */}
            <path
                d="M2 12h15v9H2z"
                fill={fill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            <path
                d="M2 12 L9.5 7.5 L17 12"
                fill={lidFill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {/* Exception badge - top-right */}
            <circle cx="18.5" cy="6.5" r="4" fill="#D85A30" />
            <line x1="18.5" y1="4.5" x2="18.5" y2="7" stroke="white" strokeWidth={sw * 0.9} strokeLinecap="round" />
            <circle cx="18.5" cy="8.5" r="0.7" fill="white" />
        </g>
    );
}

function DrawDelivered({ color, secondary, sw, variant }: DrawProps) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;

    return (
        <g>
            {/* Box - slightly shifted left */}
            <path
                d="M2 12h15v9H2z"
                fill={fill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            <path
                d="M2 12 L9.5 7.5 L17 12"
                fill={lidFill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {/* Delivered badge - top-right */}
            <circle cx="18.5" cy="6.5" r="4" fill="#0F6E56" />
            <path
                d="M16.5 6.5 L18 8 L20.5 5"
                stroke="white"
                strokeWidth={sw * 0.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </g>
    );
}

function DrawTransit({ color, secondary, sw, variant }: DrawProps) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;

    return (
        <g>
            {/* Motion lines - left side */}
            <line x1="1" y1="9" x2="4" y2="9" stroke={color} strokeWidth={sw * 0.85} strokeLinecap="round" opacity={0.5} />
            <line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth={sw * 0.85} strokeLinecap="round" opacity={0.3} />
            <line x1="1" y1="15" x2="4" y2="15" stroke={color} strokeWidth={sw * 0.85} strokeLinecap="round" opacity={0.5} />
            {/* Box - shifted right */}
            <path
                d="M6 12h16v9H6z"
                fill={fill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            <path
                d="M6 12 L14 7 L22 12"
                fill={lidFill}
                stroke={color}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {/* Center seam */}
            <line x1="14" y1="7" x2="14" y2="12" stroke={color} strokeWidth={sw} opacity={0.4} />
        </g>
    );
}

/**
 * Component
 */
export const PackageIcon = React.forwardRef<SVGSVGElement, PackageIconProps>(
    (
        {
            size = 'md',
            px,
            variant = 'outline',
            state = 'default',
            color = 'currentColor',
            secondaryColor,
            label,
            decorative = false,
            className,
            style,
        },
        ref,
    ) => {
        const diameter = px ?? SIZE_PX[size];
        const sw = strokeWidth(diameter);

        // Default secondary color per variant
        const resolvedSecondary =
            secondaryColor ??
            (variant === 'duotone' ? 'rgba(186,117,23,0.25)' : color);

        const drawProps: DrawProps = {
            color,
            secondary: resolvedSecondary,
            sw,
            variant,
        };

        const resolvedLabel = label ?? DEFAULT_LABELS[state];

        const stateDrawers: Record<PackageIconState, React.ReactNode> = {
            default:   <DrawDefault    {...drawProps} />,
            open:      <DrawOpen       {...drawProps} />,
            sealed:    <DrawSealed     {...drawProps} />,
            exception:  <DrawException {...drawProps} />,
            delivered:  <DrawDelivered {...drawProps} />,
            transit:    <DrawTransit   {...drawProps} />,
        };

        return (
            <svg
                ref={ref}
                width={diameter}
                height={diameter}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                style={{ flex: 0, ...style }}
                aria-label={decorative ? undefined : resolvedLabel}
                aria-hidden={decorative ? true : undefined}
                role={decorative ? undefined : 'img'}
            >
                {stateDrawers[state]}
            </svg>
        );
    },
);

PackageIcon.displayName = 'PackageIcon';

export default PackageIcon;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- States ---
<PackageIcon state="default"   />
<PackageIcon state="open"      />   // received, unpacked
<PackageIcon state="sealed"    />   // packed, ready to ship
<PackageIcon state="transit"   />   // shipped, in transit
<PackageIcon state="delivered" />   // delivered — green badge
<PackageIcon state="exception" />   // exception — coral badge
 
// --- Variants ---
<PackageIcon variant="outline"  />   // default — stroke only
<PackageIcon variant="filled"   />   // solid fill
<PackageIcon variant="duotone"  />   // two-tone body + amber lid
 
// --- Sizes ---
<PackageIcon size="xs" />   // 12px — inline text icons
<PackageIcon size="sm" />   // 16px — table rows, badges
<PackageIcon size="md" />   // 20px — default
<PackageIcon size="lg" />   // 24px — card headers, nav
<PackageIcon size="xl" />   // 32px — empty states, hero
 
// --- Explicit px ---
<PackageIcon px={40} />
 
// --- Colors ---
<PackageIcon color="#0F6E56" />
<PackageIcon variant="duotone" color="#3C3C3A" secondaryColor="rgba(186,117,23,0.2)" />
 
// --- Decorative (hidden from screen readers) ---
<PackageIcon decorative />
 
// --- Custom label ---
<PackageIcon state="transit" label="Order #FR-48291 in transit" />
 
// --- Inside ActionButton ---
<ActionButton intent="primary" icon={<PackageIcon size="sm" decorative />}>
  Assign pick
</ActionButton>
 
// --- Inside StatusBadge (paired) ---
<span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
  <PackageIcon state="delivered" size="sm" color="#0F6E56" decorative />
  <StatusBadge status="delivered" iconMode="none" />
</span>
 
// --- Empty state illustration ---
<PackageIcon size="xl" variant="duotone" state="open" color="#B4B2A9" secondaryColor="rgba(136,135,128,0.15)" />
 
*/