"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Home, Gift, User, Package } from "lucide-react";
import AddImageButton from "@/app/components/AddImageButton";
import "@uploadthing/react/styles.css";

export default function RequestFootwear() {
  const [user, setUser] = useState<User | null>(null);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);

  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  // NGO Details
  const [ngoName, setNgoName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Footwear Details
  const [shoeType, setShoeType] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [gender, setGender] = useState("");
  const [condition, setCondition] = useState("");
  const [season, setSeason] = useState("");
  const [purpose, setPurpose] = useState("");
  const [color, setColor] = useState("");
  const [reason, setReason] = useState("");

  // Delivery & Address
  const [deliveryPreference, setDeliveryPreference] = useState("");
  const [ngoAddress, setNgoAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Dates
  const [requiredBefore, setRequiredBefore] = useState("");
  const [urgency, setUrgency] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/Login");
      else setUser(currentUser);
    });
    return unsub;
  }, [router]);

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

      shoeType,
      size,
      material,
      category,
      quantity,
      gender,
      condition,
      season,
      purpose,
      color,
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

    const res = await fetch("/api/request-footwear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    alert(result.message);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* SIDEBAR */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between
          h-screen w-64 fixed md:sticky transition-transform duration-300 z-50
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div>
          {/* Logo */}
          <div
            className="flex items-center gap-2 px-4 py-4 cursor-pointer"
            onClick={() => router.push("/DashboardNGO")}
          >
            <Image src="/logo3.png" width={50} height={50} alt="Logo" />
            <h1 className="text-2xl font-semibold">
              Share<i>For</i>Care
            </h1>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex flex-col gap-2 px-3">
            <button
              onClick={() => router.push("/DashboardNGO")}
              className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              <Home size={20} /> Home
            </button>

            {/* Dropdown */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowDonateDropdown(!showDonateDropdown)}
                className="w-full px-4 py-2 bg-blue-800 hover:bg-blue-700 flex justify-between items-center rounded-lg"
              >
                <div className="flex gap-2 items-center">
                  <Gift size={20} /> Request
                </div>
                <span>{showDonateDropdown ? "▲" : "▼"}</span>
              </button>

              {showDonateDropdown && (
                <div className="bg-blue-900 rounded-md ml-4 mt-2 p-1 flex flex-col">
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
              className="flex items-center rounded-lg gap-2 px-4 py-2 hover:bg-blue-700"
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

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:mx-30 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Request Footwear
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* IMAGES */}
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

            {/* NGO FIELDS */}
            <input
              className="border p-2 rounded w-full"
              placeholder="NGO Name*"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              required
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Contact Person*"
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
              placeholder="Email*"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />

            {/* FOOTWEAR FIELDS */}
            <select
              className="border p-2 rounded w-full"
              value={shoeType}
              onChange={(e) => setShoeType(e.target.value)}
              required
            >
              <option value="">Footwear Type*</option>
              <option value="sports-shoes">Sports Shoes</option>
              <option value="casual-shoes">Casual Shoes</option>
              <option value="school-shoes">School Shoes</option>
              <option value="formal-shoes">Formal Shoes</option>
              <option value="sandals">Sandals</option>
              <option value="flipflops">Flip-Flops</option>
              <option value="boots">Boots</option>
              <option value="running-shoes">Running Shoes</option>
            </select>

            {/* Shoe Size */}
            <select
              className="border p-2 rounded w-full"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
            >
              <option value="">Size*</option>

              {/* ADULT MEN */}
              <optgroup label="Men">
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </optgroup>

              {/* WOMEN */}
              <optgroup label="Women">
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6w">6</option>
                <option value="7w">7</option>
                <option value="8w">8</option>
              </optgroup>

              {/* KIDS */}
              <optgroup label="Kids">
                <option value="kids-8">Kids 8</option>
                <option value="kids-9">Kids 9</option>
                <option value="kids-10">Kids 10</option>
                <option value="kids-11">Kids 11</option>
                <option value="kids-12">Kids 12</option>
              </optgroup>
            </select>

            {/* MATERIAL */}
            <select
              className="border p-2 rounded w-full"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              <option value="">Material (Optional)</option>
              <option value="leather">Leather</option>
              <option value="synthetic">Synthetic</option>
              <option value="mesh">Mesh</option>
              <option value="canvas">Canvas</option>
              <option value="rubber">Rubber</option>
              <option value="foam">Foam</option>
            </select>

            {/* PURPOSE */}
            <select
              className="border p-2 rounded w-full"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="">Purpose (Optional)</option>
              <option value="school">School Wear</option>
              <option value="sports">Sports</option>
              <option value="formal">Formal Use</option>
              <option value="daily-use">Daily Use</option>
              <option value="running">Running</option>
            </select>

            {/* CONDITION */}
            <select
              className="border p-2 rounded w-full"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">Condition (Optional)</option>
              <option value="new">Brand New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="usable">Usable</option>
            </select>

            {/* GENDER */}
            <select
              className="border p-2 rounded w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Gender (Optional)</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>

            {/* COLOR */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Color (Optional)"
              value={color}
              onChange={(e) => setColor(e.target.value)}
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

            {/* Reason */}
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Reason for Request*"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            {/* Delivery */}
            <select
              className="border p-2 rounded w-full"
              value={deliveryPreference}
              onChange={(e) => setDeliveryPreference(e.target.value)}
              required
            >
              <option value="">Delivery Preference*</option>
              <option value="pickup">Donor Delivers</option>
              <option value="ngo-pickup">NGO Pickup</option>
            </select>

            {/* Address */}
            <input
              className="border p-2 rounded w-full"
              placeholder="NGO Address*"
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
              <option value="urgent">Urgent (3–5 days)</option>
              <option value="very-urgent">Very Urgent (48 hours)</option>
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
