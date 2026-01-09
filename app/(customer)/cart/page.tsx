'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, incrementQuantity, decrementQuantity, removeItem, clearCart } = useCartStore();

  const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
  const deliveryCharge = itemsTotal > 0 ? 30 : 0;
  const grandTotal = itemsTotal + deliveryCharge;

  const isEmpty = items.length === 0;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: isEmpty ? '100px' : '200px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.back()}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Your Cart</h1>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          {!isEmpty && (
            <button
              onClick={clearCart}
              style={{
                padding: '8px',
                backgroundColor: '#fef2f2',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Trash2 style={{ width: '18px', height: '18px', color: '#ef4444' }} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {isEmpty ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛒</span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>Your cart is empty</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>
              Add items from our shop to get started
            </p>
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShoppingBag style={{ width: '18px', height: '18px' }} />
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Cart Items */}
            {items.map((item) => (
              <div
                key={item.productId}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0
                }}>
                  {item.image || '🛒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{item.name}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{item.unit}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>{formatPrice(item.total)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => decrementQuantity(item.productId)}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Minus style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      </button>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.productId)}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#059669',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Items */}
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px dashed #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <ShoppingBag style={{ width: '18px', height: '18px', color: '#059669' }} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>Add More Items</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Order Summary - Fixed at bottom */}
      {!isEmpty && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Items Total</span>
              <span style={{ fontSize: '14px', color: '#1e293b' }}>{formatPrice(itemsTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Delivery Charge</span>
              <span style={{ fontSize: '14px', color: '#1e293b' }}>{formatPrice(deliveryCharge)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Grand Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <Link href="/checkout" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
