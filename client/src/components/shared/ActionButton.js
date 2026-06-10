import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Primary (amber fill), secondary (outline), danger (coral outline)
import React from 'react';
import Spinner, {} from './Spinner.js';
// -- Style tokens (inline - no external CSS dependency)
const BASE = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 500,
    letterSpacing: '0.06em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer',
    border: '1px solid transparent',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'background 120ms cubic-bezier(0.4,0,0.2,1), ' +
        'color 120ms cubic-bezier(0.4,0,0.2,1), ' +
        'border-color 120ms cubic-bezier(0.4,0,0.2,1), ' +
        'box-shadow 120ms cubic-bezier(0.4,0,0.2,1)',
    position: 'relative',
    flexShrink: 0,
};
const INTENT_TOKENS = {
    primary: {
        default: { background: '#BA7517', color: '#FFFFFF', borderColor: '#BA7517' },
        hover: { background: '#EF9F27', borderColor: '#EF9F27' },
        active: { background: '#633806', borderColor: '#633806', transform: 'scale(0.97)' },
        disabled: { background: '#BA7517', color: '#FFFFFF', borderColor: '#BA7517', opacity: 0.4 },
        focusColor: 'rgba(186, 117, 23, 0.3)',
    },
    secondary: {
        default: { background: 'transparent', color: '#3C3C3A', borderColor: 'rgba(60,60,58,0.28)' },
        hover: { background: '#F1EFE8' },
        active: { background: '#D3D1C7', transform: 'scale(0.97)' },
        disabled: { background: 'transparent', opacity: 0.4 },
        focusColor: 'rgba(60, 60, 58, 0.2)',
    },
    ghost: {
        default: { background: 'transparent', color: '#888780', borderColor: 'transparent' },
        hover: { background: '#F1EFE8', color: '#3C3C3A' },
        active: { background: '#D3D1C7', transform: 'scale(0.97)' },
        disabled: { background: 'transparent', opacity: 0.4 },
        focusColor: 'rgba(60, 60, 58, 0.2)',
    },
    danger: {
        default: { background: 'transparent', color: '#D85A30', borderColor: '#D85A30' },
        hover: { background: '#FAECE7' },
        active: { background: '#F5C4B3', transform: 'scale(0.97)' },
        disabled: { background: 'transparent', opacity: 0.4 },
        focusColor: 'rgba(216, 90, 48, 0.25)',
    },
    'danger-fill': {
        default: { background: '#D85A30', color: '#FFFFFF', borderColor: '#D85A30' },
        hover: { background: '#993C1D', borderColor: '#993C1D' },
        active: { background: '#712B13', borderColor: '#712B13', transform: 'scale(0.97)' },
        disabled: { background: '#D85A30', color: '#FFFFFF', opacity: 0.4 },
        focusColor: 'rgba(216, 90, 48, 0.3)',
    }
};
const SIZE_TOKENS = {
    sm: { height: 28, padding: '0 10px', fontSize: '10px', gap: '5px', iconSize: 'sm', iconOnlyWidth: 28 },
    md: { height: 36, padding: '0 14px', fontSize: '11px', gap: '6px', iconSize: 'md', iconOnlyWidth: 36 },
    lg: { height: 44, padding: '0 20px', fontSize: '12px', gap: '8px', iconSize: 'lg', iconOnlyWidth: 44 },
};
// -- Style injection --
const STYLE_ID = 'flowroute-action-button';
function ensureStyles() {
    if (typeof document === 'undefined')
        return;
    if (document.getElementById(STYLE_ID))
        return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        @keyframes fr-btn-spin {
            to { transform: rotate(360deg); }   
        }
        .fr-btn:focus-visible {
            outline: none;
        }
        .fr-btn[data-intent="primary"]:focus-visible     { box-shadow: 0 0 0 3px rgba(186,117,23,0.30); }
        .fr-btn[data-intent="secondary"]:focus-visible   { box-shadow: 0 0 0 3px rgba(60,60,58,0.20); }
        .fr-btn[data-intent="ghost"]:focus-visible       { box-shadow: 0 0 0 3px rgba(60,60,58,0.20); }
        .fr-btn[data-intent="danger"]:focus-visible      { box-shadow: 0 0 0 3px rgba(216,90,48,0.25); }
        .fr-btn[data-intent="danger-fill"]:focus-visible { box-shadow: 0 0 0 3px rgba(216,90,48,0.30); }
    `;
    document.head.appendChild(el);
}
// -- Component --
export const ActionButton = React.forwardRef(({ intent = 'secondary', size = 'md', icon, iconPosition = 'left', iconOnly = false, loading = false, loadingLabel = 'loading...', fullWidth = false, href, target, children, disabled, className, style, onClick, ...rest }, ref) => {
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    React.useEffect(() => { ensureStyles(); }, []);
    const tokens = INTENT_TOKENS[intent];
    const sizeTok = SIZE_TOKENS[size];
    const isDisabled = disabled || loading;
    // Resolve style state
    const stateStyle = isDisabled ? tokens.disabled
        : pressed ? { ...tokens.default, ...tokens.active }
            : hovered ? { ...tokens.default, ...tokens.hover }
                : tokens.default;
    // Spinner color matches text color of the current intent
    const spinnerColor = stateStyle.color ?? '#3C3C3A';
    const computedStyle = {
        ...BASE,
        ...stateStyle,
        height: sizeTok.height,
        fontSize: sizeTok.fontSize,
        gap: sizeTok.gap,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%'
            : iconOnly ? sizeTok.iconOnlyWidth
                : undefined,
        padding: iconOnly ? 0 : sizeTok.padding,
        ...style,
    };
    // Icon wrapper - constrains size, hides when loading + left position
    const iconEl = icon && !loading && (_jsx("span", { "aria-hidden": "true", style: {
            display: 'inline-flex',
            flexShrink: 0,
            width: sizeTok.iconSize,
            height: sizeTok.iconSize,
            alignItems: 'center',
            justifyContent: 'center',
        }, children: icon }));
    // Content arrangement
    let content;
    if (iconOnly) {
        content = loading
            ? _jsx(Spinner, { size: sizeTok.iconSize, color: spinnerColor })
            : iconEl;
    }
    else {
        const labelEl = (_jsx("span", { style: { opacity: loading ? 0 : 1 }, children: children }));
        const spinnerEl = loading && (_jsxs("span", { style: {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sizeTok.gap,
            }, children: [_jsx(Spinner, { size: sizeTok.iconSize, color: spinnerColor }), _jsx("span", { style: { fontSize: sizeTok.fontSize }, children: loadingLabel })] }));
        content = (_jsxs(_Fragment, { children: [iconPosition === 'left' && iconEl, labelEl, iconPosition === 'right' && iconEl, spinnerEl] }));
    }
    const sharedProps = {
        className: ['fr-btn', className].filter(Boolean).join(' '),
        style: computedStyle,
        'data-intent': intent,
        'aria-disabled': isDisabled ? true : undefined,
        'aria-busy': loading ? true : undefined,
        onMouseEnter: () => !isDisabled && setHovered(true),
        onMouseLeave: () => { setHovered(false); setPressed(false); },
        onMouseDown: () => !isDisabled && setPressed(true),
        onMouseUp: () => setPressed(false),
        onClick: isDisabled ? undefined : onClick,
    };
    // Link variant
    if (href) {
        return (_jsx("a", { ref: ref, href: isDisabled ? undefined : href, target: target, rel: target === '_blank' ? 'noopener noreferrer' : undefined, role: "button", tabIndex: isDisabled ? -1 : 0, ...sharedProps, ...rest, children: content }));
    }
    return (_jsx("button", { ref: ref, type: "button", disabled: isDisabled, ...sharedProps, ...rest, children: content }));
});
ActionButton.displayName = 'ActionButton';
export const ActionButtonGroup = ({ children, attached = false, className, style, }) => {
    const groupStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: attached ? 0 : '8px',
        ...style,
    };
    // Flatten and clone children to handle attached border radii
    const kids = React.Children.toArray(children).filter(Boolean);
    const cloned = attached
        ? kids.map((child, i) => {
            if (!React.isValidElement(child))
                return child;
            const isFirst = i === 0;
            const isLast = i === kids.length - 1;
            const isMid = !isFirst && !isLast;
            const borderRadius = isFirst ? '6px 0 0 6px'
                : isLast ? '0 6px 6px 0'
                    : '0';
            const extraStyle = {
                borderRadius,
                ...(isMid || isLast ? { marginLeft: '-1px' } : {}),
            };
            return React.cloneElement(child, {
                style: {
                    ...child.props.style,
                    ...extraStyle,
                },
            });
        })
        : kids;
    return (_jsx("div", { className: className, style: groupStyle, role: "group", children: cloned }));
};
ActionButtonGroup.displayName = 'ActionButtonGroup';
export default ActionButton;
//# sourceMappingURL=ActionButton.js.map