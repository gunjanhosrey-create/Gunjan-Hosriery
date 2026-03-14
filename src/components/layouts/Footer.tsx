import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Gunjan Hosrey</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Premium fashion destination for men, women, and kids. Experience luxury in every stitch.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-gold transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=pogo-sets" className="hover:text-gold transition-colors">
                  Pogo Sets
                </Link>
              </li>
              <li>
                <Link to="/products?category=zara-style" className="hover:text-gold transition-colors">
                  Zara Style
                </Link>
              </li>
              <li>
                <Link to="/products?category=little-champ" className="hover:text-gold transition-colors">
                  Little Champ
                </Link>
              </li>
              <li>
                <Link to="/products?category=t-shirts" className="hover:text-gold transition-colors">
                  T-Shirts
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Fashion Street, Mumbai, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@gunjanhosrey.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; 2026 Gunjan Hosrey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
