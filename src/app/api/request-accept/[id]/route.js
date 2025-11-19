import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

/* ============================================================
   GET — Fetch request by ID and type
   /api/request-accept/:id?type=cloths|footwear|school-supplies
============================================================ */
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const requestType = request.nextUrl.searchParams.get("type");

    if (!id || id.length !== 24) {
      return new Response(JSON.stringify({ message: "Invalid request ID" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("your_database_name");

    // SELECT COLLECTION
    const collection =
      requestType === "cloths"
        ? "requests"
        : requestType === "footwear"
        ? "requests-footwear"
        : "request-school-supplies";

    const requestItem = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });

    if (!requestItem) {
      return new Response(
        JSON.stringify({ message: "Request not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(requestItem), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

/* ============================================================
   PATCH — Accept Request + Save + Send Emails
============================================================ */
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { requestType, volunteerId } = await req.json();

    if (!id || id.length !== 24)
      return Response.json({ message: "Invalid request ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("your_database_name");

    // SELECT COLLECTION
    const collection =
      requestType === "cloths"
        ? "requests"
        : requestType === "footwear"
        ? "requests-footwear"
        : "request-school-supplies";

    // FETCH REQUEST ITEM
    const reqItem = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });

    if (!reqItem)
      return Response.json({ error: "Request not found" }, { status: 404 });

    // FETCH NGO WHO CREATED THE REQUEST
    const ngo = await db.collection("ngos").findOne({
      firebaseUid: reqItem.userId,
    });

    if (!ngo)
      return Response.json({ error: "NGO not found" }, { status: 404 });

    // FETCH VOLUNTEER WHO ACCEPTED THE REQUEST
    const volunteer = await db.collection("volunteers").findOne({
      firebaseUid: volunteerId,
    });

    if (!volunteer)
      return Response.json({ error: "Volunteer not found" }, { status: 404 });

    // UPDATE REQUEST IN DATABASE
    await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          accepted: true,
          acceptedAt: new Date(),
          acceptedBy: volunteerId,
          updatedAt: new Date(),
        },
      }
    );

    /* ============================================================
       FORMAT REQUEST DETAILS
    ============================================================= */
    let requestDetails = "";

    if (requestType === "cloths") {
      requestDetails = `
Cloth Type: ${reqItem.clothType}
Category: ${reqItem.category}
Gender: ${reqItem.gender}
Age Group: ${reqItem.ageGroup}
Season: ${reqItem.season}
Quantity Needed: ${reqItem.quantity}
Description: ${reqItem.description || "N/A"}
`;
    }

    if (requestType === "footwear") {
      requestDetails = `
Shoe Type: ${reqItem.shoeType}
Size Required: ${reqItem.size}
Gender: ${reqItem.gender}
Category: ${reqItem.category}
Quantity Needed: ${reqItem.quantity}
Description: ${reqItem.description || "N/A"}
`;
    }

    if (requestType === "school-supplies") {
      requestDetails = `
Item: ${reqItem.itemType}
Grade Level: ${reqItem.gradeLevel}
Quantity Needed: ${reqItem.quantity}
Condition Preference: ${reqItem.itemCondition}
Extra Details: ${reqItem.extraDetails || "N/A"}
`;
    }

    const formattedDate = new Date().toLocaleString();

    /* ============================================================
       EMAIL TO NGO — Request Accepted
    ============================================================= */
    const emailToNGO = `
Hello ${ngo.ngoName},

A volunteer has accepted your request.

===============================
        REQUEST DETAILS
===============================
${requestDetails}

===============================
       VOLUNTEER DETAILS
===============================
Name: ${volunteer.name}
Email: ${volunteer.email}
Phone: ${volunteer.phoneNo || "N/A"}

Accepted On: ${formattedDate}

Thank you for using ShareForCare 💙
— ShareForCare Team
`;

    await sendEmail(ngo.email, "Your Request Was Accepted", emailToNGO);

    /* ============================================================
       EMAIL TO VOLUNTEER — Confirmation
    ============================================================= */
    const emailToVolunteer = `
Hello ${volunteer.name},

You have successfully accepted an NGO request.

===============================
         NGO DETAILS
===============================
Name: ${ngo.ngoName}
Email: ${ngo.ngoEmail}
Phone: ${ngo.ngoPhoneNo}
Address: ${ngo.ngoAddress}

===============================
        REQUEST DETAILS
===============================
${requestDetails}

Accepted On: ${formattedDate}

Thank you for helping the community 💙
— ShareForCare Team
`;

    await sendEmail(
      volunteer.email,
      "You Accepted an NGO Request",
      emailToVolunteer
    );

    return Response.json({ message: "Request accepted successfully" });
  } catch (error) {
    console.error("Request Accept Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/* ============================================================
   EMAIL SENDER FUNCTION
============================================================ */
async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ShareForCare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}
