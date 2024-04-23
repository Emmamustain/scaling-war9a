import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return new NextResponse(JSON.stringify(1000000000), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
