#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');

const files = {
  seasons: 'data/seasons.json',
  players: 'data/players.json',
  playerSeasons: 'data/player_seasons.json',
  managers: 'data/managers.json',
  managerTenures: 'data/manager_tenures.json',
  uniforms: 'data/uniforms.json',
  sources: 'data/sources.json'
};

const db = {};
for (const [key, rel] of Object.entries(files)) {
  db[key] = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

const output = `// GENERATED FILE — DO NOT EDIT MANUALLY.\n// Source of truth: data/*.json. Rebuild with: node scripts/build-data-bundle.mjs\nwindow.URAWA_DB = ${JSON.stringify(db, null, 2)};\n`;
const target = path.join(root, 'data/data-bundle.js');

if (checkOnly) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current !== output) {
    console.error('data/data-bundle.js is out of sync with canonical JSON.');
    process.exit(1);
  }
  console.log('data-bundle sync: OK');
} else {
  fs.writeFileSync(target, output);
  console.log('data/data-bundle.js rebuilt from canonical JSON.');
}
