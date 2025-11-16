import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  const volunteers = await db.collection("volunteers").find({}).toArray();
  return Response.json(volunteers);
}
