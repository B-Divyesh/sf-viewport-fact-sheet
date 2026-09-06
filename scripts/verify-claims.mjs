import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const claims = JSON.parse(await readFile(new URL('../.factory/claims.json', import.meta.url), 'utf8'));
for (const claim of claims) {
  const marker = `@claim:${claim.id}`;
  if (!claim.test.includes(marker)) throw new Error(`${claim.id} does not run its tagged test.`);
  console.log(`Verifying ${marker}`);
  execFileSync('npm', ['run', 'test:claims', '--', '--grep', marker], { stdio: 'inherit' });
}

const summary = `Verified ${claims.length} declared claims.`;
if (process.env.CLAIM_SUCCESS_FILE) await writeFile(process.env.CLAIM_SUCCESS_FILE, `${summary}\n`);
console.log(summary);
