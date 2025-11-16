import clientPromise from "@/app/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  const client = await clientPromise;
  const db = client.db("your_database_name");

  const admin = await db.collection("users").findOne({ firebaseUid: uid });

  return Response.json({ isAdmin: admin?.role === "admin" });
}
