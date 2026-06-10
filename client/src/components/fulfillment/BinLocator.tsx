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
    bin, secondaryBin, aislePerZone, tok,
}) => {
    const BAYS = 4;
    const targetAisle = aisleIndex(bin.aisle, aislesPerZone);
    const targetBay   = Math.min(bayIndex(bin.bay), BAYS - 1);
    const secAisle    = secondaryBin ? aisleIndex(secondaryBin.aisle, aislesPerZone) : -1;
    const secBay      = secondaryBin ? Math.min(bayIndex(secondaryBin.bay), BAYS - 1) : -1;

    return (
        
    )
}
