'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthModal from './AuthModal';
import Cart from './Cart';
import useAuth from '@/app/stores/useAuth';
import useWishlist from '@/app/stores/useWishlist';
import useCart from '@/app/stores/useCart';
import useSiteSettings from '@/app/stores/useSiteSettings';

export default function Navbar() {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { getTotalItems, toggleCart } = useCart();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if we're at the top of the page
      setIsAtTop(currentScrollY < 10);

      // Determine scroll direction
      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  const handleLogout = async () => {
    // Call the logout function from the auth store
    // This now handles both client state reset and server-side cookie clearing
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and validate search query
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      // Navigate to search results page with query
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);

      // Reset search input
      setSearchQuery('');
    }
  };
  console.log('settings', settings);
  const logoUrl = settings?.logoUrl || '/images/logo1.png';
  const siteName = settings?.siteName || 'Andaz E Nu';
  const contactPhone = settings?.contactPhone || '+92 319 6557338';
  return (
    <>
      {/* Announcement Bar - only shows when at top of page */}
      {isAtTop && (
        <div className="bg-black text-white py-2">
          <div className="mx-auto px-15 flex justify-between items-center">
            <div className="text-sm text-center w-full md:w-auto">
              Free shipping on all orders over Rs. 5,000
            </div>
            <div className="hidden md:block text-sm">Call or Whatsapp: {contactPhone}</div>
          </div>
        </div>
      )}

      {/* Main Navbar - with scroll behavior */}
      <header
        className={`bg-white sticky top-0 z-50 transition-transform duration-300 ${
          scrollDirection === 'down' && !isAtTop ? '-translate-y-full' : 'translate-y-0'
        } shadow-sm`}
      >
        <div className="px-4 md:px-8 lg:px-12">
          <div className="flex justify-between items-center py-2 text-black">
            {/* Logo */}
            <Link href="/" className="flex items-center text-black">
              <div className="mr-2">
                <img src={logoUrl} alt={siteName} className="h-12" />
              </div>
            </Link>

            {/* Main Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* <Link href="/" className="text-gray-700 hover:text-black font-medium">
                Home
              </Link> */}
              <Link
                href="/collection/all-collections"
                className="text-gray-700 hover:text-black font-medium flex items-center"
              >
                All Collections
              </Link>
              <Link
                href="/collection/mens-collection"
                className="text-gray-700 hover:text-black font-medium flex items-center"
              >
                Men&apos;s
              </Link>
              <Link
                href="/collection/kids-collection"
                className="text-gray-700 hover:text-black font-medium flex items-center"
              >
                Kid&apos;s
              </Link>
              <Link href="/custom-design" className="text-gray-700 hover:text-black font-medium">
                Custom Design
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-black font-medium">
                Contact
              </Link>
            </nav>

            {/* Right Side Elements */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <form onSubmit={handleSearch} className="w-full">
                  <input
                    type="text"
                    placeholder="I'm looking for..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-48"
                  />
                  <button type="submit" className="absolute right-2 top-1/4 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    aria-label="Account"
                    className="text-gray-700 hover:text-black flex items-center cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="px-4 py-2 text-xs text-gray-500">Logged in as:</div>
                    <div className="px-4 py-1 text-sm font-medium truncate">{user?.email}</div>
                    <div className="border-t my-2"></div>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Orders
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  aria-label="Account"
                  className="text-gray-700 hover:text-black cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              )}

              {/* Wishlist - only on desktop */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hidden cursor-pointer md:block text-gray-700 hover:text-black"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                aria-label="Shopping cart"
                className="text-gray-700 cursor-pointer hover:text-black relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {(getTotalItems() || 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-gray-700 hover:text-black cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 bg-white transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button className="text-gray-800" onClick={() => setIsMenuOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="I'm looking for..."
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
            <button className="absolute right-3 top-2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                href="/"
                className="block py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/collection/all-collections"
                className="block py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                All Collections
              </Link>
            </li>
            <li>
              <Link
                href="/collection/mens-collection"
                className="block py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Men's Collection
              </Link>
            </li>
            <li>
              <Link
                href="/collection/kids-collection"
                className="block py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Kids Collection
              </Link>
            </li>
            <li>
              <Link
                href="/custom-design"
                className="block py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Custom Design
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/wishlist"
                className="flex items-center py-2 text-gray-800 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
                {wishlistItems.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="border-t mt-2 pt-2">
                  <Link
                    href="/orders"
                    className="block py-2 text-gray-800 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Orders
                  </Link>
                </li>
                {user?.isAdmin && (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className="block py-2 text-gray-800 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block py-2 text-gray-800 font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
            {!isAuthenticated && (
              <li className="border-t mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="block py-2 text-gray-800 font-medium w-full text-left"
                >
                  Login
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Cart Sidebar */}
      <Cart />
    </>
  );
}
