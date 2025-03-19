'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Smile, Meh, Frown, Menu, X, Facebook, Twitter, Instagram, Linkedin, User2, ShoppingBag, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth'
import { SentimentAPI } from '@/lib/api';

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

// Define Brand interface
interface Brand {
  id: string;
  name: string;
  image: string;
}

interface BrandRanking {
  overallScore: number;
  positiveScore: number;
  neutralScore: number;
  negativeScore: number;
  qualityEmotion: number;
  styleEmotion: number;
  valueEmotion: number;
  serviceEmotion: number;
  reviewCount: number;
}

interface BrandWithRanking extends Brand, BrandRanking {}

// Static brand data - in a real app, you'd fetch this from your database
const brandData: Brand[] = [
  { 
    id: "1", 
    name: "Khaadi", 
    image: "https://images.pexels.com/photos/5705080/pexels-photo-5705080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  },
  { 
    id: "2", 
    name: "Gul Ahmed", 
    image: "https://images.pexels.com/photos/5705090/pexels-photo-5705090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  },
  { 
    id: "3", 
    name: "Sana Safinaz", 
    image: "https://images.pexels.com/photos/12165038/pexels-photo-12165038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  },
  { 
    id: "4", 
    name: "Sapphire", 
    image: "https://images.pexels.com/photos/5705079/pexels-photo-5705079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  },
  { 
    id: "5", 
    name: "Alkaram", 
    image: "https://images.pexels.com/photos/2950650/pexels-photo-2950650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  },
];

export default function AIBrandRankingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<keyof BrandWithRanking>("overallScore");
  const [brands, setBrands] = useState<BrandWithRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Fetch brand rankings
  useEffect(() => {
    async function fetchRankings() {
      try {
        setLoading(true);
        
        // Fetch rankings from the sentiment API
        const rankingsData = await SentimentAPI.getBrandRankings();
        
        // Combine brand data with rankings
        const brandsWithRankings = brandData.map(brand => {
          const ranking = rankingsData[brand.id] || {
            overallScore: 0,
            positiveScore: 0,
            neutralScore: 0,
            negativeScore: 0,
            qualityEmotion: 0,
            styleEmotion: 0,
            valueEmotion: 0,
            serviceEmotion: 0,
            reviewCount: 0
          };
          
          return {
            ...brand,
            ...ranking
          };
        });
        
        setBrands(brandsWithRankings);
      } catch (err) {
        console.error('Error fetching brand rankings:', err);
        setError('Failed to load brand rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRankings();
  }, []);

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!user) return;

    try {
      await signOut(auth);
      setUser(null);
      router.push('/auth');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const sortedBrands = [...brands].sort(
    (a, b) => (b[sortBy] as number) - (a[sortBy] as number)
  );

  const getEmotionColor = (score: number) => {
    if (score >= 8.5) return "text-green-500"
    if (score >= 7) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-purple-700">FashionFusion</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-purple-700">Home</Link>
              <Link href="/product-search" className="text-gray-600 hover:text-purple-700">Search</Link>
              <Link href="/ai-brand-rankings" className="text-purple-700 hover:text-purple-900 font-semibold">Brand Rankings</Link>
              <Link href="/about" className="text-gray-600 hover:text-purple-700">About</Link>
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
                <Link href="/" className="text-gray-600 hover:text-purple-700">Home</Link>
                <Link href="/product-search" className="text-gray-600 hover:text-purple-700">Search</Link>
                <Link href="/ai-brand-rankings" className="text-purple-700 hover:text-purple-900 font-semibold">Brand Rankings</Link>
                <Link href="/about" className="text-gray-600 hover:text-purple-700">About</Link>
                <Link href="/auth" className="text-gray-600 hover:text-purple-700">Login/Signup</Link>
              </nav>
              <div className="flex items-center space-x-4 mt-4">
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
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">AI-Powered Pakistani Fashion Brand Rankings</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 bg-red-100 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as keyof BrandWithRanking)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overallScore">Overall Score</SelectItem>
                  <SelectItem value="qualityEmotion">Quality Emotion</SelectItem>
                  <SelectItem value="styleEmotion">Style Emotion</SelectItem>
                  <SelectItem value="valueEmotion">Value Emotion</SelectItem>
                  <SelectItem value="serviceEmotion">Service Emotion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sortedBrands.slice(0, 3).map((brand, index) => (
                <Card key={brand.id} className="overflow-hidden">
                  <img src={brand.image} alt={brand.name} className="w-full h-48 object-cover" />
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{brand.name}</span>
                      <span className="text-2xl font-bold text-purple-700">{brand.overallScore.toFixed(1)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Rank: #{index + 1} • {brand.reviewCount} reviews</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Positive</span>
                        <span className="text-sm font-medium text-green-500">{brand.positiveScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={brand.positiveScore} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Neutral</span>
                        <span className="text-sm font-medium text-yellow-500">{brand.neutralScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={brand.neutralScore} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Negative</span>
                        <span className="text-sm font-medium text-red-500">{brand.negativeScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={brand.negativeScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Overall Score</TableHead>
                      <TableHead className="text-right">Quality Emotion</TableHead>
                      <TableHead className="text-right">Style Emotion</TableHead>
                      <TableHead className="text-right">Value Emotion</TableHead>
                      <TableHead className="text-right">Service Emotion</TableHead>
                      <TableHead className="text-right">Reviews</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBrands.map((brand, index) => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{brand.name}</TableCell>
                        <TableCell className="text-right font-bold">{brand.overallScore.toFixed(1)}</TableCell>
                        <TableCell className={`text-right ${getEmotionColor(brand.qualityEmotion)}`}>
                          {brand.qualityEmotion.toFixed(1)}
                        </TableCell>
                        <TableCell className={`text-right ${getEmotionColor(brand.styleEmotion)}`}>
                          {brand.styleEmotion.toFixed(1)}
                        </TableCell>
                        <TableCell className={`text-right ${getEmotionColor(brand.valueEmotion)}`}>
                          {brand.valueEmotion.toFixed(1)}
                        </TableCell>
                        <TableCell className={`text-right ${getEmotionColor(brand.serviceEmotion)}`}>
                          {brand.serviceEmotion.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {brand.reviewCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <section id="about" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-700">About Our AI-Powered Ranking System</h2>
              <p className="mb-4">
                Our brand rankings are powered by advanced AI algorithms that analyze the emotional content of user reviews. 
                By processing thousands of customer feedback points, we provide a nuanced and sentiment-based evaluation of 
                Pakistani fashion brands.
              </p>
              <h3 className="text-xl font-semibold mb-2 text-purple-600">How It Works:</h3>
              <ul className="list-disc pl-5 mb-4">
                <li><strong>Emotion Analysis:</strong> Our AI examines the language used in reviews to detect emotions and sentiments.</li>
                <li><strong>Scoring Categories:</strong> We evaluate brands across four key areas: Quality, Style, Value, and Customer Service.</li>
                <li><strong>Emotional Weighting:</strong> Scores are weighted based on the intensity of emotions expressed in reviews.</li>
                <li><strong>Overall Score:</strong> A comprehensive score is calculated, considering all emotional factors and category scores.</li>
              </ul>
              <h3 className="text-xl font-semibold mb-2 text-purple-600">Understanding the Scores:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center">
                  <Smile className="w-6 h-6 text-green-500 mr-2" />
                  <span>8.5-10: Very Positive</span>
                </div>
                <div className="flex items-center">
                  <Meh className="w-6 h-6 text-yellow-500 mr-2" />
                  <span>7.0-8.4: Neutral to Positive</span>
                </div>
                <div className="flex items-center">
                  <Frown className="w-6 h-6 text-red-500 mr-2" />
                  <span>Below 7.0: Needs Improvement</span>
                </div>
              </div>
              <p>
                Our AI-driven approach ensures that the rankings reflect not just quantitative ratings, but the true emotional 
                responses of customers to their experiences with these fashion brands.
              </p>
            </section>
          </>
        )}
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
                <li><Link href="/search" className="text-sm hover:underline">Top Brands</Link></li>
                <li><Link href="/search" className="text-sm hover:underline">Latest Reviews</Link></li>
                <li><Link href="/search" className="text-sm hover:underline">Write a Review</Link></li>
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