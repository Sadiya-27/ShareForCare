import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch existing NGO data
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

    const ngo = await db.collection("ngos").findOne({ firebaseUid });

    if (!ngo) {
      return new Response(JSON.stringify({ message: "NGO not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(ngo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Create new NGO profile
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
      ngoName,
      ngoLocation,
      latitude,
      longitude,
      ngoAddress,
      ngoPhoneNo,
      ngoWebsite,
      ngoType,
      ngoDescription,
      ngoEmail,
      verificationDoc,
    } = await req.json();

    // Validate required fields
    if (!firebaseUid || !email) {
      return new Response(
        JSON.stringify({ message: "Firebase UID and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if NGO already exists for this Firebase UID
    const existingNgo = await db.collection("ngos").findOne({ firebaseUid });
    if (existingNgo) {
      return new Response(
        JSON.stringify({
          message: "NGO profile already exists. Use PUT to update.",
          ngoId: existingNgo._id,
        }),
        {
          status: 409, // Conflict
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert new NGO record
    const result = await db.collection("ngos").insertOne({
      firebaseUid,
      userId,
      name,
      email, // Email stored only on creation
      profilePic,
      ngoName,
      ngoLocation,
      latitude,
      longitude,
      ngoAddress,
      ngoPhoneNo,
      ngoWebsite,
      ngoType,
      ngoDescription,
      ngoEmail,
      verificationDoc,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        message: "NGO profile created successfully",
        ngoId: result.insertedId,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error creating NGO profile:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PUT - Update existing NGO profile (email cannot be changed)
export async function PUT(req) {
  const client = await clientPromise;
  const db = client.db("your_database_name");

  try {
    const {
      firebaseUid,
      name,
      profilePic,
      ngoName,
      ngoLocation,
      ngoAddress,
      ngoPhoneNo,
      ngoWebsite,
      ngoType,
      ngoDescription,
      ngoEmail,
      verificationDoc,
      // email is intentionally NOT destructured - it cannot be updated
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

    // Check if NGO exists
    const existingNgo = await db.collection("ngos").findOne({ firebaseUid });

    if (!existingNgo) {
      return new Response(
        JSON.stringify({
          message: "NGO profile not found. Please create a profile first.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prepare update object - explicitly exclude email
    const updateFields = {
      updatedAt: new Date(),
    };

    // Only add fields that are provided and not undefined
    if (name !== undefined) updateFields.name = name;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;
    if (ngoName !== undefined) updateFields.ngoName = ngoName;
    if (ngoLocation !== undefined) updateFields.ngoLocation = ngoLocation;
    if (ngoAddress !== undefined) updateFields.ngoAddress = ngoAddress;
    if (ngoPhoneNo !== undefined) updateFields.ngoPhoneNo = ngoPhoneNo;
    if (ngoWebsite !== undefined) updateFields.ngoWebsite = ngoWebsite;
    if (ngoType !== undefined) updateFields.ngoType = ngoType;
    if (ngoDescription !== undefined)
      updateFields.ngoDescription = ngoDescription;
    if (ngoEmail !== undefined) updateFields.ngoEmail = ngoEmail;
    if (verificationDoc !== undefined)
      updateFields.verificationDoc = verificationDoc;

    // Update the NGO record (email field is never modified)
    const result = await db
      .collection("ngos")
      .updateOne({ firebaseUid }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "NGO not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "NGO profile updated successfully",
        modifiedCount: result.modifiedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error updating NGO profile:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
