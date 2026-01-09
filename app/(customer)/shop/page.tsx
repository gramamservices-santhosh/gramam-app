'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, X, ChevronRight, Package } from 'lucide-react';
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return SAMPLE_PRODUCTS;

    const query = searchQuery.toLowerCase();
    return SAMPLE_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, typeof SAMPLE_PRODUCTS> = {};
    CATEGORIES.forEach((cat) => {
      grouped[cat.id] = filteredProducts.filter((p) => p.category === cat.id);
    });
    return grouped;
  }, [filteredProducts]);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Shop</h1>
        <p className="text-sm text-muted mt-1">Order groceries, vegetables & more</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-card border border-border rounded-xl pl-11 pr-10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-6">
        <CategoryList />
      </div>

      {/* Custom Order Card */}
      <div className="px-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">Need something specific?</h3>
              <p className="text-xs text-muted mt-0.5">
                Describe what you need and we&apos;ll get it for you
              </p>
            </div>
          </div>
          <textarea
            placeholder="E.g., 2kg Basmati rice, special spice mix..."
            value={customOrderDescription}
            onChange={(e) => setCustomOrder(e.target.value)}
            className="mt-3 w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none transition-colors"
            rows={2}
          />
        </div>
      </div>

      {/* Products */}
      {searchQuery ? (
        <div className="px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Search Results ({filteredProducts.length})
          </h2>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product, index) => (
                <ProductCard key={`${product.name}-${index}`} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Search className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-foreground font-medium">No products found</p>
              <p className="text-sm text-muted mt-1">
                Try a different search or use custom order
              </p>
            </div>
          )}
        </div>
      ) : (
        CATEGORIES.map((category) => {
          const products = productsByCategory[category.id];
          if (products.length === 0) return null;

          return (
            <section key={category.id} className="mb-6">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {category.name}
                </h2>
                <Link
                  href={`/shop/${category.id}`}
                  className="flex items-center gap-1 text-xs text-primary font-medium"
                >
                  See All
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4">
                {products.slice(0, 4).map((product, index) => (
                  <ProductCard key={`${product.name}-${index}`} product={product} />
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* Cart Summary Bar */}
      {(cartCount > 0 || customOrderDescription) && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <div className="max-w-lg mx-auto">
            <Link href="/cart" className="block">
              <div className="bg-primary rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {cartCount > 0 ? `${cartCount} items` : 'Custom Order'}
                    </p>
                    {cartTotal > 0 && (
                      <p className="text-white/80 text-xs">{formatPrice(cartTotal)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-white font-medium text-sm">
                  View Cart
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
