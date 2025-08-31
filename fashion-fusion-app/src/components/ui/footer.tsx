// src/components/ui/footer.tsx
import Link from 'next/link';
import { Smile, Meh, Frown, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
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
          <p className="text-sm">&copy; 2025 FashionFusion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}