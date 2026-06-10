// Initials circle for user/assignee display
import React from 'react';

/**
 * Types
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type AvatarColor =
    | 'amber'  // Default - brand color
    | 'teal'
    | 'coral'
    | 'purple'
    | 'slate'
    | 'green';

export type AvatarStatus =
    | 'online'  // green dot - active / logged in
    | 'away'    // amber dot - idle
    | 'busy'    // coral dot - do not disturb
    | 'offline'; // gray dot - not connected

export type AvatarShape = 'circle' | 'rounded';

export interface AvatarBadgeProps {
    /**
     * Display name used to derive initials and as the accessible label.
     * Required unless `src` is provided with an explicit `alt`.
     */
    name?: string;
    /** Avatar image URL. Falls back to initials when omitted or on error. */
    src?: string;
    /** Alt text for the image. Defaults to `name`. */
    alt?: string;
    /** Named size preset. Defaults to 'md'. */
    size?: AvatarSize;
    /** Explicit pixel override - overrides `size` */
    px?: number;
    /* Initials background color. Defaults to 'amber'. Auto-assigned from name if 'auto'. */
    color?: AvatarColor | 'auto';
    /** Shape of the avatar. Defaults to 'circle'. */
    shape?: AvatarShape;
    /**
     * Presence indicator dot shown at the bottom right.
     * Omit to show no indicator.
     */
    status?: AvatarStatus;
    /**
     * Override the initials derived from 'name'.
     * Useful for system actors ("SY") or role abbreviations ("WH").
     */
    initials?: string;
    /**
     * Stack mode - applies a negative left margin and a ring border.
     * Used inside AvatarGroup.
     */
    stacked?: boolean;
    /** Ring border color in stacked mode. Defaults to white */
    ringColor?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

export interface AvatarGroupProps {
    children: React.ReactNode;
    /** 
     * Maximum avatars to show before collapsing into a "+N" overflow badge.
     * Defaults to 4.
     */
    max?: number;
    /** Size passed to all child Avatar and overflow badges. Defaults to 'sm' */
    size?: AvatarSize;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
const SIZE_PX: Record<AvatarSize, number> = {
    xs: 20,
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
};

const FONT_SIZE: Record<AvatarSize, string> = {
    xs: '9px',
    sm: '11px',
    md: '13px',
    lg: '16px',
    xl: '20px',
};

const STATUS_DOT_SIZE: Record<AvatarSize, number> = {
    xs: 5,
    sm: 7,
    md: 9,
    lg: 11,
    xl: 13,
};

// [background, text]
const COLOR_TOKENS: Record<AvatarColor, [string, string]> = {
    amber:  ['#FAEEDA', '#633806'],
    teal:   ['#E1F5EE', '#085041'],
    coral:  ['#FAECE7', '#712B13'],
    purple: ['#EDE8F5', '#3D2273'],
    slate:  ['#ECEAE3', '#3C3C3A'],
    green:  ['#EAF3DE', '#27500A'],
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
    online:  '#1D9E75',
    away:    '#BA7517',
    busy:    '#D85A30',
    offline: '#B4B2A9',
};

const STATUS_LABELS: Record<AvatarStatus, string> = {
    online:  'Online',
    away:    'Away',
    busy:    'Busy',
    offline: 'Offline',
};

// Deterministic color assignment from name string
const COLOR_SEQUENCE: AvatarColor[] = ['amber', 'teal', 'coral', 'purple', 'slate', 'green'];

function colorFromName(name: string): AvatarColor {
    const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = code % COLOR_SEQUENCE.length;
    return COLOR_SEQUENCE[index]!;
}

// Derive up to 2 initials from a display name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const [first] = parts;
  const last = parts[parts.length - 1];
  if (parts.length === 1) return (first ?? '?').slice(0, 2).toUpperCase();
  return ((first?.[0] ?? '?') + (last?.[0] ?? '')).toUpperCase();
}

