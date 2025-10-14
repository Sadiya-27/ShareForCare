"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Home, Users, Gift, Repeat, User, Menu } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recent"); // <-- tab state
  const router = useRouter();

  const cards = [
    {
      id: 1,
      location: "Aurangabad NGO Center",
      uploader: "Rahul Patil",
      type: "Cloths",
      time: "12 hr Ago",
      verified: true,
      image: "/ngo.jpg",
    },
    {
      id: 2,
      location: "Local School",
      uploader: "Sneha More",
      type: "School Supplies",
      time: "6 hr Ago",
      verified: false,
      image: "/ngo.jpg",
    },
    {
      id: 3,
      location: "Community Center",
      uploader: "Aditya Shah",
      type: "Footwear",
      time: "3 hr Ago",
      verified: true,
      image: "/ngo.jpg",
    },
  ];

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
  const filteredCards = cards
    .filter(
      (card) =>
        (filterType === "All" || card.type === filterType) &&
        card.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (activeTab === "recent") return b.id - a.id; // newest first
      if (activeTab === "daily") return a.id - b.id; // oldest first (example for daily active)
      return 0;
    });

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
            onClick={() => router.push("/Dashboard")}
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
          <nav className="mt-8 flex flex-col gap-2">
            <button
              onClick={() => router.push("/Dashboard")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg font-medium bg-blue-800"
            >
              <Home size={20} /> Home
            </button>
            <button
              onClick={() => router.push("/join")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
            >
              <Users size={20} /> Join
            </button>

            {/* Donate Dropdown */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowDonateDropdown((prev) => !prev)}
                className="flex items-center justify-between w-full gap-2 hover:bg-blue-700 rounded-lg px-4 py-2 bg-blue-800 text-white"
              >
                <div className="flex items-center gap-2">
                  <Gift size={20} /> Donate
                </div>
                <span>{showDonateDropdown ? "▲" : "▼"}</span>
              </button>

              {showDonateDropdown && (
                <div className="ml-4 mt-2 flex flex-col gap-1 bg-blue-900 rounded-md shadow-md">
                  <button
                    onClick={() => router.push("/donate/cloths")}
                    className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md"
                  >
                    Cloths
                  </button>
                  <button
                    onClick={() => router.push("/donate/footwear")}
                    className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md"
                  >
                    Footwear
                  </button>
                  <button
                    onClick={() => router.push("/donate/school-supplies")}
                    className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md"
                  >
                    School Supplies
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/recycle")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
            >
              <Repeat size={20} /> Recycle
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
            >
              <User size={20} /> Profile
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

      {/* Mobile top bar */}
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden flex items-center justify-between bg-blue-900 p-3 shadow-md">
        <div className="flex items-center gap-2">
          <Image
            src="/logo3.png"
            width={40}
            height={40}
            alt="Logo"
            className="rounded-xl"
          />
          <h1 className="text-white font-semibold text-lg">
            Share<i>For</i>Care
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay behind sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

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
            className={`pb-2 font-medium ${
              activeTab === "recent"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recently Uploaded
          </button>
          <button
            className={`pb-2 font-medium ${
              activeTab === "daily"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Daily Active
          </button>
        </div>

        {/* Feed Section */}
        <div className="p-4 space-y-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border"
            >
              <div className="relative w-full h-40">
                <Image
                  src={card.image}
                  alt={card.type}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span className="font-semibold text-blue-900">
                    {card.location}
                  </span>
                  <button className="text-gray-400 hover:text-red-500">
                    ♡
                  </button>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-600 gap-2">
                  <span className="font-semibold">Uploaded by:</span>
                  <span>{card.uploader}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {card.verified && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">
                      NGO Verified
                    </span>
                  )}
                  <div className="text-xs text-gray-600 space-x-3">
                    <span>Type: {card.type}</span>
                    <span>{card.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
