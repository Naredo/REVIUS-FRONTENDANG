import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import http from 'node:http';
import https from 'node:https';
import { join } from 'node:path';
import { URL } from 'node:url';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const apiTarget = process.env['API_URL'] ?? 'http://gateway-service:9001';

const proxyTo = (targetBase: string): express.RequestHandler => {
  const base = new URL(targetBase);
  const client = base.protocol === 'https:' ? https : http;

  return (req, res, next) => {
    try {
      const targetUrl = new URL(req.originalUrl, base);

      const headers: Record<string, string | string[] | undefined> = {
        ...req.headers,
        host: targetUrl.host,
      };

      const proxyReq = client.request(
        targetUrl,
        {
          method: req.method,
          headers,
        },
        (proxyRes) => {
          res.statusCode = proxyRes.statusCode ?? 502;

          for (const [key, value] of Object.entries(proxyRes.headers)) {
            if (value !== undefined) {
              res.setHeader(key, value as string | string[]);
            }
          }

          proxyRes.pipe(res);
        },
      );

      proxyReq.on('error', next);
      req.pipe(proxyReq);
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

// Reverse-proxy API calls to backend to avoid browser CORS.
app.use(['/api', '/scopus'], proxyTo(apiTarget));

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
