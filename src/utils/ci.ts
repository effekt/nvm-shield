import { spawnSync } from 'child_process';

export const checkForPackageLockChange = (): boolean => {
  try {
    const sp = spawnSync('git', ['status'], { encoding: 'utf-8' });
    const pattern = /modified:.*package-lock.json/;

    return pattern.test(sp.stdout);
  } catch (err) {
    return false;
  }
};
