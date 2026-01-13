'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, FileText, TrendingUp, IndianRupee, Package, Users } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

type ReportType = 'orders' | 'revenue' | 'partners' | 'users';
type DateRange = 'today' | 'week' | 'month' | 'custom';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('orders');
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Report data
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  });

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(now);

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const customEnd = new Date(endDate);
          customEnd.setHours(23, 59, 59, 999);
          return { start, end: customEnd };
        }
        break;
    }

    return { start, end };
  };

  const fetchReport = async () => {
    setIsLoading(true);
    const { start, end } = getDateRange();

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(ordersData);

      // Calculate stats
      const completed = ordersData.filter(o => ['completed', 'delivered'].includes(o.status));
      const cancelled = ordersData.filter(o => o.status === 'cancelled');
      const totalRev = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalOrders: ordersData.length,
        totalRevenue: totalRev,
        completedOrders: completed.length,
        cancelledOrders: cancelled.length,
        avgOrderValue: completed.length > 0 ? totalRev / completed.length : 0,
      });
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, startDate, endDate]);

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      let csvContent = '';
      const { start, end } = getDateRange();
      const dateStr = `${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')}`;

      if (reportType === 'orders') {
        // Orders CSV
        csvContent = 'Order ID,Type,Customer,Phone,Village,Amount,Status,Date,Payment Method\n';
        orders.forEach(order => {
          csvContent += `${order.id},${order.type},${order.userName || 'N/A'},${order.userPhone || 'N/A'},${order.userVillage || 'N/A'},${order.totalAmount || 0},${order.status},${order.createdAt?.toDate().toLocaleDateString('en-IN') || 'N/A'},${order.paymentMethod || 'COD'}\n`;
        });
      } else if (reportType === 'revenue') {
        // Revenue CSV
        csvContent = 'Date,Order ID,Type,Amount,Status\n';
        orders.filter(o => ['completed', 'delivered'].includes(o.status)).forEach(order => {
          csvContent += `${order.createdAt?.toDate().toLocaleDateString('en-IN') || 'N/A'},${order.id},${order.type},${order.totalAmount || 0},${order.status}\n`;
        });
        csvContent += `\nTotal Revenue,${stats.totalRevenue}\n`;
        csvContent += `Total Orders,${stats.completedOrders}\n`;
        csvContent += `Average Order Value,${stats.avgOrderValue.toFixed(2)}\n`;
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `gramam_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const reportTypes = [
    { id: 'orders', label: 'All Orders', icon: Package },
    { id: 'revenue', label: 'Revenue', icon: IndianRupee },
  ];

  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Reports</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Generate and export business reports</p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          {/* Report Type */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
              Report Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id as ReportType)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: reportType === type.id ? '#059669' : '#f8fafc',
                      color: reportType === type.id ? '#ffffff' : '#64748b',
                      border: reportType === type.id ? 'none' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Icon style={{ width: '16px', height: '16px' }} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
              Date Range
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id as DateRange)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: dateRange === range.id ? '#dbeafe' : '#f8fafc',
                    color: dateRange === range.id ? '#2563eb' : '#64748b',
                    border: dateRange === range.id ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    fontSize: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    fontSize: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={isExporting || orders.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isExporting || orders.length === 0 ? 'not-allowed' : 'pointer',
              opacity: isExporting || orders.length === 0 ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: 'auto'
            }}
          >
            <Download style={{ width: '18px', height: '18px' }} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.totalOrders}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Orders</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee style={{ width: '22px', height: '22px', color: '#16a34a' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{formatPrice(stats.totalRevenue)}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Revenue</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{formatPrice(stats.avgOrderValue)}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Avg Order Value</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#e0e7ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText style={{ width: '22px', height: '22px', color: '#4f46e5' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {stats.completedOrders}/{stats.totalOrders}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Completed Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {reportType === 'orders' ? 'Orders List' : 'Revenue Details'}
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Loading report data...</p>
          </div>
        ) : orders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 50).map((order) => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    pending: { bg: '#fef3c7', text: '#d97706' },
                    confirmed: { bg: '#dbeafe', text: '#2563eb' },
                    delivered: { bg: '#dcfce7', text: '#16a34a' },
                    completed: { bg: '#dcfce7', text: '#16a34a' },
                    cancelled: { bg: '#fee2e2', text: '#dc2626' },
                  };
                  const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                        #{order.id.slice(-6)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#64748b', textTransform: 'capitalize' }}>
                        {order.type}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{order.userName || 'N/A'}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{order.userVillage || ''}</p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#059669', textAlign: 'right' }}>
                        {formatPrice(order.totalAmount || 0)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>
                        {order.createdAt?.toDate().toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length > 50 && (
              <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Showing 50 of {orders.length} orders. Export CSV to see all data.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>No Data Found</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>No orders found for the selected date range</p>
          </div>
        )}
      </div>
    </div>
  );
}
