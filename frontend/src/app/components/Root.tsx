import { Outlet, Link, useLocation } from "react-router";
import { BookOpen, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export default function Root() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-blue-600">
              <BookOpen className="w-8 h-8" />
              <span className="font-semibold text-lg hidden sm:inline">Public Library</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/catalog"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/catalog") ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Catalog
              </Link>
              <Link
                to="/events"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/events") ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Events
              </Link>
              <Link
                to="/my-account"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/my-account") ? "text-blue-600" : "text-gray-700"
                }`}
              >
                My Account
              </Link>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-md">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="font-semibold">
                    Login/Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hours */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Branch Hours</h3>
              <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p className="text-sm text-gray-600">Saturday: 10:00 AM - 6:00 PM</p>
              <p className="text-sm text-gray-600">Sunday: 12:00 PM - 5:00 PM</p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact Us</h3>
              <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
              <p className="text-sm text-gray-600">Email: info@publiclibrary.org</p>
              <p className="text-sm text-gray-600">123 Library Street</p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  Support
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2026 Public Library Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}