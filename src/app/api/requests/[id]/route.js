import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const { id } = params;

    // Validate ID format
    if (!id || id.length !== 24) {
      return new Response(JSON.stringify({ message: "Invalid request ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const requestData = await db
      .collection("requests")
      .findOne({ _id: new ObjectId(id) });

    if (!requestData) {
      return new Response(JSON.stringify({ message: "Request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(requestData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching request:", err);
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

    await db.collection("requests").updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed } }
    );

    return Response.json({ message: "Updated successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}