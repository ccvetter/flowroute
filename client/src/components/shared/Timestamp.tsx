// Formatted date/time with relative label ("2m ago")
import React from 'react';

/**
 * Types
 */
export type TimestampFormat =
    | 'relative'        // "2m ago", "just now", "3d ago"
    | 'absolute'        // "May 28, 2026 · 09:14"
    | 'absolute-short'  // "May 28 · 09:14"
    | 'date-only'       // "May 28, 2026"
    | 'time-only'       // "09:14 EDT"
    | 'combined'        // relative when recent, absolute when older
    | 'compact';        // "28 May" / "09:14" / "28/05"

export type TimestampSize = 'xs' | 'sm' | 'md';

export type TimestampThreshold =
    | number   // seconds - switch from relative to absolute after N seconds
    | 'never'; // always stay relative

export interface TimestampProps {
    /** The date/time to display. Accepts Date, ISO string, or Unix ms. */
    value: Date | string | number;
    /**
     * Display format. Defaults to 'combined' - relative when under 24h,
     * absolute-short beyond that.
     */
    format?: TimestampFormat;
    /**
     * For 'combined' format: seconds of age past which the display
     * switches from relative to absolute-short. Defaults to 86400 (24h).
     */
    relativeThreshold?: number;
    /** Locale for absolute formatting. Defaults to 'en-US' */
    locale?: string;
    /** IANA timezone for absolute formatting. Defaults to the browser's local zone. */
    timezone?: string;
    /**
     * Whether to use 24-hour clock in absolue formats.
     * Defaults to false (12-hour with am/pm).
     */
    hour24?: boolean;
    /**
     * Live update interval in milliseconds for relative timestamps.
     * Pass 0 to disable live updates. Defaults to 30000 (30s).
     */
    updateInterval?: number;
    /** Text size. Defaults to 'sm'. */
    size?: TimestampSize;
    /**
     * Show a clock icon before the text.
     * Defaults to false.
     */
    icon?: boolean;
    /**
     * Render the full absolute datetime in a native browser tooltip.
     * Defaults to true.
     */
    tooltip?: boolean;
    /** Additional class names. */
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Tokens
 */
const SIZE_STYLES: Record<TimestampSize, React.CSSProperties> = {
    xs: { fontSize: '10px', letterSpacing: '0.01em' },
    sm: { fontSize: '11px', letterSpacing: '0.01em' },
    md: { fontSize: '13px', letterSpacing: '0' },
};

const THRESHOLDS = {
    JUST_NOW:  45,  // < 45S -> "just now"
    MINUTE:    60,
    HOUR:      3_600,
    DAY:       86_400,
    WEEK:      604_000,
    MONTH:     2_592_000,
    YEAR:      31_536_000,
} as const;

/**
 * Helpers
 */
function toDate(value: Date | string | number): Date {
    if (value instanceof Date) return value;
    return new Date(value);
}

function ageSeconds(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / 1000);
}

function formatRelative(date: Date): string {
    const age = ageSeconds(date);
    const abs = Math.abs(age);
    const future = age < 0;
    const suffix = future ? 'from now' : 'ago';

    if (abs < THRESHOLDS.JUST_NOW) return 'just now';

    if (abs < THRESHOLDS.MINUTE) {
        const s = abs;
        return `${s}s ${suffix}`;
    }
    if (abs < THRESHOLDS.HOUR) {
        const m = Math.floor(abs / THRESHOLDS.MINUTE);
        return `${m}m ${suffix}`;
    }
    if (abs < THRESHOLDS.DAY) {
        const h = Math.floor(abs / THRESHOLDS.HOUR);
        return `${h}h ${suffix}`;
    }
    if (abs < THRESHOLDS.WEEK) {
        const d = Math.floor(abs / THRESHOLDS.DAY);
        return `${d}d ${suffix}`;
    }
    if (abs < THRESHOLDS.MONTH) {
        const w = Math.floor(abs / THRESHOLDS.WEEK);
        return `${w}w ${suffix}`;
    }
    if (abs < THRESHOLDS.YEAR) {
        const mo = Math.floor(abs / THRESHOLDS.MONTH);
        return `${mo}mo ${suffix}`;
    }
    const yr = Math.floor(abs / THRESHOLDS.YEAR);
    return `${yr}y ${suffix}`;
}

