import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/index';

interface Product3DCardProps {
  product: Product;
}

export function Product3DCard({ product }: Product3DCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Add to cart with default selections
    addToCart({
      product,
      quantity: 1,
      selectedSize: product.sizes[0] || 'One Size',
      selectedColor: product.colors[0] || 'Default',
    });

    toast.success('Added to cart! Redirecting to checkout...');
    setTimeout(() => navigate('/checkout'), 500);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart({
      product,
      quantity: 1,
      selectedSize: product.sizes[0] || 'One Size',
      selectedColor: product.colors[0] || 'Default',
    });

    toast.success('Added to cart!');
  };

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="group overflow-hidden border-border bg-card hover:luxury-shadow transition-all duration-500">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover product-3d transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {product.is_new_arrival && (
              <Badge className="bg-primary text-primary-foreground">New</Badge>
            )}
            {product.is_trending && (
              <Badge className="bg-gold text-gold-foreground">Trending</Badge>
            )}
          </div>
          {/* Hover overlay with quick actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="space-y-2">

            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              ₹{product.price.toFixed(2)}
            </span>
            {product.stock_quantity > 0 ? (
              <span className="text-xs text-muted-foreground">In Stock</span>
            ) : (
              <span className="text-xs text-destructive">Out of Stock</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
