#!/usr/bin/env node
import { parseArguments } from './utils/arguments';
import { comparePackageLockChecksum, getPackageLockChecksum } from './utils/ci';
import { getNvmrc } from './utils/nvmrc';

const currentNodeVersion = process.version;
const nvmrcVersion = getNvmrc() ?? undefined;

try {
  const parsedArguments = parseArguments() || {};
  const compareVersion =
    transformVersion(parsedArguments['--version']) ?? undefined;

  if (compareVersion) {
    isValidVersion(
      `v${compareVersion}`,
      parsedArguments['--compare']?.trim().toLowerCase(),
    );
  } else if (nvmrcVersion) {
    isValidVersion(
      nvmrcVersion,
      parsedArguments['--compare']?.trim().toLowerCase(),
    );
  } else {
    if (
      !Object.keys(parsedArguments).includes('--preci') &&
      !Object.keys(parsedArguments).includes('--postci')
    ) {
      outputToConsole(
        `No ".nvmrc" file found in the project and --version argument not supplied!`,
      );
    }
  }

  if (Object.keys(parsedArguments).includes('--preci')) {
    getPackageLockChecksum();
    outputToConsole(
      `Saved SHA1 checksum of package-lock.json to .package-lock-hash`,
    );
    process.exit(0);
  }

  if (Object.keys(parsedArguments).includes('--postci')) {
    const validPackageLock = comparePackageLockChecksum();
    if (validPackageLock) {
      outputToConsole(`No changes to package-lock.json`);
      process.exit(0);
    } else {
      outputErrorToConsole(
        `Uncommitted changes to package-lock.json detected, this could be caused by committing changes from a different Node version`,
      );
      process.exit(1);
    }
  }

  outputToConsole(
    `Passed! (${currentNodeVersion})${
      parsedArguments['--compare']
        ? ` Compare Method: (${parsedArguments['--compare']})`
        : ''
    }`,
  );
} catch (err) {
  console.log(`\x1b[1;37;44m (NVM-Shield): \x1b[41m ${err.message} \x1b[49m`);
  process.exit(1);
}

function isValidVersion(nvmrc: string, compare?: string | undefined) {
  const validCompares = ['major', 'minor', 'patch'];
  if (compare && !validCompares.includes(compare))
    throw new Error(
      `Invalid compare value (${compare}). Expected "major", "minor", "patch".`,
    );

  if (currentNodeVersion === nvmrc) return;

  const [nvmMajor, nvmMinor, nvmPatch] = nvmrc.replace('v', '').split('.');
  const [nodeMajor, nodeMinor] = currentNodeVersion.replace('v', '').split('.');

  if (compare === 'patch' && !nvmPatch)
    throw new Error(
      `Requested patch version comparison but did not provide the patch version. Provided: (${nvmMajor}.${nvmMinor}.${nvmPatch}), Expected: (x.x.x)`,
    );

  if (compare === 'minor' && !nvmMinor)
    throw new Error(
      `Requested minor version comparison but did not provide the minor version. Provided: (${nvmMajor}.${nvmMinor}), Expected: (x.x)`,
    );

  if (!compare || compare === 'patch') {
    if (currentNodeVersion !== nvmrc)
      throw new Error(
        `Current Node version: ${currentNodeVersion}. Required Node version: ${nvmrc}.`,
      );

    return;
  }

  if (compare === 'major' && nvmMajor !== nodeMajor) {
    throw new Error(
      `Current Node version: v${nodeMajor}.x.x. Required Node version: v${nvmMajor}.x.x.`,
    );
  }

  if (
    compare === 'minor' &&
    (nvmMajor !== nodeMajor || nvmMinor !== nodeMinor)
  ) {
    throw new Error(
      `Current Node version: v${nodeMajor}.${nodeMinor}.x. Required Node version: v${nvmMajor}.${nvmMinor}.x.`,
    );
  }

  return;
}

function transformVersion(version: string | undefined) {
  if (!version) return;

  const versionPattern = /^\d+$/;

  let finalVersion = `${
    version.charAt(0) === 'v' ? version.trim().replace('v', '') : version.trim()
  }`;
  const [major, minor, patch] = finalVersion.split('.');

  if (
    !versionPattern.test(major) ||
    (minor && !versionPattern.test(minor)) ||
    (patch && !versionPattern.test(patch))
  ) {
    throw new Error(`Invalid --version value supplied (${version})`);
  }
  return [major, minor || undefined, patch || undefined].join('.');
}

function outputToConsole(str: string): void {
  console.log(`\x1b[1;37;44m (NVM-Shield): \x1b[1;37;42m ${str} \x1b[49m`);
}

function outputErrorToConsole(str: string): void {
  console.log(`\x1b[1;37;44m (NVM-Shield): \x1b[41m ${str} \x1b[49m`);
}
