import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  ShoppingCart,
  Star,
  Upload,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getProductBySlug } from "@/db/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import colorMap from "@/lib/colorMap";
import type { Product } from "@/types";

type Review = {
  id: string;
  name: string;
  customerImage: string;
  rating: number;
  comment: string;
  createdAt: string;
  images: string[];
};

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const SAMPLE_REVIEWS: Review[] = [
  {
    id: "sample-1",
    name: "Riya Sharma",
    customerImage: "https://ui-avatars.com/api/?name=Riya+Sharma&background=fee2e2&color=b91c1c",
    rating: 5,
    comment:
      "The fabric quality is excellent, and the color matches perfectly. It is great for daily wear.",
    createdAt: "2026-03-20T10:00:00.000Z",
    images: [],
  },
  {
    id: "sample-2",
    name: "Aman Verma",
    customerImage: "https://ui-avatars.com/api/?name=Aman+Verma&background=e2e8f0&color=0f172a",
    rating: 4,
    comment:
      "The print quality and fit are both excellent. The size selection was straightforward, and size M fit perfectly.",
    createdAt: "2026-03-18T10:00:00.000Z",
    images: [],
  },
];

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

const getColorValue = (color: string) => {
  if (!color || typeof color !== 'string') return "#ccc";

  const clean = color.trim().toLowerCase();

  // Check if it's already a hex color
  if (clean.startsWith('#') && (clean.length === 4 || clean.length === 7)) {
    return clean;
  }

  // Check colorMap
  if (colorMap[clean]) {
    return colorMap[clean];
  }

  // Fallback: try to find close matches or return a default
  console.warn(`Color "${color}" not found in colorMap, using fallback`);
  return "#ccc"; // fallback color
};

