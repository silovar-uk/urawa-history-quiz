import fs from 'node:fs';

const path = 'prototype/app.js';
let source = fs.readFileSync(path, 'utf8');

const oldBlock = `  function getAnswerSpineContext(question) {
    if (!db || !question) return [];
    const seasons = [...db.seasons].sort((a, b) => a.year - b.year);
    const index = seasons.findIndex(s => s.season_id === question.seasonId);
    if (index < 0) return [];
    return seasons.slice(Math.max(0, index - 1), Math.min(seasons.length, index + 2));
  }
`;

const newBlock = `  function getAnswerSpineContext(question) {
    if (!db || !question) return [];
    const seasons = [...db.seasons].sort((a, b) => a.year - b.year);
    const index = seasons.findIndex(s => s.season_id === question.seasonId);
    if (index < 0) return [];
    const maxItems = Math.min(3, seasons.length);
    const maxStart = Math.max(0, seasons.length - maxItems);
    const start = Math.min(Math.max(0, index - 1), maxStart);
    return seasons.slice(start, start + maxItems);
  }
`;

if (!source.includes(oldBlock)) {
  if (source.includes(newBlock)) {
    console.log('B+ edge context already fixed.');
    process.exit(0);
  }
  throw new Error('Guard failed: expected B+ context helper not found.');
}

source = source.replace(oldBlock, newBlock);
fs.writeFileSync(path, source);
console.log('B+ edge context fixed: first/last seasons retain up to three context nodes.');
