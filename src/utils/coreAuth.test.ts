import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLATOBOOST_SERVICE_ID,
  PLATOBOOST_GATEWAY_URL,
  DISCORD_INVITE_CODE,
  DISCORD_INVITE_URL,
  DISCORD_SERVER_NAME,
  BOOT_STAGE_SEQUENCE,
  DEFAULT_CORE_CONFIG,
  DEFAULT_GITHUB_CONFIG,
  validateAccessKey,
  formatRemainingKeyTime,
  parseDiscordInviteCounts,
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

test('parseDiscordInviteCounts parses live Discord invite API member and active counts for Core | Beta', () => {
  const stats = parseDiscordInviteCounts({
    code: 'TVyFdDwDkn',
    guild: {
      id: '1565870578613752008',
      name: 'Core | BETA',
      icon: '241614e0c238a40ff43e061065d35f5a',
    },
    approximate_member_count: 148,
    approximate_presence_count: 42,
  });
  assert.equal(stats.serverName, DISCORD_SERVER_NAME);
  assert.equal(stats.inviteCode, DISCORD_INVITE_CODE);
  assert.equal(stats.inviteUrl, DISCORD_INVITE_URL);
  assert.equal(stats.memberCount, 148);
  assert.equal(stats.onlineCount, 42);
  assert.ok(stats.iconUrl.includes('1565870578613752008/241614e0c238a40ff43e061065d35f5a'));
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

test('weatherEngine creates and steps dense snow, heavy rain droplets with ground splashes, and forked lightning bolts', async () => {
  const {
    getTargetParticleCount,
    createWeatherParticles,
    stepWeatherParticles,
    generateLightningBolt,
  } = await import('./weatherEngine');

  assert.equal(getTargetParticleCount('Default'), 0);
  assert.ok(getTargetParticleCount('Rain') >= 120);
  assert.ok(getTargetParticleCount('Thunderstorm') >= 200);
  assert.ok(getTargetParticleCount('Snow') >= 180, 'Snowfall must be dense without needing a ground layer');

  const rainParticles = createWeatherParticles('Thunderstorm');
  assert.equal(rainParticles.length, getTargetParticleCount('Thunderstorm'));
  const splashes: any[] = [];
  for (let step = 0; step < 6; step++) {
    stepWeatherParticles(rainParticles, splashes, 'Thunderstorm', 0.08, step * 0.08);
  }
  assert.ok(splashes.length > 0, 'Stepping heavy rain particles must spawn ground splash ripples');

  const snowParticles = createWeatherParticles('Snow');
  const firstFlakeX = snowParticles[0].x;
  const firstFlakeY = snowParticles[0].y;
  stepWeatherParticles(snowParticles, [], 'Snow', 0.08, 2.0);
  assert.notEqual(snowParticles[0].y, firstFlakeY, 'Snowflakes must fall vertically');
  assert.notEqual(snowParticles[0].x, firstFlakeX, 'Snowflakes must drift horizontally with wind turbulence');

  const bolt = generateLightningBolt(0.28, 75);
  assert.ok(bolt.segments.length >= 10, 'Forked lightning bolt must contain main trunk and branch segments');
  assert.ok(bolt.stereoPan >= -0.92 && bolt.stereoPan <= 0.92, 'Lightning bolt must compute stereo pan position');
});


