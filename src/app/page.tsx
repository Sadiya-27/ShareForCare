"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Link as ScrollLink, animateScroll as scroll } from "react-scroll"; // 👈 Smooth scroll import
import Link from "next/link";
import { Package, Building2, Truck } from "lucide-react";
import {
  Users,
  BadgeCheck,
  MapPin,
  CalendarClock,
  PackageSearch,
  LayoutDashboard,
} from "lucide-react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-blue-100 min-h-screen pt-6 scroll-smooth">
      {/* Navbar */}
      <nav className="flex items-center justify-between shadow-xl rounded-2xl mx-4 mb-3 bg-blue-900 px-4 py-2">
        {/* Logo and Title */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => scroll.scrollToTop({ duration: 500 })}
        >
          <Image
            src="/logo3.png"
            width={60}
            height={60}
            alt="ShareForCare logo"
            className="rounded-2xl"
          />
          <h1 className="text-3xl text-white font-semibold">
            Share<i>For</i>Care
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-white text-xl">
          <ScrollLink
            to="about"
            smooth={true}
            duration={600}
            offset={-80}
            className="hover:border-b-2 hover:border-b-blue-300 cursor-pointer"
          >
            About Us
          </ScrollLink>
          <ScrollLink
            to="howitworks"
            smooth={true}
            duration={600}
            offset={-80}
            className="hover:border-b-2 hover:border-b-blue-300 cursor-pointer"
          >
            How It Works
          </ScrollLink>
          <ScrollLink
            to="features"
            smooth={true}
            duration={600}
            offset={-80}
            className="hover:border-b-2 hover:border-b-blue-300 cursor-pointer"
          >
            Features
          </ScrollLink>
        </div>

        {/* Buttons (Desktop) */}
        <div className="hidden md:flex gap-3 text-blue-900 font-semibold text-lg">
          <Link
            href="/Login"
            className=" bg-blue-300 px-6 py-2 rounded-2xl hover:bg-blue-200 cursor-pointer"
          >
            Login
          </Link>

          <Link
            href="/Signup"
            className=" bg-blue-300 px-6 py-2 rounded-2xl hover:bg-blue-200 cursor-pointer"
          >
            Signup
          </Link>
        </div>

        {/* Hamburger Icon (Mobile) */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      {/* Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-blue-900 text-white text-xl py-4 space-y-4 rounded-xl mx-4 mt-6 shadow-lg">
          {/* Mobile Links */}
          {["about", "howitworks", "features"].map((section, i) => (
            <ScrollLink
              key={i}
              to={section}
              smooth={true}
              duration={600}
              offset={-80}
              className="hover:border-b-2 hover:border-b-blue-300 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              {section === "about"
                ? "About Us"
                : section === "howitworks"
                ? "How It Works"
                : section.charAt(0).toUpperCase() + section.slice(1)}
            </ScrollLink>
          ))}

          {/* Login / Signup Buttons (Visible on Mobile) */}
          <div className="flex gap-3 text-blue-900 font-semibold text-lg mt-4">
            <Link
              href="/Login"
              className="bg-blue-300 px-6 py-2 rounded-2xl hover:bg-blue-200 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/Signup"
              className="bg-blue-300 px-6 py-2 rounded-2xl hover:bg-blue-200 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Signup
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section
        id="hero"
        className="flex flex-col md:flex-row items-center justify-between text-center md:text-left px-6 py-20 bg-blue-200 rounded-2xl mx-6 my-6"
      >
        {/* Left Content */}
        <div className="md:w-1/2 px-6 space-y-6">
          <h2 className="text-5xl font-bold text-blue-900 leading-tight">
            Give What You Can. <br /> Share For Care.
          </h2>
          <p className="text-xl text-gray-700 max-w-lg mx-auto md:mx-0">
            Connecting donors and NGOs to bring essentials—clothing, footwear,
            and school supplies—to those in need.
          </p>
          <div className="flex gap-4 text-xl justify-center md:justify-start">
            <ScrollLink
              to="donate"
              smooth={true}
              duration={600}
              offset={-80}
              className="bg-blue-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-800 cursor-pointer"
            >
              <Link href="/Signup">Donate Now</Link>
            </ScrollLink>
            <ScrollLink
              to="join"
              smooth={true}
              duration={600}
              offset={-80}
              className="bg-blue-300 text-blue-900 px-6 py-3 rounded-2xl hover:bg-blue-400 cursor-pointer"
            >
              <Link href="/Signup">Join as NGO</Link>
            </ScrollLink>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center mt-4 md:mt-0">
          <Image
            src="/volunteer.png"
            alt="Volunteering illustration"
            width={800}
            height={800}
            className="rounded-xl"
            priority
          />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="text-center py-16 px-6">
        <h3 className="text-4xl font-bold text-blue-900 mb-6">
          About ShareForCare
        </h3>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          ShareForCare is a transparent donation platform bridging the gap
          between generous donors and NGOs. Our goal is to make donating simple,
          efficient, and trustworthy through technology.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" className="bg-blue-50 py-16">
        <h3 className="text-4xl font-bold text-center text-blue-900 mb-10">
          How It Works
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          {/* Step 1 */}
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <Package size={48} className="text-blue-900" />
            </div>
            <h4 className="text-2xl font-semibold mb-2 text-blue-900">
              List Items
            </h4>
            <p className="text-gray-700">
              Donors upload clothing, shoes, or school supplies for donation.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <Building2 size={48} className="text-blue-900" />
            </div>
            <h4 className="text-2xl font-semibold mb-2 text-blue-900">
              NGO Requests
            </h4>
            <p className="text-gray-700">
              NGOs post their needs, and the system matches donors with suitable
              NGOs.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex justify-center mb-4">
              <Truck size={48} className="text-blue-900" />
            </div>
            <h4 className="text-2xl font-semibold mb-2 text-blue-900">
              Pickup / Drop-off
            </h4>
            <p className="text-gray-700">
              Donors schedule pickups or drop-offs.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-16 px-6 text-center">
        <h3 className="text-4xl font-bold text-blue-900 mb-10">
          Platform Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "User Management (Donor, NGO, Admin)",
              icon: <Users size={48} className="text-blue-900 mx-auto mb-4" />,
            },
            {
              title: "Verified NGO Profiles",
              icon: (
                <BadgeCheck size={48} className="text-blue-900 mx-auto mb-4" />
              ),
            },
            {
              title: "Google Maps Integration",
              icon: <MapPin size={48} className="text-blue-900 mx-auto mb-4" />,
            },
            {
              title: "Pickup & Drop Scheduling",
              icon: (
                <CalendarClock
                  size={48}
                  className="text-blue-900 mx-auto mb-4"
                />
              ),
            },
            {
              title: "Donation Tracking",
              icon: (
                <PackageSearch
                  size={48}
                  className="text-blue-900 mx-auto mb-4"
                />
              ),
            },
            {
              title: "Admin Dashboard",
              icon: (
                <LayoutDashboard
                  size={48}
                  className="text-blue-900 mx-auto mb-4"
                />
              ),
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              {feature.icon}
              <p className="text-lg text-gray-800 font-medium">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section id="impact" className="bg-blue-900 text-white py-16 text-center">
        <h3 className="text-4xl font-bold mb-8">Our Impact</h3>
        <div className="flex flex-col md:flex-row justify-center gap-10">
          <div>
            <h4 className="text-5xl font-bold">500+</h4>
            <p className="text-lg">Items Donated</p>
          </div>
          <div>
            <h4 className="text-5xl font-bold">200+</h4>
            <p className="text-lg">Verified NGOs</p>
          </div>
          <div>
            <h4 className="text-5xl font-bold">1000+</h4>
            <p className="text-lg">Happy Donors</p>
          </div>
        </div>
      </section>

      {/* JOIN SECTION */}
      <section
        id="join"
        className="text-center py-16 bg-gradient-to-b from-blue-50 to-white"
      >
        <h3 className="text-4xl font-bold text-blue-900 mb-6">
          Be Part of the Change
        </h3>
        <p className="text-lg text-gray-700 mb-6">
          Join ShareForCare to make a real difference in someone’s life.
        </p>

        {/* Image Section */}
        <div className="flex justify-center mb-8">
          <Image
            src="/volunteers-collecting-goods-charity-into-huge-donation-box-donating-coins-into-jar-donation-charity-donation-funds-gift-kind-concept.png"
            alt="Donation illustration"
            className="w-full max-w-3xl "
            width={600}
            height={600}
          />
        </div>

        {/* Buttons Section */}
        <div className="flex justify-center gap-4">
          <div className="flex gap-3 text-blue-900 font-semibold text-lg">
            <Link
              href="/Signup"
              className="bg-blue-300 px-6 py-2 rounded-2xl hover:bg-blue-200 cursor-pointer"
            >
              Join
            </Link>
            <Link
              href="/Signup"
              className="bg-blue-300 px-6 py-2 rounded-2xl hover:bg-blue-200 cursor-pointer"
            >
              Donate
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white py-8 text-center">
        <p>© {new Date().getFullYear()} ShareForCare. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-blue-300">
            Instagram
          </a>
          <a href="#" className="hover:text-blue-300">
            LinkedIn
          </a>
          <a href="#" className="hover:text-blue-300">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}
