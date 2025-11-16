import clientPromise from "@/app/lib/mongodb";

export async function GET(req, context) {
  const { params } = await context;
  const { userId } = params;

  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const data = await db
      .collection("donate-cloths")
      .find({ userId })
      .toArray();

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
