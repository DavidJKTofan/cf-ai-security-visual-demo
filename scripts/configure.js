#!/usr/bin/env node
/**
 * configure.js — Substitute the deployed site URL across all static files.
 *
 * Reads SITE_URL from the environment and replaces the current domain
 * (detected from wrangler.jsonc) in every HTML, XML, and TXT file under src/,
 * plus the routes pattern in wrangler.jsonc itself.
 *
 * Usage:
 *   SITE_URL=https://my-domain.com node scripts/configure.js
 *   SITE_URL=https://my-domain.com npm run deploy
 *
 * If SITE_URL is not set the script exits immediately — no files are changed.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── 0. Load .env if present ───────────────────────────────────────────────────
// Populates process.env with any vars defined in .env that aren't already set.
// This makes SITE_URL and CLOUDFLARE_* vars available without requiring the
// caller to export them manually. Already-set env vars always take precedence.
(function loadDotEnv() {
  const envFile = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
})();

// ── 1. Read SITE_URL ──────────────────────────────────────────────────────────
const rawSiteUrl = process.env.SITE_URL;
if (!rawSiteUrl) {
  console.log('SITE_URL not set — skipping domain configuration.');
  process.exit(0);
}

const newUrl  = rawSiteUrl.replace(/\/+$/, '');        // strip trailing slash
const newHost = newUrl.replace(/^https?:\/\//, '');    // bare hostname

// ── 2. Detect current domain from wrangler.jsonc ─────────────────────────────
const root           = path.resolve(__dirname, '..');
const wranglerPath   = path.join(root, 'wrangler.jsonc');
const wranglerRaw    = fs.readFileSync(wranglerPath, 'utf8');
const patternMatch   = wranglerRaw.match(/"pattern"\s*:\s*"([^"]+)"/);

if (!patternMatch) {
  console.error('ERROR: Could not find a "pattern" entry in wrangler.jsonc');
  process.exit(1);
}

const currentHost = patternMatch[1];
const currentUrl  = `https://${currentHost}`;

if (currentUrl === newUrl) {
  console.log(`Domain already set to ${newUrl} — nothing to do.`);
  process.exit(0);
}

console.log(`Configuring domain: ${currentUrl}  ->  ${newUrl}\n`);

// ── 3. Collect files to update ────────────────────────────────────────────────
function walkFiles(dir, extensions, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, extensions, results);
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

const srcDir = path.join(root, 'src');
const files  = walkFiles(srcDir, ['.html', '.xml', '.txt']);

// ── 4. Replace domain in each file ───────────────────────────────────────────
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated  = original.split(currentUrl).join(newUrl);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`  updated: ${path.relative(root, file)}`);
    changed++;
  }
}

// ── 5. Update routes pattern in wrangler.jsonc (hostname only) ───────────────
const updatedWrangler = wranglerRaw.replace(
  `"pattern": "${currentHost}"`,
  `"pattern": "${newHost}"`
);
fs.writeFileSync(wranglerPath, updatedWrangler, 'utf8');
console.log(`  updated: wrangler.jsonc`);
changed++;

console.log(`\nDone — ${changed} file(s) updated.`);
