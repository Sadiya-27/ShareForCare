import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const donations = await db
      .collection("donate-school-supplies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(donations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error fetching school supply donations:", err);
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

      itemType,
      gradeLevel,
      brandPreference,
      quantity,
      itemCondition,
      extraDetails,

      deliveryMethod,

      address,
      landmark,
      city,
      state,

      availableFrom,

      images,
      userId,
    } = body;

    // Required field validation
    if (
      !donorName ||
      !contactNumber ||
      !contactEmail ||
      !itemType ||
      !quantity ||
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

    // If delivery is pickup-request → address required
    if (
      deliveryMethod === "pickup-request" &&
      (!address || !city || !state)
    ) {
      return new Response(
        JSON.stringify({
          message:
            "Pickup address, city and state are required for pickup-request",
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

      itemType,
      gradeLevel: gradeLevel || "",
      brandPreference: brandPreference || "",
      quantity,
      itemCondition: itemCondition || "",
      extraDetails: extraDetails || "",

      deliveryMethod,

      address: deliveryMethod === "pickup-request" ? address : "",
      landmark: deliveryMethod === "pickup-request" ? landmark || "" : "",
      city: deliveryMethod === "pickup-request" ? city : "",
      state: deliveryMethod === "pickup-request" ? state : "",

      availableFrom: new Date(availableFrom),

      images: images || [],

      userId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
    };

    const result = await db
      .collection("donate-school-supplies")
      .insertOne(newDonation);

    return new Response(
      JSON.stringify({
        message: "School supplies donation submitted successfully",
        data: { _id: result.insertedId, ...newDonation },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Error submitting school supplies donation:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
