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
  Package,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [activeTab, setActiveTab] = useState("recent"); // <-- tab state
  const [openCategory, setOpenCategory] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
    const fetchNgos = async () => {
      try {
        const res = await fetch("/api/ngos");
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const ngosWithRequests = await Promise.all(
          data.map(async (ngo) => {
            const uid = ngo.firebaseUid;

            const filterPending = (arr) =>
              Array.isArray(arr)
                ? arr.filter((item) => !item.completed && !item.accepted)
                : [];
            
            const clothReq = await fetch(`/api/requests/by-user/${uid}`)
              .then((r) => r.json())
              .then(filterPending); // <-- filter here

            const footwearReq = await fetch(
              `/api/request-footwear/by-user/${uid}`
            )
              .then((r) => r.json())
              .then(filterPending);

            const schoolReq = await fetch(
              `/api/request-school-supplies/by-user/${uid}`
            )
              .then((r) => r.json())
              .then(filterPending);

            return {
              ...ngo,
              requests: {
                cloths: clothReq || [],
                footwear: footwearReq || [],
                schoolSupplies: schoolReq || [],
              },
            };
          })
        );

        setNgos(ngosWithRequests);
      } catch (err) {
        console.error("Error fetching NGOs:", err);
      }
    };

    fetchNgos();
  }, []);

  // 1️⃣ Sort NGOs by recent (createdAt)
  const recentNgos = [...ngos].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 2️⃣ Filter NGOs that have ANY requests
  const activeNgos = ngos.filter((ngo) => {
    const r = ngo.requests;
    return (
      r &&
      (r.cloths?.length > 0 ||
        r.footwear?.length > 0 ||
        r.schoolSupplies?.length > 0)
    );
  });

  // 3️⃣ Select tab → recent or active
  const ngosToDisplay = activeTab === "recent" ? recentNgos : activeNgos;

  // 4️⃣ Search + Category Filter Logic
  const filteredCards = ngosToDisplay.filter((ngo) => {
    const matchesSearch = ngo.ngoName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const clothReq = ngo.requests?.cloths?.length || 0;
    const footReq = ngo.requests?.footwear?.length || 0;
    const schoolReq = ngo.requests?.schoolSupplies?.length || 0;

    // CATEGORY FILTERING
    let matchesCategory = true;

    if (filterType === "Cloths") {
      matchesCategory = clothReq > 0;
    } else if (filterType === "Footwear") {
      matchesCategory = footReq > 0;
    } else if (filterType === "School Supplies") {
      matchesCategory = schoolReq > 0;
    }

    // ALWAYS require at least one request
    const hasAnyRequest = clothReq > 0 || footReq > 0 || schoolReq > 0;

    return matchesSearch && matchesCategory && hasAnyRequest;
  });

  const handleAcceptRequest = async (requestItem, ngo) => {
    try {
      if (!confirm("Do you want to accept this request?")) return;

      // detect request type
      const requestType = requestItem.clothType
        ? "cloths"
        : requestItem.shoeType
        ? "footwear"
        : requestItem.itemType
        ? "school-supplies"
        : null;

      if (!requestType) {
        alert("Unable to detect request type.");
        return;
      }

      const res = await fetch(`/api/request-accept/${requestItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          volunteerId: user.uid, // logged-in volunteer UID
        }),
      });

      if (!res.ok) {
        alert("Error accepting request.");
        return;
      }

      alert("Request accepted successfully!");
      setSelectedNgo(null);
      location.reload();
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong.");
    }
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
              className="flex items-center rounded-lg bg-blue-800 gap-2 px-4 py-2 hover:bg-blue-700"
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
                    className="px-3 py-2 rounded-md hover:bg-blue-700"
                  >
                    Footwear
                  </button>

                  <button
                    onClick={() => router.push("/donate/school-supplies")}
                    className="px-3 py-2 rounded-md hover:bg-blue-700"
                  >
                    School Supplies
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/profileVolunteer")}
              className="flex items-center rounded-lg gap-2 px-4 py-2 hover:bg-blue-700"
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

      {/* Main content */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        {/* Search bar */}
        <div className="flex gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Search NGOs..."
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
            Hello! 👋 {user?.displayName || "Volunteer"}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back to ShareForCare Dashboard
          </p>
        </div>

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
            Active NGOs
          </button>
        </div>

        {/* Feed Section */}
        <div className="p-4 space-y-4">
          {filteredCards.map((ngo) => (
            <div
              key={ngo._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedNgo(ngo)}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Small Circular NGO Image */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={ngo.profilePic || "/default-avatar.png"}
                    alt={ngo.ngoName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* NGO INFO */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-blue-900">
                    {ngo.ngoName}
                  </h2>

                  <p className="text-sm text-gray-600">
                    {ngo.ngoAddress || "Location not specified"}
                  </p>

                  {/* Request Tags */}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {ngo.requests.cloths.length > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                        Cloths ({ngo.requests.cloths.length})
                      </span>
                    )}

                    {ngo.requests.footwear.length > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                        Footwear ({ngo.requests.footwear.length})
                      </span>
                    )}

                    {ngo.requests.schoolSupplies.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                        School Supplies ({ngo.requests.schoolSupplies.length})
                      </span>
                    )}

                    {/* No requests */}
                    {ngo.requests.cloths.length === 0 &&
                      ngo.requests.footwear.length === 0 &&
                      ngo.requests.schoolSupplies.length === 0 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                          No requests yet
                        </span>
                      )}
                  </div>
                </div>

                {/* Verification Badge */}
                {ngo.verification === "verified" ? (
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

          {filteredCards.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No NGOs found.</p>
          )}

          {selectedNgo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                className="bg-white rounded-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 
      max-h-[80vh] overflow-y-auto relative 
      scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400"
              >
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  onClick={() => setSelectedNgo(null)}
                >
                  ✕
                </button>

                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  {/* LEFT SIDE: IMAGE + NAME */}
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedNgo.profilePic || "/default-avatar.png"}
                      alt={selectedNgo.ngoName}
                      className="w-20 h-20 rounded-full object-cover"
                    />

                    <div>
                      <h2 className="text-2xl font-semibold text-blue-900">
                        {selectedNgo.ngoName}
                      </h2>
                      <p className="text-gray-600">{selectedNgo.ngoEmail}</p>
                    </div>
                  </div>

                  {/* RIGHT SIDE: STATUS */}
                  <div className="text-right mt-2">
                    {selectedNgo.status === "verified" ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-md font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-md font-semibold">
                        Not Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic NGO Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
                  <p>
                    <strong>Contact Person:</strong> {selectedNgo.name}
                  </p>
                  <p>
                    <strong>Contact No:</strong> {selectedNgo.ngoPhoneNo}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedNgo.ngoAddress}
                  </p>
                  <p>
                    <strong>Website:</strong> {selectedNgo.ngoWebsite}
                  </p>
                </div>

                {/* =====================================
          CLOTH REQUESTS ACCORDION
      ======================================= */}
                {selectedNgo.requests.cloths.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === "cloths" ? null : "cloths"
                        )
                      }
                      className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-semibold"
                    >
                      Cloth Requests ({selectedNgo.requests.cloths.length})
                    </button>

                    {openCategory === "cloths" && (
                      <div className="mt-2">
                        {selectedNgo.requests.cloths.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg bg-purple-50 mb-3"
                          >
                            {/* Images */}
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

                            {/* Details */}
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
                              <strong>Extra Details:</strong>{" "}
                              {item.extraDetails}
                            </p>
                            <p>
                              <strong>Reason:</strong> {item.reason}
                            </p>
                            <p>
                              <strong>Delivery:</strong>{" "}
                              {item.deliveryPreference}
                            </p>
                            <p>
                              <strong>Address:</strong> {item.ngoAddress}
                            </p>
                            <p>
                              <strong>Required Before:</strong>{" "}
                              {new Date(
                                item.requiredBefore
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Urgency:</strong> {item.urgency}
                            </p>
                            <button
                              onClick={() =>
                                handleAcceptRequest(item, selectedNgo)
                              }
                              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Accept Request
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* =====================================
          FOOTWEAR REQUESTS ACCORDION
      ======================================= */}
                {selectedNgo.requests.footwear.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === "footwear" ? null : "footwear"
                        )
                      }
                      className="w-full bg-orange-100 text-orange-700 px-3 py-2 rounded-lg font-semibold"
                    >
                      Footwear Requests ({selectedNgo.requests.footwear.length})
                    </button>

                    {openCategory === "footwear" && (
                      <div className="mt-2">
                        {selectedNgo.requests.footwear.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg bg-orange-50 mb-3"
                          >
                            {/* Images */}
                            {item.images?.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {item.images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    onClick={() => setPreviewImage(img)}
                                    className="rounded object-cover h-24 w-full cursor-pointer"
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
                              <strong>Purpose:</strong> {item.purpose}
                            </p>
                            <p>
                              <strong>Reason:</strong> {item.reason}
                            </p>
                            <p>
                              <strong>Delivery:</strong>{" "}
                              {item.deliveryPreference}
                            </p>
                            <p>
                              <strong>Address:</strong> {item.ngoAddress}
                            </p>
                            <p>
                              <strong>Required Before:</strong>{" "}
                              {new Date(
                                item.requiredBefore
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Urgency:</strong> {item.urgency}
                            </p>
                            <button
                              onClick={() =>
                                handleAcceptRequest(item, selectedNgo)
                              }
                              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Accept Request
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* =====================================
          SCHOOL SUPPLIES REQUESTS
      ======================================= */}
                {selectedNgo.requests.schoolSupplies.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === "school" ? null : "school"
                        )
                      }
                      className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold"
                    >
                      School Supplies Requests (
                      {selectedNgo.requests.schoolSupplies.length})
                    </button>

                    {openCategory === "school" && (
                      <div className="mt-2">
                        {selectedNgo.requests.schoolSupplies.map(
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
                                      className="rounded object-cover h-24 w-full cursor-pointer"
                                    />
                                  ))}
                                </div>
                              )}

                              <p>
                                <strong>Item Type:</strong> {item.itemType}
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
                                <strong>Reason:</strong> {item.reason}
                              </p>
                              <p>
                                <strong>Delivery:</strong>{" "}
                                {item.deliveryPreference}
                              </p>
                              <p>
                                <strong>Required Before:</strong>{" "}
                                {new Date(
                                  item.requiredBefore
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <strong>Urgency:</strong> {item.urgency}
                              </p>
                              <button
                              onClick={() =>
                                handleAcceptRequest(item, selectedNgo)
                              }
                              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Accept Request
                            </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
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
        </div>
      </main>
    </div>
  );
}
