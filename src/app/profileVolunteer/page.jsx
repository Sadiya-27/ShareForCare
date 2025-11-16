"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { LogOut, Home, Users, Gift, Repeat, User, Package } from "lucide-react";
import FileUpload from "../components/FileUpload";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

export default function ProfileVolunteerPage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExistingVolunteer, setIsExistingVolunteer] = useState(false);
  const [showDonateDropdown, setShowDonateDropdown] = useState(false);
  const [L, setL] = useState(null);

  // Volunteer-specific fields
  const [phoneNo, setPhoneNo] = useState("");
  const [volunteerLocation, setVolunteerLocation] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      setL(leaflet);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/Login");
      } else {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setProfilePic(currentUser.photoURL || null);
        await fetchVolunteerData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch Volunteer Profile
  const fetchVolunteerData = async (firebaseUid) => {
    try {
      const res = await axios.get(`/api/volunteer?firebaseUid=${firebaseUid}`);
      if (res.status === 200 && res.data) {
        const v = res.data;
        setIsExistingVolunteer(true);
        setPhoneNo(v.phoneNo || "");
        setVolunteerLocation(v.location || "");
        setAddress(v.address || "");
        setAge(v.age || "");
        setGender(v.gender || "");
        setSkills(v.skills?.join(", ") || "");
        setAvailability(v.availability || "");
        setExperience(v.experience || "");
        setMotivation(v.motivation || "");
        setVerificationDoc(v.verificationDoc || null);
        if (v.profilePic) setProfilePic(v.profilePic);
      }
    } catch (err) {
      console.log("No existing Volunteer data found:", err);
      setIsExistingVolunteer(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  const handleProfilePicUpload = (url) => {
    setProfilePic(url);
  };

  const handleDocumentUpload = (url) => {
    setVerificationDoc(url);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) {
        alert("Please log in first!");
        return;
      }

      await updateProfile(user, {
        displayName: name,
        photoURL: profilePic,
      });

      if (newPassword) {
        await updatePassword(user, newPassword);
        alert("Password updated successfully!");
      }

      const volunteerData = {
        firebaseUid: user.uid,
        userId: user.uid,
        name,
        email: user.email,
        profilePic,
        phoneNo,
        location,
        latitude,
        longitude,
        address,
        age,
        gender,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        availability,
        experience,
        motivation,
        verificationDoc,
      };

      let res;
      if (isExistingVolunteer) {
        res = await axios.put("/api/volunteer", volunteerData);
        if (res.status === 200)
          alert("Volunteer profile updated successfully!");
      } else {
        res = await axios.post("/api/volunteer", volunteerData);
        if (res.status === 201) {
          alert("Volunteer profile created successfully!");
          setIsExistingVolunteer(true);
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(
        err.response?.data?.message || "Error updating profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !L) return;

    const map = L.map("map").setView([19.076, 72.8777], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    let marker;

    // Function to update map with current coordinates
    const updateMap = (lat, lng) => {
      map.setView([lat, lng], 14);
      if (marker) marker.remove();
      marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("You are here!")
        .openPopup();
    };

    // If we already have coordinates (from “Use My Current Location” button)
    if (latitude && longitude) {
      updateMap(latitude, longitude);
    } else if (navigator.geolocation) {
      // Get live geolocation
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setLatitude(lat);
          setLongitude(lng);
          updateMap(lat, lng);
        },
        (err) => {
          console.error("Location access denied:", err);
          map.setView([19.076, 72.8777], 12);
        }
      );
    }

    return () => map.remove();
  }, [L, latitude, longitude]); // 👈 triggers map update when coords change

  return (
    <div className="flex min-h-screen bg-gray-50">
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
              className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-blue-700"
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700"
            >
              <User size={20} /> Profile
            </button>

            <button
              onClick={() => router.push("/donationVolunteer")}
              className="flex items-center gap-2 px-4 rounded-lg py-2 hover:bg-blue-700"
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

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-6 mt-16 md:mt-0">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Volunteer Profile{" "}
            {isExistingVolunteer && (
              <span className="text-sm text-green-600">(Existing)</span>
            )}
          </h2>

          <form className="space-y-6" onSubmit={handleProfileUpdate}>
            {/* Profile Picture */}
            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg space-y-4">
              <Image
                src={profilePic || "/default-avatar.png"}
                width={120}
                height={120}
                alt="Profile"
                className="rounded-full object-cover"
              />
              <FileUpload onUploadComplete={handleProfilePicUpload} />
              {profilePic && (
                <p className="text-xs text-green-600">
                  Current:{" "}
                  <a href={profilePic} target="_blank" className="underline">
                    View Image
                  </a>
                </p>
              )}
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="border p-2 rounded w-full bg-gray-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {/* Volunteer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">
                Volunteer Details
              </h3>

              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Location (Select on Map)
                </label>
                <input
                  type="text"
                  value={volunteerLocation}
                  onChange={(e) => setVolunteerLocation(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Search or select location"
                />

                {/* ✅ New Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          setLatitude(lat);
                          setLongitude(lng);
                          setVolunteerLocation(
                            `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                          );

                          // Reverse geocode address
                          const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                          );
                          const data = await res.json();
                          setAddress(data.display_name || "Unknown location");
                        },
                        (err) =>
                          alert("Unable to fetch location: " + err.message)
                      );
                    }
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 mb-3"
                >
                  Use My Current Location
                </button>

                <div
                  id="map"
                  className="h-64 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  {latitude && longitude && (
                    <p className="text-sm text-gray-600 mt-2">
                      📍 Coordinates: {latitude.toFixed(5)},{" "}
                      {longitude.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>

              <textarea
                rows="2"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border p-2 rounded w-1/2"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="border p-2 rounded w-1/2"
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Skills (comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <input
                type="text"
                placeholder="Availability (e.g., Weekends, Full-time)"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <textarea
                rows="2"
                placeholder="Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <textarea
                rows="3"
                placeholder="Motivation / Why do you want to volunteer?"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Verification Document
                </label>
                <FileUpload onUploadComplete={handleDocumentUpload} />
                {verificationDoc && (
                  <p className="text-sm text-green-600 mt-1">
                    Uploaded:{" "}
                    <a
                      href={verificationDoc}
                      target="_blank"
                      className="underline"
                    >
                      View Document
                    </a>
                  </p>
                )}
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
                : isExistingVolunteer
                ? "Update Profile"
                : "Create Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
