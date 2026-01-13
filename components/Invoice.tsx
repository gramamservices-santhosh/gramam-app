'use client';

import { forwardRef } from 'react';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface InvoiceProps {
  order: Order & { finalAmount?: number; assignedPartner?: any };
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
}

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({
  order,
  businessName = 'Gramam Services',
  businessPhone = '+91 8667510724',
  businessAddress = 'Vaniyambadi, Thirupathur District, Tamil Nadu'
}, ref) => {
  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`;

  const getOrderTypeLabel = () => {
    switch (order.type) {
      case 'shopping': return 'Delivery Order';
      case 'ride': return 'Ride Booking';
      case 'transport': return 'Transport Service';
      case 'service': return 'Service Request';
      default: return 'Order';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#1e293b',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid #059669', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>🏘️</span>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#059669', margin: 0 }}>{businessName}</h1>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>{businessAddress}</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>Phone: {businessPhone}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>INVOICE</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Invoice #:</strong> {invoiceNumber}</p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Date:</strong> {invoiceDate}</p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 12px', textTransform: 'uppercase' }}>Bill To</h3>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>{order.userName || 'Customer'}</p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{order.userPhone}</p>
          {order.deliveryAddress && (
            <>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{order.deliveryAddress.street}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{order.deliveryAddress.village}</p>
            </>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 12px', textTransform: 'uppercase' }}>Order Details</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Order ID:</strong> #{order.id.slice(-6)}</p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Type:</strong> {getOrderTypeLabel()}</p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: '500' }}>{order.status.toUpperCase()}</span></p>
          {order.assignedPartner && (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Delivered By:</strong> {order.assignedPartner.name}</p>
          )}
        </div>
      </div>

      {/* Items Table for Shopping Orders */}
      {order.items && order.items.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Qty</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{index + 1}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>{item.name}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', fontWeight: '500', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ride Details */}
      {(order.type === 'ride' || order.type === 'transport') && order.pickup && order.drop && (
        <div style={{ marginBottom: '30px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 12px' }}>RIDE DETAILS</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Pickup Location</p>
              <p style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', margin: 0 }}>{order.pickup.name}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Drop Location</p>
              <p style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', margin: 0 }}>{order.drop.name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}><strong>Vehicle:</strong> {order.transportType || order.vehicleType}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}><strong>Distance:</strong> {order.distance?.toFixed(1)} km</p>
          </div>
        </div>
      )}

      {/* Service Details */}
      {order.type === 'service' && (
        <div style={{ marginBottom: '30px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 12px' }}>SERVICE DETAILS</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Service Type:</strong> {order.serviceType}</p>
          {order.serviceOption && <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Service:</strong> {order.serviceOption}</p>}
          {order.description && <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Description:</strong> {order.description}</p>}
          {order.preferredDate && <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}><strong>Scheduled:</strong> {order.preferredDate} {order.preferredTime}</p>}
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
            <span style={{ fontSize: '13px', color: '#1e293b' }}>{formatPrice(order.itemsTotal || order.totalAmount)}</span>
          </div>
          {order.deliveryCharge !== undefined && order.deliveryCharge > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Delivery/Service Charge</span>
              <span style={{ fontSize: '13px', color: '#1e293b' }}>{formatPrice(order.deliveryCharge)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid #059669' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Order Total</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{formatPrice(order.totalAmount)}</span>
          </div>
          {order.finalAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', backgroundColor: '#f0fdf4', marginTop: '8px', borderRadius: '6px', paddingLeft: '8px', paddingRight: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>Amount Collected</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>{formatPrice(order.finalAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div style={{ marginBottom: '30px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
        <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: '500' }}>
          Payment Mode: Cash on Delivery (COD)
        </p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 8px' }}>Thank you for choosing Gramam Services!</p>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>For any queries, contact us at {businessPhone}</p>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '16px 0 0' }}>This is a computer-generated invoice and does not require a signature.</p>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;
