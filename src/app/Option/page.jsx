"use client";

import { useState } from "react";
import { auth } from "../lib/firebase"; // your firebase setup
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Heart } from "lucide-react";

export default function OptionPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Update role handler ---
  const handleRoleSelect = async (selectedRole) => {
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to select a role.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update role");
      } else {
        alert(`Role updated to ${selectedRole}`);
        if (selectedRole === "NGO") {
          router.push("/DashboardNGO");
        } else if (selectedRole === "Volunteer") {
          router.push("/DashboardVolunteer");
        } else {
          alert("Something went Wrong try again later")
        } // redirect after role selection
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl my-4 mx-4 md:mx-auto w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo3.png"
            alt="ShareForCare Logo"
            width={80}
            height={80}
            className="rounded-xl mb-2"
          />
          <Link href="/">
            <h1 className="text-3xl font-bold text-blue-900">
              Share<i>For</i>Care
            </h1>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-center text-blue-900 mb-4">
          Choose your role
        </h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <button
    className="flex items-center justify-center gap-2 w-full sm:w-1/2 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition"
    onClick={() => handleRoleSelect("NGO")}
    disabled={loading}
  >
    <Users className="w-5 h-5" />
    NGO
  </button>

  <button
    className="flex items-center justify-center gap-2 w-full sm:w-1/2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 transition"
    onClick={() => handleRoleSelect("Volunteer")}
    disabled={loading}
  >
    <Heart className="w-5 h-5" />
    Volunteer
  </button>
</div>
      </div>
    </div>
  );
}
