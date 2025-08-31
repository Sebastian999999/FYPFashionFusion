// src/components/ui/navigation-bar.tsx
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { User2, ShoppingBag, LogOut, Menu, X } from 'lucide-react';
import { CompareIndicator } from "@/components/ui/compare-indicator";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlLplE7VlgZnIjBSz4Raup8jF_OsFMqGE",
  authDomain: "fypfashionfusion.firebaseapp.com",
  projectId: "fypfashionfusion",
  storageBucket: "fypfashionfusion.firebasestorage.app",
  messagingSenderId: "704360142609",
  appId: "1:704360142609:web:f71b16b0f211dde1b81eb0",
  measurementId: "G-B2Y77JTHBX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function NavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Handle login
  const handleLogin = () => {
    router.push('/auth');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled && !hovering ? 'bg-white/80 backdrop-blur-sm shadow-sm' : 'bg-white shadow-md'
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-purple-700">FashionFusion</h1>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Link 
              href="/" 
              className={`transition-colors duration-200 ${
                pathname === '/' 
                  ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/product-search" 
              className={`transition-colors duration-200 ${
                pathname === '/product-search' 
                  ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              Search
            </Link>
            <Link 
              href="/ai-brand-rankings" 
              className={`transition-colors duration-200 ${
                pathname === '/ai-brand-rankings' 
                  ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              Brand Rankings
            </Link>
            <Link 
              href="/about" 
              className={`transition-colors duration-200 ${
                pathname === '/about' 
                  ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              About
            </Link>
            <CompareIndicator />
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User2 className="h-5 w-5" />
                  <span className="sr-only">User account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel>
                      {user.displayName || user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogin}>
                      Login / Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Shopping bag</span>
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className={`transition-colors duration-200 ${
                  pathname === '/' 
                    ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/product-search" 
                className={`transition-colors duration-200 ${
                  pathname === '/product-search' 
                    ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/ai-brand-rankings" 
                className={`transition-colors duration-200 ${
                  pathname === '/ai-brand-rankings' 
                    ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Brand Rankings
              </Link>
              <Link 
                href="/about" 
                className={`transition-colors duration-200 ${
                  pathname === '/about' 
                    ? 'text-purple-700 hover:text-purple-900 font-semibold' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <CompareIndicator />
            </nav>
            <div className="flex items-center space-x-4 mt-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => router.push('/profile')}>
                    <User2 className="h-5 w-5 mr-2" />
                    Profile
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={handleLogin}>
                  <User2 className="h-5 w-5 mr-2" />
                  Login / Sign Up
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Shopping bag</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}