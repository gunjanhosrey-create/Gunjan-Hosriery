import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const shopLinks = [
  { label: 'Men', href: '/products?category=men' },
  { label: 'Women', href: '/products?category=women' },
  { label: 'Boys', href: '/products?category=boys' },
  { label: 'Girls', href: '/products?category=girls' },
];

const quickLinks = [
  { label: 'Privacy Policy', href: '/contact' },
  { label: 'Return Policy', href: '/contact' },
  { label: 'Shipping Policy', href: '/contact' },
  { label: 'Terms and Conditions', href: '/contact' },
  { label: 'Track Order', href: '/whatsapp-order' },
];

const aboutLinks = [
  { label: 'Retail B2B Inquiries', href: '/contact' },
  { label: 'Bulk Orders', href: '/contact' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Admin', href: '/admin' },
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

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/images/gunjan-logo.png"
                alt="Gunjan Hosiery logo"
                className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15"
              />
              <span className="text-lg font-bold tracking-[0.04em] text-white">
                Gunjan Hosiery
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Contact
            </p>
            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <span>
                  C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward, Kanpur,
                  Uttar Pradesh 209402
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-red-400" />
                <a href="mailto:gunjanhosrey@gmail.com" className="transition hover:text-white">
                  gunjanhosrey@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-red-400" />
                <a href="tel:+919170259644" className="transition hover:text-white">
                  +91 9170259644
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Shop Now
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Quick Links
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              About and Support
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {aboutLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Newsletter
            </p>
            <div className="mt-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          <p>Copyright (c) 2026 Gunjan Hosiery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
