import fs from 'node:fs';
import path from 'node:path';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

async function syncToGithub() {
  loadEnvLocal();

  const rootDir = process.cwd();
  const mainScriptPath = path.join(rootDir, 'Core.xyz.lua');
  const content = fs.readFileSync(mainScriptPath, 'utf8');

  // 1. Keep local mirrors in sync
  const mirrorTargets = [
    path.join(rootDir, 'public', 'Core.xyz.lua'),
    path.join(rootDir, 'loader.lua'),
    path.join(rootDir, 'public', 'loader.lua'),
  ];
  for (const target of mirrorTargets) {
    fs.writeFileSync(target, content, 'utf8');
  }
  console.log(`[Local Sync] Synced Core.xyz.lua (${content.split('\n').length} lines) to public/Core.xyz.lua, loader.lua, and public/loader.lua.`);

  // 2. Push to GitHub repository via GitHub Contents API
  const pat = process.env.GITHUB_SYNC_PAT;
  const repo = process.env.GITHUB_SYNC_REPO || 'FeykHere/Core.xyz-Private';
  const branch = process.env.GITHUB_SYNC_BRANCH || 'main';
  const remoteFilePath = 'Core.xyz.lua';

  if (!pat) {
    throw new Error('Missing GITHUB_SYNC_PAT in .env.local');
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${remoteFilePath}`;
  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CoreXYZ-AutoSync',
  };

  let existingSha = undefined;
  const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
    method: 'GET',
    headers,
  });

  if (getRes.status === 200) {
    const existingData = await getRes.json();
    existingSha = existingData.sha;
  } else if (getRes.status !== 404) {
    const errText = await getRes.text();
    throw new Error(`Failed to inspect existing file on GitHub (HTTP ${getRes.status}): ${errText}`);
  }

  const commitMessage = process.argv[2] || 'Auto-sync Core.xyz.lua from AI Studio workspace';
  const putBody = {
    message: commitMessage,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  };
  if (existingSha) {
    putBody.sha = existingSha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`GitHub push failed (HTTP ${putRes.status}): ${errBody}`);
  }

  const result = await putRes.json();
  console.log(`[GitHub Auto-Sync] Successfully pushed Core.xyz.lua to ${repo}@${branch}! Commit SHA: ${result.commit?.sha || 'OK'}`);
}

syncToGithub().catch((err) => {
  console.error('[GitHub Auto-Sync Error]:', err.message);
  process.exit(1);
});
