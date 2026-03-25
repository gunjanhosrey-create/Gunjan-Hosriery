import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

const priceRanges = [
  { label: 'Under Rs. 299', value: 'under-299' },
  { label: 'Rs. 300 - 499', value: '300-499' },
  { label: 'Rs. 500 - 799', value: '500-799' },
  { label: 'Rs. 800+', value: '800-plus' },
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
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  const categoryFilter = searchParams.get('category');
  const filterType = searchParams.get('filter');
  const saleView = searchParams.get('sale') === 'true';
  const queryParam = searchParams.get('q') || '';

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

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
        const trimmedQuery = queryParam.trim();

        if (trimmedQuery) {
          data = await searchProducts(trimmedQuery);
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
  }, [categories, categoryFilter, filterType, saleView, queryParam]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.description ?? ''} ${product.slug} ${product.colors.join(' ')} ${product.sizes.join(' ')}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesPrice =
        selectedPriceRange === 'all' ||
        (selectedPriceRange === 'under-299' && product.price < 300) ||
        (selectedPriceRange === '300-499' &&
          product.price >= 300 &&
          product.price <= 499) ||
        (selectedPriceRange === '500-799' &&
          product.price >= 500 &&
          product.price <= 799) ||
        (selectedPriceRange === '800-plus' && product.price >= 800);

      const matchesSize =
        selectedSize === 'all' || product.sizes.some((size) => size === selectedSize);

      const matchesColor =
        selectedColor === 'all' ||
        product.colors.some((color) => color.toLowerCase() === selectedColor.toLowerCase());

      const matchesAvailability =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'in-stock' && product.stock_quantity > 0) ||
        (selectedAvailability === 'out-of-stock' && product.stock_quantity === 0);

      return (
        matchesQuery &&
        matchesPrice &&
        matchesSize &&
        matchesColor &&
        matchesAvailability
      );
    });
  }, [
    products,
    searchQuery,
    selectedAvailability,
    selectedColor,
    selectedPriceRange,
    selectedSize,
  ]);

  const sortedProducts = useMemo(() => {
    const cloned = [...filteredProducts];

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
  }, [filteredProducts, sortBy]);

  const selectedCategoryName = categories.find((category) => category.slug === categoryFilter)?.name;
  const availableSizes = useMemo(
    () => [...new Set(products.flatMap((product) => product.sizes).filter(Boolean))],
    [products]
  );
  const availableColors = useMemo(
    () => [...new Set(products.flatMap((product) => product.colors).filter(Boolean))],
    [products]
  );

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const params = new URLSearchParams(searchParams);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      params.set('q', trimmedValue);
    } else {
      params.delete('q');
    }

    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <section className="border-b border-[#e6dfd5] pb-10">
          <div className="mx-auto max-w-5xl">
            <div className="relative mx-auto mt-6 max-w-4xl">
              <Input
                type="text"
                placeholder="Search by product name, style, color or size"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-14 rounded-none border-[#d8d1c6] bg-white px-5 pr-14 text-base shadow-none transition-all duration-300 focus:border-[#2e3b4f] focus-visible:ring-0"
              />
              <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f2937]" />
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Accordion type="multiple" defaultValue={['price', 'product-type', 'style']} className="border-t border-[#e6dfd5]">
                <AccordionItem value="price" className="border-[#e6dfd5]">
                  <AccordionTrigger className="py-5 text-xs font-medium uppercase tracking-[0.35em] text-[#4d4a45] hover:no-underline">
                    Price
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPriceRange('all')}
                      className={`block text-left text-sm transition ${
                        selectedPriceRange === 'all' ? 'text-[#2e3b4f]' : 'text-[#7b746c]'
                      }`}
                    >
                      All prices
                    </button>
                    {priceRanges.map((range) => (
                      <button
                        key={range.value}
                        type="button"
                        onClick={() => setSelectedPriceRange(range.value)}
                        className={`block text-left text-sm transition ${
                          selectedPriceRange === range.value ? 'text-[#2e3b4f]' : 'text-[#7b746c]'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="product-type" className="border-[#e6dfd5]">
                  <AccordionTrigger className="py-5 text-xs font-medium uppercase tracking-[0.35em] text-[#4d4a45] hover:no-underline">
                    Product Type
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('all')}
                      className={`block text-left text-sm transition ${
                        !categoryFilter && !saleView ? 'text-[#2e3b4f]' : 'text-[#7b746c]'
                      }`}
                    >
                      All collections
                    </button>
                    {[
                      { label: 'Men', value: 'men' },
                      { label: 'Women', value: 'women' },
                      { label: 'Boys', value: 'boys' },
                      { label: 'Girls', value: 'girls' },
                      { label: 'Value Pack', value: 'value-pack' },
                      { label: 'Sale', value: 'sale' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleCategoryChange(item.value)}
                        className={`block text-left text-sm transition ${
                          (item.value === 'sale' && saleView) || categoryFilter === item.value
                            ? 'text-[#2e3b4f]'
                            : 'text-[#7b746c]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="style" className="border-[#e6dfd5]">
                  <AccordionTrigger className="py-5 text-xs font-medium uppercase tracking-[0.35em] text-[#4d4a45] hover:no-underline">
                    Style
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {[
                      { label: 'All styles', value: 'all' },
                      { label: 'Featured', value: 'featured' },
                      { label: 'New arrivals', value: 'new' },
                      { label: 'Trending', value: 'trending' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleFilterChange(item.value)}
                        className={`block text-left text-sm transition ${
                          (filterType || 'all') === item.value ? 'text-[#2e3b4f]' : 'text-[#7b746c]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size" className="border-[#e6dfd5]">
                  <AccordionTrigger className="py-5 text-xs font-medium uppercase tracking-[0.35em] text-[#4d4a45] hover:no-underline">
                    Size
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSize('all')}
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        selectedSize === 'all'
                          ? 'border-[#2e3b4f] text-[#2e3b4f]'
                          : 'border-[#d8d1c6] text-[#7b746c]'
                      }`}
                    >
                      All
                    </button>
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                          selectedSize === size
                            ? 'border-[#2e3b4f] text-[#2e3b4f]'
                            : 'border-[#d8d1c6] text-[#7b746c]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="availability" className="border-[#e6dfd5]">
                  <AccordionTrigger className="py-5 text-xs font-medium uppercase tracking-[0.35em] text-[#4d4a45] hover:no-underline">
                    Availability
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {[
                      { label: 'All products', value: 'all' },
                      { label: 'In stock', value: 'in-stock' },
                      { label: 'Out of stock', value: 'out-of-stock' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedAvailability(item.value)}
                        className={`block text-left text-sm transition ${
                          selectedAvailability === item.value
                            ? 'text-[#2e3b4f]'
                            : 'text-[#7b746c]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="color" className="border-[#e6dfd5]">
                  <AccordionTrigger className="py-5 text-xs font-medium uppercase tracking-[0.35em] text-[#4d4a45] hover:no-underline">
                    Color
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedColor('all')}
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        selectedColor === 'all'
                          ? 'border-[#2e3b4f] text-[#2e3b4f]'
                          : 'border-[#d8d1c6] text-[#7b746c]'
                      }`}
                    >
                      All
                    </button>
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                          selectedColor.toLowerCase() === color.toLowerCase()
                            ? 'border-[#2e3b4f] text-[#2e3b4f]'
                            : 'border-[#d8d1c6] text-[#7b746c]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </aside>

            <div>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-medium text-[#2e3b4f]">
                    {sortedProducts.length} results
                  </p>
                  <p className="mt-1 text-sm text-[#7b746c]">
                    {searchQuery.trim()
                      ? `Showing matches for "${searchQuery.trim()}"`
                      : 'Browse the latest Gunjan Hosiery collection'}
                  </p>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 w-full rounded-none border-[#d8d1c6] bg-white px-4 text-sm shadow-none md:w-[250px] focus:ring-0">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-none bg-slate-200" />
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {sortedProducts.map((product) => (
                    <Product3DCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#d8d1c6] bg-white px-6 py-20 text-center">
                  <p className="text-lg font-medium text-[#2e3b4f]">No products found</p>
                  <p className="mt-2 text-sm text-[#7b746c]">
                    Search text ya filters change karke phir try kijiye.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
