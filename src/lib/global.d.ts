declare global {
  // Add a mongoose property to globalThis
  // Prevents multiple connections in Next.js hot reload
  var mongoose: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
  } | undefined;
}

// Ensure this file is treated as a module
export {};
