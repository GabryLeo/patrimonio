import { spawn } from 'node:child_process'

const commands = [
  ['api', 'npm run dev --workspace=@patrimonio/api'],
  ['web', 'npm run dev --workspace=@patrimonio/web'],
]

const children = commands.map(([name, command]) => {
  const child = spawn(command, {
    cwd: process.cwd(),
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  })

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`))
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`))
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`)
      shutdown(code)
    }
  })

  return child
})

let shuttingDown = false
function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) child.kill()
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
