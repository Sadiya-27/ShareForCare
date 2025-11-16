"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Home, Gift, Repeat, User, Package } from "lucide-react";
import AddImageButton from "@/app/components/AddImageButton";
import "@uploadthing/react/styles.css";

export default function RequestSchoolSupplies() {
  const [user, setUser] = useState(null);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);

  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path) => pathname === path;

  // NGO details
  const [ngoName, setNgoName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // School supplies fields
  const [itemType, setItemType] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [brandPreference, setBrandPreference] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemCondition, setItemCondition] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [reason, setReason] = useState("");

  // Delivery
  const [deliveryPreference, setDeliveryPreference] = useState("");

  // Address
  const [ngoAddress, setNgoAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Date
  const [requiredBefore, setRequiredBefore] = useState("");
  const [urgency, setUrgency] = useState("");

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/Login");
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  const handleImagesUpload = (urls) => {
    setImages((prev) => [...prev, ...urls]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
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
      userId: user?.uid,
    };

    const res = await fetch("/api/request-school-supplies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    alert(result.message);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between
              h-screen w-64 fixed md:sticky z-50 transition-transform duration-300
              ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0`}
      >
        <div className="mt-6 flex flex-col gap-2 px-3">
          <div
            className="flex items-center gap-2 px-4 rounded-lg py-4 cursor-pointer"
            onClick={() => router.push("/DashboardNGO")}
          >
            <Image src="/logo3.png" width={50} height={50} alt="Logo" />
            <h1 className="text-2xl font-semibold">
              Share<i>For</i>Care
            </h1>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            <button
              onClick={() => router.push("/DashboardNGO")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700"
            >
              <Home size={20} /> Home
            </button>

            {/* Dropdown */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowDonateDropdown(!showDonateDropdown)}
                className="w-full bg-blue-800 hover:bg-blue-700 px-4 py-2 flex justify-between items-center rounded-lg"
              >
                <div className="flex gap-2 items-center">
                  <Gift size={20} />
                  Request
                </div>
                <span>{showDonateDropdown ? "▲" : "▼"}</span>
              </button>

              {showDonateDropdown && (
                <div className="mt-2 bg-blue-900 rounded-md ml-4 p-1 flex flex-col">
                  <button
                    onClick={() => router.push("/request/cloths")}
                    className={`px-3 py-2 rounded-md hover:bg-blue-700 ${
                      isActive("/request/cloths") ? "bg-blue-600" : ""
                    }`}
                  >
                    Cloths
                  </button>

                  <button
                    onClick={() => router.push("/request/footwear")}
                    className={`px-3 py-2 rounded-md hover:bg-blue-700 ${
                      isActive("/request/footwear") ? "bg-blue-600" : ""
                    }`}
                  >
                    Footwear
                  </button>

                  <button
                    onClick={() => router.push("/request/school-supplies")}
                    className={`px-3 py-2 rounded-md hover:bg-blue-700 ${
                      isActive("/request/school-supplies") ? "bg-blue-600" : ""
                    }`}
                  >
                    School Supplies
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/profileNGO")}
              className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              <User size={20} /> Profile
            </button>

            <button
              onClick={() => router.push("/RequestsNGO")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
            >
              <Package size={20} /> Your Requests
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            {user?.photoURL && (
              <Image
                src={user.photoURL}
                width={40}
                height={40}
                alt="User"
                className="rounded-full border-2 border-blue-300"
              />
            )}
            <button
              onClick={handleLogout}
              className="text-blue-900 bg-blue-300 px-3 py-2 rounded-xl hover:bg-blue-200 flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN FORM */}
      <main className="flex-1 p-6 md:mx-30 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Request School Supplies
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Upload */}
            <div className="border-2 border-dashed p-4 rounded-lg bg-gray-100">
              <p className="text-sm text-gray-600 mb-2">Upload Images</p>

              <AddImageButton onUploadComplete={handleImagesUpload} />

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {images.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width={150}
                      height={150}
                      alt="Uploaded"
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Basic NGO Fields */}
            <input
              className="border p-2 rounded w-full"
              placeholder="NGO Name*"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              required
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Contact Person Name*"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Contact Number*"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />

            <input
              type="email"
              className="border p-2 rounded w-full"
              placeholder="Contact Email*"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />

            {/* Item Type */}
            <select
              className="border p-2 rounded w-full"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              required
            >
              <option value="">Select Item Needed*</option>
              <option value="notebooks">Notebooks</option>
              <option value="school-bag">School Bag</option>
              <option value="uniform">School Uniform</option>
              <option value="books">Textbooks</option>
              <option value="storybooks">Story Books</option>
              <option value="stationery">Stationery Kit</option>
              <option value="geometry-box">Geometry Box</option>
              <option value="exam-supplies">Exam Materials</option>
              <option value="sports-items">Sports Items</option>
              <option value="art-supplies">Drawing & Craft Items</option>
            </select>

            {/* Grade Level */}
            <select
              className="border p-2 rounded w-full"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              <option value="">Grade/Standard (Optional)</option>
              <option value="nursery">Nursery</option>
              <option value="kg">KG / UKG</option>
              <option value="1-5">Class 1–5</option>
              <option value="6-8">Class 6–8</option>
              <option value="9-10">Class 9–10</option>
              <option value="11-12">Class 11–12</option>
            </select>

            {/* Brand Preference */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Brand Preference (Optional)"
              value={brandPreference}
              onChange={(e) => setBrandPreference(e.target.value)}
            />

            {/* Quantity */}
            <input
              type="number"
              className="border p-2 rounded w-full"
              placeholder="Quantity Required*"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            {/* Condition */}
            <select
              className="border p-2 rounded w-full"
              value={itemCondition}
              onChange={(e) => setItemCondition(e.target.value)}
            >
              <option value="">Condition (Optional)</option>
              <option value="new">Brand New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good Condition</option>
              <option value="usable">Usable Condition</option>
            </select>

            {/* Extra Details */}
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Additional Details (Optional)"
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
            ></textarea>

            {/* Reason */}
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Reason for Request*"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            ></textarea>

            {/* Delivery Preference */}
            <select
              className="border p-2 rounded w-full"
              value={deliveryPreference}
              onChange={(e) => setDeliveryPreference(e.target.value)}
              required
            >
              <option value="">Delivery/Pickup Preference*</option>
              <option value="pickup">Donor will deliver</option>
              <option value="ngo-pickup">NGO will pick up</option>
            </select>

            {/* Address */}
            <input
              className="border p-2 rounded w-full"
              placeholder="NGO Full Address*"
              value={ngoAddress}
              onChange={(e) => setNgoAddress(e.target.value)}
              required
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Landmark (Optional)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="City*"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="State*"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />

            {/* Required Before */}
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={requiredBefore}
              onChange={(e) => setRequiredBefore(e.target.value)}
              required
            />

            {/* Urgency */}
            <select
              className="border p-2 rounded w-full"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              required
            >
              <option value="">Urgency Level*</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="very-urgent">Very Urgent</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
