// src/components/ui/compare-button.tsx
"use client"

import { Button } from "@/components/ui/button";
import { SplitSquareHorizontal } from "lucide-react";
import { useCompare, CompareProduct } from "@/components/providers/compare-provider";
import { useState } from "react";

interface CompareButtonProps {
  product: CompareProduct;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function CompareButton({ 
  product, 
  variant = "outline",
  size = "sm",
  className = ""
}: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [isAdded, setIsAdded] = useState(isInCompare(product.id));
  
  const handleClick = () => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      setIsAdded(false);
    } else {
      addToCompare(product);
      setIsAdded(true);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      variant={isAdded ? "secondary" : variant}
      size={size}
      className={className}
    >
      <SplitSquareHorizontal className="mr-2 h-4 w-4" />
      {isAdded ? "Remove from Compare" : "Add to Compare"}
    </Button>
  );
}