import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/types/index';

interface CategoryShowcaseProps {
  category: Category;
}

export function CategoryShowcase({ category }: CategoryShowcaseProps) {
  return (
    <Link to={`/products?category=${category.slug}`}>
      <Card className="group overflow-hidden border-border bg-card hover:luxury-shadow transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {category.image_url && (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-full w-full object-cover product-3d"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
            <div>
              <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-primary-foreground/90">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
