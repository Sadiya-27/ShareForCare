import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const requests = await db
      .collection("request-school-supplies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(requests), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error fetching school supply requests:", err);
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

      itemType,
      gradeLevel,
      brandPreference,
      quantity,
      itemCondition,
      extraDetails,
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

    // Validate required fields
    if (
      !ngoName ||
      !contactPerson ||
      !contactNumber ||
      !contactEmail ||
      !itemType ||
      !quantity ||
      !reason ||
      !deliveryPreference ||
      !ngoAddress ||
      !city ||
      !state ||
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

      itemType,
      gradeLevel: gradeLevel || "",
      brandPreference: brandPreference || "",
      quantity,
      itemCondition: itemCondition || "",
      extraDetails: extraDetails || "",
      reason,

      deliveryPreference,

      ngoAddress,
      landmark: landmark || "",
      city,
      state,

      requiredBefore: new Date(requiredBefore),
      urgency: urgency || "normal",

      images: images || [],

      userId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("request-school-supplies")
      .insertOne(newRequest);

    return new Response(
      JSON.stringify({
        message: "School supplies request submitted successfully",
        data: { _id: result.insertedId, ...newRequest },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Error submitting school supplies request:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