function formatAbsolute(
    date: Date,
    locale: string,
    timezone: string | undefined,
    hour24: boolean,
): string {
    const dateStr = date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(timezone ? { timeZone: timezone } : {}),
    });
    const timeStr = date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: !hour24,
        ...(timezone ? { timeZone: timezone} : {}),
    });
    return `${dateStr} · ${timeStr}`;
}

function formatAbsoluteShort(
    date: Date,
    locale: string,
    timezone: string | undefined,
    hour24: boolean,
): string {
    const dateStr = date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        ...(timezone ? { timeZone: timezone } : {}),
    });
    const timeStr = date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: !hour24,
        ...(timezone ? { timeZone: timezone } : {}),
    });
    return `${dateStr} · ${timeStr}`;
}

function formatDateOnly(
    date: Date,
    locale: string,
    timezone: string | undefined,
): string {
    return date.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        ...(timezone ? { timeZone: timezone } : {}),
    });
}

function formatTimeOnly(
    date: Date,
    locale: string,
    timezone: string | undefined,
    hour24: boolean,
): string {
    return date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        hour12: !hour24,
        ...(timezone ? { timeZone: timezone } : {}),
    });
}

function formatCompact(
    date: Date,
    locale: string,
    timezone: string | undefined,
    hour24: boolean,
): string {
    const age = ageSeconds(date);
    // Within today - show time only
    if (Math.abs(age) < THRESHOLDS.DAY) {
        return date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: !hour24,
            ...(timezone ? { timeZone: timezone } : {}),
        });
    }
    // Within this year - show date + month
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    if (sameYear) {
        return date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            ...(timezone ? { timeZone: timezone } : {}),
        });
    }
    // Older - show short date with year
    return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        ...(timezone ? { timeZone: timezone } : {}),
    });
}

function formatTooltip(date: Date): string {
    return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    });
}

function resolve(
    date: Date,
    format: TimestampFormat,
    relativeThreshold: number,
    locale: string,
    timezone: string | undefined,
    hour24: boolean,
): string {
    switch (format) {
        case 'relative':
            return formatRelative(date);

        case 'absolute':
            return formatAbsolute(date, locale, timezone, hour24);

        case 'absolute-short':
            return formatAbsoluteShort(date, locale, timezone, hour24);

        case 'date-only':
            return formatDateOnly(date, locale, timezone);

        case 'time-only':
            return formatTimeOnly(date, locale, timezone, hour24);

        case 'compact':
            return formatCompact(date, locale, timezone, hour24);

        case 'combined': {
            const age = Math.abs(ageSeconds(date));
            return age <= relativeThreshold
                ? formatRelative(date)
                : formatAbsoluteShort(date, locale, timezone, hour24);
        }
    }
}

/**
 * Clock icon
 */
const ClockIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
    >
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 5v3.25L10.25 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-timestamp';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-timestamp {
            font-family: 'IBM Plex Mono', monospace;
            color: #888780;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            line-height: 1.4;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(el);
}

/**
 * Component
 */
