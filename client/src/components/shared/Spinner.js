import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/**
 * Tokens
 */
const SIZE_PX = {
    xs: 10,
    sm: 14,
    md: 20,
    lg: 28,
    xl: 40,
};
// [track, arc]
const INTENT_COLORS = {
    brand: ['rgba(186,117,23,0.20)', '#BA7517'],
    white: ['rgba(255,255,255,0.25)', '#FFFFFF'],
    muted: ['rgba(60,60,58,0.12)', '#888780'],
    danger: ['rgba(216,90,48,0.18)', '#D85A30'],
    success: ['rgba(15,110,86,0.18)', '#0F6E56'],
};
const STROKE_WIDTH = {
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
    if (typeof document === 'undefined')
        return;
    if (document.getElementById(STYLE_ID))
        return;
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
export const Spinner = React.forwardRef(({ size = 'sm', px, intent = 'brand', trackColor, color, label = 'Loading...', style, className, }, ref) => {
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
    return (_jsx("svg", { ref: ref, className: ['fr-spinner', className].filter(Boolean).join(' '), width: diameter, height: diameter, viewBox: `0 0 ${diameter} ${diameter}`, fill: "none", "aria-label": label, role: "status", style: style, children: _jsx("circle", { cx: diameter / 2, cy: diameter / 2, r: radius, stroke: resolvedArc, strokeWidth: strokeW, strokeLinecap: "round", strokeDasharray: dashArray, strokeDashoffset: 0, transform: `rotate(-90 ${diameter / 2} ${diameter / 2})` }) }));
});
Spinner.displayName = 'Spinner';
export default Spinner;
//# sourceMappingURL=Spinner.js.map