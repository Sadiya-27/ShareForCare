"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut,
  Home,
  Users,
  Package,
  Gift,
  Menu,
  X,
  Package as PackageIcon,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  // Auth & user
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data
  const [volunteers, setVolunteers] = useState([]);
  const [ngos, setNgos] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // analytics | volunteers | ngos
  const [filter, setFilter] = useState("all"); // all | verified | unverified
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & preview
  const [selectedEntity, setSelectedEntity] = useState(null); // volunteer or ngo
  const [previewImage, setPreviewImage] = useState(null);
  const [openDocsAccordion, setOpenDocsAccordion] = useState(null);

  const [donations, setDonations] = useState({
    cloths: [],
    footwear: [],
    school: [],
  });

  const [requests, setRequests] = useState({
    cloths: [],
    footwear: [],
    school: [],
  });

  // --- Auth + admin check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/Login");
        return;
      }
      setUser(currentUser);

      try {
        const res = await fetch(`/api/checkAdmin?uid=${currentUser.uid}`);
        const data = await res.json();
        if (!data.isAdmin) {
          router.push("/not-authorized");
          return;
        }
        setIsAdmin(true);
        await fetchData();
      } catch (err) {
        console.error("admin check failed", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- fetch both collections
  const fetchData = async () => {
    try {
      const [volRes, ngoRes, dcRes, dfRes, dsRes, rcRes, rfRes, rsRes] =
        await Promise.all([
          fetch("/api/admin/allVolunteers"),
          fetch("/api/admin/allNgos"),

          // donations
          fetch("/api/admin/donate-cloths"),
          fetch("/api/admin/donate-footwear"),
          fetch("/api/admin/donate-school-supplies"),

          // requests
          fetch("/api/admin/request-cloths"),
          fetch("/api/admin/request-footwear"),
          fetch("/api/admin/request-school-supplies"),
        ]);

      // helper: safely parse JSON
      const safeJSON = async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("❌ Invalid JSON from:", res.url);
          console.log("Response was:", text);
          return null;
        }
      };

      const [
        volunteers,
        ngos,
        donateCloths,
        donateFootwear,
        donateSchool,
        reqCloths,
        reqFootwear,
        reqSchool,
      ] = await Promise.all([
        safeJSON(volRes),
        safeJSON(ngoRes),
        safeJSON(dcRes),
        safeJSON(dfRes),
        safeJSON(dsRes),
        safeJSON(rcRes),
        safeJSON(rfRes),
        safeJSON(rsRes),
      ]);

      // update state
      setVolunteers(volunteers || []);
      setNgos(ngos || []);

      setDonations({
        cloths: donateCloths || [],
        footwear: donateFootwear || [],
        school: donateSchool || [],
      });

      setRequests({
        cloths: reqCloths || [],
        footwear: reqFootwear || [],
        school: reqSchool || [],
      });
    } catch (err) {
      console.error("fetch error", err);
    }
  };

  // --- update status (verified / unverified)
  const handleStatusUpdate = async (id, type, status) => {
    try {
      await fetch("/api/admin/updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, status }),
      });
      await fetchData();
      // If an entity currently open in modal was updated, refresh it
      if (
        selectedEntity &&
        selectedEntity._id === id &&
        selectedEntity.type === type
      ) {
        const updated =
          type === "volunteer"
            ? volunteers.find((v) => v._id === id)
            : ngos.find((n) => n._id === id);
        setSelectedEntity(updated ? { ...updated, type } : null);
      }
    } catch (err) {
      console.error("update status failed", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  // --- derived lists with filter & search
  const applyFilterAndSearch = (list) => {
    return list
      .filter((item) => {
        if (filter === "verified") return item.verification === "verified";
        if (filter === "unverified") return item.verification !== "verified";
        return true;
      })
      .filter((item) => {
  if (!searchTerm) return true;

  const search = searchTerm.toLowerCase();

  // Build a unified searchable string for both NGO + Volunteer
  const haystack = [
    item.name,
    item.ngoName,
    item.email,
    item.ngoEmail,
    item.address,
    item.ngoAddress,
    item.location?.address, // nested volunteer location
  ]
    .filter(Boolean) // remove undefined/null
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
})

      .sort(
        (a, b) =>
          new Date(b.createdAt || b._createdAt || 0) -
          new Date(a.createdAt || a._createdAt || 0)
      );
  };

  const volunteersToShow = applyFilterAndSearch(volunteers);
  const ngosToShow = applyFilterAndSearch(ngos);

  if (loading) {
    return <p className="p-6 text-center">Loading admin dashboard…</p>;
  }

  // Analytics counts
  const totalVolunteers = volunteers.length;
  const totalNgos = ngos.length;
  const totalVerified =
    (volunteers.filter((v) => v.verification === "verified").length || 0) +
    (ngos.filter((n) => n.verification === "verified").length || 0);
  const totalPending =
    (volunteers.filter((v) => v.verification !== "verified").length || 0) +
    (ngos.filter((n) => n.verification !== "verified").length || 0);

    const totalDonations =
  (donations.cloths?.length || 0) +
  (donations.footwear?.length || 0) +
  (donations.school?.length || 0);

const totalRequests =
  (requests.cloths?.length || 0) +
  (requests.footwear?.length || 0) +
  (requests.school?.length || 0);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between h-screen w-64 transition-transform duration-300 fixed md:sticky md:top-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex z-40`}
      >
        <div>
          <div
            className="flex items-center gap-3 px-4 py-4 cursor-pointer"
            onClick={() => router.push("/admin")}
          >
            <Image
              src="/logo3.png"
              width={52}
              height={52}
              alt="logo"
              className="rounded-xl"
            />
            <h1 className="text-2xl font-semibold">
              Share<i>For</i>Care
            </h1>
          </div>

          <nav className="mt-6 flex flex-col gap-2 px-3">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-3 px-4 py-2 rounded-md w-full text-left ${
                activeTab === "analytics" ? "bg-blue-800" : "hover:bg-blue-800"
              }`}
            >
              <Home size={18} /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab("volunteers")}
              className={`flex items-center gap-3 px-4 py-2 rounded-md w-full text-left ${
                activeTab === "volunteers" ? "bg-blue-800" : "hover:bg-blue-800"
              }`}
            >
              <Users size={18} /> Volunteers
            </button>

            <button
              onClick={() => setActiveTab("ngos")}
              className={`flex items-center gap-3 px-4 py-2 rounded-md w-full text-left ${
                activeTab === "ngos" ? "bg-blue-800" : "hover:bg-blue-800"
              }`}
            >
              <PackageIcon size={18} /> NGOs
            </button>
          </nav>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mr-2">
            {user?.photoURL ? (
              // use <img> for remote URLs
              // eslint-disable-next-line @next/next/no-img-element

              <img
                src={user?.photoURL || "/default-avatar.png"}
                alt="admin"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">
                A
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-medium">
                {user?.displayName || "Admin"}
              </p>
              <p className="text-xs text-blue-200">Administrator</p>
            </div>

            <button
              onClick={handleLogout}
              className="text-blue-900 bg-blue-300 px-3 py-2 rounded-xl hover:bg-blue-200 flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:mx-8">
        {/* Top controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              Hello, {user?.displayName || "Admin"} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Manage NGOs, volunteers and verifications
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search by name / email / org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-64"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-2 font-medium transition ${
              activeTab === "analytics"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`pb-2 font-medium transition ${
              activeTab === "volunteers"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            Volunteers
          </button>
          <button
            onClick={() => setActiveTab("ngos")}
            className={`pb-2 font-medium transition ${
              activeTab === "ngos"
                ? "text-blue-900 border-b-2 border-blue-900"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            NGOs
          </button>
        </div>

        {/* Content */}
        {activeTab === "analytics" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">Total NGOs</p>
                <h3 className="text-2xl font-bold">{totalNgos}</h3>
              </div>

              <div className="p-5 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">Total Volunteers</p>
                <h3 className="text-2xl font-bold">{totalVolunteers}</h3>
              </div>

              <div className="p-5 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">
                  Verified (NGO + Volunteers)
                </p>
                <h3 className="text-2xl font-bold">{totalVerified}</h3>
              </div>

              <div className="p-5 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">Pending Verification</p>
                <h3 className="text-2xl font-bold">{totalPending}</h3>
              </div>

              <div className="p-5 bg-white rounded-lg shadow">
  <p className="text-sm text-gray-500">Requests</p>
  <h3 className="text-2xl font-bold">{totalRequests}</h3>
</div>

<div className="p-5 bg-white rounded-lg shadow">
  <p className="text-sm text-gray-500">Donations</p>
  <h3 className="text-2xl font-bold">{totalDonations}</h3>
</div>

            </div>
          </section>
        )}

        {activeTab === "volunteers" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Volunteers</h2>

            <div className="space-y-4">
              {volunteersToShow.map((v) => (
                <div
                  key={v._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border cursor-pointer hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.profilePic || "/default-avatar.png"}
                        alt={v.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900">
                        {v.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {v.email} · {v.address || "No address"}
                      </p>

                      <p className="text-xs mt-2 text-gray-500">
                        Joined:{" "}
                        {v.createdAt
                          ? new Date(v.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <div>
                        {v.verification === "verified" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">
                            Verified
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold">
                            Not Verified
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedEntity({
                              ...v,
                              type: "volunteer",
                              donations: {
                                cloths: donations.cloths.filter(
                                  (d) => d.userId === v.userId
                                ),
                                footwear: donations.footwear.filter(
                                  (d) => d.userId === v.userId
                                ),
                                school: donations.school.filter(
                                  (d) => d.userId === v.userId
                                ),
                              },
                            });
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          View
                        </button>

                        {v.verification !== "verified" ? (
                          <button
                            onClick={() =>
                              handleStatusUpdate(v._id, "volunteer", "verified")
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                v._id,
                                "volunteer",
                                "unverified"
                              )
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Unverify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {volunteersToShow.length === 0 && (
                <p className="text-center text-gray-500">
                  No volunteers found.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "ngos" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">NGOs</h2>

            <div className="space-y-4">
              {ngosToShow.map((n) => (
                <div
                  key={n._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* NGO Logo */}
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={n.profilePic || "/default-org.png"}
                        className="object-cover w-full h-full"
                        alt={n.ngoName}
                      />
                    </div>

                    {/* NGO Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900">
                        {n.ngoName}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {n.ngoEmail} · {n.ngoAddress || "No address"}
                      </p>

                      <p className="text-xs mt-2 text-gray-500">
                        Joined:{" "}
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    {/* ------------------ STATUS + BUTTONS ------------------ */}
                    <div className="flex flex-col items-end gap-2">
                      {n.verification === "verified" ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          Not Verified
                        </span>
                      )}

                      <div className="flex gap-2">
                        {/* View button */}
                        <button
                          className="px-3 py-1 border rounded text-sm"
                          onClick={() => {
                            setSelectedEntity({
                              ...n,
                              type: "ngo",
                              requests: {
                                cloths: requests.cloths.filter(
                                  (r) => r.userId === n.userId
                                ),
                                footwear: requests.footwear.filter(
                                  (r) => r.userId === n.userId
                                ),
                                school: requests.school.filter(
                                  (r) => r.userId === n.userId
                                ),
                              },
                            });
                          }}
                        >
                          View
                        </button>

                        {/* Verify / Unverify */}
                        {n.verification !== "verified" ? (
                          <button
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                            onClick={() =>
                              handleStatusUpdate(n._id, "ngo", "verified")
                            }
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            onClick={() =>
                              handleStatusUpdate(n._id, "ngo", "unverified")
                            }
                          >
                            Unverify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {ngosToShow.length === 0 && (
                <p className="text-center text-gray-500">No NGOs found.</p>
              )}
            </div>
          </section>
        )}

        {/* Selected entity modal */}

        {selectedEntity && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedEntity(null)}
          >
            <div
              className="bg-white rounded-xl p-6 w-11/12 md:w-3/4 lg:w-2/3 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedEntity.profilePic || "/default-avatar.png"}
                    alt={
                      selectedEntity.type === "ngo"
                        ? selectedEntity.ngoName
                        : selectedEntity.name
                    }
                    className="w-20 h-20 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">
                      {selectedEntity.type === "ngo"
                        ? selectedEntity.ngoName
                        : selectedEntity.name}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {selectedEntity.type === "ngo"
                        ? selectedEntity.ngoEmail
                        : selectedEntity.email}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {selectedEntity.type === "ngo" ? "NGO" : "Volunteer"}
                    </p>
                  </div>
                </div>

                {/* Status & verify/unverify */}
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-700 mb-2">
                    Status:{" "}
                    {selectedEntity.verification === "verified" ? (
                      <span className="text-green-600 font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Not Verified
                      </span>
                    )}
                  </span>

                  {selectedEntity.verification !== "verified" ? (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-md"
                      onClick={() => {
                        handleStatusUpdate(
                          selectedEntity._id,
                          selectedEntity.type,
                          "verified"
                        );
                        setSelectedEntity((s) => ({
                          ...s,
                          verification: "verified",
                        }));
                      }}
                    >
                      Mark Verified
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                      onClick={() => {
                        handleStatusUpdate(
                          selectedEntity._id,
                          selectedEntity.type,
                          "unverified"
                        );
                        setSelectedEntity((s) => ({
                          ...s,
                          verification: "unverified",
                        }));
                      }}
                    >
                      Mark Unverified
                    </button>
                  )}
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                {/* ------- Volunteer Details ------- */}
                {selectedEntity.type === "volunteer" && (
                  <>
                    <p>
                      <strong>Phone:</strong> {selectedEntity.phoneNo}
                    </p>
                    <p>
                      <strong>Gender:</strong> {selectedEntity.gender}
                    </p>
                    <p>
                      <strong>Age:</strong> {selectedEntity.age}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedEntity.location?.address || "Not provided"}
                    </p>
                    <p>
                      <strong>Skills:</strong>{" "}
                      {selectedEntity.skills?.join(", ") || "N/A"}
                    </p>
                    <p>
                      <strong>Experience:</strong>{" "}
                      {selectedEntity.experience || "N/A"}
                    </p>
                    <p>
                      <strong>Availability:</strong>{" "}
                      {selectedEntity.availability || "N/A"}
                    </p>
                    <p>
                      <strong>Motivation:</strong>{" "}
                      {selectedEntity.motivation || "N/A"}
                    </p>
                    <p>
                      <strong>Joined:</strong>{" "}
                      {new Date(selectedEntity.createdAt).toLocaleDateString()}
                    </p>
                    {/* ================= VOLUNTEER DONATIONS ================ */}
                    {selectedEntity.type === "volunteer" && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3 text-blue-900">
                          Donations
                        </h3>

                        {/* Cloths */}
                        {selectedEntity?.donations?.cloths?.length > 0 && (
                          <Accordion title="Cloth Donations">
                            {selectedEntity.donations.cloths.map(
                              (item, index) => (
                                <DonationCard
                                  key={index}
                                  item={item}
                                  setPreviewImage={setPreviewImage}
                                />
                              )
                            )}
                          </Accordion>
                        )}

                        {/* Footwear */}
                        {selectedEntity?.donations?.footwear?.length > 0 && (
                          <Accordion title="Footwear Donations">
                            {selectedEntity.donations.footwear.map(
                              (item, index) => (
                                <DonationCard
                                  key={index}
                                  item={item}
                                  setPreviewImage={setPreviewImage}
                                />
                              )
                            )}
                          </Accordion>
                        )}

                        {/* School Supplies */}
                        {selectedEntity?.donations?.school?.length > 0 && (
                          <Accordion title="School Supply Donations">
                            {selectedEntity.donations.school.map(
                              (item, index) => (
                                <DonationCard
                                  key={index}
                                  item={item}
                                  setPreviewImage={setPreviewImage}
                                />
                              )
                            )}
                          </Accordion>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ------- NGO Details ------- */}
                {selectedEntity.type === "ngo" && (
                  <>
                    <p>
                      <strong>NGO Name:</strong> {selectedEntity.ngoName}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedEntity.ngoType}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedEntity.ngoPhoneNo}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedEntity.ngoEmail}
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      {selectedEntity.ngoWebsite || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedEntity.ngoAddress}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedEntity.ngoLocation}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedEntity.ngoDescription}
                    </p>
                    <p>
                      <strong>Joined:</strong>{" "}
                      {new Date(selectedEntity.createdAt).toLocaleDateString()}
                    </p>
                    {selectedEntity.type === "ngo" && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3 text-blue-900">
                          Requests
                        </h3>

                        {/* Cloth Requests */}
                        {selectedEntity?.requests?.cloths?.length > 0 && (
                          <Accordion title="Cloth Requests">
                            {selectedEntity.requests.cloths.map(
                              (req, index) => (
                                <RequestCard
                                  key={index}
                                  req={req}
                                  setPreviewImage={setPreviewImage}
                                />
                              )
                            )}
                          </Accordion>
                        )}

                        {/* Footwear Requests */}
                        {selectedEntity?.requests?.footwear?.length > 0 && (
                          <Accordion title="Footwear Requests">
                            {selectedEntity.requests.footwear.map(
                              (req, index) => (
                                <RequestCard
                                  key={index}
                                  req={req}
                                  setPreviewImage={setPreviewImage}
                                />
                              )
                            )}
                          </Accordion>
                        )}

                        {/* School Supply Requests */}
                        {selectedEntity?.requests?.school?.length > 0 && (
                          <Accordion title="School Supply Requests">
                            {selectedEntity.requests.school.map(
                              (req, index) => (
                                <RequestCard
                                  key={index}
                                  req={req}
                                  setPreviewImage={setPreviewImage}
                                />
                              )
                            )}
                          </Accordion>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* DOCUMENT SECTION */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Verification Document</h4>

                {selectedEntity.verificationDoc ? (
                  <div className="p-4 border rounded bg-gray-50 flex items-center justify-between">
                    <p className="font-medium">Uploaded Document</p>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setPreviewImage(selectedEntity.verificationDoc)
                        }
                        className="px-3 py-1 border rounded text-sm"
                      >
                        Preview
                      </button>

                      <a
                        href={selectedEntity.verificationDoc}
                        target="_blank"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No document uploaded</p>
                )}
              </div>

              {/* IMAGE PREVIEW */}
              {previewImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60"
                  onClick={() => setPreviewImage(null)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage}
                    className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border rounded-lg p-4 bg-gray-50">
      <button
        className="w-full text-left font-semibold text-blue-700"
        onClick={() => setOpen(!open)}
      >
        {title} {open ? "▲" : "▼"}
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

function DonationCard({ item, setPreviewImage }) {
  return (
    <div className="p-4 bg-white rounded border shadow-sm">
      <p>
        <strong>Type:</strong>{" "}
        {item.clothType || item.shoeType || item.itemType}
      </p>
      <p>
        <strong>Quantity:</strong> {item.quantity}
      </p>
      <p>
        <strong>Condition:</strong> {item.condition || item.itemCondition}
      </p>

      {item.images?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {item.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setPreviewImage(img)}
              className="h-24 w-full object-cover rounded cursor-pointer"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, setPreviewImage }) {
  return (
    <div className="p-4 bg-white rounded border shadow-sm">
      <p>
        <strong>Item:</strong> {req.clothType || req.shoeType || req.itemType}
      </p>
      <p>
        <strong>Quantity:</strong> {req.quantity}
      </p>
      <p>
        <strong>Urgency:</strong> {req.urgency}
      </p>

      {req.images?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {req.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setPreviewImage(img)}
              className="h-24 w-full object-cover rounded cursor-pointer"
            />
          ))}
        </div>
      )}
    </div>
  );
}
