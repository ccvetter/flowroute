// barcode scan input field with success/error feedback for confirming picks and packing
import React from 'react';
import { Spinner } from '../shared/Spinner.js';

/**
 * Types
 */
export type ScanConfirmState =
    | 'idle'       // waiting for input
    | 'scanning'   // user is typing / scanner is active
    | 'validating' // async check in-flight
    | 'success'    // scan matched
    | 'error'      // scan did not match
    | 'disabled';  // task complete or locked
    
export type ScanConfirmSize = 'sm' | 'md' | 'lg';

export type ScanInputMode =
    | 'barcode'  // standard barcode scanner (auto-submits on Enter)
    | 'manual'   // manual keyboard entry (shows submit button)
    | 'either';  // auto-submit on Enter, but also shows button (default)

export interface ScanConfirmInputProps {
    /** Current controlled state. Defaults to 'idle'. */
    scanState?: ScanConfirmState;
    /** Size variant. Defaults to 'md'. */
    size?: ScanConfirmSize;
    /** Input mode. Defaults to 'either'. */
    mode?: ScanInputMode;
    /** Placeholder text. Defaults to mode-appropriate string. */
    placeholder?: string;
    /** Label shown above the input. */
    label?: string;
    /**
     * The expected value to match against.
     * When provided, the component validates locally on submit.
     * When omitted, all scans are passed to `onScan` for external validation.
     */
    expectedValue?: string;
    /**
     * Message shown in the success state.
     * Defaults to "Confirmed".
     */
    successMessage?: string;
    /**
     * Message shown in the error state.
     * Defaults to "No match - try again".
     */
    errorMessage?: string;
    /**
     * Message shown in the validating state.
     * Defaults to "Checking...".
     */
    validatingMessage?: string;
    /**
     * Called when the user submits a scan value.
     * Return a promise to trigger the 'validating' state automatically.
     * Resolve true/false to drive success/error, or handle state externally.
     */
    onScan?: (value: string) => void | boolean | Promise<boolean | void>;
    /**
     * Called after a successful scan confirmation.
     */
    onConfirm?: (value: string) => void;
    /**
     * Called after a failed scan.
     */
    onError?: (value: string) => void;
    /**
     * Milliseconds to hold the success/error state before resetting to idle.
     * Pass 0 to stay in that state until externally reset.
     * Defaults to 1800.
     */
    resetDelay?: number;
    /**
     * Focus the input on mount.
     * Defaults to true - scanners and floor staff expect immediate focus.
     */
    autoFocus?: boolean;
    /**
     * Play a short audio tone on success/error.
     * Requires user gesture to unlock AudioContext on some browsers.
     * Defaults to false.
     */
    sound?: boolean;
    /**
     * Vibrate on success/error (mobile/tablet devices).
     * Defaults to false.
     */
    haptic?: boolean;
    /** Controlled value. */
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
interface SizeTokens {
    height:       number;
    fontSize:     string;
    iconSize:     number;
    btnHeight:    number;
    feedbackSize: string;
    gap:          number;
    borderRadius: string;
    padding:      string;
}

const SIZE_TOKENS: Record<ScanConfirmSize, SizeTokens> = {
    sm: { height: 40, fontSize: '14px', iconSize: 14, btnHeight: 32, feedbackSize: '11px', gap: 6, borderRadius: '6px', padding: '0 12px' },
    md: { height: 52, fontSize: '18px', iconSize: 18, btnHeight: 40, feedbackSize: '12px', gap: 8, borderRadius: '8px', padding: '0 16px' },
    lg: { height: 64, fontSize: '22px', iconSize: 22, btnHeight: 48, feedbackSize: '13px', gap: 10, borderRadius: '10px', padding: '0 20px' },
};

interface StateTokens {
    border:        string;
    background:    string;
    color:         string;
    shadow:        string;
    feedbackColor: string;
}

const STATE_TOKENS: Record<ScanConfirmState, StateTokens> = {
    idle: {
        border:        'rgba(60,60,58,0.18)',
        background:    '#F8F7F2',
        color:         '#3C3C3A',
        shadow:        'none',
        feedbackColor: '#888780',
    },
    scanning: {
        border:        '#BA7517',
        background:    '#FFFFFF',
        color:         '#3C3C3A',
        shadow:        '0 0 0 3px rgba(186,117,23,0.18)',
        feedbackColor: '#BA7517',
    },
    validating: {
        border:        '#BA7517',
        background:    '#FFFFFF',
        color:         '#3C3C3A',
        shadow:        '0 0 0 3px rgba(186,117,23,0.12)',
        feedbackColor: '#BA7517',
    },
    success: {
        border:        '#0F6E56',
        background:    '#E1F5EE',
        color:         '#712B13',
        shadow:        '0 0 0 3px rgba(216,90,48,0.15)',
        feedbackColor: '#D85A30',
    },
    error: {
        border:        '#D85A30',
        background:    '#FAECE7',
        color:         '#712B13',
        shadow:        '0 0 0 3px rgba(216,90,48,0.15)',
        feedbackColor: '#D85A30',
    },
    disabled: {
        border:        'rgba(60,60,58,0.10)',
        background:    '#F1EFE8',
        color:         '#B4B2A9',
        shadow:        'none',
        feedbackColor: '#B4B2A9',
    },
};

/**
 * Audio feedback (Web Audio API)
 */
function playTone(type: 'success' | 'error') {
    if (typeof window === 'undefined') return;
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'success') {
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.setValueAtTime(180, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        }
    } catch {
        // AudioContext unavailable - silently skip
    }
}

