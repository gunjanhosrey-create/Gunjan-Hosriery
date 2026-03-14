import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getProductBySlug } from '@/db/api';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/index';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
        if (data) {
          setSelectedSize(data.sizes[0] || '');
          setSelectedColor(data.colors[0] || '');
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });

    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });

    toast.success('Proceeding to checkout...');
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8 bg-muted" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-[3/4] bg-muted" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4 bg-muted" />
              <Skeleton className="h-8 w-32 bg-muted" />
              <Skeleton className="h-24 w-full bg-muted" />
              <Skeleton className="h-40 w-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {product.is_new_arrival && (
                <Badge className="bg-primary text-primary-foreground">New</Badge>
              )}
              {product.is_trending && (
                <Badge className="bg-gold text-gold-foreground">Trending</Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex items-center justify-center px-4 py-2 border-2 border-border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:border-primary transition-colors"
                    >
                      {size}
                    </Label>
                  </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={color}
                      id={`color-${color}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className="flex items-center justify-center px-4 py-2 border-2 border-border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:border-primary transition-colors"
                    >
                      {color}
                    </Label>
                  </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Stock Status */}
            <div>
              {product.stock_quantity > 0 ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  {product.stock_quantity} items in stock
                </div>
              ) : (
                <div className="text-sm text-destructive">Out of stock</div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0}
              >
                <Zap className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