function borderRadius(shape: AvatarShape, px: number): string {
    return shape === 'circle' ? '50%' : `${Math.round(px * 0.22)}px`;
}

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-avatar';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-avatar {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            user-select: none;
            overflow: visible;
        }
        .fr-avatar--clickable {
            cursor: pointer;
        }
        .fr-avatar--clickable:hover .fr-avatar__img,
        .fr-avatar--clickable:hover .fr-avatar__initials {
            filter: brightness(0.92);
        }
        .fr-avatar--clickable:focus-visible {
            outline: none;
        }
        .fr-avatar--clickable:focus-visible .fr-avatar__img,
        .fr-avatar--clickable:focus-visible .fr-avatar__initials {
            box-shadow: 0 0 0 3px rgba(186, 117, 23, 0.35);
        }
        .fr-avatar__img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .fr-avatar__initials {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            letter-spacing: 0.02em;
        }
        .fr-avatar__status {
            position: absolute;
            bottom: 0;
            right: 0;
            border-style: solid;
            border-color: white;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .fr-avatar-group {
            display: inline-flex;
            align-items: center;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(
    (
        {
            name,
            src,
            alt,
            size = 'md',
            px,
            color = 'auto',
            shape = 'circle',
            status,
            initials: initialsProp,
            stacked = false,
            ringColor = '#FFFFFF',
            className,
            style,
            onClick,
        },
        ref,
    ) => {
        const [imgError, setImgError] = React.useState(false);

        React.useEffect(() => { ensureStyles(); }, []);
        // Reset error state when src changes
        React.useEffect(() => { setImgError(false); }, [src]);

        const diameter = px ?? SIZE_PX[size];
        const fontSize = FONT_SIZE[size];
        const dotSize = STATUS_DOT_SIZE[size];
        const dotBorder = Math.max(1, Math.round(dotSize * 0.22));
        const radius = borderRadius(shape, diameter);

        // Color resolution
        const resolvedColor: AvatarColor =
            color === 'auto' ? colorFromName(name ?? 'User') : color;

        const [bg, fg] = COLOR_TOKENS[resolvedColor];

        // Initials
        const resolvedInitials = initialsProp ?? (name ? getInitials(name) : '?');

        // Accessible label
        const ariaLabel = [
            alt ?? name ?? 'User avatar',
            status ? `- ${STATUS_LABELS[status]}` : '',
        ]
            .filter(Boolean)
            .join(' ');

        // Stacking ring
        const stackStyle: React.CSSProperties = stacked
            ? {
                marginLeft: `-${Math.round(diameter * 0.25)}px`,
                boxShadow: `0 0 0 ${Math.max(1.5, Math.round(diameter * 0.05))}px ${ringColor}`,
                borderRadius: radius,
              }
            : {};
        
        const showImage = src && !imgError;

        const rootStyle: React.CSSProperties = {
            width: diameter,
            height: diameter,
            borderRadius: radius,
            fontSize,
            ...stackStyle,
            ...style,
        };

        return (
            <span
                ref={ref}
                className={[
                    'fr-avatar',
                    onClick ? 'fr-avatar--clickable' : '',
                    className ?? '',
                ]
                    .filter(Boolean)
                    .join(' ' )}
                style={rootStyle}
                aria-label={ariaLabel}
                role={onClick ? 'button' : 'img'}
                tabIndex={onClick ? 0 : undefined}
                onClick={onClick}
                onKeyDown={
                    onClick
                        ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as never); }
                        : undefined
                }
            >
                {/* Image layer */}
                {showImage ? (
                    <img
                        src={src}
                        alt={alt ?? name ?? 'Avatar'}
                        className="fr-avatar__img"
                        style={{ borderRadius: radius }}
                        onError={() => setImgError(true)}
                        draggable={false}
                    />
                ) : (
                    /* Initials fallback */
                    <span
                        className="fr-avatar__initials"
                        style={{
                            background: bg,
                            color: fg,
                            borderRadius: radius,
                        }}
                        aria-hidden="true"
                    >
                        {resolvedInitials}
                    </span>
                )}

                {/* Status indicator */}
                {status && (
                    <span
                        className="fr-avatar__status"
                        style={{
                            width: dotSize,
                            height: dotSize,
                            background: STATUS_COLORS[status],
                            borderWidth: dotBorder,
                        }}
                        aria-hidden="true" // already conveyed in root aria-label
                    />
                )}
            </span>
        );
    },
);

AvatarBadge.displayName = 'AvatarBadge';

