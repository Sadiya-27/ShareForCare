import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const ngos = await db
      .collection("ngos")
      .find({}, { projection: { password: 0 } }) // exclude sensitive data
      .toArray();

    return new Response(JSON.stringify(ngos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching all NGOs:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
