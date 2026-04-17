import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const archiveDir = path.join(__dirname, "..", "data", "archive");

const base32Alphabet = "abcdefghijklmnopqrstuvwxyz234567";

function encodeVarint(value) {
  const bytes = [];
  let remaining = value;

  while (remaining >= 0x80) {
    bytes.push((remaining & 0x7f) | 0x80);
    remaining >>= 7;
  }

  bytes.push(remaining);
  return bytes;
}

function toBase32(bytes) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += base32Alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += base32Alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function createCidFromPayload(payload) {
  const bytes = Buffer.from(JSON.stringify(payload));
  const hash = createHash("sha256").update(bytes).digest();
  const cidBytes = Buffer.from([
    ...encodeVarint(1),
    ...encodeVarint(0x0129),
    ...encodeVarint(0x12),
    ...encodeVarint(hash.length),
    ...hash,
  ]);

  return `b${toBase32(cidBytes)}`;
}

export async function writeSnapshot({ planId, payload }) {
  await mkdir(archiveDir, { recursive: true });
  const cid = createCidFromPayload(payload);
  const filePath = path.join(archiveDir, `${cid}.json`);

  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

  return {
    id: `storage_${Math.random().toString(36).slice(2, 10)}`,
    planId,
    cid,
    backend: "local-content-addressed-snapshots",
    kind: "plan-snapshot",
    filePath,
    createdAt: new Date().toISOString(),
  };
}

