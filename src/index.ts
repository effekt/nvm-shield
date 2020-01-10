#!/usr/bin/env node
import { parseArguments } from './utils/arguments';
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
    console.log(
      `\x1b[1;37;44m (NVM-Shield): \x1b[41m No ".nvmrc" file found in the project and --version argument not supplied! \x1b[49m`,
    );
    process.exit(0);
  }

  console.log(
    `\x1b[1;37;44m (NVM-Shield): \x1b[1;37;42m Passed! (${currentNodeVersion})${
      parsedArguments['--compare']
        ? ` Compare Method: (${parsedArguments['--compare']})`
        : ''
    } \x1b[49m`,
  );
} catch (err) {
  console.log(
    `\x1b[1;37;44m (NVM-Shield): \x1b[41m ${err.message}${
      nvmrcVersion ? " Did you remember to 'nvm use'?" : ''
    } \x1b[49m`,
  );
  process.exit(1);
}

function isValidVersion(nvmrc: string, compare?: string | undefined) {
  const validCompares = ['major', 'minor', 'patch'];
  if (compare && !validCompares.includes(compare))
    throw new Error(
      `Invalid compare value (${compare}). Expected "major", "minor", "patch".`,
    );

  if (currentNodeVersion === nvmrc) return;

  if (!compare || compare === 'patch') {
    if (currentNodeVersion !== nvmrc)
      throw new Error(
        `Current Node version: ${currentNodeVersion}. Required Node version: ${nvmrc}.`,
      );
  }

  const [nvmMajor, nvmMinor] = nvmrc.replace('v', '').split('.');
  const [nodeMajor, nodeMinor] = currentNodeVersion.replace('v', '').split('.');

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
  return [major, minor || 'x', patch || 'x'].join('.');
}
