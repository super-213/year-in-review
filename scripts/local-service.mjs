import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rm, open } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const runtime = resolve(root, '.local-service');
const stateFile = resolve(runtime, 'server.json');
const logFile = resolve(runtime, 'server.log');
const lock = resolve(runtime, 'lock');
const action = process.argv[2];
const alive = pid => {
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
};
async function readState() {
  try { return JSON.parse(await readFile(stateFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function isOurServer(state) {
  try {
    const response = await fetch(`http://127.0.0.1:${state.port}/api/health`, { signal: AbortSignal.timeout(1000) });
    const health = await response.json();
    return health.ok === true && health.instance === state.instance;
  } catch { return false; }
}

async function start() {
  const previous = await readState();
  if (previous && alive(previous.pid)) throw new Error(`服务进程仍在运行（PID ${previous.pid}，端口 ${previous.port}），请先执行 ./stop.sh。`);
  let input = process.argv[3];
  if (input === undefined) {
    if (!process.stdin.isTTY) throw new Error('请手动指定端口，例如 ./start.sh 8080');
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    try { input = await terminal.question('请输入服务端口（1–65535）：'); }
    finally { terminal.close(); }
  }
  input = input.trim();
  const port = Number(input);
  if (!/^\d+$/.test(input) || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('端口必须为 1–65535 的整数。');
  console.log('正在构建前端…');
  await new Promise((accept, reject) => {
    const build = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
    build.on('error', reject);
    build.on('exit', code => code === 0 ? accept() : reject(new Error('构建失败，服务未启动。')));
  });
  const instance = randomUUID();
  const log = await open(logFile, 'a');
  let child;
  try {
    child = spawn(process.execPath, [resolve(root, 'server/local.mjs'), String(port)], {
      cwd: root, detached: true, stdio: ['ignore', log.fd, log.fd],
      env: { ...process.env, LOCAL_SERVER_INSTANCE: instance },
    });
    await new Promise((accept, reject) => { child.once('spawn', accept); child.once('error', reject); });
  } finally { await log.close(); }
  child.unref();
  const state = { pid: child.pid, port, instance };
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await isOurServer(state)) {
      await writeFile(stateFile, JSON.stringify(state, null, 2), 'utf8');
      console.log(`服务已后台启动：http://localhost:${port}\n局域网访问：http://服务器IP:${port}\n作品目录：${resolve(root, 'data')}\n日志：${logFile}\n停止：./stop.sh`);
      return;
    }
    if (!alive(child.pid)) break;
    await delay(200);
  }
  if (alive(child.pid)) process.kill(child.pid, 'SIGTERM');
  throw new Error(`启动失败（可能端口被占用），请查看 ${logFile}`);
}

async function stop() {
  const state = await readState();
  if (!state) { console.log('没有通过启动脚本运行的服务。'); return; }
  if (!alive(state.pid)) {
    await rm(stateFile, { force: true });
    console.log('服务已停止，已清除旧的运行记录。');
    return;
  }
  // Confirm identity before signalling a PID that the OS might have reused.
  if (!await isOurServer(state)) throw new Error(`无法确认 PID ${state.pid} 的服务身份，未终止该进程。请检查 ${logFile}`);
  process.kill(state.pid, 'SIGTERM');
  for (let attempt = 0; attempt < 40; attempt++) {
    if (!alive(state.pid)) {
      await rm(stateFile, { force: true });
      console.log(`服务已停止（端口 ${state.port}）。data 中的作品会保留。`);
      return;
    }
    await delay(200);
  }
  throw new Error('服务尚未退出，请稍后重试停止脚本。');
}

if (!['start', 'stop'].includes(action)) {
  console.error('用法：node scripts/local-service.mjs start [端口] | stop');
  process.exitCode = 1;
} else {
  await mkdir(runtime, { recursive: true });
  let locked = false;
  try {
    await mkdir(lock);
    locked = true;
    if (action === 'start') await start();
    else await stop();
  } catch (error) {
    console.error(error.code === 'EEXIST' ? `另一个启停操作正在进行。如果此前操作被强制中断，请删除 ${lock} 后重试。` : error.message);
    process.exitCode = 1;
  } finally {
    if (locked) await rm(lock, { recursive: true, force: true });
  }
}