function triggerHaptic(type: 'success' | 'error') {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    if (type === 'success') navigator.vibrate([40, 20, 40]);
    else                    navigator.vibrate([80, 30, 80, 30, 80]);
}

/**
 * Icons
 */
const BarcodeIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 5h2v14H3zM6 5h1v14H6zM8 5h2v14H8zM11 5h1v14h-1zM13 5h3v14h-3zM17 5h1v14h-1zM19 5h2v14h-2z"
            fill={color} />
    </svg>
);

const SuccessIcon: React.FC<{ size: number}> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="#0F6E56" />
        <path d="M7.5 12.5l3 3 6-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="#D85A30" />
        <path d="M9 9l6 6M15 91-6 6" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
);

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-scan-input';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-scan { display: flex; flex-direction: column; width: 100%; }

        .fr-scan__label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #888780;
            margin-bottom: 6px;
        }

        .fr-scan__row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .fr-scan__wrap {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
        }

        .fr-scan__icon {
            position: absolute;
            left: 14px;
            pointer-events: none;
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }

        .fr-scan__state-icon {
            position: absolute;
            right: 14px;
            pointer-events: none;
            display: flex;
            align-items: center;
        }

        .fr-scan__input {
            width: 100%;
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            text-align: center;
            letter-spacing: 0.06em;
            border-style: solid;
            border-width: 1.5px;
            outline: none;
            transition: 
                border-color 140ms ease,
                background   140ms ease,
                color        140ms ease,
                box-shadow   140ms ease;
        }

        .fr-scan__input::placeholder {
            font-weight: 400;
            letter-spacing: 0.04em;
            opacity: 0.5;
        }

        .fr-scan__input:disabled {
            cursor: not-allowed;
        }

        .fr-scan__submit {
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            letter-spacing: 0.06em;
            background: #BA7517;
            color: #FFFFFF;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            white-space: nowrap;
            transition: background 120ms ease, transform 80ms ease;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }
        .fr-scan__submit:hover:not(:disabled) { background: #EF9F27; }
        .fr-scan__submit:active:not(:disabled) { transform: scale(0.97); }
        .fr-scan__submit:disabled {
            background: rgba(60,60,58,0.15);
            color: #888780;
            cursor: not-allowed;
        }
        .fr-scan__submit:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(186,117,23,0.28);
        }

        .fr-scan__feedback {
            display: flex;
            align-items: center;
            gap: 5px;
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 500;
            margin-top: 6px;
            min-height: 18px;
            animation: fr-scan-feedback-in 160ms ease;
        }

        @keyframes fr-scan-feedback-in {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fr-scan__input--success { animation: fr-scan-flash-success 400ms ease; }
        .fr-scan__input--error   { animation: fr-scan-flash-error   300ms ease; }

        @keyframes fr-scan-flash-success {
            0%   { box-shadow: 0 0 0 0   rgba(15,110,86,0.5); }
            50%  { box-shadow: 0 0 0 8px rgba(15,110,86,0.2); }
            100% { box-shadow: 0 0 0 3px  rgba(15,110,86,0.15); }
        }
        @keyframes fr-scan-flash-error {
            0%    { transform: translateX(0); }
            20%   { transform: translateX(-5); }
            40%   { transform: translateX(5px); }
            60%   { transform: translateX(-4px); }
            80%   { transform: translateX(4px); }
            100%  { transform: translateX(0); }
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const ScanConfirmInput = React.forwardRef<
    HTMLInputElement,
    ScanConfirmInputProps
>(
    (
        {
            scanState: controlledState,
            size = 'md',
            mode = 'either',
            placeholder,
            label,
            expectedValue,
            successMessage = 'Confirmed',
            errorMessage = 'No match - try again',
            validatingMessage = 'Checking...',
            onScan,
            onConfirm,
            onError,
            resetDelay = 1800,
            autoFocus = true,
            sound = false,
            haptic = false,
            value: controlledValue,
            onChange,
            className,
            style,
        },
        ref,
    ) => {
        const [internalState, setInternalState] =
            React.useState<ScanConfirmState>('idle');
        const [internalValue, setInternalValue] = React.useState('');
        const inputRef = React.useRef<HTMLInputElement>(null);
        const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

        React.useEffect(() => { ensureStyles(); }, []);

        // Merge controlled / uncontrolled
        const scanState = controlledState ?? internalState;
        const value     = controlledValue ?? internalValue;

        const isDisabled = scanState === 'disabled';
        const isLocked   = scanState === 'success' || scanState === 'validating' || isDisabled;

        // Auto-focus
        React.useEffect(() => {
            if (autoFocus && !isDisabled) {
                const el = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current;
                el?.focus();
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [autoFocus]);

        // Cleanup timer on unmount
        React.useEffect(() => {
            return () => {
                if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
            };
        }, []);

        function scheduleReset(delay: number) {
            if (delay === 0) return;
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
            resetTimerRef.current = setTimeout(() => {
                setInternalState('idle');
                setInternalValue('');
                onChange?.('');
                const el = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current;
                el?.focus();
            }, delay);
        }

        function successState(trimmed: string) {
            setInternalState('success');
            if (sound) playTone('success');
            if (haptic) triggerHaptic('success');
            onConfirm?.(trimmed);
            scheduleReset(resetDelay);
        }

        function errorState(trimmed: string) {
            setInternalState('error');
            if (sound) playTone('error');
            if (haptic) triggerHaptic('error');
            onError?.(trimmed);
            scheduleReset(resetDelay);
        }

        async function handleSubmit(raw: string) {
            const trimmed = raw.trim();
            if (!trimmed || isLocked) return;

            // Local validation when expectedValue is provided
            if (expectedValue !== undefined) {
                const matched = trimmed === expectedValue;
                if (matched) {
                   successState(trimmed);
                } else {
                    errorState(trimmed);
                }
                return;
            }

            // External validation via onScan
            if (onScan) {
                const result = onScan(trimmed);
                if (result instanceof Promise) {
                    setInternalState('validating');
                    try {
                        const outcome = await result;
                        if (outcome === true) {
                            successState(trimmed);
                        } else if (outcome === false) {
                            errorState(trimmed);
                        }
                    } catch {
                        setInternalState('error');
                        if (sound) playTone('error');
                        if (haptic) triggerHaptic('error');
                        scheduleReset(resetDelay);
                    }
                } else if (result == true) {
                    successState(trimmed);
                } else if (result === false) {
                    errorState(trimmed);
                }
            }
        }

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            const v = e.target.value;
            if (!controlledValue) setInternalValue(v);
            onChange?.(v);
            if (internalState !== 'scanning') setInternalState(v ? 'scanning' : 'idle');
        }

        function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(value);
            }
            if (e.key === 'Escape') {
                setInternalState('idle');
                setInternalValue('');
                onChange?.('');
            }
        }

        // Derive display values
        const tok = SIZE_TOKENS[size];
        const stTok = STATE_TOKENS[scanState];

        const showSubmitBtn =
            (mode === 'manual' || mode === 'either') &&
            scanState !== 'success' &&
            scanState !== 'disabled';

        const resolvedPlaceholder =
            placeholder ??
            (mode === 'barcode' ? 'Scan barcode...' :
             mode === 'manual'  ? 'Enter SKU or order ID...' :
                                  'Scan or type...');

        // Feedback message
        const feedbackMessage =
            scanState === 'success'   ? successMessage :
            scanState === 'error'     ? errorMessage :
            scanState === 'validating' ? validatingMessage :
            null;

        // Left icon
        const leftIcon = (
            <BarcodeIcon
                size={tok.iconSize}
                color={
                    scanState === 'success' ? '#0F6E56' :
                    scanState === 'error'   ? '#D85A30' :
                    scanState === 'scanning' || scanState === 'validating' ? '#BA7517' :
                    '#B4B2A9'
                }
            />
        );

        // Right state icon
        const rightIcon =
            scanState === 'success'   ? <SuccessIcon size={tok.iconSize} /> :
            scanState === 'error'     ? <ErrorIcon   size={tok.iconSize} /> :
            scanState === 'validating' ? <Spinner px={tok.iconSize} intent="brand" /> :
            null;

        const inputAnimClass =
            scanState === 'success' ? 'fr-scan__input--success' :
            scanState === 'error'   ? 'fr-scan__input--error'   :
            '';

        const iconPadding = `calc(${tok.padding.split(' ')[1]} + ${tok.iconSize}px + 10px)`;

        return (
            <div
                className={['fr-scan', className].filter(Boolean).join(' ')}
                style={style}
            >
                {/* Label */}
                {label && (
                    <label className="fr-scan__label">
                        {label}
                    </label>
                )}

                <div className="fr-scan__row">
                    {/* Input wrapper */}
                    <div className="fr-scan__wrap">
                        {/* Left barcode icon */}
                        <span className="fr-scan__icon">
                            {leftIcon}
                        </span>

                        <input
                            ref={(node) => {
                                (inputRef as React.RefObject<HTMLInputElement | null>).current = node;
                                if (typeof ref === 'function') ref(node);
                                else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
                            }}
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            className={['fr-scan__input', inputAnimClass].filter(Boolean).join(' ')}
                            style={{
                                height:       tok.height,
                                fontSize:     tok.fontSize,
                                paddingLeft:  iconPadding,
                                paddingRight: rightIcon ? iconPadding : tok.padding.split(' ')[1],
                                borderRadius: tok.borderRadius,
                                borderColor:  stTok.border,
                                background:   stTok.background,
                                color:        stTok.color,
                                boxShadow:    stTok.shadow,
                            }}
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (scanState === 'idle' && value) setInternalState('scanning');
                            }}
                            onBlur={() => {
                                if (scanState === 'scanning' && !value) setInternalState('idle');
                            }}
                            placeholder={resolvedPlaceholder}
                            disabled={isDisabled || scanState === 'validating' || scanState === 'success'}
                            aria-label={label ?? 'Scan or enter barcode'}
                            aria-invalid={scanState === 'error'}
                            aria-busy={scanState === 'validating'}
                            aria-describedby={feedbackMessage ? 'fr-scan-feedback' : undefined}
                        />

                        {/* Right state icon */}
                        {rightIcon && (
                            <span className="fr-scan__state-icon">{rightIcon}</span>
                        )}
                    </div>

                    {/* Submit button */}
                    {showSubmitBtn && (
                        <button
                            type="button"
                            className="fr-scan__submit"
                            style={{
                                height: tok.btnHeight,
                                padding: `0 ${parseInt(tok.padding.split(' ')[1] ?? '0', 10) * 1.2}px`,
                                borderRadius: tok.borderRadius,
                                fontSize: `calc(${tok.fontSize} * 0.7)`,
                            }}
                            onClick={() => handleSubmit(value)}
                            disabled={!value.trim() || isLocked}
                            aria-label="Confirm scan"
                        >
                            Confirm
                        </button>
                    )}
                </div>

                {/* Feedback message */}
                {feedbackMessage && (
                    <div
                        id="fr-scan-feedback"
                        className="fr-scan__feedback"
                        style={{
                            fontSize: tok.feedbackSize,
                            color: stTok.feedbackColor,
                            gap: tok.gap * 0.6,
                        }}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {feedbackMessage}
                    </div>
                )}
            </div>
        );
    },
);

