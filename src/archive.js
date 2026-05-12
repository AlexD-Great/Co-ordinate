import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import * as StorachaClient from "@storacha/client";
import { StoreMemory } from "@storacha/client/stores/memory";
import { Signer } from "@storacha/client/principal/ed25519";
import { CarReader } from "@ipld/car";
import { extract, importDAG } from "@ucanto/core/delegation";

import { archiveDir } from "./runtime-paths.js";

const base32Alphabet = "abcdefghijklmnopqrstuvwxyz234567";
const defaultGatewayBaseUrl = "https://storacha.link/ipfs/";

let storachaClientPromise = null;

const archiveRuntime = {
  lastUploadStatus: "idle",
  lastUploadError: null,
  lastUploadAt: null,
};

function getStorachaCredentials() {
  const key = process.env.STORACHA_KEY?.trim() || null;
  const proof = process.env.STORACHA_PROOF?.trim() || null;
  const gatewayBaseUrl = process.env.STORACHA_GATEWAY_BASE_URL?.trim() || defaultGatewayBaseUrl;

  return {
    key,
    proof,
    gatewayBaseUrl,
    configured: Boolean(key && proof),
    partiallyConfigured: Boolean(key || proof) && !(key && proof),
  };
}

export function getArchiveRuntimeStatus() {
  const storacha = getStorachaCredentials();

  return {
    remoteArchiveConfigured: storacha.configured,
    partialRemoteArchiveConfigured: storacha.partiallyConfigured,
    preferredBackend: storacha.configured ? "storacha" : "local-content-addressed-snapshots",
    gatewayBaseUrl: storacha.configured ? storacha.gatewayBaseUrl : null,
    remoteArchiveProvider: storacha.configured ? "storacha" : null,
    lastUploadStatus: archiveRuntime.lastUploadStatus,
    lastUploadError: archiveRuntime.lastUploadError,
    lastUploadAt: archiveRuntime.lastUploadAt,
  };
}

function markArchiveAttempt(status, error = null) {
  archiveRuntime.lastUploadStatus = status;
  archiveRuntime.lastUploadError = error;
  archiveRuntime.lastUploadAt = new Date().toISOString();
}

function formatArchiveError(error) {
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return "Unknown remote archive error.";
}

async function parseStorachaProof(proofBase64) {
  const proofBytes = Uint8Array.from(Buffer.from(proofBase64, "base64"));
  const extractResult = await extract(proofBytes);

  if (extractResult.ok) {
    return extractResult.ok;
  }

  const blocks = [];
  const reader = await CarReader.fromBytes(proofBytes);

  for await (const block of reader.blocks()) {
    blocks.push(block);
  }

  return importDAG(blocks);
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

async function loadStorachaClient() {
  const storacha = getStorachaCredentials();

  if (!storacha.configured) {
    return null;
  }

  if (!storachaClientPromise) {
    storachaClientPromise = (async () => {
      try {
        const principal = Signer.parse(storacha.key);
        const store = new StoreMemory();
        const client = await StorachaClient.create({ principal, store });
        const proof = await parseStorachaProof(storacha.proof);
        const space = await client.addSpace(proof);
        await client.setCurrentSpace(space.did());

        return {
          client,
          gatewayBaseUrl: storacha.gatewayBaseUrl,
          spaceDid: space.did(),
        };
      } catch (error) {
        const message = formatArchiveError(error);
        markArchiveAttempt("remote-failed", message);
        console.error("[archive] Failed to initialize Storacha client:", message);
        return null;
      }
    })();
  }

  return storachaClientPromise;
}

async function writeLocalArchive({ cid, payload }) {
  await mkdir(archiveDir, { recursive: true });
  const filePath = path.join(archiveDir, `${cid}.json`);
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
  return filePath;
}

async function writeRemoteSnapshot({ planId, payload, localCid }) {
  const storacha = await loadStorachaClient();

  if (!storacha) {
    return null;
  }

  const payloadText = JSON.stringify(payload, null, 2);
  const blob = new Blob([payloadText], { type: "application/json" });
  const cidLink = await storacha.client.uploadFile(blob);
  const cid = cidLink.toString();
  markArchiveAttempt("remote-success");

  return {
    id: `storage_${Math.random().toString(36).slice(2, 10)}`,
    planId,
    cid,
    backend: "storacha",
    kind: "plan-snapshot",
    filePath: null,
    gatewayUrl: `${storacha.gatewayBaseUrl}${cid}`,
    localFallbackCid: localCid,
    createdAt: new Date().toISOString(),
  };
}

export async function writeSnapshot({ planId, payload }) {
  const cid = createCidFromPayload(payload);
  const filePath = await writeLocalArchive({ cid, payload });
  const storacha = getStorachaCredentials();

  if (!storacha.configured) {
    markArchiveAttempt("local-only");
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

  try {
    const remoteReference = await writeRemoteSnapshot({ planId, payload, localCid: cid });

    if (remoteReference) {
      return {
        ...remoteReference,
        filePath,
      };
    }

    markArchiveAttempt(
      "remote-failed",
      "Storacha client initialization did not complete, so Co-ordinate kept the local snapshot.",
    );
  } catch (error) {
    const message = formatArchiveError(error);
    markArchiveAttempt("remote-failed", message);
    console.error("[archive] Remote upload failed, falling back to local:", message);
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
