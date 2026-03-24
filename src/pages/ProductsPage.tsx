import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Filter, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product3DCard } from '@/components/Product3DCard';
import { getCategories, getProducts, getProductsByCategory, searchProducts } from '@/db/api';
import type { Category, Product } from '@/types/index';

const categoryPageContent: Record<
  string,
  { title: string; subtitle: string; eyebrow: string; accent: string }
> = {
  men: {
    title: 'Menswear That Looks Sharp Every Day',
    subtitle: 'Shop polished essentials, elevated basics, and easy styles built for all-day comfort.',
    eyebrow: 'Mens Collection',
    accent: 'from-slate-950 via-slate-900 to-red-900',
  },
  women: {
    title: 'Modern Womenswear With Everyday Ease',
    subtitle: 'Discover flattering fits, soft fabrics, and premium silhouettes for work, lounge, and beyond.',
    eyebrow: 'Womens Collection',
    accent: 'from-rose-950 via-fuchsia-900 to-orange-900',
  },
  boys: {
    title: 'Boys Styles Built For Play And Comfort',
    subtitle: 'From active basics to graphic favorites, shop durable everyday pieces for growing kids.',
    eyebrow: 'Boys Collection',
    accent: 'from-blue-950 via-sky-900 to-cyan-800',
  },
  girls: {
    title: 'Girls Looks Full Of Color And Comfort',
    subtitle: 'Cute sets, playful favorites, and soft essentials designed for movement and all-day wear.',
    eyebrow: 'Girls Collection',
    accent: 'from-pink-950 via-rose-900 to-purple-900',
  },
  'value-pack': {
    title: 'Value Packs That Give You More For Less',
    subtitle: 'Smart combo buys, everyday essentials, and family-ready packs designed for better savings.',
    eyebrow: 'Value Pack',
    accent: 'from-emerald-950 via-green-900 to-lime-800',
  },
  sale: {
    title: 'Sale Picks Worth Grabbing Fast',
    subtitle: 'Limited-time favorites, special drops, and standout pieces curated for quick shopping.',
    eyebrow: 'Sale Edit',
    accent: 'from-red-950 via-red-800 to-orange-700',
  },
  all: {
    title: 'Shop The Full Gunjan Hosiery Collection',
    subtitle: 'Browse every category, discover premium essentials, and find the right fit for every age and style.',
    eyebrow: 'All Products',
    accent: 'from-slate-950 via-slate-900 to-sky-900',
  },
};

const navQuickLinks = [
  { label: 'All', href: '/products' },
  { label: 'Men', href: '/products?category=men' },
  { label: 'Women', href: '/products?category=women' },
  { label: 'Boys', href: '/products?category=boys' },
  { label: 'Girls', href: '/products?category=girls' },
  { label: 'Value Pack', href: '/products?category=value-pack' },
  { label: 'Sale', href: '/products?sale=true' },
];

const getValuePackProducts = (products: Product[]) =>
  products.filter((product) =>
    `${product.name} ${product.description ?? ''} ${product.slug}`
      .toLowerCase()
      .match(/value|pack|combo|set/)
  );

const getSaleProducts = (products: Product[]) =>
  products.filter(
    (product) => product.is_featured || product.is_new_arrival || product.is_trending
  );

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const categoryFilter = searchParams.get('category');
  const filterType = searchParams.get('filter');
  const saleView = searchParams.get('sale') === 'true';

  const activePageKey = saleView ? 'sale' : categoryFilter || 'all';
  const heroContent = categoryPageContent[activePageKey] || categoryPageContent.all;

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let data: Product[] = [];

        if (searchQuery) {
          data = await searchProducts(searchQuery);
        } else if (saleView) {
          data = getSaleProducts(await getProducts());
        } else if (categoryFilter === 'value-pack') {
          data = getValuePackProducts(await getProducts());
        } else if (categoryFilter) {
          const category = categories.find((c) => c.slug === categoryFilter);
          if (category) {
            data = await getProductsByCategory(category.id);
          } else {
            const allProducts = await getProducts();
            data = allProducts.filter((product) =>
              `${product.name} ${product.description ?? ''} ${product.slug}`
                .toLowerCase()
                .includes(categoryFilter.toLowerCase())
            );
          }
        } else {
          data = await getProducts();
        }

        if (filterType === 'featured') {
          data = data.filter((p) => p.is_featured);
        } else if (filterType === 'new') {
          data = data.filter((p) => p.is_new_arrival);
        } else if (filterType === 'trending') {
          data = data.filter((p) => p.is_trending);
        }

        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (categories.length > 0 || !categoryFilter) {
      loadProducts();
    }
  }, [categories, categoryFilter, filterType, saleView, searchQuery]);

  const sortedProducts = useMemo(() => {
    const cloned = [...products];

    if (sortBy === 'price-low') {
      return cloned.sort((a, b) => a.price - b.price);
    }

    if (sortBy === 'price-high') {
      return cloned.sort((a, b) => b.price - a.price);
    }

    if (sortBy === 'name') {
      return cloned.sort((a, b) => a.name.localeCompare(b.name));
    }

    return cloned.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [products, sortBy]);

  const selectedCategoryName = categories.find((category) => category.slug === categoryFilter)?.name;

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === 'all') {
      params.delete('category');
      params.delete('sale');
    } else if (value === 'sale') {
      params.delete('category');
      params.set('sale', 'true');
    } else {
      params.delete('sale');
      params.set('category', value);
    }

    setSearchParams(params);
  };

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', value);
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff_0%,_#faf7f2_100%)]">
      <section className={`bg-gradient-to-br ${heroContent.accent} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-white/75">
              <Sparkles className="h-4 w-4" />
              <span>{heroContent.eyebrow}</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {heroContent.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
              {heroContent.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {navQuickLinks.map((item) => {
                const isActive =
                  (item.label === 'All' && !categoryFilter && !saleView) ||
                  (item.label === 'Sale' && saleView) ||
                  item.href.includes(`category=${categoryFilter}`);

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white text-slate-950'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedCategoryName || (saleView ? 'Sale Collection' : 'All Collections')}
              </p>
              <p className="text-sm text-slate-500">
                {sortedProducts.length} products ready to explore and purchase
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Need bulk help?
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products by name, style, or type"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-2xl border-slate-200 pl-11"
            />
          </div>

          <Select value={saleView ? 'sale' : categoryFilter || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 md:w-[220px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="boys">Boys</SelectItem>
              <SelectItem value="girls">Girls</SelectItem>
              <SelectItem value="value-pack">Value Pack</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType || 'all'} onValueChange={handleFilterChange}>
            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 md:w-[220px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="new">New Arrivals</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 md:w-[220px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-[28px] bg-slate-200" />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sortedProducts.map((product) => (
              <Product3DCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <p className="text-lg font-semibold text-slate-900">No products found</p>
            <p className="mt-2 text-sm text-slate-500">
              Try changing collection, search, or product filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
