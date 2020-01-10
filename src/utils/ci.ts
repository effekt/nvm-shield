import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const crypto = require('crypto');

function checksum(contents: string) {
  return crypto
    .createHash('sha1')
    .update(contents, 'utf8')
    .digest('hex');
}

export const getPackageLockChecksum = () => {
  try {
    writeFileSync(
      join(process.cwd(), '.package-lock-hash'),
      checksum(
        readFileSync(join(process.cwd(), 'package-lock.json'), 'utf-8').trim(),
      ),
    );
  } catch (err) {
    return;
  }
};

export const comparePackageLockChecksum = (): boolean => {
  try {
    const oldPackageLock = readFileSync(
      join(process.cwd(), '.package-lock-hash'),
      'utf-8',
    ).trim();
    const newPackageLock = checksum(
      readFileSync(join(process.cwd(), 'package-lock.json'), 'utf-8').trim(),
    );

    return oldPackageLock === newPackageLock;
  } catch (err) {
    return false;
  }
};
