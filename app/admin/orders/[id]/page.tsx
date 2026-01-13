'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, User, CheckCircle, XCircle, Truck, UserPlus, X, Printer, MessageCircle, FileText, StickyNote, Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import Invoice from '@/components/Invoice';

interface Partner {
  id: string;
  name: string;
  phone: string;
  village: string;
  vehicleType: string;
  vehicleNumber: string;
  status: string;
  isActive: boolean;
  documents?: {
    selfie?: string;
  };
}

// Different status flows for different order types
const STATUS_FLOWS: Record<string, string[]> = {
  shopping: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
  ride: ['pending', 'confirmed', 'driver_on_way', 'arrived', 'in_progress', 'completed'],
  service: ['pending', 'confirmed', 'technician_assigned', 'in_progress', 'completed'],
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  driver_on_way: 'Driver On Way',
  arrived: 'Driver Arrived',
  in_progress: 'In Progress',
  completed: 'Completed',
  technician_assigned: 'Technician Assigned',
  cancelled: 'Cancelled',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#dbeafe', text: '#2563eb' },
  preparing: { bg: '#e0e7ff', text: '#4f46e5' },
  out_for_delivery: { bg: '#dbeafe', text: '#2563eb' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  driver_on_way: { bg: '#fef3c7', text: '#d97706' },
  arrived: { bg: '#dbeafe', text: '#2563eb' },
  in_progress: { bg: '#e0e7ff', text: '#4f46e5' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  technician_assigned: { bg: '#dbeafe', text: '#2563eb' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Partner assignment state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedPartner, setAssignedPartner] = useState<Partner | null>(null);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Final amount state (commission/charges)
  const [finalAmount, setFinalAmount] = useState<string>('');
  const [showAmountModal, setShowAmountModal] = useState(false);

  // Invoice and notes state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orderRef = doc(db, 'orders', id);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const orderData = { id: doc.id, ...doc.data() } as Order & { assignedPartner?: Partner; notes?: string };
        setOrder(orderData);
        // Set assigned partner if exists
        if (orderData.assignedPartner) {
          setAssignedPartner(orderData.assignedPartner);
        }
        // Set notes if exists
        if (orderData.notes) {
          setOrderNotes(orderData.notes);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Fetch available partners when modal opens
  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const partnersRef = collection(db, 'partners');
      const q = query(
        partnersRef,
        where('status', '==', 'approved'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      const partnersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Partner[];
      setPartners(partnersData);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleOpenAssignModal = () => {
    fetchPartners();
    setShowAssignModal(true);
  };

  const handleAssignPartner = async (partner: Partner) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        assignedPartner: {
          id: partner.id,
          name: partner.name,
          phone: partner.phone,
          vehicleType: partner.vehicleType,
          vehicleNumber: partner.vehicleNumber,
          selfie: partner.documents?.selfie || null,
        },
        updatedAt: serverTimestamp(),
      });
      setAssignedPartner(partner);
      setShowAssignModal(false);
      setSuccessMsg(`Partner ${partner.name} assigned to order`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to assign partner');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemovePartner = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        assignedPartner: null,
        updatedAt: serverTimestamp(),
      });
      setAssignedPartner(null);
      setSuccessMsg('Partner removed from order');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to remove partner');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteWithAmount = () => {
    // Show modal to enter final amount before completing
    setFinalAmount(order?.totalAmount?.toString() || '0');
    setShowAmountModal(true);
  };

  const completeOrderWithAmount = async () => {
    if (!order) return;
    const amount = parseFloat(finalAmount) || 0;
    if (amount <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      const finalStatus = order.type === 'shopping' ? 'delivered' : 'completed';
      await updateDoc(orderRef, {
        status: finalStatus,
        finalAmount: amount,
        updatedAt: serverTimestamp(),
      });
      setShowAmountModal(false);
      setSuccessMsg(`Order completed with amount ₹${amount}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to complete order');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setSuccessMsg(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
    setIsUpdating(false);
  };

  const getStatusFlow = () => {
    if (!order) return STATUS_FLOWS.shopping;
    return STATUS_FLOWS[order.type] || STATUS_FLOWS.shopping;
  };

  const getNextStatus = () => {
    if (!order) return null;
    const statusFlow = getStatusFlow();
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  // Print invoice
  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Order #${order?.id.slice(-6)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; }
            @media print {
              @page { size: A4; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Share invoice via WhatsApp
  const handleWhatsAppShare = () => {
    if (!order) return;
    const phone = order.userPhone.replace(/[^0-9]/g, '');
    const finalAmt = (order as any).finalAmount || order.totalAmount;

    const message = `*Gramam Services - Invoice*

Order #${order.id.slice(-6)}
Date: ${formatDate(order.createdAt)}

Customer: ${order.userName || 'Customer'}
${order.type === 'shopping' ? `Items: ${order.items?.length || 0} items` : ''}
${order.type === 'ride' || order.type === 'transport' ? `From: ${order.pickup?.name}
To: ${order.drop?.name}
Distance: ${order.distance?.toFixed(1)} km` : ''}
${order.type === 'service' ? `Service: ${order.serviceType} - ${order.serviceOption || ''}` : ''}

*Total Amount: ₹${finalAmt}*

Thank you for choosing Gramam Services!
Contact: +91 8667510724`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  // Save order notes
  const handleSaveNotes = async () => {
    if (!order) return;
    setSavingNotes(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        notes: orderNotes,
        updatedAt: serverTimestamp(),
      });
      setSuccessMsg('Notes saved successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to save notes');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '32px', height: '32px', border: '4px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>Order not found</p>
        <button onClick={() => router.back()} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Go Back
        </button>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };

  return (
    <div>
      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>{successMsg}</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Order #{order.id.slice(-6)}</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{formatDate(order.createdAt)}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Invoice Actions */}
          <button
            onClick={() => setShowInvoiceModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
            Invoice
          </button>
          <button
            onClick={handlePrintInvoice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#dbeafe',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#2563eb',
              cursor: 'pointer'
            }}
          >
            <Printer style={{ width: '16px', height: '16px' }} />
            Print
          </button>
          <button
            onClick={handleWhatsAppShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#dcfce7',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#16a34a',
              cursor: 'pointer'
            }}
          >
            <MessageCircle style={{ width: '16px', height: '16px' }} />
            WhatsApp
          </button>
          <span style={{ padding: '6px 16px', backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Customer Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User style={{ width: '20px', height: '20px', color: '#64748b' }} />
                <span style={{ color: '#1e293b' }}>{order.userName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone style={{ width: '20px', height: '20px', color: '#64748b' }} />
                <span style={{ color: '#1e293b' }}>{order.userPhone}</span>
              </div>
              {order.deliveryAddress && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#64748b', marginTop: '2px' }} />
                  <div>
                    <p style={{ color: '#1e293b', margin: 0 }}>{order.deliveryAddress.street}</p>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>{order.deliveryAddress.village}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Items</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: index < (order.items?.length || 0) - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#1e293b', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>{formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: '500', color: '#1e293b' }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ride Details */}
          {order.type === 'transport' && order.pickup && order.drop && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Ride Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Pickup</p>
                    <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{order.pickup.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Dropoff</p>
                    <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{order.drop.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Vehicle</span>
                  <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{order.transportType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Distance</span>
                  <span style={{ color: '#1e293b' }}>{order.distance?.toFixed(1)} km</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Details */}
          {order.type === 'service' && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Service Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Service Type</span>
                  <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{order.serviceType}</span>
                </div>
                {order.serviceOption && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Service</span>
                    <span style={{ color: '#1e293b' }}>{order.serviceOption}</span>
                  </div>
                )}
                {order.description && (
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ color: '#64748b', margin: '0 0 4px' }}>Description</p>
                    <p style={{ color: '#1e293b', margin: 0 }}>{order.description}</p>
                  </div>
                )}
                {order.preferredDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Scheduled</span>
                    <span style={{ color: '#1e293b' }}>{order.preferredDate} {order.preferredTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Summary */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ color: '#1e293b' }}>{formatPrice(order.itemsTotal || order.totalAmount)}</span>
              </div>
              {order.deliveryCharge !== undefined && order.deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Delivery</span>
                  <span style={{ color: '#1e293b' }}>{formatPrice(order.deliveryCharge)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus('confirmed')}
                    disabled={isUpdating}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                  >
                    <CheckCircle style={{ width: '18px', height: '18px' }} />
                    Accept Order
                  </button>
                  <button
                    onClick={() => updateStatus('cancelled')}
                    disabled={isUpdating}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                  >
                    <XCircle style={{ width: '18px', height: '18px' }} />
                    Reject Order
                  </button>
                </>
              )}
              {nextStatus && order.status !== 'pending' && order.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    // For final status, show amount modal
                    if (nextStatus === 'delivered' || nextStatus === 'completed') {
                      handleCompleteWithAmount();
                    } else {
                      updateStatus(nextStatus);
                    }
                  }}
                  disabled={isUpdating}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                >
                  {(nextStatus === 'out_for_delivery' || nextStatus === 'driver_on_way') && <Truck style={{ width: '18px', height: '18px' }} />}
                  {(nextStatus === 'delivered' || nextStatus === 'completed') && <CheckCircle style={{ width: '18px', height: '18px' }} />}
                  Mark as {STATUS_LABELS[nextStatus] || nextStatus}
                </button>
              )}
              {(order.status === 'delivered' || order.status === 'completed') && (
                <div>
                  <p style={{ textAlign: 'center', color: '#16a34a', fontWeight: '500', margin: '0 0 8px' }}>Order Completed</p>
                  {(order as any).finalAmount && (
                    <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#059669', margin: 0 }}>
                      Final Amount: ₹{(order as any).finalAmount}
                    </p>
                  )}
                </div>
              )}
              {order.status === 'cancelled' && (
                <p style={{ textAlign: 'center', color: '#dc2626', fontWeight: '500' }}>Order Cancelled</p>
              )}
            </div>
          </div>

          {/* Assigned Partner */}
          {(order.type === 'ride' || order.type === 'transport' || order.type === 'shopping') && order.status !== 'cancelled' && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>
                {order.type === 'ride' || order.type === 'transport' ? 'Assigned Driver' : 'Delivery Partner'}
              </h2>

              {assignedPartner ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#f1f5f9'
                    }}>
                      {assignedPartner.documents?.selfie ? (
                        <img src={assignedPartner.documents.selfie} alt={assignedPartner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{assignedPartner.name}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                        {assignedPartner.vehicleType === 'auto' ? '🛺' : '🏍️'} {assignedPartner.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Phone style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{assignedPartner.phone}</span>
                  </div>
                  <button
                    onClick={handleRemovePartner}
                    disabled={isUpdating}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: isUpdating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Remove Partner
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>No partner assigned yet</p>
                  <button
                    onClick={handleOpenAssignModal}
                    disabled={isUpdating}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <UserPlus style={{ width: '18px', height: '18px' }} />
                    Assign Partner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getStatusFlow().map((status, index) => {
                const statusFlow = getStatusFlow();
                const currentIndex = statusFlow.indexOf(order.status);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#16a34a' : '#e2e8f0',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none'
                    }} />
                    <span style={{
                      color: isCompleted ? '#1e293b' : '#94a3b8',
                      fontWeight: isCurrent ? '600' : '400'
                    }}>
                      {STATUS_LABELS[status] || status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Notes */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StickyNote style={{ width: '18px', height: '18px' }} />
                Order Notes
              </h2>
            </div>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add notes about this order (internal use only)..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                fontSize: '13px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: savingNotes ? 'not-allowed' : 'pointer',
                opacity: savingNotes ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Assign Partner Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Select Partner</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '18px', height: '18px', color: '#64748b' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
              {loadingPartners ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <p style={{ color: '#64748b' }}>Loading partners...</p>
                </div>
              ) : partners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <User style={{ width: '40px', height: '40px', color: '#94a3b8', margin: '0 auto 12px' }} />
                  <p style={{ color: '#64748b', margin: 0 }}>No available partners found</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0 0' }}>Partners must be approved and active</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {partners.map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => handleAssignPartner(partner)}
                      disabled={isUpdating}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#e2e8f0',
                        flexShrink: 0
                      }}>
                        {partner.documents?.selfie ? (
                          <img src={partner.documents.selfie} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '14px' }}>{partner.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {partner.vehicleType === 'auto' ? '🛺' : '🏍️'} {partner.vehicleNumber}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            📍 {partner.village}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        Assign
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Amount Entry Modal */}
      {showAmountModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Enter Final Amount</h2>
              <button
                onClick={() => setShowAmountModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '18px', height: '18px', color: '#64748b' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px' }}>
                Enter the final amount collected for this order (commission/charges included).
              </p>

              {/* Order Amount Reference */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Original Order Amount</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>₹{order?.totalAmount || 0}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Final Amount (₹)
                </label>
                <input
                  type="number"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    fontSize: '18px',
                    fontWeight: '600',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAmountModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={completeOrderWithAmount}
                  disabled={isUpdating || !finalAmount || parseFloat(finalAmount) <= 0}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (isUpdating || !finalAmount || parseFloat(finalAmount) <= 0) ? 'not-allowed' : 'pointer',
                    opacity: (isUpdating || !finalAmount || parseFloat(finalAmount) <= 0) ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle style={{ width: '18px', height: '18px' }} />
                  {isUpdating ? 'Completing...' : 'Complete Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText style={{ width: '20px', height: '20px' }} />
                Invoice Preview
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrintInvoice}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Printer style={{ width: '16px', height: '16px' }} />
                  Print
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                  Send to WhatsApp
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ width: '18px', height: '18px', color: '#64748b' }} />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f1f5f9', padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
                <Invoice ref={invoiceRef} order={order as any} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice for Printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <Invoice ref={invoiceRef} order={order as any} />
      </div>
    </div>
  );
}
