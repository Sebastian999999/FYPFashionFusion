// src/components/ui/compare-indicator.tsx
"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SplitSquareHorizontal } from "lucide-react";
import { useCompare } from "@/components/providers/compare-provider";

export function CompareIndicator() {
  const { compareProducts } = useCompare();
  
  const count = compareProducts.length;
  const isActive = count > 0;
  
  return (
    <Link href="/compare" passHref>
      <Button 
        variant="ghost" 
        size="sm"
        disabled={!isActive}
        className={`relative ${isActive ? 'text-purple-700 hover:text-purple-900' : 'text-gray-400'}`}
      >
        <SplitSquareHorizontal className="mr-1 h-5 w-5" />
        <span>Compare</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </Button>
    </Link>
  );
}