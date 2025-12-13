import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreHorizontal 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState(''); // '' = All
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Panggil API Backend yang sudah canggih (Support Filter & Pagination)
      const res = await api.get('/orders', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter || undefined,
          search: search || undefined,
          sort: 'desc'
        }
      });
      
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  // Update Status (PENDING -> PAID -> READY)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status berhasil diubah jadi ${newStatus}`);
      fetchOrders(); // Refresh data
    } catch (err) {
      toast.error('Gagal update status');
    }
  };

  // Cancel Order
  const handleCancel = async (orderId) => {
    if (!window.confirm('Yakin ingin membatalkan pesanan ini? Stok tidak akan kembali otomatis (fitur advanced).')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Pesanan dibatalkan');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal batalkan pesanan');
    }
  };

  // Helper Warna Status
  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'READY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Helper Rupiah
  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(val);

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pesanan</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau semua transaksi yang masuk</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari kasir..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'PENDING', 'PAID', 'READY', 'CANCELLED'].map((stat) => (
          <button
            key={stat}
            onClick={() => { setStatusFilter(stat); setPagination({...pagination, page: 1}); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              statusFilter === stat 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {stat === '' ? 'Semua Pesanan' : stat}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Kasir</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400">Tidak ada pesanan ditemukan</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {format(parseISO(order.createdAt), 'dd MMM, HH:mm', { locale: id })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {order.user?.name?.charAt(0)}
                        </div>
                        {order.user?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{formatIDR(order.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                      {order.orderItems?.map(i => `${i.menu.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* Tombol Proses (Hanya muncul jika PENDING) */}
                        {order.status === 'PENDING' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'PAID')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                            title="Tandai Sudah Bayar"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {/* Tombol Selesai (Jika PAID -> READY) */}
                        {order.status === 'PAID' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'READY')}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200"
                            title="Tandai Siap Saji"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {/* Tombol Cancel (Hanya Admin atau Pemilik) */}
                        {(user.role === 'ADMIN' || order.status === 'PENDING') && order.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleCancel(order.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                            title="Batalkan Pesanan"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Hal. <b>{pagination.currentPage}</b> dari <b>{pagination.totalPages}</b> ({pagination.totalRecords} Data)
          </span>
          <div className="flex gap-2">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination({...pagination, page: pagination.currentPage - 1})}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPagination({...pagination, page: pagination.currentPage + 1})}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;