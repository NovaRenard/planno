import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function terminalLogger(): Plugin {
  return {
    name: 'planno-terminal-logger',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use('/__dev_log', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const origin = req.headers.origin
        const host = req.headers.host

        if (!origin || !host || new URL(origin).host !== host) {
          res.statusCode = 403
          res.end('Forbidden')
          return
        }

        let body = ''

        req.on('data', (chunk) => {
          body += chunk.toString()

          if (body.length > 8192) {
            req.destroy()
          }
        })

        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            const message = data.message

            if (
              typeof message !== 'string' ||
              message.length > 2000 ||
              !['INFO', 'WARN', 'ERROR'].includes(data.level)
            ) {
              res.statusCode = 400
              res.end('Invalid log')
              return
            }

            const time = new Date().toLocaleTimeString()
            const line = `[${time}] [${data.level}] ${message}`

            if (data.level === 'ERROR') {
              console.error(line)
            } else if (data.level === 'WARN') {
              console.warn(line)
            } else {
              console.info(line)
            }

            res.statusCode = 204
            res.end()
          } catch {
            res.statusCode = 400
            res.end('Invalid JSON')
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), terminalLogger()],
})