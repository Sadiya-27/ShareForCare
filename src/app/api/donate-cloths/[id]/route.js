import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const { id } = params;

    if (!id || id.length !== 24) {
      return new Response(JSON.stringify({ message: "Invalid donation ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Correct collection name
    const donationData = await db
      .collection("donate-cloths")
      .findOne({ _id: new ObjectId(id) });

    if (!donationData) {
      return new Response(JSON.stringify({ message: "Donation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(donationData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error fetching donation:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { completed } = await req.json();

    const client = await clientPromise;
    const db = client.db("your_database_name");

    // ✅ Correct collection name
    await db.collection("donate-cloths").updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed } }
    );

    return Response.json({ message: "Updated successfully" });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