ScanConfirmInput.displayName = 'ScanConfirmInput';

export default ScanConfirmInput;


// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Uncontrolled with local validation ---
<ScanConfirmInput
  expectedValue="SKU-00412"
  onConfirm={(val) => console.log('Confirmed:', val)}
  onError={(val)   => console.log('Mismatch:',  val)}
/>
 
// --- External async validation ---
<ScanConfirmInput
  onScan={async (val) => {
    const ok = await validateBarcode(val);
    return ok;   // true → success, false → error
  }}
  onConfirm={(val) => advancePickTask(val)}
/>
 
// --- Sizes ---
<ScanConfirmInput size="sm" />   // compact — secondary confirmation
<ScanConfirmInput size="md" />   // default — pick task main input
<ScanConfirmInput size="lg" />   // prominent — full-screen pick mode
 
// --- Input modes ---
<ScanConfirmInput mode="barcode" />   // Enter auto-submits, no button
<ScanConfirmInput mode="manual"  />   // button only, no Enter submit
<ScanConfirmInput mode="either"  />   // Enter + button (default)
 
// --- Controlled state (external state machine) ---
const [state, setState] = React.useState<ScanConfirmState>('idle');
<ScanConfirmInput
  scanState={state}
  onScan={(val) => {
    setState('validating');
    validateScan(val).then(ok => setState(ok ? 'success' : 'error'));
  }}
  resetDelay={0}   // manage reset externally
