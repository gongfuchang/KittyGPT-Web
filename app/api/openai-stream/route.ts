import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";
import { requestOpenai } from "../openai/request-utils";

async function createStream(req: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await requestOpenai(req);

  const contentType = res.headers.get("Content-Type") ?? "";
  if (!contentType.includes("stream")) {
    const content = await (
      await res.text()
    ).replace(/provided:.*. You/, "provided: ***. You");
    console.log("[Stream] error ", content);
    return "```json\n" + content + "```";
  }

  // const queueingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const choice = json.choices[0];
            if (choice?.finish_reason) {
              console.log("[Stream-finished]" + choice.finish_reason);
              controller.close();
              return;
            }
            const text = json.choices[0].delta.content;
            // console.log('[Stream-choice]' + JSON.stringify(json.choices[0]));
            if (text) {
              console.log("[Stream-content]" + text);
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            }
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        const it = decoder.decode(chunk);
        // console.log('[txt111]' + txt);
        // txt.split('\n').filter(it=>it.length >0).forEach(function(it){
        console.log("[txt]" + it);
        parser.feed(it);
        // });
      }
    },
  });
  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const stream = await createStream(req);
    return new Response(stream);
  } catch (error) {
    console.error("[Chat Stream]", error);
    return new Response(
      ["```json\n", JSON.stringify(error, null, "  "), "\n```"].join(""),
    );
  }
}

export const config = {
  runtime: "edge",
};
