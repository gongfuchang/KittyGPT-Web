import { NextRequest } from "next/server";

const GLM_URL = `http://127.0.0.1:5000/chat_stream`; 
const BASE_URL = process.env.GLM_URL ?? GLM_URL;


export async function requestGlm(req: NextRequest) {
  return fetch(BASE_URL, {
    headers: {
      "Content-Type": "application/json"
    },
    method: req.method,
    body: req.body,
  })
}

export async function doCompletion(req: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await requestGlm(req);
  const rb = res.body as any;

  const stream = new ReadableStream({
    async start(controller) {
      // The following function handles each data chunk
      for await (const chunk of rb as any) {
        const text = decoder.decode(chunk);
        console.log('text-part:' + text);
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });
  console.log('return response with 200');
  return new Response(stream, { headers: { "Content-Type": "text/plain"} , status: 200 });
}