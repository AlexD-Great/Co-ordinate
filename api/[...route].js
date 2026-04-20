import { handleApiRequest } from "../src/api-router.js";

async function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, "https://co-ordinate.local");
  const body = await parseBody(req);
  const result = await handleApiRequest({
    method: req.method,
    pathname: url.pathname,
    body,
  });

  res.status(result.statusCode).json(result.payload);
}
