import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Product3DCard } from '@/components/Product3DCard';
import { ProductCarousel } from '@/components/ProductCarousel';
import { CategoryShowcase } from '@/components/CategoryShowcase';
import { getCategories, getFeaturedProducts, getNewArrivals } from '@/db/api';
import type { Category, Product } from '@/types/index';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, featuredData, newArrivalsData] = await Promise.all([
          getCategories(),
          getFeaturedProducts(),
          getNewArrivals(),
        ]);
        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
        setNewArrivals(newArrivalsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-gold mr-2" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Premium Fashion Collection
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Gunjan Hosrey
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-2xl mx-auto">
            Experience luxury fashion with our exclusive collection of premium clothing for men, women, and kids
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products?filter=new">
              <Button size="lg" variant="outline">
                New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collections designed for every style and occasion
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <CategoryShowcase key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Collection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked premium pieces that define luxury and style
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] bg-muted" />
              ))}
            </div>
          ) : (
            <div className="group">
              <ProductCarousel products={featuredProducts} autoPlayInterval={4000} />
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/products?filter=featured">
              <Button variant="outline" size="lg">
                View All Featured
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">New Arrivals</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fresh styles just landed. Be the first to wear the latest trends
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] bg-muted" />
            ))}
          </div>
        ) : (
          <div className="group">
            <ProductCarousel products={newArrivals} autoPlayInterval={5000} />
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/products?filter=new">
            <Button variant="outline" size="lg">
              View All New Arrivals
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Fashion Revolution
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive offers, style tips, and early access to new collections
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
