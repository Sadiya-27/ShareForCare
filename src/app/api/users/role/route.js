import clientPromise from "../../../lib/mongodb";

export async function PATCH(req) {
  try {
    const client = await clientPromise;
    const db = client.db("your_database_name"); // replace with your DB
    const { firebaseUid, role } = await req.json();

    const result = await db.collection("users").updateOne(
      { firebaseUid },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Role updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
