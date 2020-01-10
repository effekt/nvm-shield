import { readFileSync } from 'fs';
import { join } from 'path';

export const getNvmrc = () => {
  try {
    return readFileSync(join(process.cwd(), '.nvmrc'), 'utf-8').trim();
  } catch (err) {
    return;
  }
};