export const Timestamp = React.forwardRef<HTMLTimeElement, TimestampProps>(
    (
        {
            value,
            format = 'combined',
            relativeThreshold = THRESHOLDS.DAY,
            locale = 'en-US',
            timezone,
            hour24 = false,
            updateInterval = 30_000,
            size = 'sm',
            icon = false,
            tooltip = true,
            className,
            style,
        },
        ref,
    ) => {
        React.useEffect(() => { ensureStyles(); }, []);

        const date = React.useMemo(() => toDate(value), [value]);

        const [display, setDisplay] = React.useState(() => 
            resolve(date, format, relativeThreshold, locale, timezone, hour24),
        );

        // Live update for relative/combined formats
        const isLive = 
            updateInterval > 0 &&
                (format === 'relative' || format === 'combined' || format === 'compact');

        React.useEffect(() => {
            setDisplay(resolve(date, format, relativeThreshold, locale, timezone, hour24));
            if (!isLive) return;

            const id = setInterval(() => {
                setDisplay(resolve(date, format, relativeThreshold, locale, timezone, hour24));
            }, updateInterval);

            return () => clearInterval(id);
        }, [date, format, relativeThreshold, locale, timezone, hour24, updateInterval, isLive]);

        const iconSize = size === 'xs' ? 10 : size === 'sm' ? 11 : 13;
        const tooltipText = tooltip ? formatTooltip(date) : undefined;

        return (
            <time
                ref={ref}
                className={['fr-timestamp', className].filter(Boolean).join(' ')}
                style={{ ...SIZE_STYLES[size], ...style }}
                dateTime={date.toISOString()}
                title={tooltipText}
            >
                {icon && <ClockIcon size={iconSize} />}
                {display}
            </time>
        );
    },
);

Timestamp.displayName = 'Timestamp';

export default Timestamp;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Formats ---
<Timestamp value={date} format="relative"       />   // "2m ago", "3h ago", "just now"
<Timestamp value={date} format="absolute"       />   // "May 28, 2026 · 9:14 AM"
<Timestamp value={date} format="absolute-short" />   // "May 28 · 9:14 AM"
<Timestamp value={date} format="date-only"      />   // "May 28, 2026"
<Timestamp value={date} format="time-only"      />   // "9:14 AM EDT"
<Timestamp value={date} format="compact"        />   // "9:14 AM" / "28 May" / "05/28/26"
<Timestamp value={date} format="combined"       />   // relative if < 24h, absolute-short if older
 
// --- Input types ---
<Timestamp value={new Date()}              />
<Timestamp value="2026-05-28T09:14:00Z"   />   // ISO string
<Timestamp value={1748426040000}          />   // Unix ms
 
// --- Sizes ---
<Timestamp value={date} size="xs" />   // 10px — dense table cells
<Timestamp value={date} size="sm" />   // 11px — default
<Timestamp value={date} size="md" />   // 13px — detail drawers
 
// --- 24-hour clock ---
<Timestamp value={date} hour24 />   // "28 May · 14:30"
 
// --- Timezone ---
<Timestamp value={date} timezone="America/New_York" />
<Timestamp value={date} timezone="Europe/London"    />
<Timestamp value={date} timezone="UTC"              />
 
// --- With clock icon ---
<Timestamp value={date} icon />
 
// --- Disable tooltip ---
<Timestamp value={date} tooltip={false} />
 
// --- Custom relative threshold (switch to absolute after 1 hour) ---
<Timestamp value={date} format="combined" relativeThreshold={3600} />
 
// --- Disable live updates ---
<Timestamp value={date} updateInterval={0} />
 
// --- Custom update interval (every 10s) ---
<Timestamp value={date} updateInterval={10_000} />
 
// --- In an order table row ---
<td className="col-mono">
  <Timestamp value={order.createdAt} format="combined" size="xs" />
</td>
 
// --- In an audit trail event ---
<div className="audit-ts">
  <Timestamp value={event.at} format="absolute-short" size="xs" />
</div>
 
// --- In a pick task card ---
<span style={{ display:'flex', alignItems:'center', gap:6 }}>
  <Timestamp value={task.dueAt} format="relative" icon size="xs" />
</span>
 
// --- In a navbar / header ---
<Timestamp
  value={Date.now()}
  format="absolute"
  size="xs"
  updateInterval={60_000}
/>
 
*/