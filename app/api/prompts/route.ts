import { NextResponse } from "next/server";

import { getMemoryPromptGroups } from "@/lib/memory-prompts";

export async function GET() {
  return NextResponse.json({
    groups: getMemoryPromptGroups(),
  });
}
