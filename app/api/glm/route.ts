import { NextRequest, NextResponse } from "next/server";
import { doCompletion } from "./request-utils";

export async function POST(req: NextRequest) {
  return doCompletion(req, true);
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      msg: '[TO-BE-IMPLETEMTED]',
    },
    {
      status: 200,
    },
  );
}
