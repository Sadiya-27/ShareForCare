import clientPromise from "@/app/lib/mongodb";

// ✅ GET - Fetch all volunteers OR a specific one by firebaseUid
export async function GET(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get("firebaseUid");

    if (firebaseUid) {
      // 🔍 Fetch a single volunteer
      const volunteer = await db.collection("volunteers").findOne({ firebaseUid });

      if (!volunteer) {
        return new Response(
          JSON.stringify({ message: "Volunteer not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(volunteer), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // 🌍 Fetch all volunteers
      const volunteers = await db.collection("volunteers").find({}).toArray();
      return new Response(JSON.stringify({ success: true, volunteers }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
