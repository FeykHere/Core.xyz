import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_ACCESS_KEY,
  DEFAULT_CORE_CONFIG,
  DEFAULT_GITHUB_CONFIG,
  validateAccessKey,
  buildGithubRawUrl,
  buildLoadstringSnippet,
  generateCoreLuaScript,
} from './coreAuth';

test('validateAccessKey rejects empty input', () => {
  const result = validateAccessKey('   ');
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('Please enter an authorization key'));
});

test('validateAccessKey rejects incorrect key', () => {
  const result = validateAccessKey('WRONG_KEY_123');
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes(REQUIRED_ACCESS_KEY));
});

test('validateAccessKey accepts FEYKSECURED exact key', () => {
  const result = validateAccessKey('FEYKSECURED');
  assert.equal(result.valid, true);
  assert.equal(result.normalizedKey, 'FEYKSECURED');
  assert.equal(result.error, null);
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

test('generateCoreLuaScript embeds FEYKSECURED key and user config', () => {
  const script = generateCoreLuaScript({
    ...DEFAULT_CORE_CONFIG,
    fovRadius: 120,
    walkSpeed: 32,
  });
  assert.ok(script.includes('local REQUIRED_KEY = "FEYKSECURED"'));
  assert.ok(script.includes('fovRadius = 120'));
  assert.ok(script.includes('walkSpeed = 32'));
});
