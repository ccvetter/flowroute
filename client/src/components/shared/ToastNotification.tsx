// Transient alerts (exception flagged, label printed, etc.)
import React from 'react';

/** 
 * Types
 */
export type ToastIntent = 'success' | 'warning' | 'error' | 'info';
export type ToastPosition =
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left'
    | 'top-center';

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface Toast {
    id: string;
    intent: ToastIntent;
    title: string;
    description?: string;
    /** Duration in ms before auto-dismiss. Pass 0 to disable. Defaults to 45000. */
    duration?: number;
    /** Optional inline action (e.g. "Undo", "View order"). */
    action?: ToastAction;
    /** Whether the toast has been dismissed (used internally). */
    dismissed?: boolean;
}

export interface ToastNotificationProps {
    toast: Toast;
    onDismiss: (id: string) => void;
    /** Position content - affects enter/exit animation direction. */
    position?: ToastPosition;
}

export interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
    position?: ToastPosition;
    /** Max number of toasts visible at once. Older ones are removed. Defaults to 5. */
    maxVisible?: number;
}

/**
 * Toast manager hook
 */
export interface UseToastReturn {
    toasts: Toast[];
    toast: (options: Omit<Toast, 'id'>) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    // Convenience shorthands
    success: (title: string, options?: Partial<Omit<Toast, 'id' | 'intent' | 'title'>>) => string;
    error:   (title: string, options?: Partial<Omit<Toast, 'id' | 'intent' | 'title'>>) => string;
    warning: (title: string, options?: Partial<Omit<Toast, 'id' | 'intent' | 'title'>>) => string;
    info:    (title: string, options?: Partial<Omit<Toast, 'id' | 'intent' | 'title'>>) => string;
}

export function useToast(): UseToastReturn {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const dismiss = React.useCallback((id: string) => {
        setToasts(prev =>
            prev.map(t => t.id === id ? { ...t, dismissed: true } : t),
        );
        // Remove from state after exit animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 320);
    }, []);

    const dismissAll = React.useCallback(() => {
        setToasts(prev => prev.map(t => ({ ...t, dismissed: true })));
        setTimeout(() => setToasts([]), 320);
    }, []);

    const toast = React.useCallback((options: Omit<Toast, 'id'>): string => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts(prev => [...prev, { ...options, id, dismissed: false }]);
        return id;
    }, []);

    const makeShorthand = (intent: ToastIntent) =>
    (title: string, options?: Partial<Omit<Toast, 'id' | 'intent' | 'title'>>) =>
        toast({ intent, title, duration: 4500, ...options });

    return {
        toasts,
        toast,
        dismiss,
        dismissAll,
        success: makeShorthand('success'),
        error: makeShorthand('error'),
        warning: makeShorthand('warning'),
        info: makeShorthand('info'),
    };
}

/**
 * Tokens
 */
interface IntentTokens {
    accentColor: string;
    iconColor: string;
    icon: React.ReactNode;
    ariaRole: 'status' | 'alert';
}

const INTENT_CONFIG: Record<ToastIntent, IntentTokens> = {
    success: {
        accentColor: '#0F6E56',
        iconColor: '#0F6E56',
        ariaRole: 'status',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.25 8.25l2 2 3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    warning: {
        accentColor: '#BA7517',
        iconColor: '#BA7517',
        ariaRole: 'status',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.75L14.5 13.2H1.5L8 1.75z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 6.25v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.65" fill="currentColor" />
            </svg>
        ),
    },
    error: {
         accentColor: '#D85A30',
         iconColor: '#D85A30',
         ariaRole: 'alert',
         icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.65" fill="currentColor" />
            </svg>
         ),
    },
    info: {
        accentColor: '#888780',
        iconColor: '#888780',
        ariaRole: 'status',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 7.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="8" cy="5.5" r="0.65" fill="currentColor" />
            </svg>
        ),
    },
};

