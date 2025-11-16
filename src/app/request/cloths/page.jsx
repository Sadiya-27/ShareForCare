"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Home, Gift, User, Package } from "lucide-react";
import AddImageButton from "@/app/components/AddImageButton";
import "@uploadthing/react/styles.css";

export default function RequestCloths() {
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

  // Cloth details
  const [clothType, setClothType] = useState("");
  const [size, setSize] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [condition, setCondition] = useState("");
  const [season, setSeason] = useState("");
  const [color, setColor] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [reason, setReason] = useState("");

  // Delivery
  const [deliveryPreference, setDeliveryPreference] = useState("");

  // Address
  const [ngoAddress, setNgoAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Dates
  const [requiredBefore, setRequiredBefore] = useState("");
  const [urgency, setUrgency] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ngoName,
      contactPerson,
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

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log(result);
    alert(result.message);
  };

  const handleImagesUpload = (urls) => {
    setImages((prev) => [...prev, ...urls]); // APPEND instead of replace
  };

  // inside handleSubmit (before fetch)
  console.log("Submitting images:", images); // should be the same array

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
        <div>
          <div
            className="flex items-center gap-2 px-4 py-4 cursor-pointer"
            onClick={() => router.push("/DashboardNGO")}
          >
            <Image src="/logo3.png" width={50} height={50} alt="Logo" />
            <h1 className="text-2xl font-semibold">
              Share<i>For</i>Care
            </h1>
          </div>

          <nav className="mt-6 flex flex-col gap-2 px-3">
            <button
              onClick={() => router.push("/DashboardNGO")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 hover:rounded-lg"
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

      {/* MAIN FORM */}
      <main className="flex-1 p-6 md:mx-30 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Request Cloths
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Upload */}
            <div className="border-2 border-dashed p-4 rounded-lg bg-gray-100">
              <p className="text-sm text-gray-600 mb-2">Upload Images</p>

              {/* Add More Images Button */}
              <AddImageButton onUploadComplete={handleImagesUpload} />

              {/* Preview Grid */}
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

            {/* NGO Name */}
            <input
              className="border p-2 rounded w-full"
              placeholder="NGO Name*"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              required
            />

            {/* Contact Person */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Contact Person Name*"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />

            {/* Contact Number */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Contact Number*"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />

            {/* Email */}
            <input
              type="email"
              className="border p-2 rounded w-full"
              placeholder="Contact Email*"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />

            {/* Cloth Type */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Cloth Type Needed* eg: kids wear, mens wear, summer cloths, etc"
              value={clothType}
              onChange={(e) => setClothType(e.target.value)}
              required
            />

            {/* Size */}
            <select
              className="border p-2 rounded w-full"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
            >
              <option value="">Size Needed*</option>

              {/* Adult Sizes */}
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>

              {/* Kids Sizes */}
              <option value="kids-0-2">Kids (0–2 yrs)</option>
              <option value="kids-3-5">Kids (3–5 yrs)</option>
              <option value="kids-6-8">Kids (6–8 yrs)</option>
              <option value="kids-9-12">Kids (9–12 yrs)</option>
            </select>

            {/* Fabric */}
            <select
              className="border p-2 rounded w-full"
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
            >
              <option value="">Fabric Type (Optional)</option>
              <option value="cotton">Cotton</option>
              <option value="organic-cotton">Organic Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="wool">Wool</option>
              <option value="silk">Silk</option>
              <option value="linen">Linen</option>
              <option value="denim">Denim</option>
              <option value="rayon">Rayon</option>
              <option value="nylon">Nylon</option>
              <option value="mixed">Mixed Fabric</option>
            </select>

            {/* Category */}
            <select
              className="border p-2 rounded w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Clothing Category (Optional)</option>

              {/* Tops */}
              <option value="tshirt">T-shirts</option>
              <option value="shirt">Shirts</option>
              <option value="sweater">Sweaters</option>
              <option value="hoodie">Hoodies</option>
              <option value="jacket">Jackets</option>

              {/* Bottoms */}
              <option value="pants">Pants</option>
              <option value="jeans">Jeans</option>
              <option value="shorts">Shorts</option>
              <option value="joggers">Joggers</option>

              {/* Traditional */}
              <option value="kurta">Kurta</option>
              <option value="saree">Saree</option>
              <option value="lehenga">Lehenga</option>
              <option value="salwar-kameez">Salwar Kameez</option>

              {/* School */}
              <option value="school-uniform">School Uniform</option>

              {/* Winter */}
              <option value="thermal">Thermal Wear</option>
              <option value="winter-coat">Winter Coat</option>
            </select>

            {/* Quantity */}
            <input
              type="number"
              className="border p-2 rounded w-full"
              placeholder="Quantity Required*"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            {/* Age Group */}
            <select
              className="border p-2 rounded w-full"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
              <option value="">Age Group (Optional)</option>
              <option value="infants">Infants (0–2 yrs)</option>
              <option value="children-small">Children (3–6 yrs)</option>
              <option value="children-medium">Children (7–12 yrs)</option>
              <option value="teens">Teens (13–19 yrs)</option>
              <option value="adults">Adults (20–50 yrs)</option>
              <option value="seniors">Seniors (50+ yrs)</option>
            </select>

            {/* Gender */}
            <select
              className="border p-2 rounded w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Gender (Optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>

            {/* Condition */}
            <select
              className="border p-2 rounded w-full"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">Condition (Optional)</option>
              <option value="new">Brand New</option>
              <option value="like-new">Like New</option>
              <option value="gently-used">Gently Used</option>
              <option value="good">Good Condition</option>
              <option value="usable">Usable Condition</option>
            </select>

            {/* Season */}
            <select
              className="border p-2 rounded w-full"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="">Season (Optional)</option>
              <option value="summer">Summer Wear</option>
              <option value="winter">Winter Wear</option>
              <option value="rainy">Rainy Season</option>
              <option value="spring">Spring</option>
              <option value="autumn">Autumn</option>
              <option value="all-seasons">All Seasons</option>
            </select>

            {/* Color */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Color Preference (Optional)"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            {/* Extra Details */}
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Extra Details (Optional)"
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
            />

            {/* Reason */}
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Description / Reason for Request*"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            {/* Delivery Preference */}
            <select
              className="border p-2 rounded w-full"
              value={deliveryPreference}
              onChange={(e) => setDeliveryPreference(e.target.value)}
              required
            >
              <option value="">Delivery/Pickup Preference*</option>
              <option value="pickup">Donors Deliver</option>
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
