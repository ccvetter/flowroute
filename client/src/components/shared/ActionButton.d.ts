import React from 'react';
export type ActionButtonIntent = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-fill';
export type ActionButtonSize = 'sm' | 'md' | 'lg';
export type ActionButtonIconPosition = 'left' | 'right';
export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual intent. Defaults to 'secondary'. */
    intent?: ActionButtonIntent;
    /** Size variant. Defaults to 'md'. */
    size?: ActionButtonSize;
    /** Icon to render alongside the label. */
    icon?: React.ReactNode;
    /** Icon placement relative to label. Defaults to 'left'. */
    iconPosition?: ActionButtonIconPosition;
    /**
     * Icon-only mode - renders a square button with no label.
     * Supply an `aria-label` when using this.
     */
    iconOnly?: boolean;
    /**
     * Shows a spinner and disables interaction.
     * Use while an async action is in-flight.
     */
    loading?: boolean;
    /** Replaces the default loading text ("loading...") when in loading state. */
    loadingLabel?: string;
    /**
     * Renders as a full-width block button.
     */
    fullWidth?: boolean;
    /**
     * Render as an <a> tag. Provide `href` to activate.
     */
    href?: string;
    /** Target for link variant. */
    target?: string;
    /** Additional class names. */
    className?: string;
    /** Click handler for both button and link variants. */
    onClick?: React.MouseEventHandler<HTMLElement>;
}
export declare const ActionButton: React.ForwardRefExoticComponent<ActionButtonProps & React.RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;
export interface ActionButtonGroupProps {
    children: React.ReactNode;
    /** Attach children flush against each other (segmented control style). */
    attached?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const ActionButtonGroup: React.FC<ActionButtonGroupProps>;
export default ActionButton;
//# sourceMappingURL=ActionButton.d.ts.map