/**
 * AvatarGroup component for stacking multiple AvatarBadge with overflow handling
 */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
    children,
    max = 4,
    size = 'sm',
    className,
    style,
}) => {
    React.useEffect(() => { ensureStyles(); }, []);

    const allChildren = React.Children.toArray(children).filter(React.isValidElement);
    const visible = allChildren.slice(0, max);
    const overflow = allChildren.length - max;

    const diameter = SIZE_PX[size];
    const fontSize = FONT_SIZE[size];

    return (
        <span
            className={['fr-avatar-group', className].filter(Boolean).join(' ')}
            style={style}
            role="group"
            aria-label={`${allChildren.length} assignee${allChildren.length === 1 ? '' : 's'}`}
        >
            {visible.map((child, i) => 
                React.cloneElement(child as React.ReactElement<AvatarBadgeProps>, {
                    key: i,
                    size,
                    stacked: i > 0,
                }),
            )}

            {overflow > 0 && (
                <span
                    aria-label={`${overflow} more`}
                    style={{
                        display:        'inline-flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        width:          diameter,
                        height:         diameter,
                        borderRadius:   '50%',
                        background:     '#ECEAE3',
                        color:          '#5F5E5A',
                        fontSize,
                        fontFamily:     "'IBM Plex Mono', monospace",
                        fontWeight:     500,
                        marginLeft:     `-${Math.round(diameter * 0.25)}px`,
                        boxShadow:      '0 0 0 2px #FFFFFF',
                        flexShrink:     0,
                        userSelect:    'none',
                    }}
                >
                    +{overflow}
                </span>
            )}
        </span>
    );
};

AvatarGroup.displayName = 'AvatarGroup';

export default AvatarBadge;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Name-based initials (color auto-assigned from name) ---
<AvatarBadge name="Jamie Lee"     />   // → "JL", deterministic color
<AvatarBadge name="Chris Okafor"  />   // → "CO", different color
<AvatarBadge name="Warehouse Ops" />   // → "WO"
 
// --- Explicit color ---
<AvatarBadge name="Jamie Lee" color="teal"   />
<AvatarBadge name="Jamie Lee" color="coral"  />
<AvatarBadge name="Jamie Lee" color="purple" />
 
// --- Image with initials fallback ---
<AvatarBadge name="Jamie Lee" src="https://example.com/avatar.jpg" />
// On image load error → falls back to "JL" initials automatically
 
// --- Sizes ---
<AvatarBadge name="JL" size="xs" />   // 20px — tight table cells
<AvatarBadge name="JL" size="sm" />   // 28px — list rows, chips
<AvatarBadge name="JL" size="md" />   // 36px — default
<AvatarBadge name="JL" size="lg" />   // 44px — detail panels
<AvatarBadge name="JL" size="xl" />   // 56px — profile headers
 
// --- Shape ---
<AvatarBadge name="JL" shape="circle"  />   // default
<AvatarBadge name="JL" shape="rounded" />   // squircle — for bots/system actors
 
// --- Status indicator ---
<AvatarBadge name="Jamie Lee" status="online"  />   // green dot
<AvatarBadge name="Jamie Lee" status="away"    />   // amber dot
<AvatarBadge name="Jamie Lee" status="busy"    />   // coral dot
<AvatarBadge name="Jamie Lee" status="offline" />   // grey dot
 
// --- Custom initials (system/role actors) ---
<AvatarBadge initials="SY" color="slate" shape="rounded" />   // System
<AvatarBadge initials="WH" color="purple"                />   // Warehouse
 
// --- Clickable (opens profile / reassignment) ---
<AvatarBadge
  name="Jamie Lee"
  onClick={() => openAssigneePanel()}
/>
 
// --- In a table row (assignee column) ---
<td>
  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
    <AvatarBadge name="Jamie Lee" size="xs" />
    <span>Jamie Lee</span>
  </span>
</td>
 
// --- In the navbar (current user) ---
<AvatarBadge
  name="Chris Okafor"
  size="sm"
  status="online"
  onClick={() => openUserMenu()}
/>
 
// --- AvatarGroup (assignee stack) ---
<AvatarGroup max={3} size="sm">
  <AvatarBadge name="Jamie Lee"    />
  <AvatarBadge name="Sam Rivera"   />
  <AvatarBadge name="Morgan Chen"  />
  <AvatarBadge name="Taylor Smith" />   // overflows → "+1"
</AvatarGroup>
 
// --- AvatarGroup with image avatars ---
<AvatarGroup max={4} size="md">
  <AvatarBadge name="Jamie Lee"   src="/avatars/jl.jpg" />
  <AvatarBadge name="Sam Rivera"  src="/avatars/sr.jpg" />
  <AvatarBadge name="Morgan Chen"                       />   // no image — initials
</AvatarGroup>
 
*/
 