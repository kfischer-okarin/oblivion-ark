import { spawn } from 'child_process';

const LOG_PREFIX = '\x1b[32m[VITE]\x1b[0m';

function logWithPrefixBeforeEachLine(string, logFn) {
  const lines = string.toString().split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  lines.forEach((line) => logFn(`${LOG_PREFIX} ${line}`));
}

function integrateWithViteDevServer(app) {
  if (app.isPackaged) {
    return;
  }

  let viteProcess;

  app.on('ready', () => {
    viteProcess = spawn('npx', ['vite'], {
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: '1', // Vite defaults to no color in non-TTY environments
      },
      stdio: [
        'ignore', // stdin
        'pipe', // stdout
        'pipe', // stderr
      ]
    });

    viteProcess.stdout.on('data', (data) => {
      logWithPrefixBeforeEachLine(data, console.log);
    });

    viteProcess.stderr.on('data', (data) => {
      logWithPrefixBeforeEachLine(data, console.error);
    });

    viteProcess.on('error', (error) => {
      console.error(`${LOG_PREFIX} Error starting Vite: ${error}`);
    });
  });

  app.on('will-quit', () => {
    if (viteProcess) {
      viteProcess.kill();
    }
  });
}

export { integrateWithViteDevServer };
