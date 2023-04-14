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

  return requestGlm(req)
  .then((response) => response.body)
  .then((rb) => {
    const reader = rb?.getReader();
    const stream = new ReadableStream({
      start(controller) {
        // The following function handles each data chunk
        function push() {
          try {
            // "done" is a Boolean and value a "Uint8Array"
            reader?.read().then(({ done, value }) => {
              // If there is no more data to read
              if (done) {
                controller.close();
                return;
              }
              // Get the data and send it to the browser via the controller
              const text = decoder.decode(value);
              console.log('text-part:' + text);
              controller.enqueue(value);
              push();
            });
          } catch (error) {
            controller.error(error);
          }
        }
        push();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain" } });
  })
  
}