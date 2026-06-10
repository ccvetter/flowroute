// Destructive action confirmation dialog
import React from 'react';
import { ActionButton, type ActionButtonIntent } from './ActionButton.js';

/**
 * Types
 */
export type ConfirmModalIntent = 'danger' | 'warning' | 'info';

export interface ConfirmModalProps {
    /** Controls visibility */
    open: boolean;
    /** Modal heading */
    title: string;
    /** Explanatory body text. */
    description: string | React.ReactNode;
    /**
     * Semantic intent - drives the confirm button color and icon.
     * Defaults to 'danger'.
     */
    intent?: ConfirmModalIntent;
    /** Confirm button label. Defaults to intent-appropriate text. */
    confirmLabel?: string;
    /** Cancel button label. Defaults to 'Cancel'. */
    cancelLabel?: string;
    /**
     * Shows a spinner on the confirm button and disables both buttons.
     * Use while the confirmed async action is in-flight.
     */
    loading?: boolean;
    /** Called when the user confirms. */
    onConfirm: () => void;
    /** Called when the user cancels or clicks the backdrop. */
    onCancel: () => void;
    /**
     * Require the user to type a confirmation string before the confirm
     * button becomes active. Useful for destructive irreversible actions.
     */
    confirmPhrase?: string;
    /** Additional class name on the modal panel. */
    className?: string;
}

/**
 * Tokens
 */
interface IntentConfig {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    confirmIntent: ActionButtonIntent;
    defaultConfirmLabel: string;
}

