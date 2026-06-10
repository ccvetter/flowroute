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
 * Component
 */
export declare const ChevronRightIcon: React.ForwardRefExoticComponent<ChevronRightIconProps & React.RefAttributes<SVGSVGElement>>;
/**
 * Convenience re-exports for explicit directional usage
 */
export declare const ChevronLeftIcon: React.ForwardRefExoticComponent<Omit<ChevronRightIconProps, "direction"> & React.RefAttributes<SVGSVGElement>>;
export declare const ChevronUpIcon: React.ForwardRefExoticComponent<Omit<ChevronRightIconProps, "direction"> & React.RefAttributes<SVGSVGElement>>;
export declare const ChevronDownIcon: React.ForwardRefExoticComponent<Omit<ChevronRightIconProps, "direction"> & React.RefAttributes<SVGSVGElement>>;
export default ChevronRightIcon;
//# sourceMappingURL=ChevronIcon.d.ts.map