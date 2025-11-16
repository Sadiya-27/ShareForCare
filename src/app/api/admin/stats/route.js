import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const [
      donateCloths,
      donateFootwear,
      donateSchool,

      reqCloths,
      reqFootwear,
      reqSchool,
    ] = await Promise.all([
      db.collection("donate-cloths").countDocuments(),
      db.collection("donate-footwear").countDocuments(),
      db.collection("donate-school-supplies").countDocuments(),

      db.collection("requests").countDocuments(),
      db.collection("requests-footwear").countDocuments(),
      db.collection("request-school-supplies").countDocuments(),
    ]);

    return new Response(
      JSON.stringify({
        donations: {
          cloths: donateCloths,
          footwear: donateFootwear,
          school: donateSchool,
          total: donateCloths + donateFootwear + donateSchool,
        },
        requests: {
          cloths: reqCloths,
          footwear: reqFootwear,
          school: reqSchool,
          total: reqCloths + reqFootwear + reqSchool,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
