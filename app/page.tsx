"use client"

import { Suspense } from "react"
import FeaturedProducts from "@/components/FeaturedProducts"
import CategoryGrid from "@/components/CategoryGrid"
import Newsletter from "@/components/Newsletter"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Modern Hero Banner */}
      <section className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#f8fafc] via-[#e0c3fc] to-[#8ec5fc] rounded-b-3xl mb-12 h-[420px] overflow-hidden">
        {/* Left: Text Content */}
        <div className="flex-1 px-8 md:px-16 py-10 z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#232946] mb-4 leading-tight">
            Discover the Latest in <br />
            <span className="text-[#6a4cff]">Fashion & Lifestyle</span>
          </h1>
          <p className="text-lg text-[#4b5563] mb-8 max-w-lg">
            Shop trending clothes, shoes, bags, accessories, and more. Curated collections for every style and season—find your perfect look today!
          </p>
          <div className="flex gap-4">
            <button
              className="bg-[#6a4cff] text-white font-semibold px-6 py-2 rounded shadow hover:bg-[#232946] hover:text-white transition"
              onClick={() => {
                const el = document.getElementById("featured");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Shop Now
            </button>
            <button
              className="bg-transparent border border-[#6a4cff] text-[#6a4cff] font-semibold px-6 py-2 rounded hover:bg-[#6a4cff] hover:text-white transition"
              onClick={() => {
                const el = document.getElementById("categories");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Browse Categories
            </button>
          </div>
        </div>
        {/* Right: Product Image */}
        <div className="flex-1 flex justify-center items-center relative h-full">
          <div className="w-[350px] h-[350px] bg-white rounded-2xl shadow-2xl flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80"
              alt="Fashion Banner"
              className="w-[300px] h-auto object-contain drop-shadow-xl"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  )
}
