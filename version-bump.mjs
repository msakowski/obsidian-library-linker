import { readFileSync, writeFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const { version: targetVersion } = packageJson;

// read minAppVersion from src/manifest.json and bump version to target version
const manifest = JSON.parse(readFileSync('src/manifest.json', 'utf8'));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync('src/manifest.json', JSON.stringify(manifest, null, 2));

// update versions.json with target version and minAppVersion from manifest.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
versions[targetVersion] = minAppVersion;
writeFileSync('versions.json', JSON.stringify(versions, null, 2));
