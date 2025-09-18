declare global {
  // Add a mongoose property to globalThis
  // Prevents multiple connections in Next.js hot reload
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
  } | undefined;
}

export {};