const POSITION_STYLES: Record<ToastPosition, React.CSSProperties> = {
    'bottom-right':  { bottom: 24, right: 24, alignItems: 'flex-end' },
    'bottom-left':   { bottom: 24, left: 24, alignItems: 'flex-start' },
    'bottom-center': { bottom: 24, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
    'top-right':     { top: 24, right: 24, alignItems: 'flex-end', flexDirection: 'column-reverse' },
    'top-left':      { top: 24, left: 24, alignItems: 'flex-start', flexDirection: 'column-reverse' },
    'top-center':    { top: 24, left: '50%', transform: 'translateX(-50%)', alignItems: 'center', flexDirection: 'column-reverse' },
};

function enterAnimation(position: ToastPosition): string {
    if (position.includes('right')) return 'fr-toast-in-right';
    if (position.includes('left')) return 'fr-toast-in-left';
    return 'fr-toast-in-up';
}

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-toast';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-toast-container {
            position: fixed;
            z-index: 600;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        }
        .fr-toast {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 14px;
            background: #1A1A18;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10);
            min-width: 280px;
            max-width: 380px;
            pointer-events: all;
            position: relative;
            overflow: hidden;
            border-left: 3px solid transparent;
        }
        .fr-toast__icon {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
        }
        .fr-toast__body {
            flex: 1;
            min-width: 0;
        }
        .fr-toast__title {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            font-weight: 500;
            color: #F1EFE8;
            line-height: 1.4;
            margin: 0 0 2px;
        }
        .fr-toast__desc {
            font-family: 'IBM Plex Sans', sans-serif;
            font-size: 11px;
            color: rgba(241, 239, 232, 0.6);
            line-height: 1.5;
            margin: 0;
        }
        .fr-toast__action {
            background: none;
            border: none;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            padding: 0;
            margin-top: 6px;
            display: inline-block;
            text-decoration: underline;
            text-underline-offset: 2px;
        }
        .fr-toast__action:hover { opacity: 0.8; }
        .fr-toast__action:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
            border-radius: 2px;
        }
        .fr-toast__close {
            flex-shrink: 0;
            background: none;
            border: none;
            cursor: pointer;
            color: rgba(241, 239, 232, 0.4);
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
            transition: color 120ms ease;
        }
        .fr-toast__close:hover { color: rgba(241, 239, 232, 0.9); }
        .fr-toast__close:focus-visible {
            outline: 2px solid rgba(241, 239, 232, 0.5);
            outline-offset: 2px;
            border-radius: 2px;
        }
        .fr-toast__progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            border-radius: 0 1px 1px 0;
            transform-origin: left;
        }

        /* Enter animations */
        .fr-toast-in-right {
            animation: fr-toast-slide-right 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .fr-toast-in-left {
            animation: fr-toast-slide-left 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .fr-toast-in-up {
            animation: fr-toast-slide-up 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Exit animation */
        .fr-toast--dismissed {
            animation: fr-toast-out 280ms cubic-bezier(0.4, 0, 1, 1) forwards !important;
        }

        @keyframes fr-toast-slide-right {
            from { opacity: 0; transform: translateX(24px); }
            to { opacity: 1, transform: translateX(0); }
        }
        @keyframes fr-toast-slide-left {
            from { opacity: 0; transform: translateX(-24px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fr-toast-slide-up {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fr-toast-out {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.94); }
        }
        @keyframes fr-toast-progress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
        }
    `;
    document.head.appendChild(el);
}

/**
 * Close icon
 */
const CloseIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 3l8 8M11 31-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Single Toast
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({
    toast,
    onDismiss,
    position = 'bottom-right',
}) => {
    React.useEffect(() => { ensureStyles(); }, []);

    const config = INTENT_CONFIG[toast.intent];
    const duration = toast.duration ?? 4500;

    // Auto-dismiss timer
    React.useEffect(() => {
        if (duration === 0) return;
        const id = setTimeout(() => onDismiss(toast.id), duration);
        return () => clearTimeout(id);
    }, [toast.id, duration, onDismiss]);

    const progressStyle: React.CSSProperties = duration > 0
        ? {
            background: config.accentColor,
            width: '100%',
            animationName: 'fr-toast-progress',
            animationDuration: `${duration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
        }
        : { display: 'none' };

    return (
        <div
            className={[
                'fr-toast',
                enterAnimation(position),
                toast.dismissed ? 'fr-toast--dismissed' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderLeftColor: config.accentColor }}
            role={config.ariaRole}
            aria-atomic="true"
            aria-live={config.ariaRole === 'alert' ? 'assertive' : 'polite'}
        >
            {/* Intent icon */}
            <span className="fr-toast__icon" style={{ color: config.iconColor }}>
                {config.icon}
            </span>

            {/* Content */}
            <div className="fr-toast__body">
                <p className="fr-toast__title">{toast.title}</p>
                {toast.description && (
                    <p className="fr-toast__desc">{toast.description}</p>
                )}
                {toast.action && (
                    <button
                        type="button"
                        className="fr-toast__action"
                        style={{ color: config.accentColor }}
                        onClick={() => {
                            toast.action!.onClick();
                            onDismiss(toast.id);
                        }}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            {/* Close button */}
            <button
                type="button"
                className="fr-toast__close"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
            >
                <CloseIcon />
            </button>

            {/* Progress bar */}
            <div className="fr-toast__progress" style={progressStyle} />
        </div>
    );
};

ToastNotification.displayName = 'ToastNotification';

/**
 * Toast container
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onDismiss,
    position = 'bottom-right',
    maxVisible = 5,
}) => {
    React.useEffect(() => {ensureStyles(); }, []);

    const positionStyle = POSITION_STYLES[position];
    const visible = toasts.slice(-maxVisible);

    return (
        <div
            className="fr-toast-container"
            style={positionStyle}
            aria-label="Notifications"
        >
            {visible.map(t => (
                <ToastNotification
                    key={t.id}
                    toast={t}
                    onDismiss={onDismiss}
                    position={position}
                />
            ))}
        </div>
    );
};

ToastContainer.displayName = 'ToastContainer';

export default ToastNotification;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Setup (add ToastContainer once near the root of the app) ---
function App() {
  const { toasts, dismiss, ...toastApi } = useToast();
 
  // Pass toastApi down via context or prop-drilling
  return (
    <>
      <AppShell toastApi={toastApi} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} position="bottom-right" />
    </>
  );
}
 
// --- Shorthand helpers ---
const { success, error, warning, info } = useToast();
 
success('Order assigned');
error('Failed to load carriers');
warning('Low stock on SKU-00412');
info('Carrier label regenerated');
 
// --- Full options ---
const { toast } = useToast();
 
toast({
  intent:   'success',
  title:    'Pick task complete',
  description: 'Order #FR-48291 moved to packing queue.',
  duration: 4500,
});
 
// --- With inline action ---
toast({
  intent: 'warning',
  title:  'Order re-assigned',
  description: '47 orders moved to unassigned queue.',
  action: { label: 'Undo', onClick: undoReassign },
});
 
// --- Persist until dismissed (duration: 0) ---
toast({
  intent:   'error',
  title:    'Carrier API unreachable',
  description: 'UPS tracking updates are paused.',
  duration: 0,
  action:   { label: 'Retry', onClick: retryCarrier },
});
 
// --- Positions ---
<ToastContainer toasts={toasts} onDismiss={dismiss} position="bottom-right"  />   // default
<ToastContainer toasts={toasts} onDismiss={dismiss} position="bottom-left"   />
<ToastContainer toasts={toasts} onDismiss={dismiss} position="bottom-center" />
<ToastContainer toasts={toasts} onDismiss={dismiss} position="top-right"     />
<ToastContainer toasts={toasts} onDismiss={dismiss} position="top-left"      />
<ToastContainer toasts={toasts} onDismiss={dismiss} position="top-center"    />
 
// --- Dismiss programmatically ---
const id = success('Label printed');
// ... later:
dismiss(id);
 
// --- Dismiss all ---
dismissAll();
 
// --- Limit visible toasts ---
<ToastContainer toasts={toasts} onDismiss={dismiss} maxVisible={3} />
 
// --- Common FlowRoute trigger points ---
success('Pick task confirmed',  { description: 'Order #FR-48291 is ready to pack.' });
success('Label generated',      { action: { label: 'Print', onClick: printLabel } });
warning('SLA at risk',          { description: '3 orders due in under 30 minutes.', duration: 0 });
error('Scan mismatch',          { description: 'Expected SKU-00412, scanned SKU-00891.' });
info('Carrier switch applied',  { description: 'FedEx → UPS for order #FR-48291.' });
 
*/