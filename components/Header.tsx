"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, User, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useAuth } from "@/contexts/AuthContext"
import SearchBar from "./SearchBar"
import CartDropdown from "./CartDropdown"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, logout } = useAuth()
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const categories = [
    { name: "Clothing", href: "/category/clothing", hasSubmenu: false },
    { name: "Electronics", href: "/category/electronics" },
    { name: "Groceries", href: "/category/groceries" },
    { name: "Footwear", href: "/category/footwear", hasSubmenu: false },
    { name: "Home & Garden", href: "/category/home-garden" },
    { name: "Sports", href: "/category/sports" },
  ]

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      {/* <div className="bg-gray-900 text-white py-2"> */}
        {/* <div className="container mx-auto px-4 text-center text-sm">Free shipping on orders over $50! 🚚</div> */}
      {/* </div> */}

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ClickCart
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
                <User className="h-5 w-5" />
                <span>{user ? user.name : "Account"}</span>
              </Button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {user ? (
                    <>
                      <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Account
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Orders
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Login
                      </Link>
                      <Link href="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <CartDropdown />

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search bar - Mobile */}
        <div className="md:hidden mt-4">
          <SearchBar />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-center space-x-8 py-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="relative group"
                onMouseEnter={() => category.hasSubmenu && setActiveSubmenu(category.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  href={category.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
                >
                  {category.name}
                  {category.hasSubmenu && <ChevronDown className="h-4 w-4 ml-1" />}
                </Link>

                {category.hasSubmenu && activeSubmenu === category.name && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-2">
                      {category.name === "Clothing" && (
                        <>
                          <Link
                            href="/category/clothing/men"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Men's Clothing
                          </Link>
                          <Link
                            href="/category/clothing/women"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Women's Clothing
                          </Link>
                          <Link
                            href="/category/clothing/kids"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Kids' Clothing
                          </Link>
                        </>
                      )}
                      {category.name === "Footwear" && (
                        <>
                          <Link
                            href="/category/footwear/men"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Men's Shoes
                          </Link>
                          <Link
                            href="/category/footwear/women"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Women's Shoes
                          </Link>
                          <Link
                            href="/category/footwear/kids"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Kids' Shoes
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
