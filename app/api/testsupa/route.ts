import { NextRequest, NextResponse } from "next/server";
import { getFeaturedBusinesses } from "@/database/queries";

export async function GET(request: NextRequest) {
  return new NextResponse(JSON.stringify(await getFeaturedBusinesses()), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
