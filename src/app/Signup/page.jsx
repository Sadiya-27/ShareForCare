"use client";
import { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  // --- Email Signup Handler ---
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await updateProfile(userCred.user, { displayName: form.name });
      alert("Signup successful!");
      router.push("/Login");
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Google Signup/Login Handler ---
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      alert(`Welcome ${user.displayName || "User"}!`);
      router.push("/Login");
    } catch (err) {
      setError(err.message);
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
            <h1 className="text-3xl font-bold text-blue-900" href="/">
              Share<i>For</i>Care
            </h1>
          </Link>
        </div>
        <h2 className="text-2xl font-semibold text-center text-blue-900 mb-4">
          Create Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full border rounded-lg p-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border rounded-lg p-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border rounded-lg p-3"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Google Auth Button */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">or sign up with</p>
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-gray-700 font-medium">Google</span>
          </button>
        </div>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a
            href="/Login"
            className="text-blue-900 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
