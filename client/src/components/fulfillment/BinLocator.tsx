// visual warehouse zone map highlighting target bin locations for current pick tasks
import React from 'react';
import { SectionLabel } from '../shared/SectionLabel.js';
import { MonoID } from '../shared/MonoID.js';

/**
 * Types
 */
export type BinLocatorSize = 'sm' | 'md' | 'lg';
export type BinLocatorView = 'map' | 'detail' | 'both';

/**
 * A warehouse is divided into Zones (A-Z), each zone has Aisles (1-99),
 * each aisle has Bays (A-Z), each bay has Levels (1-9).
 * 
 * Full bin address: ZONE-AISLE-BAY-LEVEL e.g. "B-04-C-2"
 */
export interface BinAddress {
    zone:  string; // e.g. "B"
    aisle: string; // e.g. "04"
    bay:   string; // e.g. "C"
    level: string; // e.g. "2"
}

export interface BinLocatorProps {
    /** Target bin address. */
    bin: BinAddress | string;
    /**
     * All zones present in the warehouse.
     * Used to render the map grid. Defaults to A-H (8 zones).
     */
    zones?: string[];
    /**
     * Number of aisles per zone, used to size the aisle grid.
     * Defaults to 8.
     */
    aislesPerZone?: number;
    /** Size variant. Defaults to 'md'. */
    size?: BinLocatorSize;
    /**
     * Which views to render.
     * - 'map'    -- zone grid overview only
     * - 'detail' -- bin address breakdown only
     * - 'both'   -- map + detail (default)
     */
    view?: BinLocatorView;
    /**
     * Highlight a secondary bin - useful for showing origin + destination
     * during a transfer task.
     */
    secondaryBin?: BinAddress | string;
    /** Called when the user taps a zone cell on the map. */
    onZoneClick?: (zone: string) => void;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Helpers
 */
const DEFAULT_ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function parseBin(bin: BinAddress | string): BinAddress {
    if (typeof bin !== 'string') return bin;
    // Accepts "B-04-C-2" or "B04C2" - normalise to parts
    const parts = bin.toUpperCase().split('-');
    if (parts.length === 4) {
        return {
            zone: parts[0] ?? '?',
            aisle: parts[1] ?? '??',
            bay: parts[2] ?? '?',
            level: parts[3] ?? '?',
        };
    }
    // Best-effort parse of compact form e.g. "B04C2"
    const match = bin.toUpperCase().match(/^([A-Z]+)(\d+)([A-Z]+)(\d+)$/);
    if (match) {
        return {
            zone: match[1] ?? '?',
            aisle: match[2] ?? '??',
            bay: match[3] ?? '?',
            level: match[4] ?? '?',
        };
    }

    return { zone: bin, aisle: '??', bay: '?', level: '?' }
}

function binToString(bin: BinAddress): string {
    return `${bin.zone}-${bin.aisle}-${bin.bay}-${bin.level}`;
}

/** Map aisle string to a column index (0-based) */
function aisleIndex(aisle: string, total: number): number {
    const n = parseInt(aisle, 10);
    if (!isNaN(n)) return Math.min(n - 1, total - 1);
    // Letter aisle: A=0, B=1, ...
    return Math.min(aisle.charCodeAt(0) - 65, total - 1);
}

/** Map bay letter to a row index. A=0, B=1, ... */
function bayIndex(bay: string): number {
    return bay.charCodeAt(0) - 65;
}

/**
 * Tokens
 */
interface SizeTokens {
    zoneCell: number;
    aisleCell: number;
    gap: number;
    labelSize: string;
    addrSize: string;
    detailGap: number;
    padding: string;
}

const SIZE_TOKENS: Record<BinLocatorSize, SizeTokens> = {
    sm: { zoneCell: 22, aisleCell: 8, gap: 3, labelSize: '9px', addrSize: '18px', detailGap: 8, padding: '12px' },
    md: { zoneCell: 28, aisleCell: 10, gap: 4, labelSize: '10px', addrSize: '22px', detailGap: 12, padding: '16px' },
    lg: { zoneCell: 36, aisleCell: 13, gap: 5, labelSize: '11px', addrSize: '28px', detailGap: 16, padding: '20px' },
};

// Colors
const C = {
    surface:        '#FFFFFF',
    border:         'rgba(60,60,58,0.12)',
    zoneBg:         '#F1EFE8',
    zoneText:       '#888780',
    zoneActive:     '#BA7517',
    zoneActiveBg:   '#FAEEDA',
    zoneActiveText: '#633806',
    zoneSecondary:  '#0F6E56',
    zoneSecondaryBg: '#E1F5EE',
    zoneSecondaryText: '#085041',
    aisleBg:        'rgba(60,60,58,0.06)',
    aisleActive:    '#BA7517',
    aisleSecondary: '#0F6E56',
    binBg:          '#BA7517',
    binSecBg:       '#0F6E56',
    labelText:      '#888780',
    addrText:       '#3C3C3A',
    divider:        'rgba(60,60,58,0.08)',
    levelColors:    ['#F1EFE8', '#D3D1C7', '#888780', '#3C3C3A', '#1A1A18'],
} as const;

/**
 * Style injection
 */
const STYLE_ID = 'flowroute-bin-locator';

function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
        .fr-bin {
            font-family: 'IBM Plex Mono', monospace;
            background: ${C.surface};
            border: 1px solid ${C.border};
            border-radius: 10px;
            display: inline-flex;
            flex-direction: column;
            overflow: hidden;
        }
        .fr-bin__section {
            padding: 0;
        }
        .fr-bin__divider {
            height: 1px;
            background: ${C.divider};
        }
        /* Zone grid */
        .fr-bin__zone-grid {
            display: flex;
            flex-wrap: wrap;
        }
        .fr-bin__zone-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            cursor: pointer;
            transition: background 120ms ease, color 120ms ease;
            user-select: none;
            letter-spacing: 0.04em;
        }
        .fr-bin__zone-cell:hover:not(.fr-bin__zone-cell--active):not(.fr-bin__zone-cell--secondary) {
            background: rgba(186,117,23,0.08);
        }

        /* Aisle grid (inside zone detail) */
        .fr-bin__aisle-grid {
            display: grid;
        }
        .fr-bin__aisle-cell {
            border-radius: 2px;
            transition: background 120ms ease;
        }

        /* Level indicator */
        .fr-bin__levels {
            display: flex;
            align-items: flex-end;
            gap: 3px;
        }
        .fr-bin__level-bar {
            border-radius: 2px 2px 0 0;
            transition: background 120ms ease;
            flex: 1;
        }

        /* Detail segment */
        .fr-bin__detail {
            display: flex;
            align-items: center;
        }
        .fr-bin__detail-seg {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        .fr-bin__detail-seg {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        .fr-bin__detail-val {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            color: ${C.addrText};
            line-height: 1;
        }
        .fr-bin__detail-key {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: ${C.labelText}
            margin-top: 3px;
        }
        .fr-bin__detail-divider {
            width: 1px;
            background: ${C.divider};
            align-self: stretch;
        }
        .fr-bin__detail-seg--active .fr-bin__detail-val {
            color: ${C.zoneActive};
        }
        .fr-bin__detail-seg--secondary .fr-bin__detail-val {
            color: ${C.zoneSecondary};
        }

        /* Address footer */
        .fr-bin__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: ${C.zoneBg};
            border-top: 1px solid ${C.divider};
        }
        .fr-bin__footer-label {
            font-family: 'IBM Plex Mono', monospace;
            color: ${C.labelText};
        }
    `;
    document.head.appendChild(el);
}

/**
 * Sub-components
 */
interface ZoneMapProps {
    zones:          string[];
    targetZone:     string;
    secondaryZone?: string;
    tok:            SizeTokens;
    onZoneClick?:   (zone: string) => void;
}

const ZoneMap: React.FC<ZoneMapProps> = ({
    zones, targetZone, secondaryZone, tok, onZoneClick,
}) => {
    // Lay out zones in a roughly square grid
    const cols = Math.ceil(Math.sqrt(zones.length));

    return (
        <div style={{ padding: tok.padding }}>
            <SectionLabel size="xs" style={{ marginBottom: tok.gap * 2 }}>
                Warehouse Zones
            </SectionLabel>
            <div
                className="fr-bin__zone-grid"
                style={{ gap: tok.gap, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                role="grid"
                aria-label="Warehouse zone map"    
            >
                {zones.map(zone => {
                    const isActive = zone === targetZone;
                    const isSecondary = zone === secondaryZone;
                    const bg =
                        isActive ? C.zoneActiveText :
                        isSecondary ? C.zoneSecondaryBg :
                        C.zoneBg;
                    const color = 
                        isActive ? C.zoneActiveText :
                        isSecondary ? C.zoneSecondaryText :
                        C.zoneText;
                    const border =
                        isActive ? `2px solid ${C.zoneActive}` :
                        isSecondary ? `2px solid ${C.zoneSecondary}` :
                        `1px solid ${C.border}`;

                    return (
                        <div
                            key={zone}
                            role="gridcell"
                            aria-label={`Zone ${zone}${isActive ? ' -- target' : ''}${isSecondary ? ' -- secondary' : ''}`}
                            aria-selected={isActive || isSecondary}
                            className={[
                                'fr-bin__zone-cell',
                                isActive ? 'fr-bin__zone-cell--active' : '',
                                isSecondary ? 'fr-bin__zone-cell--secondary' : '',
                            ].filter(Boolean).join(' ')}
                            style={{
                                width: tok.zoneCell,
                                height: tok.zoneCell,
                                background: bg,
                                color,
                                border,
                                borderRadius: 5,
                                fontSize: tok.labelSize,
                            }}
                            onClick={() => onZoneClick?.(zone)}
                            tabIndex={onZoneClick ? 0 : undefined}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onZoneClick?.(zone); }}
                        >
                            {zone}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface AisleMapProps {
    bin: BinAddress;
    secondaryBin?: BinAddress;
    aislesPerZone: number;
    tok: SizeTokens;
}

const AisleMap: React.FC<AisleMapProps> = ({
    bin, secondaryBin, aislesPerZone, tok,
}) => {
    const BAYS = 4;
    const targetAisle = aisleIndex(bin.aisle, aislesPerZone);
    const targetBay   = Math.min(bayIndex(bin.bay), BAYS - 1);
    const secAisle    = secondaryBin ? aisleIndex(secondaryBin.aisle, aislesPerZone) : -1;
    const secBay      = secondaryBin ? Math.min(bayIndex(secondaryBin.bay), BAYS - 1) : -1;

    return (
        <div style={{ padding: `0 ${tok.padding} ${tok.padding}` }}>
            <SectionLabel size="xs" style={{ marginBottom: tok.gap * 2 }}>
                Zone {bin.zone} - aisle layout
            </SectionLabel>
            <div
                className="fr-bin__aisle-grid"
                style={{
                    gridTemplateColumns: `repeat(${aislesPerZone}, ${tok.aisleCell}px)`,
                    gridTemplateRows:    `repeat(${BAYS}, ${tok.aisleCell}px)`,
                    gap: 2,
                }}
                role="grid"
                aria-label={`Aisle map for zone ${bin.zone}`}
            >
                {Array.from({ length: BAYS }).map((_, bayRow) =>
                    Array.from({ length: aislesPerZone }).map((_, aisleCol) => {
                        const isTarget    = aisleCol === targetAisle && bayRow === targetBay;
                        const isSecondary = aisleCol === secAisle    && bayRow === secBay;
                        const isTargetAisle = aisleCol === targetAisle;
                        const isSecAisle    = aisleCol === secAisle;
            
                        const bg =
                        isTarget    ? C.aisleActive :
                        isSecondary ? C.aisleSecondary :
                        isTargetAisle ? 'rgba(186,117,23,0.18)' :
                        isSecAisle    ? 'rgba(15,110,86,0.14)'  :
                        C.aisleBg;
            
                        return (
                        <div
                            key={`${bayRow}-${aisleCol}`}
                            role="gridcell"
                            aria-label={
                            isTarget    ? `Target bin: aisle ${aisleCol + 1}, bay ${String.fromCharCode(65 + bayRow)}` :
                            isSecondary ? `Secondary bin`  : undefined
                            }
                            className="fr-bin__aisle-cell"
                            style={{
                            background: bg,
                            borderRadius: isTarget || isSecondary ? 3 : 2,
                            width:  tok.aisleCell,
                            height: tok.aisleCell,
                            outline: isTarget    ? `2px solid ${C.aisleActive}`    : isSecondary ? `2px solid ${C.aisleSecondary}` : 'none',
                            outlineOffset: 1,
                            position: 'relative',
                            }}
                        />
                        );
                    }),
                )}
            </div>
            {/* Aisle numbers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${aislesPerZone}, ${tok.aisleCell}px)`,
                gap: 2,
                marginTop: 3,
            }}>
                {Array.from({ length: aislesPerZone }).map((_, i) => (
                    <div key={i} style={{
                        fontSize: '8px',
                        color: i === targetAisle ? C.zoneActive : i === secAisle ? C.zoneSecondary : C.labelText,
                        textAlign: 'center',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontWeight: i === targetAisle || i === secAisle ? 600 : 400,
                    }}>
                        {String(i + 1).padStart(2, '0')}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface LevelIndicatorProps {
    level: string;
    secondaryLevel?: string;
    tok: SizeTokens;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, secondaryLevel, tok }) => {
    const maxLevels = 5;
    const targetLvl = Math.min(Math.max(parseInt(level, 10) || 1, 1), maxLevels);
    const secLvl = secondaryLevel
        ? Math.min(Math.max(parseInt(secondaryLevel, 10) || 1, 1), maxLevels)
        : null;

    const BAR_HEIGHTS = [12, 18, 24, 30, 36];

    return (
        <div style={{ padding: `0 ${tok.padding} ${tok.padding}` }}>
            <SectionLabel size="xs" style={{ marginBottom: tok.gap * 2}}>
                Shelf level
            </SectionLabel>
            <div className="fr-bin__levels" style={{ height: 40, alignItems: 'flex-end' }}>
                {Array.from({ length: maxLevels }).map((_, i) => {
                    const lvl = i + 1;
                    const isTarget = lvl === targetLvl;
                    const isSec = lvl === secLvl;
                    const height = BAR_HEIGHTS[i] ?? 12;
                    const bg =
                        isTarget ? C.binBg :
                        isSec ? C.binSecBg :
                        C.levelColors[i] ?? C.aisleBg;

                    return (
                        <div key={lvl} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div style={{
                                fontSize: '9px',
                                color: isTarget ? C.zoneActive : isSec ? C.zoneSecondary : C.labelText,
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: isTarget || isSec ? 600 : 400,
                                lineHeight: 1,
                            }}>
                                L{lvl}
                            </div>
                            <div
                                className="fr-bin__level-bar"
                                style={{
                                    height,
                                    background: bg,
                                    borderRadius: '2px 2px 0 0',
                                    width: '100%',
                                    outline: isTarget ? `2px solid ${C.binBg}` : isSec ? `2px solid ${C.binSecBg}` : 'none',
                                    outlineOffset: 1,
                                }}
                                aria-label={`Level ${lvl}${isTarget ? ' - target' : ''}${isSec ? ' - secondary' : ''}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface AddressDetailProps {
    bin: BinAddress;
    secondaryBin?: BinAddress;
    tok: SizeTokens;
}

const AddressDetail: React.FC<AddressDetailProps> = ({ bin, secondaryBin, tok }) => {
    const segments: { key: string; val: string; secVal?: string | undefined}[] = [
        { key: 'Zone',  val: bin.zone,  ...(secondaryBin ? { secVal: secondaryBin.zone } : {}) },
        { key: 'Aisle', val: bin.aisle, ...(secondaryBin ? { secVal: secondaryBin.aisle } : {}) },
        { key: 'Bay',   val: bin.bay,   ...(secondaryBin ? { secVal: secondaryBin.bay } : {}) },
        { key: 'Level', val: bin.level, ...(secondaryBin ? { secVal: secondaryBin.level } : {}) },
    ];

    return (
        <div className="fr-bin__detail" style={{ padding: `${tok.padding} 0` }}>
            {segments.map((seg, i) => {
                const changed = secondaryBin && seg.val !== seg.secVal;
                return (
                    <React.Fragment key={seg.key}>
                        { i > 0 && <div className="fr-bin__detail-divider" />}
                        <div
                            className={[
                                'fr-bin__detail-seg',
                                changed ? 'fr-bin__detail-seg--active' : '',
                            ].filter(Boolean).join(' ')}
                            style={{ gap: 4 }}
                        >
                            <div className="fr-bin__detail-val" style={{ fontSize: tok.addrSize }}>
                                {seg.val}
                            </div>
                            <div className="fr-bin__detail-key">{seg.key}</div>
                            {secondaryBin && seg.secVal && seg.secVal !== seg.val && (
                                <div   
                                    className="fr-bin__detail-val fr-bin__detail-seg--secondary"
                                    style={{ fontSize: `calc(${tok.addrSize} * 0.65)`, color: C.zoneSecondary, marginTop: 2 }}
                                >
                                    → {seg.secVal}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/**
 * Component
 */
export const BinLocator: React.FC<BinLocatorProps> = ({
    bin,
    zones = DEFAULT_ZONES,
    aislesPerZone = 8,
    size = 'md',
    view = 'both',
    secondaryBin,
    onZoneClick,
    className,
    style,
}) => {
    React.useEffect(() => { ensureStyles(); }, []);

    const target = parseBin(bin);
    const secondary = secondaryBin ? parseBin(secondaryBin) : undefined;
    const tok = SIZE_TOKENS[size];

    const showMap = view === 'map' || view === 'both';
    const showDetail = view === 'detail' || view === 'both';

    const addressStr = binToString(target);
    const secAddrStr = secondary ? binToString(secondary) : undefined;

    return (
        <div 
            className={['fr-bin', className].filter(Boolean).join(' ')}
            style={style}
            aria-label={`Bin locator: ${addressStr}${secAddrStr ? ` → ${secAddrStr}` : ''}`}
        >
            {/* Zone map */}
            {showMap && (
                <div className="fr-bin__section">
                    <ZoneMap
                        zones={zones}
                        targetZone={target.zone}
                        secondaryZone={secondary?.zone ?? ''}
                        tok={tok}
                        onZoneClick={onZoneClick ?? (() => {})}
                    />
                </div>
            )}

            {/* Aisle map -- only when view includes map */}
            {showMap && (
                <>
                    <div className="fr-bin__divider" />
                    <div className="fr-bin__section">
                        <AisleMap
                            bin={target}
                            secondaryBin={secondary ?? {zone: '', aisle: '', bay: '', level: ''}}
                            aislesPerZone={aislesPerZone}
                            tok={tok}
                        />
                    </div>
                </>
            )}

            {/* Level indicator */}
            {showMap && (
                <>
                    <div className="fr-bin__divider" />
                    <div className="fr-bin__section">
                        <LevelIndicator
                            level={target.level}
                            secondaryLevel={secondary?.level ?? ''}
                            tok={tok}
                        />
                    </div>
                </>
            )}

            {/* Address detail row */}
            {showDetail && (
                <>
                    <div className="fr-bin__divider" />
                    <div className="fr-bin__section">
                        <AddressDetail
                            bin={target}
                            secondaryBin={secondary ?? {zone: '', aisle: '', bay: '', level: ''}}
                            tok={tok}
                        />
                    </div>
                </>
            )}

            {/* Footer - full address in MonoID style */}
            <div 
                className="fr-bin__footer"
                style={{ padding: `${parseInt(tok.padding) / 2}px ${tok.padding}` }}
            >
                <span className="fr-bin__footer-label" style={{ fontSize: tok.labelSize }}>
                    Bin address
                </span>
                <MonoID id={addressStr} variant="bin" size="xs" />
                {secAddrStr && (
                    <>
                        <span style={{ color: C.labelText, fontSize: tok.labelSize, margin: '0 4px' }}>→</span>
                        <MonoID id={secAddrStr} variant="bin" size="xs" />
                    </>
                )}
            </div>
        </div>
    );
};

BinLocator.displayName = 'BinLocator';

export default BinLocator;

// ============================================================
// Usage examples (remove before shipping)
// ============================================================
 
/*
 
// --- Basic usage ---
<BinLocator bin="B-04-C-2" />
 
// --- BinAddress object ---
<BinLocator bin={{ zone: 'B', aisle: '04', bay: 'C', level: '2' }} />
 
// --- Compact form input ---
<BinLocator bin="B04C2" />
 
// --- Sizes ---
<BinLocator bin="B-04-C-2" size="sm" />   // pick task card, tight layout
<BinLocator bin="B-04-C-2" size="md" />   // default — detail drawer
<BinLocator bin="B-04-C-2" size="lg" />   // full-panel view
 
// --- Views ---
<BinLocator bin="B-04-C-2" view="map"    />   // zone + aisle grid only
<BinLocator bin="B-04-C-2" view="detail" />   // address breakdown only
<BinLocator bin="B-04-C-2" view="both"   />   // default
 
// --- Transfer task (origin → destination) ---
<BinLocator
  bin="B-04-C-2"
  secondaryBin="D-07-A-1"
/>
// Amber highlights = current bin
// Teal highlights  = destination bin
// Changed segments shown in detail row with "→ newVal"
 
// --- Custom warehouse layout ---
<BinLocator
  bin="C-03-B-1"
  zones={['A', 'B', 'C', 'D', 'E', 'F']}
  aislesPerZone={12}
/>
 
// --- Zone click handler (navigate to zone overview) ---
<BinLocator
  bin="B-04-C-2"
  onZoneClick={(zone) => navigateTo(`/warehouse/${zone}`)}
/>
 
// --- In a PickTask card ---
<div className="pick-task">
  <div className="pick-task__bin">B-04</div>
  <div className="pick-task__info">...</div>
  <BinLocator bin="B-04-C-2" size="sm" view="detail" />
</div>
 
// --- In an order detail drawer ---
<SectionLabel ruled>Pick location</SectionLabel>
<BinLocator bin={order.binAddress} size="md" />
 
*/
