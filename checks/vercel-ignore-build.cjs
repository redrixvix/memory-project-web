#!/usr/bin/env node
/**
 * Guardrail for Vercel Git deployments.
 *
 * Vercel Git CI has repeatedly produced CSS bundles missing critical Tailwind
 * utilities while local CLI production deploys are healthy. For now, Git pushes
 * should NOT auto-promote to production. Manual/CLI deploys are still allowed.
 *
 * Vercel ignoreCommand convention:
 *   exit 0 => ignore/cancel this Git deployment
 *   exit 1 => continue building/deploying
 *
 * To intentionally allow a Git-triggered deployment, include [deploy] in the
 * commit message after running the visual smoke check against a preview URL.
 */

const isGitDeployment = Boolean(process.env.VERCEL_GIT_COMMIT_SHA);
const message = process.env.VERCEL_GIT_COMMIT_MESSAGE || '';

if (!isGitDeployment) {
  console.log('Non-Git deployment detected; allowing build.');
  process.exit(1);
}

if (message.includes('[deploy]')) {
  console.log('Commit message includes [deploy]; allowing Git deployment.');
  process.exit(1);
}

console.log('Skipping Vercel Git deployment. Use CLI deploy, or include [deploy] after visual smoke checks.');
process.exit(0);
