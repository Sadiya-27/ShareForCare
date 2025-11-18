"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  LogOut,
  Home,
  Gift,
  User,
  Package,
  XCircle,
  CheckCircle,
} from "lucide-react";

export default function YourDonations() {
  const [user, setUser] = useState(null);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);

  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCompletedCategory, setFilterCompletedCategory] = useState("all");

  const router = useRouter();

  // AUTH CHECK
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

  // FETCH ALL DONATIONS
  useEffect(() => {
    async function load() {
      setLoading(true);

      if (!user?.uid) return; // Wait until user is available
      const uid = user.uid;

      try {
        // Fetch all 3 categories
        const cloths = await fetch(`/api/donate-cloths/by-user/${uid}`)
          .then((r) => r.json())
          .catch(() => []);

        const footwear = await fetch(`/api/donate-footwear/by-user/${uid}`)
          .then((r) => r.json())
          .catch(() => []);

        const school = await fetch(`/api/donate-school-supplies/by-user/${uid}`)
          .then((r) => r.json())
          .catch(() => []);

        // Combine and label
        const combined = [
          ...cloths.map((c) => ({ ...c, type: "cloths" })),
          ...footwear.map((f) => ({ ...f, type: "footwear" })),
          ...school.map((s) => ({ ...s, type: "school-supplies" })),
        ];

        setDonations(combined);
      } catch (error) {
        console.error("Error loading donations:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // MARK COMPLETED
  const markCompleted = async (id, type, status) => {
    const endpoint =
      type === "cloths"
        ? "donate-cloths"
        : type === "footwear"
        ? "donate-footwear"
        : "donate-school-supplies";

    await fetch(`/api/${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: status }),
    });

    setDonations((prev) =>
      prev.map((d) => (d._id === id ? { ...d, completed: status } : d))
    );

    setSelectedDonation(null);
  };

  // LOADING
  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  // FILTERS
  const pending = donations.filter((d) => !d.completed);
  const completedDonations = donations.filter((d) => d.completed);

  // Pending Filter
  const filteredPending = pending.filter((d) =>
    filterCategory === "all" ? true : d.type === filterCategory
  );

  // Completed Filter
  const filteredCompleted = completedDonations.filter((d) =>
    filterCompletedCategory === "all"
      ? true
      : d.type === filterCompletedCategory
  );
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        user={user}
        router={router}
        handleLogout={handleLogout}
        showDonateDropdown={showDonateDropdown}
        setShowDonateDropdown={setShowDonateDropdown}
      />

      {/* MAIN */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        <div className="p-6 md:px-20">
          <h1 className="text-3xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <Package size={28} /> Your Donations
          </h1>

          {/* TABS */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === "pending"
                  ? "bg-blue-900 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Pending
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === "completed"
                  ? "bg-blue-900 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Completed
            </button>
          </div>

          {/* FILTER FOR PENDING */}
          {activeTab === "pending" && (
            <div className="mb-6">
              <label className="font-semibold mr-3 text-gray-700">
                Filter By Category:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="all">All</option>
                <option value="cloths">Cloths</option>
                <option value="footwear">Footwear</option>
                <option value="school-supplies">School Supplies</option>
              </select>
            </div>
          )}

          {/* FILTER FOR COMPLETED */}
          {activeTab === "completed" && (
            <div className="mb-6">
              <label className="font-semibold mr-3 text-gray-700">
                Filter By Category:
              </label>
              <select
                value={filterCompletedCategory}
                onChange={(e) => setFilterCompletedCategory(e.target.value)}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="all">All</option>
                <option value="cloths">Cloths</option>
                <option value="footwear">Footwear</option>
                <option value="school-supplies">School Supplies</option>
              </select>
            </div>
          )}

          {/* PENDING TAB */}
          {activeTab === "pending" && (
            <>
              {filteredPending.length > 0 ? (
                <Section
                  title="Pending Donations"
                  items={filteredPending}
                  onClick={setSelectedDonation}
                />
              ) : (
                <p className="text-gray-500">No pending donations.</p>
              )}
            </>
          )}

          {/* COMPLETED TAB */}
          {activeTab === "completed" && (
            <>
              {filteredCompleted.length > 0 ? (
                <Section
                  title="Completed Donations"
                  items={filteredCompleted}
                  onClick={setSelectedDonation}
                />
              ) : (
                <p className="text-gray-500">No completed donations.</p>
              )}
            </>
          )}

          {/* MODAL */}
          {selectedDonation && (
            <DetailsModal
              donation={selectedDonation}
              close={() => setSelectedDonation(null)}
              markCompleted={markCompleted}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------
   SIDEBAR
------------------------------------------------------------- */
function Sidebar({
  user,
  router,
  handleLogout,
  showDonateDropdown,
  setShowDonateDropdown,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <aside
      className={`bg-blue-900 text-white flex flex-col justify-between
                  h-screen w-64 fixed md:sticky z-50 transition-transform duration-300
                  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                  md:translate-x-0`}
    >
      <div>
        {/* LOGO */}
        <div
          className="flex items-center gap-2 px-4 py-4 cursor-pointer"
          onClick={() => router.push("/DashboardVolunteer")}
        >
          <Image src="/logo3.png" width={50} height={50} alt="Logo" />
          <h1 className="text-2xl font-semibold">
            Share<i>For</i>Care
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-6 flex flex-col gap-2 px-3">
          <button
            onClick={() => router.push("/DashboardVolunteer")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Home size={20} /> Home
          </button>

          {/* DONATE DROPDOWN */}
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
                  className="px-3 py-2 rounded-md hover:bg-blue-700 bg-blue-600"
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
            className="flex items-center rounded-lg bg-blue-800 gap-2 px-4 py-2 hover:bg-blue-700"
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
  );
}

function SideBtn({ path, router, text, icon: Icon }) {
  return (
    <button
      onClick={() => router.push(path)}
      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"
    >
      {Icon && <Icon size={20} />} {text}
    </button>
  );
}

/* -------------------------------------------------------------
   SECTION CARDS
------------------------------------------------------------- */
function Section({ title, items, onClick, hideTitle }) {
  if (!items.length) return null;

  return (
    <div className="mb-8">
      {!hideTitle && (
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => onClick(item)}
            className="border p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-white"
          >
            {item.images?.length > 0 && (
              <Image
                src={item.images[0]}
                width={300}
                height={180}
                className="rounded mb-3 object-cover h-40 w-full"
                alt="Preview"
              />
            )}

            <h3 className="font-semibold text-lg">{item.donorName}</h3>

            <p className="text-sm text-gray-600">{item.itemType}</p>

            <p className="text-sm mt-2 font-medium">
              Quantity: {item.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   DETAILS MODAL
------------------------------------------------------------- */
function DetailsModal({ donation, close, markCompleted }) {
  const { type } = donation;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
        <button
          onClick={close}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-blue-900 mb-4">
          {donation.donorName}
        </h2>

        {donation.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {donation.images.map((img, i) => (
              <Image
                key={i}
                src={img}
                width={200}
                height={150}
                className="rounded object-cover h-28 w-full"
                alt="Preview"
              />
            ))}
          </div>
        )}

        <div className="space-y-1 text-gray-700">
          <p>
            <strong>Item:</strong> {donation.itemType}
          </p>

          <p>
            <strong>Quantity:</strong> {donation.quantity}
          </p>

          {type === "cloths" && (
            <>
              <p>
                <strong>Size:</strong> {donation.size}
              </p>
              <p>
                <strong>Fabric:</strong> {donation.fabricType}
              </p>
              <p>
                <strong>Season:</strong> {donation.season}
              </p>
            </>
          )}

          {type === "footwear" && (
            <>
              <p>
                <strong>Shoe Type:</strong> {donation.shoeType}
              </p>
              <p>
                <strong>Size:</strong> {donation.size}
              </p>
            </>
          )}

          {type === "school-supplies" && (
            <>
              <p>
                <strong>Grade Level:</strong> {donation.gradeLevel}
              </p>
              <p>
                <strong>Brand:</strong> {donation.brandPreference}
              </p>
            </>
          )}

          <p>
            <strong>Message:</strong> {donation.extraDetails}
          </p>

          <p>
            <strong>Delivery Method:</strong> {donation.deliveryMethod}
          </p>

          <p>
            <strong>Address:</strong> {donation.address}
          </p>

          <p>
            <strong>Available From:</strong>{" "}
            {new Date(donation.availableFrom).toISOString().split("T")[0]}
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          {!donation.completed ? (
            <button
              onClick={() => markCompleted(donation._id, donation.type, true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={18} /> Mark Completed
            </button>
          ) : (
            <button
              onClick={() => markCompleted(donation._id, donation.type, false)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <XCircle size={18} /> Mark Not Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
