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
import { LogOut, Home, Users, Gift, Repeat, User, Menu } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("Volunteer");
  const [newPassword, setNewPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [helpLink, setHelpLink] = useState("");
  const [phone, setPhone] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDonateDropdown, setShowDonateDropdown] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/Login");
      else {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setAccountType(currentUser.accountType || "Volunteer"); // custom field
        setProfilePic(currentUser.photoURL || null);
        setHelpLink(currentUser.helpLink || "");
        setPhone(currentUser.phoneNumber || "");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      setProfilePic(fileURL);
      // Optional: upload to storage here if needed
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await updateProfile(user, {
          displayName: name,
          photoURL: profilePic,
          accountType,
        });
        if (newPassword) {
          await updatePassword(user, newPassword);
          alert("Password updated successfully!");
        }
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between h-screen w-64 transition-transform duration-300 z-50 fixed md:sticky md:top-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        <div>
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
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg bg-blue-800"
            >
              <User size={20} /> Profile
            </button>
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6 md:mx-40 mt-16 md:mt-0">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">Profile</h2>

          <form className="space-y-4" onSubmit={handleProfileUpdate}>
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-4">
              <Image
                src={profilePic || "/default-avatar.png"}
                width={100}
                height={100}
                alt="Profile Picture"
                className="rounded-full object-cover mb-2"
              />
              <label className="cursor-pointer text-blue-900 font-medium">
                Change Profile Picture
                <input
                  type="file"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </label>
            </div>

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
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="border p-2 rounded w-full bg-gray-100"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option>Volunteer</option>
                <option>NGO</option>
                <option>Both</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Enter phone number"
              />
            </div>

            {/* Help / Contact */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Help / Contact Link
              </label>
              <input
                type="text"
                value={helpLink}
                onChange={(e) => setHelpLink(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Enter a link or email for help"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white p-3 rounded-lg"
            >
              Update Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
