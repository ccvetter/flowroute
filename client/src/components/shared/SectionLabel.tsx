// Uppercase monospaced section headers
import React from 'react';

/**
 * Types
 */
export type SectionLabelSize = 'xs' | 'sm' | 'md';
export type SectionLabelAs = 'p' | 'span' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'legend' | 'dt';

export interface SectionLabelProps {
    children: React.ReactNode;
    /**
     * Underlying HTML element. Defaults to 'p'.
     * Use 'label' when associated with a form field via 'htmlFor'.
     * Use 'legend' inside a <fieldset>.
     * Use heading levels when the label also acts as a document landmark.
     */
    as?: SectionLabelAs;
    /** Associates the label with a form control by ID. Only valid when as="label". */
    htmlFor?: string;
    /** Size variant. Defaults to 'sm'. */
    size?: SectionLabelSize;
    /**
     * Render a horizontal rule after the label that spans the
     * remaining width of its container. Useful for section dividers.
     * Defaults to false.
     */
    ruled?: boolean;
    /**
     * Decorative dot prefix rendered in the brand amber color.
     * Useful for sidebar group headings and status-adjacent labels.
     * Defaults to false.
     */
    dot?: boolean;
    /**
     * Mute the label to a lower-contrast secondary color.
     * Useful for inactive or disabled sections.
     * Defaults to false.
     */
    muted?: boolean;
    /** Color override for the label text. */
    color?: string;
    /** Additional class names. */
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
interface SizeTokens {
    fontSize: string;
    letterSpacing: string;
    dotSize: number;
}

const SIZE_TOKENS: Record<SectionLabelSize, SizeTokens> = {
    xs: { fontSize: '9px', letterSpacing: '0.18em', dotSize: 4 },
    sm: { fontSize: '10px', letterSpacing: '0.15em', dotSize: 5 },
    md: { fontSize: '11px', letterSpacing: '0.12em', dotSize: 6 },
};

const COLOR_DEFAULT = '#888780';
const COLOR_MUTED   = '#B4B2A9';
const COLOR_RULE    = 'rgba(60, 60, 58, 0.1)';
const COLOR_DOT     = '#BA7517';

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-section-label';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-section-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            text-transform: uppercase;
            line-height: 1;
            margin: 0;
            padding: 0;
            white-space: nowrap;
        }
        .fr-section-label__dot {
            border-radius: 50%;
            background: ${COLOR_DOT};
            flex-shrink: 0;
        }
        .fr-section-label__rule {
            flex: 1;
            height: 1px;
            background: ${COLOR_RULE};
            min-width: 12px;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const SectionLabel = React.forwardRef<HTMLElement, SectionLabelProps>(
    (
        {
            children,
            as: Tag = 'p',
            htmlFor,
            size = 'sm',
            ruled = false,
            dot = false,
            muted = false,
            color,
            className,
            style,
        },
        ref,
    ) => {
        React.useEffect(() => { ensureStyles(); }, []);

        const { fontSize, letterSpacing, dotSize } = SIZE_TOKENS[size];
        const resolvedColor = color ?? (muted ? COLOR_MUTED : COLOR_DEFAULT);

        const computedStyle: React.CSSProperties = {
            fontSize,
            letterSpacing,
            color: resolvedColor,
            ...style,
        };

        // 'label' and 'legen' need special prop handling
        const extraProps: Record<string, unknown> = {};
        if (Tag === 'label' && htmlFor) extraProps.htmlFor = htmlFor;

        return (
            <Tag
                // @ts-expect-error — polymorphic ref, Tag varies at runtime
                ref={ref}
                className={['fr-section-label', className].filter(Boolean).join(' ')}
                style={computedStyle}
                {...extraProps}
            >
                {dot && (
                    <span
                        className="fr-section-label__dot"
                        style={{ width: dotSize, height: dotSize }}
                        aria-hidden="true"
                    />
                )}

                <span>{children}</span>

                {ruled && (
                    <span className="fr-section-label__rule" aria-hidden="true" />
                )}
            </Tag>
        );
    },
);

SectionLabel.displayName = 'SectionLabel';

export default SectionLabel;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Sizes ---
<SectionLabel size="xs">Warehouse zone</SectionLabel>
<SectionLabel size="sm">Carrier details</SectionLabel>   // default
<SectionLabel size="md">Order summary</SectionLabel>
 
// --- Ruled divider ---
<SectionLabel ruled>Fulfillment pipeline</SectionLabel>
// renders:  FULFILLMENT PIPELINE ————————————————
 
// --- Dot prefix ---
<SectionLabel dot>Active carriers</SectionLabel>
// renders:  • ACTIVE CARRIERS
 
// --- Dot + ruled ---
<SectionLabel dot ruled>Today's exceptions</SectionLabel>
// renders:  • TODAY'S EXCEPTIONS ———————————————
 
// --- Muted (disabled / inactive section) ---
<SectionLabel muted>Archived orders</SectionLabel>
 
// --- Color override ---
<SectionLabel color="#0F6E56">Completed</SectionLabel>
<SectionLabel color="#D85A30">Flagged</SectionLabel>
 
// --- Semantic element overrides ---
 
// Form field label
<SectionLabel as="label" htmlFor="carrier-select">
  Carrier
</SectionLabel>
<select id="carrier-select">...</select>
 
// Fieldset legend
<fieldset>
  <SectionLabel as="legend">Shipping options</SectionLabel>
  ...
</fieldset>
 
// Heading landmark (sidebar group)
<SectionLabel as="h3" dot>Main menu</SectionLabel>
 
// Definition list term
<dl>
  <SectionLabel as="dt">Origin warehouse</SectionLabel>
  <dd>WH-ATL — Atlanta, GA</dd>
</dl>
 
// --- In a card header ---
<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
  <SectionLabel ruled>Recent orders</SectionLabel>
</div>
 
// --- In a sidebar nav group ---
<nav>
  <SectionLabel as="h3" dot size="xs" style={{ padding:'0 16px', marginBottom:6 }}>
    Operations
  </SectionLabel>
  <a href="/orders">Orders</a>
  <a href="/fulfillment">Fulfillment</a>
</nav>
 
// --- In a detail drawer key-value block ---
<dl style={{ display:'flex', flexDirection:'column', gap:8 }}>
  <SectionLabel as="dt">Ship-to address</SectionLabel>
  <dd>1234 Peachtree Rd, Atlanta GA 30309</dd>
</dl>
 
*/