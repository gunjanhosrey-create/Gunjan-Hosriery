import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getProductBySlug } from "@/db/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

const normalizeOptions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((item) => item.trim()).filter(Boolean);
        }
      } catch {
        // Fall back to loose parsing below.
      }
    }

    return value
      .split(",")
      .map((item) => item.trim().replace(/^['"\[\]]+|['"\[\]]+$/g, ""))
      .filter(Boolean);
  }

  return [];
};

const colorMap: Record<string, string> = {
  black: "#111111",
  white: "#f8fafc",
  red: "#dc2626",
  blue: "#2563eb",
  navy: "#1e3a8a",
  green: "#16a34a",
  yellow: "#facc15",
  pink: "#ec4899",
  purple: "#7c3aed",
  orange: "#f97316",
  grey: "#6b7280",
  gray: "#6b7280",
  brown: "#8b5e3c",
  beige: "#d6c4a1",
  cream: "#f5f0e6",
  maroon: "#7f1d1d",
  olive: "#4d5d27",
  sky: "#38bdf8",
};

const getColorValue = (color: string) => {
  const normalized = color.trim().replace(/^['"\[\]]+|['"\[\]]+$/g, "").toLowerCase();
  return colorMap[normalized] || normalized;
};

const getSelectedColorImage = (product: Product, color: string) => {
  if (!color) return product.image_url;
  return product.color_images?.[color.trim().toLowerCase()] || product.image_url;
};

const formatColorName = (color: string) =>
  color
    .replace(/^['"\[\]]+|['"\[\]]+$/g, "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 🔥 LOAD PRODUCT
  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;

      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        const normalizedProduct = data
          ? {
              ...data,
              sizes: normalizeOptions(data.sizes),
              colors: normalizeOptions(data.colors),
            }
          : null;

        setProduct(normalizedProduct);

        if (normalizedProduct) {
          setSelectedSize(normalizedProduct.sizes?.[0] || "");
          setSelectedColor(normalizedProduct.colors?.[0] || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  // 🔥 ADD TO CART
  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Select size");
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      toast.error("Select color");
      return;
    }

    addToCart({
      product: {
        ...product,
        image_url: getSelectedColorImage(product, selectedColor),
      },
      quantity,
      selectedSize,
      selectedColor,
    });

    toast.success("Added to cart");
  };

  // 🔥 BUY NOW
  const handleBuyNow = () => {
    if (!product) return;

    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Select size");
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      toast.error("Select color");
      return;
    }

    addToCart({
      product: {
        ...product,
        image_url: getSelectedColorImage(product, selectedColor),
      },
      quantity,
      selectedSize,
      selectedColor,
    });

    navigate("/checkout");
  };

  // 🔥 LOADING
  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  // 🔥 NOT FOUND
  if (!product) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Button onClick={() => navigate("/products")}>Back</Button>
      </div>
    );
  }

  const displayedImage = getSelectedColorImage(product, selectedColor);

  return (
    <div className="container mx-auto p-6">

      {/* BACK */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-10 mt-6">

        {/* IMAGE */}
        <div className="relative">
          <img
            src={displayedImage}
            alt={product.name}
            className="rounded-lg w-full"
          />

          {selectedColor && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: getColorValue(selectedColor) }}
              />
              Showing {formatColorName(selectedColor)}
            </div>
          )}

          <div className="absolute top-3 right-3 space-y-2">
            {product.is_new_arrival && <Badge>New</Badge>}
            {product.is_trending && <Badge>Trending</Badge>}
          </div>
        </div>

        {/* DETAILS */}
        <div className="space-y-5">

          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold">₹{product.price}</p>
          </div>

          {product.description && <p>{product.description}</p>}

          {/* SIZE */}
          {product.sizes?.length > 0 && (
            <div>
              <Label>Select Size</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <Label key={size} className="border px-3 py-1 cursor-pointer">
                      <RadioGroupItem value={size} className="mr-2" />
                      {size}
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* COLOR */}
          {product.colors?.length > 0 && (
            <div>
              <Label>
                Select Color
                {selectedColor ? `: ${formatColorName(selectedColor)}` : ""}
              </Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="flex gap-3 flex-wrap pt-2">
                  {product.colors.map((color) => (
                    <Label
                      key={color}
                      title={color}
                      className={`flex cursor-pointer items-center justify-center rounded-full border p-1 transition ${
                        selectedColor === color
                          ? "border-slate-900 bg-slate-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      <RadioGroupItem value={color} className="sr-only" />
                      <span
                        className="h-8 w-8 rounded-full border border-slate-300 shadow-inner"
                        style={{ backgroundColor: getColorValue(color) }}
                      />
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* 🔥 QUANTITY */}
          <div>
            <Label>Quantity</Label>
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>

              <span>{quantity}</span>

              <Button
                variant="outline"
                onClick={() =>
                  setQuantity(Math.min(product.stock_quantity, quantity + 1))
                }
              >
                +
              </Button>
            </div>
          </div>

          {/* STOCK */}
          <div>
            {product.stock_quantity > 0 ? (
              <p className="text-green-600 flex items-center">
                <Check className="mr-2 h-4 w-4" />
                In Stock ({product.stock_quantity})
              </p>
            ) : (
              <p className="text-red-500">Out of stock</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="space-y-3">
            <Button className="w-full" onClick={handleBuyNow}>
              <Zap className="mr-2 h-4 w-4" />
              Buy Now
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
