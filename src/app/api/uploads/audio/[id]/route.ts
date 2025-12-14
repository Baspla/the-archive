import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Ensure the id is safe to use in a file path (basic sanitization)
  const safeId = path.basename(id);
  const filePath = path.join(process.cwd(), "uploads", `${safeId}.mp3`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
