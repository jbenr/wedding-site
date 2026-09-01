import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The RSVP flow talks to the serverless functions in /api, which only exist
// when Vercel is running them. Without this, `npm run dev` serves the site
// but every RSVP request 404s against the dev server, so the whole flow is
// untestable locally. This runs the same handler modules in-process, with a
// minimal stand-in for the Vercel req/res objects.
//
// Dev only (`apply: 'serve'`) — it has no effect on `npm run build`, where
// Vercel serves /api for real.
function devApiRoutes() {
  return {
    name: 'dev-api-routes',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        const route = req.url.split('?')[0].slice('/api/'.length)
        // Keep this to plain filenames — no traversal out of /api.
        if (!/^[a-z0-9-]+$/i.test(route)) return next()

        let handler
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.js`)
          handler = mod.default
        } catch {
          return next()
        }
        if (typeof handler !== 'function') return next()

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const raw = Buffer.concat(chunks).toString('utf8')
        try {
          req.body = raw ? JSON.parse(raw) : {}
        } catch {
          req.body = {}
        }

        const shim = {
          statusCode: 200,
          setHeader: (k, v) => res.setHeader(k, v),
          status(code) {
            this.statusCode = code
            return this
          },
          json(payload) {
            res.statusCode = this.statusCode
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
          }
        }

        try {
          await handler(req, shim)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The API handlers read RSVP_SHEET_WEBHOOK_* from process.env, which Vite
  // does not populate for unprefixed vars — do it here so the sheet sync
  // behaves the same locally as on Vercel.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('RSVP_') && !process.env[key]) process.env[key] = value
  }

  return { plugins: [react(), devApiRoutes()] }
})
