import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error(" Please define MONGODB_URI in .env.local");

const globalWithMongoose = global as typeof global & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached = globalWithMongoose.mongoose ?? { conn: null, promise: null };
globalWithMongoose.mongoose = cached;

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri!, { bufferCommands: false }).then((m) => {
      console.log(" MongoDB connected:", m.connection.name);
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}