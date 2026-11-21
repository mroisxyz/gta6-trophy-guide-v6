// Leonida Ledger — hand-in program for the GTA VI trophy guide bounty.
// Authored in this session: the ledger UI, its state and render modules, the 55-entry citation dossier,
// and the five-stage roadmap. The vendor dossier builder is used unchanged so the scorer can rebuild
// dossier.json byte for byte. Nothing fetches a remote resource at run time.
// The audit figures are derived from the data file at build time and shown again in the app's strip.
// Usage: MAKEFUN_OUTPUT_DIR=out node main.ts (the grader substitutes /output).

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier, readAppTree } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Print a short packaging receipt to stderr; it never touches dossier bytes. */
function reportPackage(outDir: string, count: number): void {
  const file = join(outDir, 'app', 'data', 'trophies.json');
  const data = JSON.parse(readFileSync(file, 'utf8')) as {
    sources: unknown[]; stats: { claims: number; backedByTwo: number }; trophies: unknown[];
  };
  console.error(
    `[leonida-ledger] app=${count} trophies=${data.trophies.length} `
    + `sources=${data.sources.length} claims=${data.stats.claims} `
    + `two-source=${data.stats.backedByTwo} out=${outDir}`,
  );
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

const dossierBytes = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossierBytes);

const tree = readAppTree(join(out, 'app'));
reportPackage(out, tree.files.length);
