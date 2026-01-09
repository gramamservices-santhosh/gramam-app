'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import CategoryList from '@/components/shop/CategoryList';
import { CATEGORIES, getProductsByCategory } from '@/constants/categories';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;

  const { items } = useCartStore();
  const cartTotal = items.reduce((sum, item) => sum + item.total, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const products = useMemo(() => getProductsByCategory(categoryId), [categoryId]);

  if (!category) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>❓</span>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Category not found</p>
        <Link href="/shop" style={{ color: '#059669', marginTop: '16px', display: 'inline-block', textDecoration: 'none' }}>
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '128px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Link
          href="/shop"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
        </Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            {category.icon} {category.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>{products.length} products</p>
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
        <CategoryList />
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {products.map((product, index) => (
            <ProductCard key={`${product.name}-${index}`} product={product} />
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>📦</span>
          <p style={{ color: '#64748b', marginTop: '8px' }}>No products in this category</p>
        </div>
      )}

      {/* Cart Summary Bar */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: 0, right: 0, padding: '16px', zIndex: 40 }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#059669',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(5, 150, 105, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShoppingCart style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                  </div>
                  <div>
                    <p style={{ color: '#ffffff', fontWeight: '500', margin: 0 }}>{cartCount} items</p>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '2px 0 0' }}>{formatPrice(cartTotal)}</p>
                  </div>
                </div>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>View Cart →</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
