import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLATOBOOST_SERVICE_ID,
  PLATOBOOST_GATEWAY_URL,
  BOOT_STAGE_SEQUENCE,
  DEFAULT_CORE_CONFIG,
  DEFAULT_GITHUB_CONFIG,
  validateAccessKey,
  formatRemainingKeyTime,
  buildGithubRawUrl,
  buildLoadstringSnippet,
  generateCoreLuaScript,
} from './coreAuth';

test('BOOT_STAGE_SEQUENCE defines the 6 sleek modern SaaS loading stages', () => {
  assert.equal(BOOT_STAGE_SEQUENCE.length, 6);
  assert.equal(BOOT_STAGE_SEQUENCE[0].label, 'Starting Core.xyz...');
  assert.equal(BOOT_STAGE_SEQUENCE[1].label, 'Preparing graphics & overlay engine...');
  assert.equal(BOOT_STAGE_SEQUENCE[2].label, 'Optimizing frame pacing & memory pool...');
  assert.equal(BOOT_STAGE_SEQUENCE[3].label, 'Loading saved profile & preferences...');
  assert.equal(BOOT_STAGE_SEQUENCE[4].label, 'Verifying license status...');
  assert.equal(BOOT_STAGE_SEQUENCE[5].label, 'Finalizing workspace...');
});

test('validateAccessKey rejects empty input', () => {
  const result = validateAccessKey('   ');
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('Please enter a key first'));
});

test('validateAccessKey rejects invalid key format', () => {
  const result = validateAccessKey('invalid key');
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('Get Key'));
});

test('validateAccessKey accepts Platoboost KEY_ format and returns 24h expiry timestamp', () => {
  const now = 1_700_000_000_000;
  const result = validateAccessKey('KEY_PLATOBOOST_LIVE_2026', now);
  assert.equal(result.valid, true);
  assert.equal(result.normalizedKey, 'KEY_PLATOBOOST_LIVE_2026');
  assert.equal(result.error, null);
  assert.equal(result.expiresAtMs, now + 24 * 60 * 60 * 1000);
});

test('formatRemainingKeyTime formats accurate HHh MMm SSs live countdown', () => {
  const now = 1_700_000_000_000;
  const expires = now + (23 * 3600 + 59 * 60 + 42) * 1000;
  assert.equal(formatRemainingKeyTime(expires, now), '23h 59m 42s');
  assert.equal(formatRemainingKeyTime(now - 1000, now), 'EXPIRED');
});

test('buildGithubRawUrl and buildLoadstringSnippet format GitHub raw URL accurately', () => {
  const rawUrl = buildGithubRawUrl(DEFAULT_GITHUB_CONFIG);
  assert.equal(
    rawUrl,
    'https://raw.githubusercontent.com/FeykHere/Core.xyz/main/Core.xyz.lua'
  );

  const snippet = buildLoadstringSnippet(DEFAULT_GITHUB_CONFIG);
  assert.equal(
    snippet,
    'loadstring(game:HttpGet("https://raw.githubusercontent.com/FeykHere/Core.xyz/main/Core.xyz.lua"))()'
  );
});

test('generateCoreLuaScript embeds Platoboost Service 36271, 2-button Key System, and user config', () => {
  const script = generateCoreLuaScript({
    ...DEFAULT_CORE_CONFIG,
    fovRadius: 120,
    walkSpeed: 32,
  });
  assert.ok(script.includes(`local PLATOBOOST_SERVICE = ${PLATOBOOST_SERVICE_ID}`));
  assert.ok(script.includes(PLATOBOOST_GATEWAY_URL));
  assert.ok(script.includes('UnlockButton.Text = "Submit"'));
  assert.ok(script.includes('CopyKeyButton.Text = "Get Key"'));
  assert.ok(script.includes('fovRadius = 120'));
  assert.ok(script.includes('walkSpeed = 32'));
});

