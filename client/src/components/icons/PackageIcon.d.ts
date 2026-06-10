import React from 'react';
/**
 * Types
 */
export type PackageIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PackageIconVariant = 'outline' | 'filled' | 'duotone';
export type PackageIconState = 'default' | 'open' | 'sealed' | 'exception' | 'delivered' | 'transit';
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
 * Component
 */
export declare const PackageIcon: React.ForwardRefExoticComponent<PackageIconProps & React.RefAttributes<SVGSVGElement>>;
export default PackageIcon;
//# sourceMappingURL=PackageIcon.d.ts.map