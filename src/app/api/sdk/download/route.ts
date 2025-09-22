import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";

// Helper function to recursively read files from a directory
async function addFilesToZip(zip: JSZip, directoryPath: string, basePath: string) {
  const files = await fs.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.stat(filePath);
    const zipPath = path.join(basePath, file);

    if (stat.isDirectory()) {
      // Recursively add files from sub-directory
      const folder = zip.folder(file);
      if (folder) {
        await addFilesToZip(folder, filePath, "");
      }
    } else {
      // Add file to zip
      const content = await fs.readFile(filePath);
      zip.file(zipPath, content);
    }
  }
}


export async function GET(req: NextRequest) {
  try {
    const zip = new JSZip();
    const sdkRootPath = path.join(process.cwd(), "chat-sdk");
    
    // Add all files from the chat-sdk directory to the zip
    await addFilesToZip(zip, sdkRootPath, "");

    // Generate the ZIP file as a buffer
    const zipBuffer = await zip.generateAsync({ 
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    });

    // Send the ZIP file as the response
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="chat-sdk-source.zip"`,
      },
    });

  } catch (error: any) {
    console.error("[SDK DOWNLOAD ERROR]:", error);
    // Check for common file-not-found error
    if (error.code === 'ENOENT') {
        return NextResponse.json(
            { error: "SDK source directory not found on the server.", details: "Ensure the 'chat-sdk' folder exists at the project root." },
            { status: 404 }
        );
    }
    return NextResponse.json(
      { error: "Failed to package the SDK source.", details: error.message },
      { status: 500 }
    );
  }
}
