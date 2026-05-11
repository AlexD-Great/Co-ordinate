import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { archiveDir } from "./runtime-paths.js";

const base32Alphabet = "abcdefghijklmnopqrstuvwxyz234567";
let nftStorageModulePromise = null;

function getNftStorageToken() {
  return process.env.NFT_STORAGE_TOKEN?.trim() || null;
}

export function getArchiveRuntimeStatus() {
  const token = getNftStorageToken();
  return {
    tokenConfigured: Boolean(token),
    preferredBackend: token ? "nft-storage" : "local-content-addressed-snapshots",
    gatewayBaseUrl: token ? "https://nftstorage.link/ipfs/" : null,
  };
}

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

async function loadNftStorageModule() {
  const token = getNftStorageToken();

  if (!token) {
    return null;
  }

  if (!nftStorageModulePromise) {
    nftStorageModulePromise = import("nft.storage")
      .then((module) => ({
        client: new module.NFTStorage({ token }),
      }))
      .catch((error) => {
        console.error("[archive] Failed to load nft.storage module:", error.message);
        return null;
      });
  }

  return nftStorageModulePromise;
}

async function writeLocalArchive({ cid, payload }) {
  await mkdir(archiveDir, { recursive: true });
  const filePath = path.join(archiveDir, `${cid}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
  return filePath;
}

async function writeRemoteSnapshot({ planId, payload, localCid }) {
  const nftStorage = await loadNftStorageModule();

  if (!nftStorage) {
    return null;
  }

  const payloadText = JSON.stringify(payload, null, 2);
  const blob = new Blob([payloadText], { type: "application/json" });
  const cid = await nftStorage.client.storeBlob(blob);

  return {
    id: `storage_${Math.random().toString(36).slice(2, 10)}`,
    planId,
    cid,
    backend: "nft-storage",
    kind: "plan-snapshot",
    filePath: null,
    gatewayUrl: `https://nftstorage.link/ipfs/${cid}`,
    localFallbackCid: localCid,
    createdAt: new Date().toISOString(),
  };
}

export async function writeSnapshot({ planId, payload }) {
  const cid = createCidFromPayload(payload);
  const filePath = await writeLocalArchive({ cid, payload });

  if (getNftStorageToken()) {
    try {
      const remoteReference = await writeRemoteSnapshot({ planId, payload, localCid: cid });

      if (remoteReference) {
        return {
          ...remoteReference,
          filePath,
        };
      }
    } catch (error) {
      console.error("[archive] Remote upload failed, falling back to local:", error.message);
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
