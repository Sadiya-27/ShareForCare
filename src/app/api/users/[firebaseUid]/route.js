import clientPromise from "../../../lib/mongodb";

export async function GET(request, { params }) {
  try {
    // ✅ params is an async object in Next.js App Router
    const { firebaseUid } = await params;

    const client = await clientPromise;
    const db = client.db("your_database_name"); // change this to your actual DB name

    // 🔹 Find user by Firebase UID
    const user = await db.collection("users").findOne({ firebaseUid });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: "Server error", error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}