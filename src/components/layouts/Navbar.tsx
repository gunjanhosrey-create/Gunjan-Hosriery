import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Facebook,
  Instagram,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Youtube,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

type MegaMenuSection = {
  title: string;
  items: string[];
};

type NavCategory = {
  label: string;
  href: string;
  sections: MegaMenuSection[];
  accent?: boolean;
};

const topLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Track Order', href: '/whatsapp-order' },
];

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/gunjanhosiery?igsh=ODh6M2hzc3N6dDV2',
    icon: Instagram,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61576791716033',
    icon: Facebook,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/',
    icon: Youtube,
  },
];

const navCategories: NavCategory[] = [
  {
    label: 'MEN',
    href: '/products?category=men',
    sections: [
      { title: 'Outerwear', items: ['T-Shirts', 'Track Pant', 'Shorts'] },
      { title: 'T-Shirt', items: ['Drop Shoulder', 'Polos', 'Solid', 'Printed Tees'] },
      { title: 'Innerwear', items: ['Trunks', 'Brief', 'Vest'] },
    ],
  },
  {
    label: 'WOMEN',
    href: '/products?category=women',
    sections: [
      { title: 'Outerwear', items: ['T-Shirts', 'Full Pant', '3/4th Pant', 'Capri Set', 'Cycling Shorts', 'Loungewear'] },
      { title: 'Innerwear', items: ['Panties', 'Camisoles And Slips', 'Boyshorts'] },
    ],
  },
  {
    label: 'BOYS',
    href: '/products?category=boys',
    sections: [
      { title: 'Outerwear', items: ['T-Shirts', 'Set Items', 'Shirts', 'Full Pants', '3/4th Pants', 'Shorts'] },
      { title: 'Topwear', items: ['Disney & Marvel', 'Drop Shoulder Tees', 'Tank Tops', 'Hoodies', 'T-Shirt with Jacket'] },
      { title: 'Innerwear', items: ['Vests', 'Drawer', 'Brief', 'Trunks', 'Jetty'] },
    ],
  },
  {
    label: 'GIRLS',
    href: '/products?category=girls',
    sections: [
      { title: 'Outerwear', items: ['T-Shirts', 'Full Pant Set', '3/4th Set', 'Co-Ord Set', 'Frock'] },
      { title: 'Topwear', items: ['Disney & Marvel', 'Cropped Tees', 'Hoodies'] },
      { title: 'Innerwear', items: ['Drawer', 'Panties', 'Slips'] },
      { title: 'Baby Girls', items: ['Frock', 'Full Pant Set'] },
    ],
  },
  {
    label: 'VALUE PACK',
    href: '/products?category=value-pack',
    sections: [
      { title: 'Everyday Value', items: ['Multi-Pack Tees', 'Combo Shorts', 'Vest Packs', 'Brief Packs'] },
      { title: 'Family Picks', items: ['Kids Sets', 'Women Combos', 'Boys Essentials', 'Girls Essentials'] },
    ],
  },
  {
    label: 'SALE',
    href: '/products?sale=true',
    accent: true,
    sections: [
      { title: 'Hot Deals', items: ['Best Sellers', 'Clearance', 'Limited Drops', 'Weekend Offers'] },
      { title: 'Discount Zones', items: ['Under 299', 'Under 499', 'Combo Deals', 'Season End Sale'] },
    ],
  },
];

const mobileQuickLinks = [...topLinks, { label: 'Admin', href: '/admin' }];

