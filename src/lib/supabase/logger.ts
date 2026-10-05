
type LogLevel = 'INFO' | 'WARN' | 'ERROR'

function sendLog(level: LogLevel, message: string): void {
  if (!import.meta.env.DEV) {
    return
  }

  const logMessage = `[${level}] ${message}`

  // Выводим сообщения в консоль браузера
  switch (level) {
    case 'INFO':
      console.info(logMessage)
      break

    case 'WARN':
      console.warn(logMessage)
      break

    case 'ERROR':
      console.error(logMessage)
      break
  }

  // Отправляем логи в терминал Vite
  void fetch('/__dev_log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      level,
      message,
    }),
  }).catch(() => {
    console.warn('Terminal logger is unavailable')
  })
}

// Экспортируем logger для использования в Planno
export const logger = {
  info(message: string): void {
    sendLog('INFO', message)
  },

  warn(message: string): void {
    sendLog('WARN', message)
  },

  error(message: string): void {
    sendLog('ERROR', message)
  },
}