const INTENT_CONFIG: Record<ConfirmModalIntent, IntentConfig> = {
    danger: {
        confirmIntent: 'danger-fill',
        defaultConfirmLabel: 'Delete',
        iconBg: '#FAECE7',
        iconColor: '#D85A30',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                    stroke="currentColor" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                    d="M10 11v4M14 11v3"
                    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
                />
            </svg>
        ),
    },
    warning: {
        confirmIntent: 'primary',
        defaultConfirmLabel: 'Confirm',
        iconBg: '#FAEEDA',
        iconColor: '#BA7517',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M12 3L22 20H2L12 3z"
                    stroke="currentColor" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round"
                />
                <path d="M12 10v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="12" cy="17" r="0.75" fill="currentColor" />
            </svg>
        ),
    },
    info: {
        confirmIntent: 'primary',
        defaultConfirmLabel: 'Continue',
        iconBg: '#E1F5EE',
        iconColor: '#0F6E56',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 11v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="12" cy="8" r="0.75" fill="currentColor" />
            </svg>
        ),
    },
};

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-confirm-modal';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(26, 26, 24, 0.5);
            z-index: 300;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            animation: fr-modal-fade-in 180ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fr-modal {
            background: #FFFFFF;
            border: 1px solid rgba(60, 60, 58, 0.12);
            border-radius: 14px;
            padding: 24px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.4);
            animation: fr-modal-scale-in 180ms cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
        }
        .fr-modal__icon-wrap {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            flex-shrink: 0;
        }
        .fr-modal__title {
            font-family: 'Syne', sans-serif;
            font-size: 17px;
            font-weight: 700;
            color: #3C3C3A';
            margin: 0 0 8px;
            line-height: 1.3;
        }
        .fr-modal__desc {
            font-family: 'IBM Plex Sans', sans-serif;
            font-size: 13px;
            color: #888780;
            line-height: 1.6;
            margin: 0 0 20px;
        }
        .fr-modal__phrase-wrap {
            margin-bottom: 20px;
        }
        .fr-modal__phrase-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: #888780;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 6px;
            display: block;
        }
        .fr-modal__phrase-hint {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            background: #F1EFE8;
            padding: 2px 6px;
            border-radius: 4px;
            color: #3C3C3A;
        }
        .fr-modal__phrase-input {
            width: 100%;
            height: 36px;
            padding: 0 10px;
            border: 1px solid rgba(60, 60, 58, 0.2);
            border-radius: 6px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            color: #3C3C3A;
            background: #FFFFFF;
            margin-top: 8px;
            transition: border-color 120ms ease, box-shadow 120ms ease;
            outline: none;
        }
        .fr-modal__phrase-input:focus {
            border-color: #BA7517;
            box-shadow: 0 0 0 3px rgba(186, 117, 23, 0.2);
        }
        .fr-modal__phrase-input--matched {
            border-color: #0F6E56;
            box-shadow: 0 0 0 3px rgba(15, 110, 86, 0.15);
        }
        .fr-modal__actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        @keyframes fr-modal-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes fr-modal-scale-in {
            from { transform: scale(0.96) translateY(6px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    description,
    intent = 'danger',
    confirmLabel,
    cancelLabel = 'Cancel',
    loading = false,
    onConfirm,
    onCancel,
    confirmPhrase,
    className,
}) => {
    const [phraseInput, setPhraseInput] = React.useState('');
    const panelRef = React.useRef<HTMLDivElement>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { ensureStyles(); }, []);

    // Reset phrase input when modal opens / closes
    React.useEffect(() => {
        if (!open) { setPhraseInput(''); return; }
        // Focus: phrase input if present, otherwise cancel button
        requestAnimationFrame(() => {
            if (confirmPhrase) inputRef.current?.focus();
            else cancelRef.current?.focus();
        });
    }, [open, confirmPhrase]);

    // Trap focus inside the modal
    React.useEffect(() => {
        if (!open) return;
        const panel = panelRef.current;
        if (!panel) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') { onCancel(); return; }
            if (e.key !== 'Tab') return;

            const focusable = Array.from(
                panel!.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="1"])',
                ),
            );

            if (focusable.length === 0) return;
            const first = focusable.at(0)!;
            const last = focusable.at(-1)!;

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onCancel]);

    // Lock body scroll while open
    React.useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; }
    }, [open]);

    if (!open) return null;

    const config = INTENT_CONFIG[intent];
    const resolvedLabel = confirmLabel ?? config.defaultConfirmLabel;
    const phraseMatched = confirmPhrase
        ? phraseInput.trim() === confirmPhrase.trim()
        : true;
    const confirmDisabled = !phraseMatched || loading;

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) onCancel();
    }

    return (
        <div
            className="fr-modal-overlay"
            role="presentation"
            onClick={handleOverlayClick}
            aria-hidden="false"
        >
            <div
                ref={panelRef}
                className={['fr-modal', className].filter(Boolean).join(' ')}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="fr-modal-title"
                aria-describedby="fr-modal-desc"
                tabIndex={-1}
            >
                {/* Intent icon */}
                <div 
                    className="fr-modal__icon-wrap"
                    style={{ background: config.iconBg, color: config.iconColor }}
                >
                    {config.icon}
                </div>

                {/* Title */}
                <h2 id="fr-modal-title" className="fr-modal__title">
                    {title}
                </h2>

                {/* Description */}
                <div id="fr-modal-desc" className="fr-modal__desc">
                    {description}
                </div>

                {/* Confirmation phrase input */}
                {confirmPhrase && (
                    <div className="fr-modal__phrase_wrap">
                        <span className="fr-modal__phrase-label">
                            Type{' '}
                            <span className="fr-modal__phrase-hint">{confirmPhrase}</span>
                            {' '}to confirm
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            className={[
                                'fr-modal__phrase-input',
                                phraseMatched ? 'fr-modal__phrase-input--matched' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            value={phraseInput}
                            onChange={(e) => setPhraseInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !confirmDisabled) onConfirm();
                            }}
                            placeholder={confirmPhrase}
                            autoComplete="off"
                            spellCheck={false}
                            aria-label={`Type ${confirmPhrase} to confirm`}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="fr-modal__actions">
                    <ActionButton
                        ref={cancelRef as React.Ref<HTMLButtonElement>}
                        intent="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </ActionButton>

                    <ActionButton
                        intent={config.confirmIntent}
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        loading={loading}
                    >
                        {resolvedLabel}
                    </ActionButton>
                </div>
            </div>
        </div>
    );
};

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Basic danger confirmation ---
const [open, setOpen] = React.useState(false);
 
<ActionButton intent="danger" onClick={() => setOpen(true)}>
  Delete order
</ActionButton>
 
<ConfirmModal
  open={open}
  intent="danger"
  title="Delete order #FR-48291?"
  description="This will permanently remove the order and all associated fulfillment records. This action cannot be undone."
  confirmLabel="Delete order"
  onConfirm={() => { deleteOrder(); setOpen(false); }}
  onCancel={() => setOpen(false)}
/>
 
// --- With async loading state ---
const [open, setOpen]       = React.useState(false);
const [loading, setLoading] = React.useState(false);
 
async function handleConfirm() {
  setLoading(true);
  await deleteOrder();
  setLoading(false);
  setOpen(false);
}
 
<ConfirmModal
  open={open}
  intent="danger"
  title="Delete order?"
  description="This cannot be undone."
  loading={loading}
  onConfirm={handleConfirm}
  onCancel={() => !loading && setOpen(false)}
/>
 
// --- Confirmation phrase (high-stakes destructive action) ---
<ConfirmModal
  open={open}
  intent="danger"
  title="Remove warehouse WH-ATL?"
  description="All associated orders, carriers, and fulfillment history will be permanently deleted."
  confirmLabel="Remove warehouse"
  confirmPhrase="WH-ATL"
  onConfirm={handleConfirm}
  onCancel={() => setOpen(false)}
/>
 
// --- Warning (non-destructive, requires acknowledgement) ---
<ConfirmModal
  open={open}
  intent="warning"
  title="Re-assign 47 open orders?"
  description="All orders currently assigned to Jamie Lee will be moved to the unassigned queue."
  confirmLabel="Re-assign orders"
  onConfirm={handleConfirm}
  onCancel={() => setOpen(false)}
/>
 
// --- Info (proceed / back) ---
<ConfirmModal
  open={open}
  intent="info"
  title="Switch carrier mid-shipment?"
  description="The current shipping label will be voided and a new one generated. Notify the customer of the change."
  confirmLabel="Switch carrier"
  cancelLabel="Go back"
  onConfirm={handleConfirm}
  onCancel={() => setOpen(false)}
/>
 
// --- Rich description ---
<ConfirmModal
  open={open}
  intent="danger"
  title="Flag as exception?"
  description={
    <span>
      Order <MonoID id="#FR-48291" variant="order" copyable={false} /> will be
      moved to the exception queue and the assigned carrier will be notified.
    </span>
  }
  confirmLabel="Flag exception"
  onConfirm={handleConfirm}
  onCancel={() => setOpen(false)}
/>
 
*/