/>
 
// --- With label ---
<ScanConfirmInput
  label="Scan item barcode"
  expectedValue={task.sku}
/>
 
// --- Custom messages ---
<ScanConfirmInput
  successMessage="SKU matched — proceed to packing"
  errorMessage="Wrong item — check the bin location"
  validatingMessage="Verifying with carrier…"
  expectedValue="SKU-00412"
/>
 
// --- Sound + haptic (floor devices) ---
<ScanConfirmInput
  expectedValue={task.sku}
  sound
  haptic
/>
 
// --- Disabled (task complete) ---
<ScanConfirmInput
  scanState="disabled"
  value={completedScan}
/>
 
// --- Reset delay ---
<ScanConfirmInput
  expectedValue="SKU-00412"
  resetDelay={3000}   // hold success/error for 3s
/>
<ScanConfirmInput
  expectedValue="SKU-00412"
  resetDelay={0}      // never auto-reset
/>
 
// --- No auto-focus (multiple inputs on page) ---
<ScanConfirmInput autoFocus={false} expectedValue="SKU-00412" />
 
// --- In a PickTask card ---
<div className="pick-task">
  <div className="pick-task__bin">B-04</div>
  <div className="pick-task__info">
    <p className="pick-task__sku">SKU-00412</p>
    <p className="pick-task__name">Nike Air Max 90 — Size 10</p>
  </div>
  <ScanConfirmInput
    label="Scan to confirm"
    expectedValue="SKU-00412"
    size="md"
    sound
    haptic
    onConfirm={() => completePickTask(task.id)}
  />
</div>
 
*/