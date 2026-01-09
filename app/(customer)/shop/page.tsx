'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CategoryList from '@/components/shop/CategoryList';
import ProductCard from '@/components/shop/ProductCard';
import { CATEGORIES, SAMPLE_PRODUCTS } from '@/constants/categories';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, customOrderDescription, setCustomOrder } = useCartStore();

  const cartTotal = items.reduce((sum, item) => sum + item.total, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return SAMPLE_PRODUCTS;

    const query = searchQuery.toLowerCase();
    return SAMPLE_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, typeof SAMPLE_PRODUCTS> = {};
    CATEGORIES.forEach((cat) => {
      grouped[cat.id] = filteredProducts.filter((p) => p.category === cat.id);
    });
    return grouped;
  }, [filteredProducts]);

  return (
    <div className="px-4 py-4 pb-32">
      {/* Search Bar */}
      <div className="sticky top-[60px] z-30 bg-background/80 backdrop-blur-lg py-2 -mx-4 px-4">
        <Input
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          rightIcon={
            searchQuery ? (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-5 h-5" />
              </button>
            ) : undefined
          }
        />
      </div>

      {/* Categories */}
      <div className="mt-4 -mx-4 px-4">
        <CategoryList />
      </div>

      {/* Custom Order Request */}
      <Card className="mt-4 bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30">
        <h3 className="font-semibold text-foreground">Need something specific?</h3>
        <p className="text-sm text-muted mt-1">
          Describe what you need and we&apos;ll get it for you!
        </p>
        <textarea
          placeholder="E.g., 2kg Basmati rice from Kumar Store, special spice mix..."
          value={customOrderDescription}
          onChange={(e) => setCustomOrder(e.target.value)}
          className="mt-3 w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
          rows={2}
        />
      </Card>

      {/* Products by Category */}
      {searchQuery ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Search Results ({filteredProducts.length})
          </h2>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product, index) => (
                <ProductCard key={`${product.name}-${index}`} product={product} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <span className="text-4xl">🔍</span>
              <p className="text-muted mt-2">No products found</p>
              <p className="text-sm text-muted mt-1">
                Try a different search term or use custom order
              </p>
            </Card>
          )}
        </div>
      ) : (
        CATEGORIES.map((category) => {
          const products = productsByCategory[category.id];
          if (products.length === 0) return null;

          return (
            <div key={category.id} className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">
                  {category.icon} {category.name}
                </h2>
                <Link
                  href={`/shop/${category.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  See All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((product, index) => (
                  <ProductCard key={`${product.name}-${index}`} product={product} />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Cart Summary Bar */}
      {(cartCount > 0 || customOrderDescription) && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Link href="/cart">
              <Card className="bg-primary shadow-lg shadow-primary/25 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {cartCount > 0 ? `${cartCount} items` : 'Custom Order'}
                    </p>
                    {cartTotal > 0 && (
                      <p className="text-white/80 text-sm">{formatPrice(cartTotal)}</p>
                    )}
                  </div>
                </div>
                <span className="text-white font-medium">View Cart →</span>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
