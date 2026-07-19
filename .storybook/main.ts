import type { StorybookConfig } from '@storybook/react-native-web-vite';
import type { Connect } from 'vite';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

// This file is loaded as an ES module, so CJS's __dirname doesn't exist here.
const CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url));

const NAME_RE = /^[a-z0-9][a-z0-9-_]*$/i;
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
// Flow packs the scaffolder understands; must match KNOWN_FLOWS in
// bin/create-e4-app.js.
const KNOWN_FLOWS = ['legal', 'auth', 'onboarding', 'subscription', 'settings'];

function isLoopback(req: IncomingMessage): boolean {
  const addr = req.socket.remoteAddress ?? '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/**
 * Dev-only endpoint backing the "Create app" page in Storybook. When the
 * catalog runs locally (`npm run storybook`), POST /api/create-app runs the
 * scaffold CLI on this machine. The deployed static build has no server, so
 * the page falls back to generating copy-paste commands instead.
 */
const createAppEndpoint = (): Connect.NextHandleFunction => (req, res, next) => {
  if (!req.url || !req.url.startsWith('/api/create-app')) return next();
  if (!isLoopback(req)) return json(res, 403, { ok: false, error: 'Local requests only' });

  if (req.method === 'GET') {
    // Probe used by the page to detect local mode.
    return json(res, 200, { ok: true, mode: 'local', home: os.homedir() });
  }
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'POST only' });

  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', () => {
    // Any uncaught throw in this callback would crash the whole dev server
    // (that's what an unguarded __dirname reference did) — keep it airtight.
    try {
      let body: {
        name?: string;
        parentDir?: string;
        primary?: string;
        accent?: string;
        flows?: string[];
      };
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        return json(res, 400, { ok: false, error: 'Invalid JSON body' });
      }

      const name = (body.name ?? '').trim();
      if (!NAME_RE.test(name)) {
        return json(res, 400, { ok: false, error: 'App name must be alphanumeric (dashes/underscores allowed), e.g. golf-tracker.' });
      }
      for (const key of ['primary', 'accent'] as const) {
        if (body[key] && !HEX_RE.test(body[key]!)) {
          return json(res, 400, { ok: false, error: `${key} must be a hex color like #3355D9.` });
        }
      }

      const flows = Array.isArray(body.flows) ? body.flows : [];
      for (const flow of flows) {
        if (!KNOWN_FLOWS.includes(flow)) {
          return json(res, 400, { ok: false, error: `Unknown flow "${flow}".` });
        }
      }

      let parentDir = (body.parentDir ?? '~').trim() || '~';
      if (parentDir === '~' || parentDir.startsWith('~/')) {
        parentDir = path.join(os.homedir(), parentDir.slice(1));
      }
      parentDir = path.resolve(parentDir);
      if (!fs.existsSync(parentDir) || !fs.statSync(parentDir).isDirectory()) {
        return json(res, 400, { ok: false, error: `Folder does not exist: ${parentDir}` });
      }

      const cli = path.resolve(CONFIG_DIR, '../bin/create-e4-app.js');
      const args = [cli, name];
      if (body.primary) args.push('--primary', body.primary);
      if (body.accent) args.push('--accent', body.accent);
      if (flows.length > 0) args.push('--flows', flows.join(','));

      execFile(process.execPath, args, { cwd: parentDir, timeout: 15000 }, (err, stdout, stderr) => {
        if (err) {
          const msg = (stderr || stdout || err.message).trim().replace(/^\s*✗\s*/m, '');
          return json(res, 400, { ok: false, error: msg });
        }
        return json(res, 200, { ok: true, path: path.join(parentDir, name) });
      });
    } catch (e) {
      return json(res, 500, { ok: false, error: e instanceof Error ? e.message : 'Internal error' });
    }
  });
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['./public'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      pluginReactOptions: {
        babel: {
          plugins: ['react-native-worklets/plugin'],
        },
      },
    },
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push({
      name: 'e4-create-app-endpoint',
      configureServer(server) {
        server.middlewares.use(createAppEndpoint());
      },
    });
    return viteConfig;
  },
};

export default config;
