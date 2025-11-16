import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const donations = await db
      .collection("donate-footwear")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(donations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching footwear donations:", err);
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
      donorName,
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
      color,
      description,

      deliveryMethod,

      address,
      landmark,
      city,
      state,

      availableFrom,

      images,
      userId,
    } = body;

    // Required Validations
    if (
      !donorName ||
      !contactNumber ||
      !contactEmail ||
      !shoeType ||
      !size ||
      !quantity ||
      !condition ||
      !deliveryMethod ||
      !availableFrom
    ) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If pickup-request → address fields required
    if (
      deliveryMethod === "pickup-request" &&
      (!address || !city || !state)
    ) {
      return new Response(
        JSON.stringify({
          message: "Pickup address, city, and state are required for pickup-request",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newDonation = {
      donorName,
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
      color,
      description,

      deliveryMethod,

      address: deliveryMethod === "pickup-request" ? address : null,
      landmark: deliveryMethod === "pickup-request" ? landmark : null,
      city: deliveryMethod === "pickup-request" ? city : null,
      state: deliveryMethod === "pickup-request" ? state : null,

      availableFrom: new Date(availableFrom),

      images: images || [],

      userId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
    };

    // Insert Donation
    const result = await db
      .collection("donate-footwear")
      .insertOne(newDonation);

    return new Response(
      JSON.stringify({
        message: "Footwear donation submitted successfully",
        data: { _id: result.insertedId, ...newDonation },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Error submitting footwear donation:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
