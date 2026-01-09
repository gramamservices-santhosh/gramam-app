'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, X, ChevronRight, Plus, Minus } from 'lucide-react';
import { CATEGORIES, SAMPLE_PRODUCTS } from '@/constants/categories';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, addItem, incrementQuantity, decrementQuantity } = useCartStore();

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

  const getQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (product: typeof SAMPLE_PRODUCTS[0]) => {
    addItem({
      productId: product.name,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
    });
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '140px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Shop</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Order groceries, vegetables & more</p>
      </div>

      {/* Search */}
      <div style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '48px',
              paddingRight: searchQuery ? '48px' : '16px',
              fontSize: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px', marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/shop/${cat.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#374151',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              {cat.icon} {cat.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Products */}
      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
          {searchQuery ? `Results (${filteredProducts.length})` : 'All Products'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {filteredProducts.slice(0, 20).map((product, index) => {
            const qty = getQuantity(product.name);
            return (
              <div key={`${product.name}-${index}`} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  fontSize: '32px'
                }}>
                  {product.category === 'vegetables' ? '🥬' : product.category === 'fruits' ? '🍎' : product.category === 'dairy' ? '🥛' : '🛒'}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0, marginBottom: '4px' }}>{product.name}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginBottom: '8px' }}>{product.unit}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>{formatPrice(product.price)}</span>
                  {qty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#059669',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => decrementQuantity(product.name)}
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Minus style={{ width: '14px', height: '14px' }} />
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                      <button
                        onClick={() => incrementQuantity(product.name)}
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#059669',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: '70px', left: '16px', right: '16px', zIndex: 40 }}>
          <Link href="/cart" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#059669',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px', margin: 0 }}>{cartCount} items</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>{formatPrice(cartTotal)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontWeight: '500', fontSize: '14px' }}>
                View Cart
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { href: '/home', label: 'Home', icon: '🏠', active: false },
            { href: '/shop', label: 'Shop', icon: '🛒', active: true },
            { href: '/ride', label: 'Ride', icon: '🛵', active: false },
            { href: '/services', label: 'Services', icon: '🔧', active: false },
            { href: '/orders', label: 'Orders', icon: '📋', active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 12px' }}>
              <span style={{ fontSize: '20px', display: 'block' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', color: item.active ? '#059669' : '#64748b', fontWeight: item.active ? '600' : '400' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
