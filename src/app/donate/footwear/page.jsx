"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { LogOut, Home, Users, Gift, Repeat, User, Menu } from "lucide-react";

export default function DonateFootwear() {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDonateDropdown, setShowDonateDropdown] = useState(true);
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Donation submitted!");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar (same as DonateCloths) */}
      <aside
        className={`bg-blue-900 text-white flex flex-col justify-between h-screen w-64 transition-transform duration-300 z-50 fixed md:sticky md:top-0 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:flex`}
      >
        <div>
          <div className="flex items-center gap-2 px-4 py-4 cursor-pointer" onClick={() => router.push("/Dashboard")}>
            <Image src="/logo3.png" width={50} height={50} alt="Logo" className="rounded-xl" />
            <h1 className="text-2xl font-semibold">Share<i>For</i>Care</h1>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            <button onClick={() => router.push("/Dashboard")} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg font-medium bg-blue-800"><Home size={20} /> Home</button>
            <button onClick={() => router.push("/join")} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"><Users size={20} /> Join</button>
            <div className="px-4 py-2">
              <button onClick={() => setShowDonateDropdown((prev) => !prev)} className="flex items-center justify-between w-full gap-2 hover:bg-blue-700 rounded-lg px-4 py-2 bg-blue-800 text-white">
                <div className="flex items-center gap-2"><Gift size={20} /> Donate</div>
                <span>{showDonateDropdown ? "▲" : "▼"}</span>
              </button>
              {showDonateDropdown && (
                <div className="ml-4 mt-2 flex flex-col gap-1 bg-blue-900 rounded-md shadow-md">
                  <button onClick={() => router.push("/donate/cloths")} className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md">Cloths</button>
                  <button onClick={() => router.push("/donate/footwear")} className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md">Footwear</button>
                  <button onClick={() => router.push("/donate/school-supplies")} className="text-sm text-white hover:bg-blue-700 px-3 py-2 text-left rounded-md">School Supplies</button>
                </div>
              )}
            </div>
            <button onClick={() => router.push("/recycle")} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"><Repeat size={20} /> Recycle</button>
            <button onClick={() => router.push("/profile")} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 rounded-lg"><User size={20} /> Profile</button>
          </nav>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            {user?.photoURL && <Image src={user.photoURL} width={40} height={40} alt="User" className="rounded-full border-2 border-blue-300" />}
            <button onClick={handleLogout} className="text-blue-900 bg-blue-300 px-3 py-2 rounded-xl hover:bg-blue-200 flex items-center gap-2"><LogOut size={18} /> Logout</button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden flex items-center justify-between bg-blue-900 p-3 shadow-md">
        <div className="flex items-center gap-2">
          <Image src="/logo3.png" width={40} height={40} alt="Logo" className="rounded-xl" />
          <h1 className="text-white font-semibold text-lg">Share<i>For</i>Care</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 rounded-md hover:bg-blue-700 transition"><Menu size={24} /></button>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="flex-1 p-6 md:mx-40 mt-16 md:mt-0">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">Donate Footwear</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="w-full h-40 border-2 border-dashed border-gray-300 flex justify-center items-center rounded-lg cursor-pointer bg-gray-100">
              {image ? <Image src={image} alt="Upload" width={200} height={200} className="object-cover" /> : <span className="text-gray-400">Click to upload image</span>}
              <input type="file" className="hidden" onChange={handleImageChange} />
            </label>
            <input type="text" placeholder="Pickup Location*" className="border p-2 rounded w-full" required />
            <input type="text" placeholder="Pickup Address*" className="border p-2 rounded w-full" required />
            <input type="text" placeholder="Footwear Type*" className="border p-2 rounded w-full" required />
            <input type="text" placeholder="Quantity*" className="border p-2 rounded w-full" required />
            <input type="date" placeholder="Pickup Date*" className="border p-2 rounded w-full" required />
            <input type="time" placeholder="Pickup Time Till*" className="border p-2 rounded w-full" required />
            <button type="submit" className="w-full bg-blue-900 text-white p-3 rounded-lg">Submit</button>
          </form>
        </div>
      </main>
    </div>
  );
}
