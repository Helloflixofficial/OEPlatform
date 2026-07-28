import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { createSelfSignedCertificate } = require("next/dist/lib/mkcert");

const envFileUrl = existsSync(".env")
  ? readFileSync(".env", "utf8").match(/^NEXT_PUBLIC_APP_URL=(.*)$/m)?.[1]?.trim()
  : "";
const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || envFileUrl || "http://localhost:3000";
const configured = new URL(configuredUrl);
const lanHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(configured.hostname)
  ? "localhost"
  : configured.hostname;
const certDir = "certificates-lan";

const certificate = await createSelfSignedCertificate(lanHost, certDir);
if (!certificate || !existsSync(certificate.key) || !existsSync(certificate.cert)) {
  throw new Error("Could not create the HTTPS certificate for the LAN address.");
}

const nextCommand = process.execPath;
const nextBin = require.resolve("next/dist/bin/next");
const nextArgs = [
  nextBin,
  "dev",
  "-H",
  "0.0.0.0",
  "-p",
  configured.port || "3000",
  "--experimental-https",
  "--experimental-https-key",
  certificate.key,
  "--experimental-https-cert",
  certificate.cert,
  "--turbo",
];

const child = spawn(nextCommand, nextArgs, {
  env: process.env,
  stdio: "inherit",
  shell: false,
});

const stop = (signal) => child.kill(signal);
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
