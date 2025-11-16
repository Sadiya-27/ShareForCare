import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const requests = await db
      .collection("requests-footwear")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(requests), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching footwear requests:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const body = await req.json();

    const {
      ngoName,
      contactPerson,
      contactNumber,
      contactEmail,

      shoeType,
      size,
      material,
      category,
      quantity,
      gender,
      condition,
      season,
      purpose,
      color,
      reason,

      deliveryPreference,

      ngoAddress,
      landmark,
      city,
      state,

      requiredBefore,
      urgency,

      images,
      userId,
    } = body;

    // Required validations
    if (
      !ngoName ||
      !contactPerson ||
      !contactNumber ||
      !contactEmail ||
      !shoeType ||
      !size ||
      !quantity ||
      !reason ||
      !deliveryPreference ||
      !ngoAddress ||
      !requiredBefore
    ) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newRequest = {
      ngoName,
      contactPerson,
      contactNumber,
      contactEmail,

      shoeType,
      size,
      material,
      category,
      quantity,
      gender,
      condition,
      season,
      purpose,
      color,
      reason,

      deliveryPreference,

      ngoAddress,
      landmark,
      city,
      state,

      requiredBefore: new Date(requiredBefore),
      urgency: urgency || "normal",

      images: images || [],

      userId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert in footwear collection
    const result = await db
      .collection("requests-footwear")
      .insertOne(newRequest);

    return new Response(
      JSON.stringify({
        message: "Footwear request submitted successfully",
        data: { _id: result.insertedId, ...newRequest },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error submitting footwear request:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
