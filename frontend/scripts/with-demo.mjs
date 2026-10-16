// Runs a command with the explicit demo switch on (cross-platform, no extra dependency).
// Usage: node scripts/with-demo.mjs <command> [...args]
import { spawn } from "node:child_process";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-demo.mjs <command> [...args]");
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, CONNECTABROAD_DEMO: "1" },
});
child.on("exit", (code) => process.exit(code ?? 1));
