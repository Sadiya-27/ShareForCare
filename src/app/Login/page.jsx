"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google provider
  const provider = new GoogleAuthProvider();

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      alert("Login successful!");
      router.push("/Dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, provider);
      alert("Google login successful!");
      router.push("/Dashboard");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-2xl mx-4 md:mx-auto shadow-xl w-full max-w-md">
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
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
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
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition"
          >
            <Image src="/google.png" alt="Google icon" width={24} height={24} />
            <span className="font-medium">Sign in with Google</span>
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <a
            href="/Signup"
            className="text-blue-900 font-semibold hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
