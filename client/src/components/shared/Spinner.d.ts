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
 * Component
 */
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<SVGSVGElement>>;
export default Spinner;
//# sourceMappingURL=Spinner.d.ts.map