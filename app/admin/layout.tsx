'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import useAuth from '@/app/stores/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top header - Fixed at the top */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link href="/admin/dashboard" className="ml-4 font-semibold text-lg">
                <img src="/images/logo1.png"   alt="logo" className="h-10" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:inline-block">
                Welcome, {user?.name || user?.email || 'Admin'}
              </span>
              <button
                onClick={() => logout()}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar and content - Add top padding for header */}
      <div className="flex pt-16 flex-1">
        {/* Sidebar - Fixed position */}
        <div
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
          } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 fixed top-16 bottom-0 left-0 z-10`}
        >
          <nav className="mt-5 px-2 h-full pb-20">
            <div className="space-y-1">
              {/* Dashboard */}
              <Link
                href="/admin/dashboard"
                className={`${
                  pathname === '/admin/dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <svg
                  className={`${
                    pathname === '/admin/dashboard' ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className={`${!isSidebarOpen && 'hidden md:hidden'}`}>Dashboard</span>
              </Link>

              {/* Products */}
              <Link
                href="/admin/products"
                className={`${
                  pathname.startsWith('/admin/products')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <svg
                  className={`${
                    pathname.startsWith('/admin/products') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m-8-4v10l8 4 8-4V7z"
                  />
                </svg>
                <span className={`${!isSidebarOpen && 'hidden md:hidden'}`}>Products</span>
              </Link>

              {/* Orders */}
              <Link
                href="/admin/orders"
                className={`${
                  pathname.startsWith('/admin/orders')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <svg
                  className={`${
                    pathname.startsWith('/admin/orders') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className={`${!isSidebarOpen && 'hidden md:hidden'}`}>Orders</span>
              </Link>

              {/* Users */}
              <Link
                href="/admin/users"
                className={`${
                  pathname.startsWith('/admin/users')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <svg
                  className={`${
                    pathname.startsWith('/admin/users') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className={`${!isSidebarOpen && 'hidden md:hidden'}`}>Users</span>
              </Link>

              {/* Settings */}
              <Link
                href="/admin/settings"
                className={`${
                  pathname.startsWith('/admin/settings')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <svg
                  className={`${
                    pathname.startsWith('/admin/settings') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className={`${!isSidebarOpen && 'hidden md:hidden'}`}>Settings</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Main content - with left margin to account for sidebar */}
        <div 
          className={`flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'ml-64' : 'ml-0 md:ml-16'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
} 