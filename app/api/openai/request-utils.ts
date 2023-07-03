import { NextRequest } from "next/server";

const API_TYPE = process.env.API_TYPE;

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_API_BASE = process.env.AZURE_API_BASE;
const AZURE_API_VERSION = process.env.AZURE_API_VERSION;
const AZURE_API_KEY = process.env.AZURE_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_MODEL;

export async function requestOpenai(req: NextRequest) {
  if (API_TYPE != "azure") {
    console.log("[OpenAi] request via openai-api");
    return _requestOpenaiApi(req);
  }

  console.log("[Azure] request via azure-api");
  return _requestAzureApi(req);
}

async function _requestOpenaiApi(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const openaiPath = req.headers.get("path");

  console.log("[OpenAi-path] ", openaiPath);

  return fetch(`${PROTOCOL}://${BASE_URL}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: req.method,
    body: req.body,
  });
}
async function _requestAzureApi(req: NextRequest) {
  const apiKey = AZURE_API_KEY;
  const path = `${AZURE_API_BASE}/openai/deployments/${DEFAULT_MODEL}/chat/completions?api-version=${AZURE_API_VERSION}`;
  console.log("[Azure-path] ", path);

  return fetch(path, {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${apiKey}`,
    },
    method: req.method,
    body: req.body,
  });
}
