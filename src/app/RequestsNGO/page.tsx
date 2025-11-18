"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import {
  LogOut,
  Home,
  Gift,
  User as UserIcon,
  Package,
  XCircle,
  CheckCircle,
} from "lucide-react";

// ------------------------------------------------
// TYPES
// ------------------------------------------------
type RequestItem = {
  _id: string;
  type: string;
  completed?: boolean;
  images?: string[];
  ngoName?: string;
  clothType?: string;
  footwearType?: string;
  supplyType?: string;
  category?: string;
  quantity?: number;
  reason?: string;
  size?: string;
  fabricType?: string;
  season?: string;
  shoeSize?: string;
  classLevel?: string;
  color?: string;
  deliveryPreference?: string;
  ngoAddress?: string;
  city?: string;
  state?: string;
  requiredBefore?: string;
  [key: string]: unknown;
};

// ------------------------------------------------
// MAIN PAGE
// ------------------------------------------------
export default function YourRequests() {
  const [user, setUser] = useState<User | null>(null);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCompletedCategory, setFilterCompletedCategory] = useState<string>("all");

  const router = useRouter();
  const pathname = usePathname();

  // --------------------------------------------
  // AUTH CHECK
  // --------------------------------------------
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

  // --------------------------------------------
  // FETCH REQUESTS FROM API
  // --------------------------------------------
  useEffect(() => {
    async function fetchAll() {
      if (!user?.uid) return;
      setLoading(true);

      const uid = user.uid;

      try {
        const cloths: RequestItem[] = await fetch(`/api/requests/by-user/${uid}`)
          .then((r) => r.json())
          .catch(() => []);

        const footwear: RequestItem[] = await fetch(
          `/api/request-footwear/by-user/${uid}`
        )
          .then((r) => r.json())
          .catch(() => []);

        const school: RequestItem[] = await fetch(
          `/api/request-school-supplies/by-user/${uid}`
        )
          .then((r) => r.json())
          .catch(() => []);

        const combined: RequestItem[] = [
          ...cloths.map((r) => ({ ...r, type: "cloths" })),
          ...footwear.map((r) => ({ ...r, type: "footwear" })),
          ...school.map((r) => ({ ...r, type: "school-supplies" })),
        ];

        setRequests(combined);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user, router]);

  // --------------------------------------------
  // MARK COMPLETED / NOT COMPLETED
  // --------------------------------------------
  const markCompleted = async (
    id: string,
    type: string,
    status: boolean
  ): Promise<void> => {
    const collection =
      type === "cloths"
        ? "requests"
        : type === "footwear"
        ? "request-footwear"
        : "request-school-supplies";

    await fetch(`/api/${collection}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: status }),
    });

    setRequests((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, completed: status } : r
      )
    );

    setSelectedRequest(null);
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  const pending = requests.filter((r) => !r.completed);
  const completedRequests = requests.filter((r) => r.completed);

  // Apply category filter for pending requests
  const filteredPending = pending.filter((r) =>
    filterCategory === "all" ? true : r.type === filterCategory
  );

  const filteredCompleted = completedRequests.filter((r) =>
    filterCompletedCategory === "all" ? true : r.type === filterCompletedCategory
  );

  return (
    <div className="flex min-height-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        user={user}
        router={router}
        pathname={pathname}
        handleLogout={handleLogout}
        showDonateDropdown={showDonateDropdown}
        setShowDonateDropdown={setShowDonateDropdown}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        <div className="p-6 md:px-20">
          <h1 className="text-3xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <Package size={28} /> Your Requests
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

          {/* FILTER CATEGORY */}
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

          {activeTab === "pending" && (
            <>
              {filteredPending.length > 0 ? (
                <Section
                  title="Pending Requests"
                  items={filteredPending}
                  onClick={setSelectedRequest}
                />
              ) : (
                <p className="text-gray-500 mt-4">No pending requests.</p>
              )}
            </>
          )}

          {activeTab === "completed" && (
            <>
              {/* COMPLETED CATEGORY FILTER */}
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

              {filteredCompleted.length > 0 ? (
                <Section
                  title="Completed Requests"
                  items={filteredCompleted}
                  onClick={setSelectedRequest}
                />
              ) : (
                <p className="text-gray-500 mt-4">No completed requests.</p>
              )}
            </>
          )}

          {selectedRequest && (
            <DetailsModal
              request={selectedRequest}
              close={() => setSelectedRequest(null)}
              markCompleted={markCompleted}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ------------------------------------------------
// SIDEBAR
// ------------------------------------------------
function Sidebar({
  user,
  router,
  pathname,
  handleLogout,
  showDonateDropdown,
  setShowDonateDropdown,
}: {
  user: User | null;
  router: ReturnType<typeof useRouter>;
  pathname: string | null;
  handleLogout: () => void;
  showDonateDropdown: boolean;
  setShowDonateDropdown: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <aside className="bg-blue-900 text-white flex flex-col justify-between h-screen w-64 fixed md:sticky z-50">
      <div className="mt-6 flex flex-col gap-2 px-3">
        <div
          className="flex items-center gap-2 px-4 py-4 cursor-pointer"
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              pathname === "/DashboardNGO"
                ? "bg-blue-800"
                : "hover:bg-blue-700"
            }`}
          >
            <Home size={20} /> Home
          </button>

          <div className="px-4 py-2">
            <button
              onClick={() => setShowDonateDropdown((p) => !p)}
              className={`flex items-center justify-between w-full gap-2 rounded-lg px-4 py-2 ${
                pathname?.includes("/request")
                  ? "bg-blue-800"
                  : "hover:bg-blue-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Gift size={20} /> Request
              </div>
              <span>{showDonateDropdown ? "▲" : "▼"}</span>
            </button>

            {showDonateDropdown && (
              <div className="ml-4 mt-2 flex flex-col gap-1 bg-blue-900 rounded-md shadow-md">
                <SideBtn
                  path="/request/cloths"
                  router={router}
                  text="Cloths"
                  active={pathname === "/request/cloths"}
                />
                <SideBtn
                  path="/request/footwear"
                  router={router}
                  text="Footwear"
                  active={pathname === "/request/footwear"}
                />
                <SideBtn
                  path="/request/school-supplies"
                  router={router}
                  text="School Supplies"
                  active={pathname === "/request/school-supplies"}
                />
              </div>
            )}
          </div>

          <SideBtn
            path="/profileNGO"
            router={router}
            text="Profile"
            icon={UserIcon}
            active={pathname === "/profileNGO"}
          />

          <SideBtn
            path="/RequestsNGO"
            router={router}
            text="Your Requests"
            icon={Package}
            active={pathname === "/RequestsNGO"}
          />
        </nav>
      </div>

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

// ------------------------------------------------
// SECTION CARDS
// ------------------------------------------------
function Section({
  title,
  items,
  onClick,
  hideTitle,
}: {
  title?: string;
  items: RequestItem[];
  onClick: (item: RequestItem) => void;
  hideTitle?: boolean;
}) {
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
            {item.images?.length ? (
              <Image
                src={item.images[0]}
                width={300}
                height={180}
                className="rounded mb-3 object-cover h-40 w-full"
                alt="Preview"
              />
            ) : null}

            <h3 className="font-semibold text-lg">{item.ngoName}</h3>

            <p className="text-sm text-gray-600">
              {item.type === "cloths"
                ? item.clothType
                : item.type === "footwear"
                ? item.footwearType
                : item.supplyType}
            </p>

            <p className="text-sm mt-2 font-medium">Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------
// DETAILS MODAL
// ------------------------------------------------
function DetailsModal({
  request,
  close,
  markCompleted,
}: {
  request: RequestItem;
  close: () => void;
  markCompleted: (id: string, type: string, status: boolean) => void;
}) {
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
          {request.ngoName}
        </h2>

        {request.images?.length ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {request.images.map((img, i) => (
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
        ) : null}

        <div className="space-y-1 text-gray-700">
          <p>
            <strong>Type:</strong> {request.type}
          </p>
          <p>
            <strong>Category:</strong> {request.category}
          </p>
          <p>
            <strong>Quantity:</strong> {request.quantity}
          </p>
          <p>
            <strong>Reason:</strong> {request.reason}
          </p>

          {request.type === "cloths" && (
            <>
              <p>
                <strong>Size:</strong> {request.size}
              </p>
              <p>
                <strong>Fabric:</strong> {request.fabricType}
              </p>
              <p>
                <strong>Season:</strong> {request.season}
              </p>
            </>
          )}

          {request.type === "footwear" && (
            <>
              <p>
                <strong>Shoe Size:</strong> {request.shoeSize}
              </p>
              <p>
                <strong>Footwear Type:</strong> {request.footwearType}
              </p>
            </>
          )}

          {request.type === "school-supplies" && (
            <>
              <p>
                <strong>Supply Type:</strong> {request.supplyType}
              </p>
              <p>
                <strong>For Class:</strong> {request.classLevel}
              </p>
            </>
          )}

          <p>
            <strong>Color Preference:</strong> {request.color}
          </p>
          <p>
            <strong>Delivery Preference:</strong> {request.deliveryPreference}
          </p>
          <p>
            <strong>Address:</strong> {request.ngoAddress}
          </p>
          <p>
            <strong>City:</strong> {request.city}
          </p>
          <p>
            <strong>State:</strong> {request.state}
          </p>
          <p>
            <strong>Required Before:</strong>{" "}
            {request.requiredBefore
              ? new Date(request.requiredBefore).toISOString().split("T")[0]
              : "N/A"}
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          {!request.completed ? (
            <button
              onClick={() =>
                markCompleted(request._id, request.type, true)
              }
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={18} /> Mark Completed
            </button>
          ) : (
            <button
              onClick={() =>
                markCompleted(request._id, request.type, false)
              }
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

// ------------------------------------------------
// SIDEBAR BUTTON
// ------------------------------------------------
function SideBtn({
  path,
  router,
  text,
  icon: Icon,
  active,
}: {
  path: string;
  router: ReturnType<typeof useRouter>;
  text: string;
  icon?: React.ElementType;
  active: boolean;
}) {
  return (
    <button
      onClick={() => router.push(path)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left ${
        active
          ? "bg-blue-800 text-white"
          : "hover:bg-blue-700 text-gray-200"
      }`}
    >
      {Icon && <Icon size={18} />}
      {text}
    </button>
  );
}
