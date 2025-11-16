import clientPromise from "@/app/lib/mongodb";

// ✅ GET - Fetch existing Volunteer profile
export async function GET(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get("firebaseUid");

    if (!firebaseUid) {
      return new Response(
        JSON.stringify({ message: "Firebase UID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
  } catch (err) {
    console.error("Error fetching volunteer:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ✅ POST - Create new Volunteer profile
export async function POST(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const {
      firebaseUid,
      userId,
      name,
      email,
      profilePic,
      phoneNo,
      location,
      address,
      age,
      gender,
      skills,
      availability,
      experience,
      motivation,
      joinedNGOs,
      verificationDoc,
    } = await req.json();

    // Validation
    if (!firebaseUid || !email) {
      return new Response(
        JSON.stringify({ message: "Firebase UID and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for existing volunteer
    const existingVolunteer = await db
      .collection("volunteers")
      .findOne({ firebaseUid });
    if (existingVolunteer) {
      return new Response(
        JSON.stringify({
          message: "Volunteer profile already exists. Use PUT to update.",
          volunteerId: existingVolunteer._id,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create new record
    const result = await db.collection("volunteers").insertOne({
      firebaseUid,
      userId,
      name,
      email,
      profilePic,
      phoneNo,
      location,
      address,
      age,
      gender,
      skills: skills || [],
      availability,
      experience,
      motivation,
      joinedNGOs: joinedNGOs || [],
      verificationDoc,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        message: "Volunteer profile created successfully",
        volunteerId: result.insertedId,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error creating volunteer profile:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ✅ PUT - Update existing Volunteer profile (email cannot be changed)
export async function PUT(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const {
      firebaseUid,
      name,
      profilePic,
      phoneNo,
      location,
      address,
      age,
      gender,
      skills,
      availability,
      experience,
      motivation,
      joinedNGOs,
      verificationDoc,
      // email is intentionally excluded
    } = await req.json();

    if (!firebaseUid) {
      return new Response(
        JSON.stringify({ message: "Firebase UID is required for update" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingVolunteer = await db
      .collection("volunteers")
      .findOne({ firebaseUid });

    if (!existingVolunteer) {
      return new Response(
        JSON.stringify({
          message: "Volunteer profile not found. Please create one first.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build update fields dynamically
    const updateFields = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;
    if (phoneNo !== undefined) updateFields.phoneNo = phoneNo;
    if (location !== undefined) updateFields.location = location;
    if (address !== undefined) updateFields.address = address;
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (skills !== undefined) updateFields.skills = skills;
    if (availability !== undefined) updateFields.availability = availability;
    if (experience !== undefined) updateFields.experience = experience;
    if (motivation !== undefined) updateFields.motivation = motivation;
    if (joinedNGOs !== undefined) updateFields.joinedNGOs = joinedNGOs;
    if (verificationDoc !== undefined)
      updateFields.verificationDoc = verificationDoc;

    const result = await db.collection("volunteers").updateOne(
      { firebaseUid },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Volunteer not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Volunteer profile updated successfully",
        modifiedCount: result.modifiedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error updating volunteer profile:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
