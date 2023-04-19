import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";
import { doCompletion } from "../glm/request-utils";

export async function POST(req: NextRequest) {
  try {
    const resp = doCompletion(req, true);
    return resp;
  } catch (error) {
    console.error("[GLM-Stream]", error);
    return new Response(
      ["```json\n", JSON.stringify(error, null, "  "), "\n```"].join(""),
    );
  }
}

export const config = {
  runtime: "edge",
};
