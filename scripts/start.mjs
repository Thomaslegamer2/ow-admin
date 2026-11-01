import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";

process.env.HOSTNAME ||= "0.0.0.0";
process.env.PORT ||= "3000";

const candidates = [
  path.join(process.cwd(), "server.js"),
  path.join(process.cwd(), ".next", "standalone", "server.js"),
];

const server = candidates.find((file) => existsSync(file));
if (!server) {
  console.error("server.js introuvable. Lance d'abord npm run build.");
  process.exit(1);
}

const child = spawn(process.execPath, [server], {
  stdio: "inherit",
  env: process.env,
  cwd: path.dirname(server),
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
