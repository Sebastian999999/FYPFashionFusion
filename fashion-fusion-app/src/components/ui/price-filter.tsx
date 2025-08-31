// src/components/ui/price-filter.tsx
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceFilterProps {
  showPriceIncreased: boolean;
  setShowPriceIncreased: (value: boolean) => void;
  showPriceDecreased: boolean;
  setShowPriceDecreased: (value: boolean) => void;
}

export function PriceFilter({
  showPriceIncreased,
  setShowPriceIncreased,
  showPriceDecreased,
  setShowPriceDecreased
}: PriceFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-gray-700">Price Changes</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="price-increased"
          checked={showPriceIncreased}
          onCheckedChange={(checked) => setShowPriceIncreased(!!checked)}
        />
        <Label 
          htmlFor="price-increased" 
          className="flex items-center text-sm font-medium cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
          Show Price Hiked
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="price-decreased"
          checked={showPriceDecreased}
          onCheckedChange={(checked) => setShowPriceDecreased(!!checked)}
        />
        <Label 
          htmlFor="price-decreased" 
          className="flex items-center text-sm font-medium cursor-pointer"
        >
          <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
          Show Price Dropped
        </Label>
      </div>
    </div>
  );
}