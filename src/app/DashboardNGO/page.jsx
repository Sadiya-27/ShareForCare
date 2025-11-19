"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Home,
  Users,
  Gift,
  User,
  Menu,
  X,
  Package,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recent"); // <-- tab state
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const [openCategory, setOpenCategory] = useState(null); // accordion control
  const [previewImage, setPreviewImage] = useState(null); // image preview

  const [donations, setDonations] = useState({
    cloths: [],
    footwear: [],
    schoolSupplies: [],
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/Login");
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  // Filtered cards based on search, type, and tab
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetch("/api/volunteers");
        const data = await res.json();

        if (!data.success) return;

        const volunteersData = await Promise.all(
          data.volunteers.map(async (v) => {
            const uid = v.firebaseUid;

            // --- GET ALL DONATIONS ---
            const cloths = await fetch(`/api/donate-cloths/by-user/${uid}`)
              .then((r) => r.json())
              .then((arr) => arr.filter((item) => !item.completed && !item.accepted)); // remove completed

            const footwear = await fetch(`/api/donate-footwear/by-user/${uid}`)
              .then((r) => r.json())
              .then((arr) => arr.filter((item) => !item.completed && !item.accepted));

            const school = await fetch(
              `/api/donate-school-supplies/by-user/${uid}`
            )
              .then((r) => r.json())
              .then((arr) => arr.filter((item) => !item.completed && !item.accepted));

            return {
              ...v,
              donations: {
                cloths: cloths || [],
                footwear: footwear || [],
                schoolSupplies: school || [],
              },
            };
          })
        );

        setVolunteers(volunteersData);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      }
    };

    fetchVolunteers();
  }, []);

  const recentVolunteers = [...volunteers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const activeVolunteers = volunteers.filter((v) => {
    const d = v.donations;
    return (
      d &&
      (d.cloths?.length > 0 ||
        d.footwear?.length > 0 ||
        d.schoolSupplies?.length > 0)
    );
  });

  const volunteersToDisplay =
    activeTab === "recent" ? recentVolunteers : activeVolunteers;

  // ✅ Search + Filter logic
  const filteredVolunteers = volunteersToDisplay.filter((v) => {
    const matchesSearch = v.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const clothsCount = v.donations?.cloths?.length || 0;
    const footwearCount = v.donations?.footwear?.length || 0;
    const schoolCount = v.donations?.schoolSupplies?.length || 0;

    // CATEGORY LOGIC
    let matchesCategory = true;

    if (filterType === "Cloths") {
      matchesCategory = clothsCount > 0;
    } else if (filterType === "Footwear") {
      matchesCategory = footwearCount > 0;
    } else if (filterType === "School Supplies") {
      matchesCategory = schoolCount > 0;
    }

    // Always require at least one donation (ALL categories)
    const hasAnyDonation =
      clothsCount > 0 || footwearCount > 0 || schoolCount > 0;

    return matchesSearch && matchesCategory && hasAnyDonation;
  });

  const handleAcceptDonation = async (donation, volunteer) => {
  try {
    // Ask confirmation
    if (!confirm("Are you sure you want to accept this donation?")) return;

    const donationType =
      donation.clothType ? "cloths" :
      donation.shoeType ? "footwear" :
      donation.itemType ? "school-supplies" :
      null;

    if (!donationType) {
      alert("Donation type could not be determined.");
      return;
    }

    const res = await fetch(`/api/donation-accept/${donation._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donationType,
        ngoId: user.uid, // NGO firebase UID
      }),
    });

    if (!res.ok) {
      alert("Error accepting donation.");
      return;
    }

    alert("Donation accepted successfully!");
    setSelectedVolunteer(null); // close modal

    // refresh the list
    location.reload();

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong.");
  }
};


  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`
          bg-blue-900 text-white flex flex-col justify-between
          h-screen w-64 transition-transform duration-300 z-50
          fixed md:sticky md:top-0 md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:flex
        `}
      >
        <div>
          {/* Logo */}
          <div
            className="flex items-center gap-2 px-4 py-4 cursor-pointer"
            onClick={() => router.push("/DashboardNGO")}
          >
            <Image
              src="/logo3.png"
              width={50}
              height={50}
              alt="Logo"
              className="rounded-xl"
            />
            <h1 className="text-2xl font-semibold">
              Share<i>For</i>Care
            </h1>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex flex-col gap-2 px-3">
            <button
              onClick={() => router.push("/DashboardNGO")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg font-medium bg-blue-800"
            >
              <Home size={20} /> Home
            </button>

            {/* Donate Dropdown */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowDonateDropdown((prev) => !prev)}
                className="flex items-center justify-between w-full gap-2 hover:bg-blue-700 rounded-lg px-4 py-2 bg-blue-800 text-white"
              >
                <div className="flex items-center gap-2">
                  <Gift size={20} /> Request
                </div>
                <span>{showDonateDropdown ? "▲" : "▼"}</span>
              </button>

              {showDonateDropdown && (
                <div className="ml-4 mt-2 flex flex-col gap-1 bg-blue-900 rounded-md shadow-md">
                  <button
                    onClick={() => router.push("/request/cloths")}
                    className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md"
                  >
                    Cloths
                  </button>
                  <button
                    onClick={() => router.push("/request/footwear")}
                    className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md"
                  >
                    Footwear
                  </button>
                  <button
                    onClick={() => router.push("/request/school-supplies")}
                    className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md"
                  >
                    School Supplies
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/profileNGO")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
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

      {/* Main content */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        {/* Search bar */}
        <div className="flex gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Search Volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option>All</option>
            <option>Cloths</option>
            <option>Footwear</option>
            <option>School Supplies</option>
          </select>
        </div>

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-900">
            Hello! 👋 {user?.displayName || "NGO"}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back to ShareForCare Dashboard
          </p>
        </div>

        {/* Tabs */}
        {/* Tabs */}
        <div className="flex justify-around border-b border-gray-200 mt-2 mb-4">
          <button
            className={`pb-2 font-medium transition ${
              activeTab === "recent"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recently Joined
          </button>

          <button
            className={`pb-2 font-medium transition ${
              activeTab === "daily"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Active Volunteers
          </button>
        </div>

        {/* Feed Section */}
        <div className="p-4 space-y-4">
          {filteredVolunteers.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedVolunteer(v)}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={v.profilePic || "/default-avatar.png"}
                    alt={v.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-blue-900">
                    {v.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {v.address || "Location not specified"}
                  </p>

                  <div className="flex gap-2 flex-wrap mt-2">
                    {v.donations.cloths.length > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                        Cloths ({v.donations.cloths.length})
                      </span>
                    )}
                    {v.donations.footwear.length > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                        Footwear ({v.donations.footwear.length})
                      </span>
                    )}
                    {v.donations.schoolSupplies.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                        School Supplies ({v.donations.schoolSupplies.length})
                      </span>
                    )}

                    {v.donations.cloths.length === 0 &&
                      v.donations.footwear.length === 0 &&
                      v.donations.schoolSupplies.length === 0 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                          No donations yet
                        </span>
                      )}
                  </div>
                </div>
                {v.verification === "verified" ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-md font-semibold">
                    Verified
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-md font-semibold">
                    Not Verified
                  </span>
                )}
              </div>
            </div>
          ))}

          {selectedVolunteer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              {/* Scrollable Modal */}
              <div
                className="bg-white rounded-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 
                    max-h-[80vh] overflow-y-auto relative 
                    scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400"
              >
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  onClick={() => setSelectedVolunteer(null)}
                >
                  ✕
                </button>

                {/* Volunteer Header */}
                <div className="relative mb-4">
                  {/* TOP RIGHT VERIFICATION BADGE */}
                  <span
                    className={`absolute top-0 right-0 px-3 py-1 mt-2 rounded-lg text-md font-semibold
      ${
        selectedVolunteer.verification === "verified"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }
    `}
                  >
                    {selectedVolunteer.verification === "verified"
                      ? "Verified"
                      : "Not Verified"}
                  </span>

                  {/* MAIN HEADER */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        selectedVolunteer.profilePic || "/default-avatar.png"
                      }
                      alt={selectedVolunteer.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />

                    <div>
                      <h2 className="text-2xl font-semibold text-blue-900">
                        {selectedVolunteer.name}
                      </h2>
                      <p className="text-gray-600">{selectedVolunteer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
                  <p>
                    <strong>Phone:</strong> {selectedVolunteer.phoneNo}
                  </p>
                  <p>
                    <strong>Age:</strong> {selectedVolunteer.age || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selectedVolunteer.gender || "N/A"}
                  </p>
                  <p>
                    <strong>Availability:</strong>{" "}
                    {selectedVolunteer.availability || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedVolunteer.address || "Not specified"}
                  </p>
                  <p>
                    <strong>Skills:</strong>{" "}
                    {selectedVolunteer.skills?.join(", ") || "Not specified"}
                  </p>
                  <p>
                    <strong>Experience:</strong>{" "}
                    {selectedVolunteer.experience || "Not specified"}
                  </p>
                  <p>
                    <strong>Motivation:</strong>{" "}
                    {selectedVolunteer.motivation || "Not specified"}
                  </p>
                </div>

                {/* -----------------------------------
          CLOTHS (Accordion)
      ----------------------------------- */}
                {selectedVolunteer.donations.cloths.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === "cloths" ? null : "cloths"
                        )
                      }
                      className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-semibold"
                    >
                      Cloth Donations (
                      {selectedVolunteer.donations.cloths.length})
                    </button>

                    {openCategory === "cloths" && (
                      <div className="mt-2">
                        {selectedVolunteer.donations.cloths.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg bg-purple-50 mb-3"
                            >
                              {/* IMAGES */}
                              {item.images?.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  {item.images.map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      onClick={() => setPreviewImage(img)}
                                      className="rounded object-cover h-24 w-full cursor-pointer hover:opacity-80"
                                    />
                                  ))}
                                </div>
                              )}

                              <p>
                                <strong>Cloth Type:</strong> {item.clothType}
                              </p>
                              <p>
                                <strong>Size:</strong> {item.size}
                              </p>
                              <p>
                                <strong>Fabric:</strong> {item.fabricType}
                              </p>
                              <p>
                                <strong>Category:</strong> {item.category}
                              </p>
                              <p>
                                <strong>Quantity:</strong> {item.quantity}
                              </p>
                              <p>
                                <strong>Age Group:</strong> {item.ageGroup}
                              </p>
                              <p>
                                <strong>Gender:</strong> {item.gender}
                              </p>
                              <p>
                                <strong>Condition:</strong> {item.condition}
                              </p>
                              <p>
                                <strong>Season:</strong> {item.season}
                              </p>
                              <p>
                                <strong>Color:</strong> {item.color}
                              </p>
                              <p>
                                <strong>Message:</strong> {item.message}
                              </p>
                              <p>
                                <strong>Delivery:</strong>{" "}
                                {item.deliveryPreference}
                              </p>
                              <p>
                                <strong>Address:</strong> {item.donorAddress}
                              </p>
                              <p>
                                <strong>Available From:</strong>{" "}
                                {new Date(
                                  item.availableFrom
                                ).toLocaleDateString()}
                              </p>
                              <button
                                onClick={() =>
                                  handleAcceptDonation(item, selectedVolunteer)
                                }
                                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Accept Donation
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* -----------------------------------
          FOOTWEAR (Accordion)
      ----------------------------------- */}
                {selectedVolunteer.donations.footwear.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === "footwear" ? null : "footwear"
                        )
                      }
                      className="w-full bg-orange-100 text-orange-700 px-3 py-2 rounded-lg font-semibold"
                    >
                      Footwear Donations (
                      {selectedVolunteer.donations.footwear.length})
                    </button>

                    {openCategory === "footwear" && (
                      <div className="mt-2">
                        {selectedVolunteer.donations.footwear.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg bg-orange-50 mb-3"
                            >
                              {item.images?.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  {item.images.map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      onClick={() => setPreviewImage(img)}
                                      className="rounded object-cover h-24 w-full cursor-pointer hover:opacity-80"
                                    />
                                  ))}
                                </div>
                              )}

                              <p>
                                <strong>Shoe Type:</strong> {item.shoeType}
                              </p>
                              <p>
                                <strong>Size:</strong> {item.size}
                              </p>
                              <p>
                                <strong>Material:</strong> {item.material}
                              </p>
                              <p>
                                <strong>Category:</strong> {item.category}
                              </p>
                              <p>
                                <strong>Quantity:</strong> {item.quantity}
                              </p>
                              <p>
                                <strong>Gender:</strong> {item.gender}
                              </p>
                              <p>
                                <strong>Condition:</strong> {item.condition}
                              </p>
                              <p>
                                <strong>Color:</strong> {item.color}
                              </p>
                              <p>
                                <strong>Description:</strong> {item.description}
                              </p>
                              <p>
                                <strong>Delivery:</strong> {item.deliveryMethod}
                              </p>
                              <p>
                                <strong>Address:</strong> {item.address}
                              </p>
                              <p>
                                <strong>Available From:</strong>{" "}
                                {new Date(
                                  item.availableFrom
                                ).toLocaleDateString()}
                              </p>
                              <button
                                onClick={() =>
                                  handleAcceptDonation(item, selectedVolunteer)
                                }
                                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Accept Donation
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* -----------------------------------
          SCHOOL SUPPLIES (Accordion)
      ----------------------------------- */}
                {selectedVolunteer.donations.schoolSupplies.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === "school" ? null : "school"
                        )
                      }
                      className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold"
                    >
                      School Supplies (
                      {selectedVolunteer.donations.schoolSupplies.length})
                    </button>

                    {openCategory === "school" && (
                      <div className="mt-2">
                        {selectedVolunteer.donations.schoolSupplies.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg bg-blue-50 mb-3"
                            >
                              {item.images?.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  {item.images.map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      onClick={() => setPreviewImage(img)}
                                      className="rounded object-cover h-24 w-full cursor-pointer hover:opacity-80"
                                    />
                                  ))}
                                </div>
                              )}

                              <p>
                                <strong>Item:</strong> {item.itemType}
                              </p>
                              <p>
                                <strong>Grade Level:</strong> {item.gradeLevel}
                              </p>
                              <p>
                                <strong>Brand:</strong> {item.brandPreference}
                              </p>
                              <p>
                                <strong>Quantity:</strong> {item.quantity}
                              </p>
                              <p>
                                <strong>Condition:</strong> {item.itemCondition}
                              </p>
                              <p>
                                <strong>Description:</strong>{" "}
                                {item.extraDetails}
                              </p>
                              <p>
                                <strong>Delivery:</strong> {item.deliveryMethod}
                              </p>
                              <p>
                                <strong>Address:</strong> {item.address}
                              </p>
                              <p>
                                <strong>Available From:</strong>{" "}
                                {new Date(
                                  item.availableFrom
                                ).toLocaleDateString()}
                              </p>
                              <button
                                onClick={() =>
                                  handleAcceptDonation(item, selectedVolunteer)
                                }
                                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Accept Donation
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-4">
                  <strong>Verification:</strong>{" "}
                  {selectedVolunteer.verification || "Pending"}
                </p>
              </div>
            </div>
          )}

          {previewImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage}
                className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
              />
            </div>
          )}

          {filteredVolunteers.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No volunteers found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
