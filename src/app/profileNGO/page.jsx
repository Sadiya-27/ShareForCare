"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
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
import FileUpload from "../components/FileUpload";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const LeafletMap = dynamic(() => import("leaflet"), { ssr: false });

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [isExistingNgo, setIsExistingNgo] = useState(false);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  // NGO-specific fields
  const [ngoName, setNgoName] = useState("");
  const [ngoLocation, setNgoLocation] = useState("");
  const [ngoAddress, setNgoAddress] = useState("");
  const [ngoType, setNgoType] = useState("");
  const [ngoDescription, setNgoDescription] = useState("");
  const [ngoPhoneNo, setNgoPhoneNo] = useState("");
  const [ngoWebsite, setNgoWebsite] = useState("");
  const [ngoEmail, setNgoEmail] = useState("");
  const [verificationDoc, setVerificationDoc] = useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/Login");
      } else {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setProfilePic(currentUser.photoURL || null);

        // Fetch existing NGO data if available
        await fetchNgoData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", sidebarOpen.toString());
    }
  }, [sidebarOpen]);

  // Fetch existing NGO data from MongoDB
  const fetchNgoData = async (firebaseUid) => {
    try {
      const res = await axios.get(`/api/ngo?firebaseUid=${firebaseUid}`);
      if (res.status === 200 && res.data) {
        const ngoData = res.data;
        setIsExistingNgo(true);

        // Populate form with existing data
        setNgoName(ngoData.ngoName || "");
        setNgoLocation(ngoData.ngoLocation || "");
        setNgoAddress(ngoData.ngoAddress || "");
        setNgoPhoneNo(ngoData.ngoPhoneNo || "");
        setNgoWebsite(ngoData.ngoWebsite || "");
        setNgoType(ngoData.ngoType || "");
        setNgoDescription(ngoData.ngoDescription || "");
        setNgoEmail(ngoData.ngoEmail || "");
        setVerificationDoc(ngoData.verificationDoc || null);
        if (ngoData.profilePic) setProfilePic(ngoData.profilePic);
      }
    } catch (error) {
      console.log("No existing NGO data found or error fetching:", error);
      setIsExistingNgo(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  // Handle UploadThing URL for profile picture
  const handleProfilePicUpload = (url) => {
    console.log("Profile picture uploaded:", url);
    setProfilePic(url);
  };

  // Handle UploadThing URL for verification document
  const handleDocumentUpload = (url) => {
    console.log("Document uploaded:", url);
    setVerificationDoc(url);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) return alert("Please log in first!");

      await updateProfile(user, { displayName: name, photoURL: profilePic });
      if (newPassword) await updatePassword(user, newPassword);

      const ngoData = {
        firebaseUid: user.uid,
        userId: user.uid,
        name,
        email: user.email,
        profilePic,
        ngoName,
        ngoLocation,
        ngoAddress,
        ngoPhoneNo,
        ngoWebsite,
        ngoType,
        ngoDescription,
        ngoEmail,
        verificationDoc,
        latitude,
        longitude,
      };

      const res = isExistingNgo
        ? await axios.put("/api/ngo", ngoData)
        : await axios.post("/api/ngo", ngoData);

      if (res.status === 200 || res.status === 201) {
        alert(
          isExistingNgo
            ? "NGO profile updated successfully!"
            : "NGO profile created successfully!"
        );
        setIsExistingNgo(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const L = require("leaflet");
    const map = L.map("map").setView([19.076, 72.8777], 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.marker([lat, lng]).addTo(map);

      setNgoLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      setNgoAddress(data.display_name || "Unknown location");
    });

    return () => map.remove();
  }, []);

  // ✅ Use My Location Button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // ✅ Save in state
        setLatitude(lat);
        setLongitude(lng);
        setNgoLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);

        // ✅ Reverse geocode for address
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        setNgoAddress(data.display_name || "Unknown location");

        // ✅ Update map + marker
        const L = require("leaflet");
        const map = mapRef.current;
        if (map) {
          map.setView([lat, lng], 13);
          if (markerRef.current) map.removeLayer(markerRef.current);
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
      },
      (err) => alert("Unable to fetch location: " + err.message)
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg font-medium"
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
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg bg-blue-800"
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

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            NGO Profile{" "}
            {isExistingNgo && (
              <span className="text-sm text-green-600">(Existing)</span>
            )}
          </h2>

          <form className="space-y-6" onSubmit={handleProfileUpdate}>
            {/* Profile Picture + User Info */}
            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg space-y-4">
              <Image
                src={profilePic || "/default-avatar.png"}
                width={120}
                height={120}
                alt="Profile Picture"
                className="rounded-full object-cover mb-2"
              />

              {/* Use FileUpload component for profile picture */}
              <div className="w-full max-w-xs">
                <label className="block text-gray-700 font-medium mb-2 text-center">
                  Change Profile Picture
                </label>
                <FileUpload onUploadComplete={handleProfilePicUpload} />
                {profilePic && (
                  <p className="text-xs text-green-600 mt-2 text-center break-all">
                    Current:{" "}
                    <a href={profilePic} target="_blank" className="underline">
                      View Image
                    </a>
                  </p>
                )}
              </div>

              <div className="w-full space-y-4 mt-2">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Email (Cannot be changed)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    className="border p-2 rounded w-full bg-gray-200 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be modified for security reasons
                  </p>
                </div>

                {/* Optional: Change Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>
            </div>

            {/* NGO Details */}
            <div className="p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">
                NGO Details
              </h3>

              {/* NGO Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  NGO Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter organization name"
                  required
                />
              </div>

              {/* Location */}
              {/* ✅ Map Section */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  NGO Location
                </label>
                <input
                  type="text"
                  value={ngoLocation}
                  onChange={(e) => setNgoLocation(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Click map or use current location"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 mb-3"
                >
                  Use My Current Location
                </button>
                <div id="map" className="h-64 w-full border rounded-lg">
                  {latitude && longitude && (
                    <p className="text-sm text-gray-700 mt-2">
                      📍 Coordinates: {latitude.toFixed(5)},{" "}
                      {longitude.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Other Fields */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  NGO Address
                </label>
                <textarea
                  value={ngoAddress}
                  onChange={(e) => setNgoAddress(e.target.value)}
                  className="border p-2 rounded w-full"
                  rows="2"
                />
              </div>

              {/* Phone no */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={ngoPhoneNo}
                  onChange={(e) => setNgoPhoneNo(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Website / Link (Optional)
                </label>
                <input
                  type="url"
                  value={ngoWebsite}
                  onChange={(e) => setNgoWebsite(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="https://example.org"
                />
              </div>

              {/* NGO Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Type of NGO <span className="text-red-500">*</span>
                </label>
                <select
                  value={ngoType}
                  onChange={(e) => setNgoType(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Educational">Educational</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Animal Welfare">Animal Welfare</option>
                  <option value="Human Rights">Human Rights</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={ngoDescription}
                  onChange={(e) => setNgoDescription(e.target.value)}
                  className="border p-2 rounded w-full"
                  rows="3"
                  placeholder="Briefly describe your organization's mission"
                />
              </div>

              {/* NGO Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  NGO Email
                </label>
                <input
                  type="email"
                  value={ngoEmail}
                  onChange={(e) => setNgoEmail(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="contact@ngo.org"
                />
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Verification Document <span className="text-red-500">*</span>
                </label>
                <FileUpload onUploadComplete={handleDocumentUpload} />
                {verificationDoc && (
                  <p className="text-sm text-green-600 mt-1 break-all">
                    Uploaded:{" "}
                    <a
                      href={verificationDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      View Document
                    </a>
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Upload NGO registration certificate, trust deed, or valid
                  proof.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white p-3 rounded-lg mt-4 font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              {loading
                ? "Saving..."
                : isExistingNgo
                ? "Update Profile"
                : "Create Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
