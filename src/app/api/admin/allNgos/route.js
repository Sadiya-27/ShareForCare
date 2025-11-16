import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  const ngos = await db.collection("ngos").find({}).toArray();
  return Response.json(ngos);
}
