import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { archiveDir } from "./runtime-paths.js";

const web3StorageToken = process.env.WEB3_STORAGE_TOKEN?.trim();

const base32Alphabet = "abcdefghijklmnopqrstuvwxyz234567";
let web3StorageModulePromise = null;

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

async function loadWeb3StorageModule() {
  if (!web3StorageToken) {
    return null;
  }

  if (!web3StorageModulePromise) {
    web3StorageModulePromise = import("web3.storage")
      .then((module) => ({
        File: module.File,
        client: new module.Web3Storage({ token: web3StorageToken }),
      }))
      .catch(() => null);
  }

  return web3StorageModulePromise;
}

async function writeLocalArchive({ cid, payload }) {
  await mkdir(archiveDir, { recursive: true });
  const filePath = path.join(archiveDir, `${cid}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
  return filePath;
}

async function writeRemoteSnapshot({ planId, payload, localCid }) {
  const web3Storage = await loadWeb3StorageModule();

  if (!web3Storage) {
    return null;
  }

  const payloadText = JSON.stringify(payload, null, 2);
  const fileName = `${planId}-${Date.now()}.json`;
  const file = new web3Storage.File([payloadText], fileName, { type: "application/json" });
  const cid = await web3Storage.client.put([file], { wrapWithDirectory: false });

  return {
    id: `storage_${Math.random().toString(36).slice(2, 10)}`,
    planId,
    cid,
    backend: "web3-storage",
    kind: "plan-snapshot",
    filePath: null,
    gatewayUrl: `https://dweb.link/ipfs/${cid}`,
    localFallbackCid: localCid,
    createdAt: new Date().toISOString(),
  };
}

export async function writeSnapshot({ planId, payload }) {
  const cid = createCidFromPayload(payload);
  const filePath = await writeLocalArchive({ cid, payload });

  if (web3StorageToken) {
    try {
      const remoteReference = await writeRemoteSnapshot({ planId, payload, localCid: cid });

      if (remoteReference) {
        return {
          ...remoteReference,
          filePath,
        };
      }
    } catch {
      // Fall back to the local adapter when remote upload is unavailable.
    }
  }

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
