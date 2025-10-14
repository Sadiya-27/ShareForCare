"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Home, Users, Repeat, User, Menu, Gift } from "lucide-react";

export default function Join() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(""); // volunteer, ngo
  const [volunteerFile, setVolunteerFile] = useState(null);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [ngoFile, setNgoFile] = useState(null);
  const [filterType, setFilterType] = useState("All");
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
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
            >
              <Home size={20} /> Home
            </button>
            <button
              onClick={() => router.push("/join")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg font-medium bg-blue-800"
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

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Join Share<i>For</i>Care
        </h1>
        <p className="text-gray-600 mb-6">Select an option to get started:</p>

        {/* Option buttons */}
        <div className="flex gap-4 mb-6">
          {["volunteer", "ngo"].map((option) => (
            <button
              key={option}
              onClick={() => setActiveOption(option)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeOption === option
                  ? "bg-blue-800 text-white"
                  : "bg-blue-100 text-blue-900"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Volunteer Form */}
        {activeOption === "volunteer" && (
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold">Volunteer Details</h2>
            <input
              type="text"
              placeholder="Full Name"
              className="border p-2 rounded w-full"
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Skills / Interests"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="City / Location"
              className="border p-2 rounded w-full"
            />
            <textarea
              placeholder="Additional Info"
              className="border p-2 rounded w-full"
            ></textarea>
            <div>
              <label className="block mb-1 font-medium">
                Upload ID / Certificate
              </label>
              <input
                type="file"
                onChange={(e) => setVolunteerFile(e.target.files[0])}
                className="border p-2 rounded w-full"
              />
            </div>
            <button className="bg-blue-900 text-white px-4 py-2 rounded-lg">
              Submit
            </button>
          </div>
        )}

        {/* NGO Form */}
        {activeOption === "ngo" && (
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-semibold">NGO Details</h2>
            <input
              type="text"
              placeholder="NGO Name"
              className="border p-2 rounded w-full"
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Address"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Type of Donations Accepted"
              className="border p-2 rounded w-full"
            />
            <textarea
              placeholder="Mission / Additional Info"
              className="border p-2 rounded w-full"
            ></textarea>
            <div>
              <label className="block mb-1 font-medium">
                Upload ID / Certificate
              </label>
              <input
                type="file"
                onChange={(e) => setNgoFile(e.target.files[0])}
                className="border p-2 rounded w-full"
              />
            </div>
            <button className="bg-blue-900 text-white px-4 py-2 rounded-lg">
              Submit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
