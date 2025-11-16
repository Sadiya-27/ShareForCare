import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const donations = await db
      .collection("donate-cloths")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(donations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching donations:", err);
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

      clothType,
      size,
      fabricType,
      category,
      quantity,
      ageGroup,
      gender,
      condition,
      season,
      color,
      extraDetails,
      message,

      deliveryPreference,

      donorAddress,
      landmark,
      city,
      state,

      availableFrom,

      images,
      userId,
    } = body;

    // Validate required fields
    if (
      !donorName ||
      !contactNumber ||
      !contactEmail ||
      !clothType ||
      !quantity ||
      !message ||
      !deliveryPreference ||
      !donorAddress ||
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

    const newDonation = {
      donorName,
      contactNumber,
      contactEmail,

      clothType,
      size,
      fabricType,
      category,
      quantity,
      ageGroup,
      gender,
      condition,
      season,
      color,
      extraDetails,
      message,

      deliveryPreference,

      donorAddress,
      landmark,
      city,
      state,

      availableFrom: new Date(availableFrom),

      images: images || [],

      userId: userId || null,
      completed: false,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("donate-cloths").insertOne(newDonation);

    return new Response(
      JSON.stringify({
        message: "Donation submitted successfully",
        data: { _id: result.insertedId, ...newDonation },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error submitting donation:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
