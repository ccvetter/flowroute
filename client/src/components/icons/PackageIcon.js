import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
/**
 * Tokens
 */
const SIZE_PX = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};
const DEFAULT_LABELS = {
    default: 'Package',
    open: 'Package open',
    sealed: 'Package sealed',
    exception: 'Package exception',
    delivered: 'Package delivered',
    transit: 'Package in transit',
};
// Stoke width scales with icon size
function strokeWidth(px) {
    if (px <= 12)
        return 1.25;
    if (px <= 16)
        return 1.5;
    if (px <= 24)
        return 1.75;
    return 2;
}
/**
 * Shared geometry constants (24x24 grid)
 * Box body:   (3, 11) -> (21, 21)
 * Lid left:   (3, 11) -> (12, 6)
 * Lid right:  (12, 6) -> (21, 11)
 * Center seam: x=12, y=6 to y=11
 */
function DrawDefault({ color, secondary, sw, variant }) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    const detailOpacity = variant === 'filled' ? 0 : 1;
    return (_jsxs("g", { children: [_jsx("path", { d: "M3 11h18v10H3z", fill: fill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("path", { d: "M3 11 L12 6 L21 11", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("line", { x1: "12", y1: "6", x2: "12", y2: "11", stroke: color, strokeWidth: sw, opacity: detailOpacity }), _jsx("line", { x1: "3", y1: "15", x2: "21", y2: "15", stroke: variant === 'duotone' ? secondary : color, strokeWidth: sw * 0.75, opacity: variant === 'filled' ? 0 : 0.45, strokeDasharray: "0" })] }));
}
function DrawOpen({ color, secondary, sw, variant }) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : 'none';
    return (_jsxs("g", { children: [_jsx("path", { d: "M3 13h18v8H3z", fill: fill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("path", { d: "M3 13 L10 7 L12 8", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M21 13 L14 7 L12 8", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("line", { x1: "3", y1: "13", x2: "21", y2: "13", stroke: color, strokeWidth: sw, opacity: 0.3 })] }));
}
function DrawSealed({ color, secondary, sw, variant }) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    const tapeFill = variant === 'outline' ? 'none' : secondary;
    const tapeStroke = variant === 'outline' ? color : secondary;
    return (_jsxs("g", { children: [_jsx("path", { d: "M3 11h18v10H3z", fill: fill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("path", { d: "M3 11 L12 6 L21 11", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("rect", { x: "10", y: "7", width: "4", height: "8", rx: "0.5", fill: tapeFill, stroke: tapeStroke, strokeWidth: sw * 0.75, opacity: 0.85 })] }));
}
function DrawException({ color, secondary, sw, variant }) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    return (_jsxs("g", { children: [_jsx("path", { d: "M2 12h15v9H2z", fill: fill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("path", { d: "M2 12 L9.5 7.5 L17 12", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("circle", { cx: "18.5", cy: "6.5", r: "4", fill: "#D85A30" }), _jsx("line", { x1: "18.5", y1: "4.5", x2: "18.5", y2: "7", stroke: "white", strokeWidth: sw * 0.9, strokeLinecap: "round" }), _jsx("circle", { cx: "18.5", cy: "8.5", r: "0.7", fill: "white" })] }));
}
function DrawDelivered({ color, secondary, sw, variant }) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    return (_jsxs("g", { children: [_jsx("path", { d: "M2 12h15v9H2z", fill: fill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("path", { d: "M2 12 L9.5 7.5 L17 12", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("circle", { cx: "18.5", cy: "6.5", r: "4", fill: "#0F6E56" }), _jsx("path", { d: "M16.5 6.5 L18 8 L20.5 5", stroke: "white", strokeWidth: sw * 0.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" })] }));
}
function DrawTransit({ color, secondary, sw, variant }) {
    const fill = variant === 'filled' ? color : 'none';
    const lidFill = variant === 'duotone' ? secondary : fill;
    return (_jsxs("g", { children: [_jsx("line", { x1: "1", y1: "9", x2: "4", y2: "9", stroke: color, strokeWidth: sw * 0.85, strokeLinecap: "round", opacity: 0.5 }), _jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12", stroke: color, strokeWidth: sw * 0.85, strokeLinecap: "round", opacity: 0.3 }), _jsx("line", { x1: "1", y1: "15", x2: "4", y2: "15", stroke: color, strokeWidth: sw * 0.85, strokeLinecap: "round", opacity: 0.5 }), _jsx("path", { d: "M6 12h16v9H6z", fill: fill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("path", { d: "M6 12 L14 7 L22 12", fill: lidFill, stroke: color, strokeWidth: sw, strokeLinejoin: "round" }), _jsx("line", { x1: "14", y1: "7", x2: "14", y2: "12", stroke: color, strokeWidth: sw, opacity: 0.4 })] }));
}
/**
 * Component
 */
export const PackageIcon = React.forwardRef(({ size = 'md', px, variant = 'outline', state = 'default', color = 'currentColor', secondaryColor, label, decorative = false, className, style, }, ref) => {
    const diameter = px ?? SIZE_PX[size];
    const sw = strokeWidth(diameter);
    // Default secondary color per variant
    const resolvedSecondary = secondaryColor ??
        (variant === 'duotone' ? 'rgba(186,117,23,0.25)' : color);
    const drawProps = {
        color,
        secondary: resolvedSecondary,
        sw,
        variant,
    };
    const resolvedLabel = label ?? DEFAULT_LABELS[state];
    const stateDrawers = {
        default: _jsx(DrawDefault, { ...drawProps }),
        open: _jsx(DrawOpen, { ...drawProps }),
        sealed: _jsx(DrawSealed, { ...drawProps }),
        exception: _jsx(DrawException, { ...drawProps }),
        delivered: _jsx(DrawDelivered, { ...drawProps }),
        transit: _jsx(DrawTransit, { ...drawProps }),
    };
    return (_jsx("svg", { ref: ref, width: diameter, height: diameter, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: className, style: { flex: 0, ...style }, "aria-label": decorative ? undefined : resolvedLabel, "aria-hidden": decorative ? true : undefined, role: decorative ? undefined : 'img', children: stateDrawers[state] }));
});
PackageIcon.displayName = 'PackageIcon';
export default PackageIcon;
//# sourceMappingURL=PackageIcon.js.map