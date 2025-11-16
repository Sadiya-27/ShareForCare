import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const { id, type, status } = await req.json();

  const client = await clientPromise;
  const db = client.db("your_database_name");

  const collectionName = type === "volunteer" ? "volunteers" : "ngos";

  await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    { $set: { verification: status } }
  );

  return Response.json({ success: true });
}