export function Navbar() {
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartCount();
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || '');
  }, [location.search]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();
    const query = searchQuery.trim();

    if (query) {
      params.set('q', query);
    }

    navigate({
      pathname: '/products',
      search: params.toString() ? `?${params.toString()}` : '',
    });

    setIsSearchOpen(true);
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget) && !searchQuery.trim()) {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="border-b border-slate-200 bg-slate-950 text-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="hidden items-center gap-5 md:flex">
            {topLinks.map((item) => (
              <Link key={item.label} to={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex w-full items-center justify-center gap-4 md:w-auto md:justify-end">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="transition hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-full text-slate-700">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-0">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
                  <Link to="/" className="flex items-center gap-3">
                    <img
                      src="/images/gunjan-logo.png"
                      alt="Gunjan Hosiery logo"
                      className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="text-2xl font-black tracking-[0.06em] text-red-600">
                      Gunjan Hosiery
                    </span>
                  </Link>
                </div>

                <div className="space-y-6 px-5 py-6">
                  <div className="space-y-3">
                    {mobileQuickLinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block text-sm font-medium text-slate-700 transition hover:text-red-600"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-slate-200 pt-6">
                    {navCategories.map((category) => {
                      const isOpen = openMobileCategory === category.label;
                      return (
                        <div key={category.label} className="rounded-2xl border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMobileCategory(isOpen ? null : category.label)
                            }
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-900"
                          >
                            <span className="flex items-center gap-2">
                              {category.label}
                              {category.accent && (
                                <Badge className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                  HOT
                                </Badge>
                              )}
                            </span>
                            {isOpen ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          {isOpen && (
                            <div className="space-y-4 border-t border-slate-200 px-4 py-4">
                              {category.sections.map((section) => (
                                <div key={section.title}>
                                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {section.title}
                                  </p>
                                  <div className="grid gap-2">
                                    {section.items.map((item) => (
                                      <Link
                                        key={item}
                                        to={category.href}
                                        className="text-sm text-slate-600 transition hover:text-red-600"
                                      >
                                        {item}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/gunjan-logo.png"
                alt="Gunjan Hosiery logo"
                className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="text-xl font-black tracking-[0.06em] text-red-600 sm:text-2xl">
                Gunjan Hosiery
              </span>
            </Link>
          </div>

          <nav className="relative hidden lg:flex lg:items-center lg:gap-2">
            {navCategories.map((category) => (
              <div key={category.label} className="group">
                <Link
                  to={category.href}
                  className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold tracking-wide text-slate-800 transition hover:bg-slate-100 hover:text-red-600"
                >
                  <span>{category.label}</span>
                  {category.accent ? (
                    <Badge className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      SALE
                    </Badge>
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 transition group-hover:text-red-600" />
                  )}
                </Link>

                <div className="pointer-events-none absolute left-1/2 top-full z-50 w-[min(calc(100vw-2rem),880px)] -translate-x-1/2 translate-y-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.35)]">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                          Explore
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                          {category.label}
                        </h3>
                      </div>
                      {category.accent && (
                        <Badge className="rounded-full bg-red-600 px-3 py-1 text-xs text-white">
                          New Offers
                        </Badge>
                      )}
                    </div>
                    <div className={`grid gap-8 ${category.sections.length > 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                      {category.sections.map((section) => (
                        <div key={section.title}>
                          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                            {section.title}
                          </p>
                          <ul className="space-y-3">
                            {section.items.map((item) => (
                              <li key={item}>
                                <Link
                                  to={category.href}
                                  className="text-sm text-slate-600 transition hover:text-red-600"
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <form
              onSubmit={handleSearchSubmit}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={handleSearchBlur}
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => {
                setIsSearchHovered(false);
                if (!searchQuery.trim()) {
                  setIsSearchOpen(false);
                }
              }}
              className="relative hidden md:flex"
            >
              <div
                className={`relative overflow-hidden rounded-full border bg-white shadow-sm transition-all duration-300 ease-out ${
                  isSearchOpen || isSearchHovered || searchQuery
                    ? 'w-[320px] border-red-200 shadow-[0_10px_32px_-20px_rgba(220,38,38,0.55)]'
                    : 'w-11 border-slate-200 hover:w-16 hover:border-slate-300'
                }`}
              >
                <button
                  type="submit"
                  aria-label="Search products"
                  className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center text-slate-500 transition hover:text-red-600"
                >
                  <Search className="h-5 w-5" />
                </button>
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tees, shorts, combo packs..."
                  className={`h-11 border-0 bg-transparent pl-11 pr-12 text-sm shadow-none ring-0 transition-opacity duration-200 focus-visible:ring-0 ${
                    isSearchOpen || isSearchHovered || searchQuery
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  }`}
                />
                {(isSearchOpen || isSearchHovered || searchQuery) && (
                  <button
                    type="button"
                    aria-label={searchQuery ? 'Clear search' : 'Close search'}
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchHovered(false);
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
            <Link to={user ? '/account' : '/login'}>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-700 hover:bg-slate-100 hover:text-red-600">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-700 hover:bg-slate-100 hover:text-red-600 md:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-700 hover:bg-slate-100 hover:text-red-600">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
