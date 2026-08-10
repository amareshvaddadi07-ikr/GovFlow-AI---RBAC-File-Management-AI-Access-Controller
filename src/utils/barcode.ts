/**
 * Utility functions for Barcode generation, SHA-256 simulation,
 * Digital Signature verification, and Tamper Detection checks.
 */

// Simple deterministic hash simulation for document integrity verification
export function calculateSHA256(content: string, author: string, version: string): string {
  let hash = 0;
  const str = `${content}_${author}_${version}_SEAL_HMAC_v4`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31 + 17).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 13 + 53).toString(16).padStart(8, '0');
  const hex4 = Math.abs(hash * 97 + 89).toString(16).padStart(8, '0');
  return `sha256:${hex1}${hex2}${hex3}${hex4}`.toLowerCase();
}

export function generateBarcodeId(prefix: string = 'DOC-GOV'): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
}

/**
 * Generates an SVG Barcode pattern based on barcode string input
 */
export function generateBarcodeSVGPattern(barcodeStr: string): Array<{ width: number; isGap: boolean }> {
  // Convert string characters into deterministic bar widths for barcode representation
  const pattern: Array<{ width: number; isGap: boolean }> = [];
  pattern.push({ width: 3, isGap: false }); // Start bar
  pattern.push({ width: 2, isGap: true });
  pattern.push({ width: 2, isGap: false });
  pattern.push({ width: 1, isGap: true });

  for (let i = 0; i < barcodeStr.length; i++) {
    const code = barcodeStr.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const g1 = ((code >> 2) % 2) + 1;
    const w2 = ((code >> 4) % 3) + 1;
    const g2 = 1;

    pattern.push({ width: w1, isGap: false });
    pattern.push({ width: g1, isGap: true });
    pattern.push({ width: w2, isGap: false });
    pattern.push({ width: g2, isGap: true });
  }

  pattern.push({ width: 3, isGap: false }); // Stop bar
  pattern.push({ width: 2, isGap: true });
  pattern.push({ width: 3, isGap: false });

  return pattern;
}
