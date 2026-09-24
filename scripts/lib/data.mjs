// @ts-check
// data/*.json을 읽는 단일 경로. pick.mjs 서브커맨드마다 새로 계산하지 않는다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DATA_DIR = path.join(ROOT, 'data');

/** @param {string} file */
export function readData(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}
