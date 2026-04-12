/**
 * Rank improvement: positive = moved up (e.g. 5 → 3 → +2). Uses numeric ranks only.
 */
export function rankDeltaFromBaseline(baseRow, scenarioRow) {
    if (!baseRow || !scenarioRow) return null;
    const br = baseRow.rank;
    const fr = scenarioRow.rank;
    if (br == null || fr == null) return null;
    if (br === '-' || fr === '-') return null;
    const b = Number(br);
    const f = Number(fr);
    if (!Number.isFinite(b) || !Number.isFinite(f)) return null;
    return b - f;
}
