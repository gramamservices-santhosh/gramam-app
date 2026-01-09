'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { CATEGORIES, SAMPLE_PRODUCTS } from '@/constants/categories';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredProducts = SAMPLE_PRODUCTS.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'groceries': return '🛒';
      case 'vegetables': return '🥬';
      case 'fruits': return '🍎';
      case 'dairy': return '🥛';
      case 'medicines': return '💊';
      case 'snacks': return '🍪';
      case 'household': return '🧹';
      case 'meat': return '🍖';
      default: return '📦';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Products</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 20px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#94a3b8' }} />
          <input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === 'all' ? '#059669' : '#f1f5f9',
              color: selectedCategory === 'all' ? '#ffffff' : '#64748b'
            }}
          >
            All Products
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: selectedCategory === cat.id ? '#059669' : '#f1f5f9',
                color: selectedCategory === cat.id ? '#ffffff' : '#64748b'
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {filteredProducts.map((product, index) => (
          <div key={`${product.name}-${index}`} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ aspectRatio: '1', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px' }}>{getCategoryIcon(product.category)}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{product.name}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{product.unit}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                {formatPrice(product.price)}
              </span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor: product.inStock ? '#dcfce7' : '#fee2e2',
                color: product.inStock ? '#16a34a' : '#dc2626'
              }}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button style={{ flex: 1, padding: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit2 style={{ width: '14px', height: '14px' }} />
                Edit
              </button>
              <button style={{ padding: '10px', backgroundColor: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <Trash2 style={{ width: '14px', height: '14px', color: '#dc2626' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block' }}>📦</span>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginTop: '16px' }}>No products found</p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Try adjusting your filters</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Add Product</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '24px', height: '24px', color: '#64748b' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Product Name</label>
                <input type="text" placeholder="Enter product name" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Price</label>
                  <input type="number" placeholder="0" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Unit</label>
                  <input type="text" placeholder="kg, L, pc" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Category</label>
                <select style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  placeholder="Product description..."
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