const formatColorName = (color: string) =>
  color
    .replace(/^['"\[\]]+|['"\[\]]+$/g, "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const readFilesAsDataUrls = async (files: FileList | null) => {
  if (!files) return [];

  const fileArray = Array.from(files);

  return Promise.all(
    fileArray.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        })
    )
  );
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, profile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;

      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        console.log("Product colors data:", data?.colors); // DEBUG
        const normalizedSizes = normalizeOptions(data?.sizes);
        const normalizedColors = normalizeOptions(data?.colors);
        console.log("Normalized colors:", normalizedColors); // DEBUG
        const finalSizes = normalizedSizes.length > 0 ? normalizedSizes : DEFAULT_SIZES;

        const normalizedProduct = data
          ? {
              ...data,
              sizes: finalSizes,
              colors: normalizedColors,
            }
          : null;

        setProduct(normalizedProduct);

        if (normalizedProduct) {
          setSelectedSize(normalizedProduct.sizes[0] || "");
          setSelectedColor(normalizedProduct.colors[0] || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (!slug || typeof window === "undefined") return;

    const storedReviews = window.localStorage.getItem(`product-reviews:${slug}`);
    if (storedReviews) {
      try {
        const parsed = JSON.parse(storedReviews) as Review[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
          return;
        }
      } catch {
        // Ignore bad local data and fall back to seed reviews.
      }
    }

    setReviews(SAMPLE_REVIEWS);
  }, [slug]);

  useEffect(() => {
    if (!slug || typeof window === "undefined" || reviews.length === 0) return;
    window.localStorage.setItem(`product-reviews:${slug}`, JSON.stringify(reviews));
  }, [reviews, slug]);

  // Auto-rotate carousel images
  useEffect(() => {
    if (!product?.additional_images || product.additional_images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.additional_images.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [product?.additional_images]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
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
        image_url: product.image_url,
      },
      quantity,
      selectedSize,
      selectedColor,
    });

    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (!selectedSize) {
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
        image_url: product.image_url,
      },
      quantity,
      selectedSize,
      selectedColor,
    });

    navigate("/checkout");
  };

  const handleReviewImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const imageDataUrls = await readFilesAsDataUrls(event.target.files);
      setReviewImages(imageDataUrls);
    } catch (error) {
      console.error(error);
      toast.error("Image could not be loaded");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmitReview = (event: React.FormEvent) => {
    event.preventDefault();

    if (!reviewComment.trim()) {
      toast.error("Please write your comment");
      return;
    }

    const reviewerName =
      profile?.name?.trim() ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Customer";

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      reviewerName
    )}&background=fee2e2&color=b91c1c`;

    const nextReview: Review = {
      id: `${Date.now()}`,
      name: reviewerName,
      customerImage: user?.user_metadata?.avatar_url || fallbackAvatar,
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
      images: reviewImages,
    };

    setReviews((prev) => [nextReview, ...prev]);
    setReviewComment("");
    setReviewRating(5);
    setReviewImages([]);
    setIsReviewFormOpen(false);
    toast.success("Your review has been submitted");
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Button onClick={() => navigate("/products")}>Back</Button>
      </div>
    );
  }

  const displayedImage = product.image_url;

  // Carousel handlers
  const handlePrevImage = () => {
    const imageCount = product.additional_images.length;
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const handleNextImage = () => {
    const imageCount = product.additional_images.length;
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 20, 100));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const carouselImage = product.additional_images.length > 0 
    ? product.additional_images[currentImageIndex]
    : displayedImage;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
          {/* Image Container with Zoom */}
          <div className="relative overflow-auto rounded-[24px] bg-slate-50" style={{ height: '500px' }}>
            <img
              src={carouselImage}
              alt={product.name}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center',
              }}
              className="w-full h-full object-contain transition-transform duration-200"
            />
          </div>

          {/* Carousel Navigation Arrows */}
          {product.additional_images.length > 0 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-slate-900" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-slate-900" />
              </button>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 100}
                  className="rounded-full bg-white/80 p-2 hover:bg-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zoom out"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5 text-slate-900" />
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="rounded-full bg-white/80 p-2 hover:bg-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zoom in"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5 text-slate-900" />
                </button>
                {zoomLevel !== 100 && (
                  <button
                    onClick={handleResetZoom}
                    className="rounded-full bg-white/80 px-2 py-2 hover:bg-white transition shadow-lg text-xs font-semibold text-slate-900"
                    aria-label="Reset zoom"
                    title="Reset Zoom"
                  >
                    {zoomLevel}%
                  </button>
                )}
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                {currentImageIndex + 1} / {product.additional_images.length}
              </div>

              {/* Carousel Dots */}
              <div className="absolute bottom-4 right-4 flex gap-1">
                {product.additional_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition ${
                      index === currentImageIndex ? "bg-white" : "bg-white/40"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute right-7 top-7 space-y-2">
            {product.is_new_arrival && <Badge>New</Badge>}
            {product.is_trending && <Badge>Trending</Badge>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-950">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-slate-950">INR {product.price}</p>
            {product.description && <p className="max-w-xl text-slate-600">{product.description}</p>}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-semibold text-slate-900">Select Size</Label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-14 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                        selectedSize === size
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-900">
                    Select Color
                    {selectedColor ? `: ${formatColorName(selectedColor)}` : ""}
                  </Label>
                  <div>Colors array: {JSON.stringify(product.colors)}</div> {/* DEBUG */}
                  {console.log("Rendering colors:", product.colors)} {/* DEBUG */}
                  <div className="mt-3 flex flex-wrap gap-3">
                  {(Array.isArray(product.colors) ? product.colors : String(product.colors || '').split(','))
                    .map((color) => color.trim())
                    .filter((color) => color.length > 0)
                    .map((cleanColor) => (
                      <button
                        key={cleanColor}
                        type="button"
                        title={cleanColor}
                        onClick={() => setSelectedColor(cleanColor)}
                        className={`flex h-12 w-12 items-center justify-center rounded-full border p-1 transition ${
                          selectedColor === cleanColor
                            ? "border-slate-950 bg-slate-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-400"
                        }`}
                      >
                        <span
                          className="h-8 w-8 rounded-full border border-slate-300 shadow-inner"
                          style={{ backgroundColor: getColorValue(cleanColor) }}
                          title={`Color: ${cleanColor}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-slate-900">Quantity</Label>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="min-w-6 text-center font-semibold text-slate-900">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 1, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                {product.stock_quantity > 0 ? (
                  <p className="flex items-center text-green-600">
                    <Check className="mr-2 h-4 w-4" />
                    In Stock ({product.stock_quantity})
                  </p>
                ) : (
                  <p className="text-red-500">Out of Stock</p>
                )}
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-slate-950 text-white hover:bg-slate-800" onClick={handleBuyNow}>
                  <Zap className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>

                <Button variant="outline" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Customer Reviews
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Customer Feedback</h2>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-950">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {averageRating.toFixed(1)} / 5
              </div>
              <p>{reviews.length} reviews</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Share your review</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Add a comment, choose stars, and upload product image if you want.
                </p>
              </div>
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setIsReviewFormOpen((prev) => !prev)}
              >
                {isReviewFormOpen ? "Close" : "Comment"}
              </Button>
            </div>

            {isReviewFormOpen && (
              <form className="mt-5 space-y-5 border-t border-slate-200 pt-5" onSubmit={handleSubmitReview}>
                <div className="space-y-2">
                  <Label>Your Rating</Label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      const active = value <= reviewRating;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className={`rounded-2xl border px-3 py-2 transition ${
                            active
                              ? "border-amber-300 bg-amber-50 text-amber-500"
                              : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <Star className={`h-4 w-4 ${active ? "fill-amber-400" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-comment">Comment</Label>
                  <Textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Write your review here..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="review-images">Image (Optional)</Label>
                  <label
                    htmlFor="review-images"
                    className="flex cursor-pointer items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    <Upload className="h-4 w-4" />
                    Add image
                  </label>
                  <input
                    id="review-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReviewImageChange}
                  />

                  {reviewImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {reviewImages.map((image, index) => (
                        <div
                          key={`preview-${index}`}
                          className="relative overflow-hidden rounded-2xl border border-slate-200"
                        >
                          <img
                            src={image}
                            alt={`Review preview ${index + 1}`}
                            className="aspect-square w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <ImagePlus className="h-4 w-4" />
                      Image upload optional hai.
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  Submit
                </Button>
              </form>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.customerImage}
                      alt={`${review.name} profile`}
                      className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-950">{review.name}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`${review.id}-${index}`}
                            className={`h-4 w-4 ${
                              index < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p>

                {review.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {review.images.map((image, index) => (
                      <img
                        key={`${review.id}-image-${index}`}
                        src={image}
                        alt={`${review.name} review ${index + 1}`}
                        className="aspect-square w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
