import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/**
 * Tokens
 */
const SIZE_PX = {
    xs: 10,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
};
const STROKE_WIDTH = {
    light: 1.25,
    regular: 1.75,
    bold: 2.5,
};
// CSS rotation per direction
const DIRECTION_DEG = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
};
const DEFAULT_LABELS = {
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
    if (typeof document === 'undefined')
        return;
    if (document.getElementById(STYLE_ID))
        return;
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
export const ChevronRightIcon = React.forwardRef(({ direction = 'right', size = 'md', px, weight = 'regular', color = 'currentColor', animated = false, label, decorative = true, className, style, }, ref) => {
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
    const computedStyle = {
        transform: `rotate(${rotateDeg}deg)`,
        ...style,
    };
    return (_jsx("svg", { ref: ref, width: diameter, height: diameter, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: classes, style: computedStyle, "aria-label": decorative ? undefined : resolvedLabel, "aria-hidden": decorative ? true : undefined, role: decorative ? undefined : 'img', children: _jsx("path", { d: "M6 3.5L10.5 8L6 12.5", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" }) }));
});
ChevronRightIcon.displayName = 'ChevronRightIcon';
/**
 * Convenience re-exports for explicit directional usage
 */
export const ChevronLeftIcon = React.forwardRef((props, ref) => _jsx(ChevronRightIcon, { ref: ref, ...props, direction: "left" }));
ChevronLeftIcon.displayName = 'ChevronLeftIcon';
export const ChevronUpIcon = React.forwardRef((props, ref) => _jsx(ChevronRightIcon, { ref: ref, ...props, direction: "up" }));
ChevronUpIcon.displayName = 'ChevronUpIcon';
export const ChevronDownIcon = React.forwardRef((props, ref) => _jsx(ChevronRightIcon, { ref: ref, ...props, direction: "down" }));
ChevronDownIcon.displayName = 'ChevronDownIcon';
export default ChevronRightIcon;
//# sourceMappingURL=ChevronIcon.js.map