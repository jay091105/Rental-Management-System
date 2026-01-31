/*
  Lightweight script to safely remove stale Next.js dev lock:
  - If .next/dev/lock exists and the PID inside is not an active process, remove it
  - If the file is older than 5 minutes, remove it (stale)
  - Works on Windows and *nix without extra deps
*/

const fs = require('fs');
const path = require('path');

const lockPath = path.resolve(__dirname, '..', '.next', 'dev', 'lock');

function log(msg) {
  try { console.log(`[clean-next-lock] ${msg}`); } catch(e) {}
}

try {
  if (!fs.existsSync(lockPath)) {
    log('No dev lock found.');
    process.exit(0);
  }

  const content = fs.readFileSync(lockPath, 'utf8').trim();
  let pid = null;
  if (content) {
    const m = content.match(/(\d+)/);
    if (m) pid = parseInt(m[1], 10);
  }

  let remove = false;

  if (pid) {
    try {
      // Check whether the process is alive
      process.kill(pid, 0);
      // If no exception, process is alive -> do not remove
      log(`Lock held by active process PID=${pid}. Leaving lock intact.`);
    } catch (err) {
      // Process does not exist
      log(`No process with PID=${pid} found; removing stale lock.`);
      remove = true;
    }
  } else {
    // No PID found. Check age
    const stats = fs.statSync(lockPath);
    const ageMs = Date.now() - stats.mtimeMs;
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (ageMs > FIVE_MINUTES) {
      log('No PID in lock and file older than 5 minutes; removing stale lock.');
      remove = true;
    } else {
      log('No PID in lock but file is recent; leaving lock intact to avoid races.');
    }
  }

  if (remove) {
    try {
      fs.unlinkSync(lockPath);
      log('Removed stale dev lock.');
    } catch (err) {
      log('Failed to remove dev lock: ' + err.message);
      // do not fail the predev script; just warn
    }
  }
} catch (err) {
  // Ensure failure here doesn't block dev startup
  try { console.warn('[clean-next-lock] unexpected error:', err && err.message); } catch(e) {}
}

process.exit(0);
