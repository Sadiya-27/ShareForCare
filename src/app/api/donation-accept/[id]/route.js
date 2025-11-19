import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

/* ============================================================
   GET — Fetch donation by ID and type
   /api/donation-accept/:id?type=cloths|footwear|school-supplies
============================================================ */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const donationType = request.nextUrl.searchParams.get("type");

    if (!id || id.length !== 24) {
      return new Response(JSON.stringify({ message: "Invalid donation ID" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("your_database_name");

    const collection =
      donationType === "cloths"
        ? "donate-cloths"
        : donationType === "footwear"
        ? "donate-footwear"
        : "donate-school-supplies";

    const donation = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });

    if (!donation) {
      return new Response(
        JSON.stringify({ message: "Donation not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(donation), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

/* ============================================================
   PATCH — Accept Donation + Save + Send Emails
============================================================ */
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { donationType, ngoId } = await req.json();

    if (!id || id.length !== 24)
      return Response.json({ message: "Invalid donation ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("your_database_name");

    // SELECT COLLECTION
    const collection =
      donationType === "cloths"
        ? "donate-cloths"
        : donationType === "footwear"
        ? "donate-footwear"
        : "donate-school-supplies";

    const donation = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });

    if (!donation)
      return Response.json({ error: "Donation not found" }, { status: 404 });

    // FETCH NGO
    const ngo = await db.collection("ngos").findOne({ firebaseUid: ngoId });

    if (!ngo)
      return Response.json({ error: "NGO not found" }, { status: 404 });

    // FETCH VOLUNTEER (DONOR)
    const volunteer = await db
      .collection("volunteers")
      .findOne({ firebaseUid: donation.userId });

    if (!volunteer)
      return Response.json({ error: "Volunteer not found" }, { status: 404 });

    // UPDATE DONATION
    await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          accepted: true,
          acceptedAt: new Date(),
          acceptedBy: ngoId,
          updatedAt: new Date(),
        },
      }
    );

    /* =========================
       FORMAT DONATION DETAILS
    ========================== */
    let donationDetails = "";

    if (donationType === "cloths") {
      donationDetails = `
Cloth Type: ${donation.clothType}
Category: ${donation.category}
Size: ${donation.size}
Age Group: ${donation.ageGroup}
Gender: ${donation.gender}
Fabric: ${donation.fabricType}
Season: ${donation.season}
Quantity: ${donation.quantity}
Condition: ${donation.condition}
Message: ${donation.message || "N/A"}
`;
    }

    if (donationType === "footwear") {
      donationDetails = `
Shoe Type: ${donation.shoeType}
Size: ${donation.size}
Category: ${donation.category}
Gender: ${donation.gender}
Season: ${donation.season || "N/A"}
Material: ${donation.material || "N/A"}
Quantity: ${donation.quantity}
Condition: ${donation.condition}
Description: ${donation.description || "N/A"}
`;
    }

    if (donationType === "school-supplies") {
      donationDetails = `
Item: ${donation.itemType}
Grade Level: ${donation.gradeLevel}
Brand Preference: ${donation.brandPreference || "N/A"}
Quantity: ${donation.quantity}
Condition: ${donation.itemCondition}
Extra Details: ${donation.extraDetails || "N/A"}
`;
    }

    const formattedDate = new Date().toLocaleString();

    /* =========================
       EMAIL TO VOLUNTEER
    ========================== */
    const volunteerMessage = `
Hello ${donation.donorName},

Your donation has been accepted by the NGO!

===============================
        NGO DETAILS
===============================
Name: ${ngo.ngoName}
Email: ${ngo.ngoEmail}
Phone: ${ngo.ngoPhoneNo}
Address: ${ngo.ngoAddress}
Website: ${ngo.ngoWebsite || "N/A"}

===============================
       DONATION DETAILS
===============================
${donationDetails}

Accepted On: ${formattedDate}

Thank you for making a difference ❤️
— ShareForCare Team
`;

    await sendEmail(
      volunteer.email || donation.contactEmail,
      "Your Donation Was Accepted!",
      volunteerMessage
    );

    /* =========================
       EMAIL TO NGO
    ========================== */
    const ngoMessage = `
Hello ${ngo.ngoName},

You have successfully accepted a donation.

===============================
       DONOR DETAILS
===============================
Name: ${donation.donorName}
Email: ${donation.contactEmail}
Phone: ${donation.contactNumber}

===============================
      DONATION DETAILS
===============================
${donationDetails}

Accepted On: ${formattedDate}

Thank you for helping your community.
— ShareForCare Team
`;

    await sendEmail(ngo.email, "You Accepted a Donation", ngoMessage);

    /* =========================
       SEND SAME EMAIL TO NGO 
       (COPY OF VOLUNTEER EMAIL)
    ========================== */
    await sendEmail(
      ngo.email,
      "Copy of Volunteer Email: Donation Accepted",
      volunteerMessage
    );

    return Response.json({ message: "Donation accepted successfully" });
  } catch (error) {
    console.error("Accept error:", error);
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
