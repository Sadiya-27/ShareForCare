"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Home, Gift, User, Menu, Package } from "lucide-react";
import AddImageButton from "@/app/components/AddImageButton";
import "@uploadthing/react/styles.css";

export default function DonateFootwear() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDonateDropdown, setShowDonateDropdown] = useState(true);
  const [images, setImages] = useState([]);

  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  // Donor Details
  const [donorName, setDonorName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Footwear Fields
  const [shoeType, setShoeType] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [gender, setGender] = useState("");
  const [condition, setCondition] = useState("");
  const [season, setSeason] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");

  // Delivery
  const [deliveryMethod, setDeliveryMethod] = useState("");

  // Address (Pickup)
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Dates
  const [availableFrom, setAvailableFrom] = useState("");

  // AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/Login");
      else setUser(currentUser);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  const handleImagesUpload = (urls) => {
    setImages((prev) => [...prev, ...urls]);
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      donorName,
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
      color,
      description,

      deliveryMethod,
      address,
      landmark,
      city,
      state,

      availableFrom,

      images,
      userId: user?.uid,
    };

    const res = await fetch("/api/donate-footwear", {
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
              h-screen w-64 fixed md:sticky z-50 transition-transform duration-300
              ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0`}
      >
        <div>
          {/* LOGO */}
          <div
            className="flex items-center gap-2 px-4 py-4 cursor-pointer"
            onClick={() => router.push("/Dashboard")}
          >
            <Image src="/logo3.png" width={50} height={50} alt="Logo" />
            <h1 className="text-2xl font-semibold">
              Share<i>For</i>Care
            </h1>
          </div>

          {/* NAV */}
          <nav className="mt-6 flex flex-col gap-2 px-3">
            <button
              onClick={() => router.push("/DashboardVolunteer")}
              className="flex items-center rounded-lg gap-2 px-4 py-2 hover:bg-blue-700"
            >
              <Home size={20} /> Home
            </button>

            {/* Donate Dropdown */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowDonateDropdown(!showDonateDropdown)}
                className="w-full bg-blue-800 hover:bg-blue-700 px-4 py-2 flex justify-between items-center rounded-lg"
              >
                <div className="flex gap-2 items-center">
                  <Gift size={20} />
                  Donate
                </div>
                <span>{showDonateDropdown ? "▲" : "▼"}</span>
              </button>

              {showDonateDropdown && (
                <div className="mt-2 bg-blue-900 rounded-md ml-4 p-1 flex flex-col">
                  <button
                    onClick={() => router.push("/donate/cloths")}
                    className="px-3 py-2 rounded-md hover:bg-blue-700"
                  >
                    Cloths
                  </button>

                  <button
                    onClick={() => router.push("/donate/footwear")}
                    className="px-3 py-2 rounded-md hover:bg-blue-700 bg-blue-800"
                  >
                    Footwear
                  </button>

                  <button
                    onClick={() => router.push("/donate/school-supplies")}
                    className="px-3 py-2 rounded-md hover:bg-blue-700 "
                  >
                    School Supplies
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/profileVolunteer")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <User size={20} /> Profile
            </button>

            <button
              onClick={() => router.push("/donationVolunteer")}
              className="flex items-center rounded-lg gap-2 px-4 py-2 hover:bg-blue-700"
            >
              <Package size={20} /> Your Donation
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
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
      <main className="flex-1 p-6 md:mx-40 mt-16 md:mt-0">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Donate Footwear
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

            {/* DONOR DETAILS */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Donor Name*"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
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
            </select>

            {/* SIZE */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Size (e.g., 7, 8, kids-10)*"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
            />

            {/* MATERIAL */}
            <select
              className="border p-2 rounded w-full"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              <option value="">Material (Optional)</option>
              <option value="leather">Leather</option>
              <option value="canvas">Canvas</option>
              <option value="rubber">Rubber</option>
              <option value="synthetic">Synthetic</option>
            </select>

            {/* CATEGORY */}
            <select
              className="border p-2 rounded w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Category (Optional)</option>
              <option value="casual">Casual</option>
              <option value="sports">Sports</option>
              <option value="formal">Formal</option>
              <option value="school">School</option>
            </select>

            {/* QUANTITY */}
            <input
              type="number"
              className="border p-2 rounded w-full"
              placeholder="Quantity*"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

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

            {/* CONDITION */}
            <select
              className="border p-2 rounded w-full"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="">Condition*</option>
              <option value="new">Brand New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="usable">Usable</option>
            </select>

            {/* SEASON */}
            <select
              className="border p-2 rounded w-full"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="">Season (Optional)</option>
              <option value="rainy">Rainy</option>
              <option value="winter">Winter</option>
              <option value="summer">Summer</option>
            </select>

            {/* COLOR */}
            <input
              className="border p-2 rounded w-full"
              placeholder="Color (Optional)"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            {/* DESCRIPTION */}
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Description of the footwear*"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* DELIVERY METHOD */}
            <select
              className="border p-2 rounded w-full"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              required
            >
              <option value="">Delivery Method*</option>
              <option value="drop-off">I Will Drop It Off</option>
              <option value="pickup-request">Request Pickup</option>
            </select>

            {/* ADDRESS FIELDS (only for pickup request) */}
            {deliveryMethod === "pickup-request" && (
              <>
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Pickup Address*"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
              </>
            )}

            {/* AVAILABLE FROM */}
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              required
            />

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg"
            >
              Submit Donation
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
