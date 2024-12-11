'use client'

import { useState , useEffect} from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smile, Meh, Frown, Brain, Star, TrendingUp, Search, Menu, X, Facebook, Twitter, Instagram, Linkedin, User2, LogOut, ShoppingBag } from 'lucide-react'
import {useRouter} from 'next/navigation';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, signInWithPopup, updateProfile, signOut , onAuthStateChanged , User} from 'firebase/auth'

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

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); 
    });

    return () => unsubscribe();
  }, []);
  const handleLogout = async () => {
    if (!user) {
      // If no user is logged in, return early and do nothing
      return;
    }

    try {
      await signOut(auth); // Sign out the user
      setUser(null); // Update user state to null after logging out
      router.push('/auth'); // Redirect to auth page or another page after logging out
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-purple-700">PakFashionAI</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-purple-700">Home</Link>
              <Link href="/product-search" className="text-gray-600 hover:text-purple-700">Search</Link>
              <Link href="/ai-brand-rankings" className="text-gray-600 hover:text-purple-700">Brand Rankings</Link>
              <Link href="/about" className="text-purple-700 hover:text-purple-900 font-semibold">About</Link>
              <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
              
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <User2 className="h-5 w-5" />
                <span className="sr-only">User account</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Shopping bag</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5"/>
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
            <div className="md:hidden">
              {user && (
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5"/>
                  <span className="sr-only">Log Out</span>
                </Button>
              )}
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4">
              <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-600 hover:text-purple-700">Home</Link>
              <Link href="/product-search" className="text-gray-600 hover:text-purple-700">Search</Link>
              <Link href="/ai-brand-rankings" className="text-gray-600 hover:text-purple-700">Brand Rankings</Link>
              <Link href="/about" className="text-purple-700 hover:text-purple-900 font-semibold">About</Link>
              <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
              </nav>
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <User2 className="h-5 w-5" />
                  <span className="sr-only">User account</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Shopping bag</span>
                </Button>
                {user && (
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5"/>
                    <span className="sr-only">Log Out</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">About Fashion Fusion</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Our Mission</h2>
          <p className="text-lg mb-4">
            At Fashion Fusion, we are revolutionizing the way Pakistani fashion brands are evaluated and ranked. Our mission is to provide consumers with unbiased, emotion-driven insights into the quality, style, value, and service of Pakistan's top fashion brands.
          </p>
          <p className="text-lg">
            By harnessing the power of artificial intelligence and natural language processing, we analyze thousands of customer reviews to capture the true sentiment behind each brand experience. This innovative approach allows us to go beyond simple star ratings, offering a nuanced understanding of what customers really feel about their fashion purchases.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">How Our AI Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-purple-500" />
                  Emotion Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our AI processes the language used in customer reviews, identifying and categorizing emotions expressed about different aspects of each brand and its products.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-6 h-6 mr-2 text-purple-500" />
                  Scoring Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>We evaluate brands across four key areas: Quality, Style, Value, and Customer Service. Each category is scored based on the emotional intensity and frequency of related comments.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-purple-500" />
                  Emotional Weighting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our algorithm weighs emotions differently based on their intensity. Strong positive or negative sentiments have a greater impact on the overall score than neutral comments.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-6 h-6 mr-2 text-purple-500" />
                  Continuous Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our AI model continuously learns from new reviews, adapting to changes in language use and emerging fashion trends to provide up-to-date and relevant rankings.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Understanding Our Scores</h2>
          <p className="text-lg mb-4">
            Our emotion-based scoring system provides a comprehensive view of brand performance. Here is how to interpret our scores:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center p-4">
                <Smile className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <h3 className="font-semibold">8.5 - 10.0</h3>
                  <p>Very Positive Sentiment</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Meh className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <h3 className="font-semibold">7.0 - 8.4</h3>
                  <p>Neutral to Positive Sentiment</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Frown className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Below 7.0</h3>
                  <p>Needs Improvement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Benefits for Consumers and Brands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>For Consumers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Make informed decisions based on genuine customer emotions</li>
                  <li>Discover brands that truly resonate with customer experiences</li>
                  <li>Understand the strengths and weaknesses of each brand across different aspects</li>
                  <li>Save time by quickly identifying top-performing brands in specific categories</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>For Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Gain deep insights into customer sentiments and emotions</li>
                  <li>Identify areas of excellence and opportunities for improvement</li>
                  <li>Track emotional trends in customer feedback over time</li>
                  <li>Benchmark performance against competitors in specific emotional categories</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Our Commitment</h2>
          <p className="text-lg mb-4">
            At PakFashionAI, we are committed to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-lg">
            <li>Providing unbiased, AI-driven insights into Pakistani fashion brands</li>
            <li>Continuously improving our emotion analysis algorithms</li>
            <li>Maintaining transparency in our ranking methodology</li>
            <li>Protecting user privacy and data security</li>
            <li>Fostering a more emotionally-aware and customer-centric fashion industry in Pakistan</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Join Us in Revolutionizing Fashion Reviews</h2>
          <p className="text-lg mb-4">
            Whether you are a fashion enthusiast, a brand representative, or simply curious about the intersection of AI and fashion, we invite you to explore our rankings, contribute your reviews, and be part of this exciting journey in reshaping how we understand and evaluate fashion brands in Pakistan.
          </p>
          <div className="flex justify-center">
            <Link href="/ai-brand-rankings">
              <Button size="lg" className="text-lg">
                Explore AI Brand Rankings
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-sm">We use AI to analyze emotional content in customer reviews, providing nuanced rankings of Pakistani fashion brands.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm hover:underline">Home</Link></li>
                <li><Link href="/product-search" className="text-sm hover:underline">Top Brands</Link></li>
                <li><Link href="/ai-brand-rankings" className="text-sm hover:underline">AI Rankings</Link></li>
                <li><Link href="/about" className="text-sm hover:underline">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">AI-Powered Rankings</h3>
              <p className="text-sm">Our advanced AI analyzes the emotional content of thousands of customer reviews to provide unbiased, sentiment-based brand rankings.</p>
              <div className="flex items-center mt-2">
                <Smile className="w-5 h-5 text-yellow-400 mr-1" />
                <Meh className="w-5 h-5 text-yellow-400 mr-1" />
                <Frown className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-gray-300"><Facebook /></a>
                <a href="#" className="hover:text-gray-300"><Twitter /></a>
                <a href="#" className="hover:text-gray-300"><Instagram /></a>
                <a href="#" className="hover:text-gray-300"><Linkedin /></a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm">&copy; 2024 Fashion Fusion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}