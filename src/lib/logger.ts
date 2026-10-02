type LogLevel = 'INFO' | 'WARN' | 'ERROR'

function sendLog(level: LogLevel, message: string): void {
  if (!import.meta.env.DEV) return

  const line = `[${level}] ${message}`

  if (level === 'ERROR') {
    console.error(line)
  } else if (level === 'WARN') {
    console.warn(line)
  } else {
    console.info(line)
  }

  void fetch('/__dev_log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ level, message }),
  }).catch(() => {
    console.warn('Terminal logger is unavailable')
  })
}

export const logger = {
  info: (message: string) => sendLog('INFO', message),
  warn: (message: string) => sendLog('WARN', message),
  error: (message: string) => sendLog('ERROR', message),
}
