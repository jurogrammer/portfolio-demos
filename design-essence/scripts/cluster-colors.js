import chroma from 'chroma-js';

/**
 * Clusters an array of {hex, count} color entries into {primary, secondary, accent, neutrals}.
 *
 * - Groups colors using deltaE 2000 < 5 for perceptual similarity
 * - Primary: representative of the most frequent non-neutral cluster
 * - Secondary: representative of the second most frequent non-neutral cluster
 * - Accent: highest chroma color with relatively low frequency
 * - Neutrals: low-chroma colors (chroma < 10)
 *
 * @param {Array<{hex: string, count: number}>} colors
 * @returns {{ primary: string, secondary: string, accent: string, neutrals: string[] }}
 */
export function clusterColors(colors) {
  if (!colors || colors.length === 0) {
    return { primary: null, secondary: null, accent: null, neutrals: [] };
  }

  const NEUTRAL_CHROMA_THRESHOLD = 10;
  const DELTA_E_THRESHOLD = 5;

  // Separate neutrals from chromatic colors
  const neutrals = [];
  const chromatic = [];

  for (const entry of colors) {
    const c = chroma(entry.hex);
    if (c.get('lch.c') < NEUTRAL_CHROMA_THRESHOLD) {
      neutrals.push(entry);
    } else {
      chromatic.push(entry);
    }
  }

  // Cluster chromatic colors by perceptual similarity (deltaE 2000 < 5)
  const clusters = [];

  for (const entry of chromatic) {
    let placed = false;
    for (const cluster of clusters) {
      const representative = cluster[0];
      const delta = chroma.deltaE(entry.hex, representative.hex, 2000);
      if (delta < DELTA_E_THRESHOLD) {
        cluster.push(entry);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push([entry]);
    }
  }

  // For each cluster, compute total count and pick representative (highest count)
  const clusterSummaries = clusters.map((cluster) => {
    const totalCount = cluster.reduce((sum, e) => sum + e.count, 0);
    const representative = cluster.reduce((best, e) => (e.count > best.count ? e : best), cluster[0]);
    return { representative: representative.hex, totalCount, cluster };
  });

  // Sort clusters by total count descending
  clusterSummaries.sort((a, b) => b.totalCount - a.totalCount);

  const primary = clusterSummaries[0]?.representative ?? null;
  const secondary = clusterSummaries[1]?.representative ?? null;

  // Accent: highest chroma color with relatively low frequency
  // "low frequency" = below the median count of chromatic colors
  const totalCounts = chromatic.map((e) => e.count);
  const median = totalCounts.length > 0
    ? totalCounts.sort((a, b) => a - b)[Math.floor(totalCounts.length / 2)]
    : 0;

  const accentCandidates = chromatic.filter((e) => e.count <= median);
  let accent = null;
  if (accentCandidates.length > 0) {
    const highest = accentCandidates.reduce((best, e) => {
      return chroma(e.hex).get('lch.c') > chroma(best.hex).get('lch.c') ? e : best;
    }, accentCandidates[0]);
    accent = highest.hex;
  } else if (chromatic.length > 0) {
    // fallback: just highest chroma overall
    const highest = chromatic.reduce((best, e) => {
      return chroma(e.hex).get('lch.c') > chroma(best.hex).get('lch.c') ? e : best;
    }, chromatic[0]);
    accent = highest.hex;
  }

  return {
    primary,
    secondary,
    accent,
    neutrals: neutrals.map((e) => e.hex),
  };
}
