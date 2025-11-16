import clientPromise from "../../lib/mongodb"; // your file with MongoClient
import { ObjectId } from "mongodb";

export async function POST(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name"); // replace with your DB name

  try {
    const { firebaseUid, name, email, role } = await req.json();

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ firebaseUid });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert new user
    const result = await db.collection("users").insertOne({
      firebaseUid,
      name,
      email,
      role,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "User created", userId: result.insertedId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
