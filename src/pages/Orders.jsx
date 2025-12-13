import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, 
  XCircle, Clock, Printer, X 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal Detail State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Ref untuk area yang akan di-print
  const printRef = useRef();

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Buka Detail Struk
  const openDetail = async (orderId) => {
    setIsModalOpen(true);
    setLoadingDetail(true);
    try {
      // Panggil endpoint Detail yang sudah kita buat di Backend
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil detail order');
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fungsi Print
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Trik Print: Ganti isi body dengan struk, print, lalu kembalikan
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload agar event listener React kembali normal
  };

  // Update & Cancel (Sama seperti sebelumnya)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status diubah jadi ${newStatus}`);
      fetchOrders();
      if(selectedOrder) openDetail(orderId); // Refresh modal jika sedang terbuka
    } catch (err) {
      toast.error('Gagal update status');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Yakin batalkan pesanan?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Pesanan dibatalkan');
      fetchOrders();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Gagal batalkan pesanan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'READY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(val);

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header & Filter (Sama seperti sebelumnya) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pesanan</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau & Cetak Struk Transaksi</p>
        </div>
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Kasir</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10">Loading...</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {format(parseISO(order.createdAt), 'dd MMM HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">{order.user?.name}</td>
                  <td className="px-6 py-4 font-bold">{formatIDR(order.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openDetail(order.id)}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 border border-indigo-200"
                        title="Lihat Detail & Struk"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer (Sama spt sebelumnya, dipersingkat di sini) */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-2">
            <button disabled={pagination.currentPage===1} onClick={() => setPagination({...pagination, page: pagination.currentPage-1})} className="px-3 py-1 bg-white border rounded">Prev</button>
            <button disabled={pagination.currentPage===pagination.totalPages} onClick={() => setPagination({...pagination, page: pagination.currentPage+1})} className="px-3 py-1 bg-white border rounded">Next</button>
        </div>
      </div>

      {/* MODAL DETAIL & STRUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Detail Pesanan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetail || !selectedOrder ? (
                <div className="text-center py-8">Loading detail...</div>
              ) : (
                <>
                  {/* AREA STRUK (Yang akan di-print) */}
                  <div ref={printRef} className="bg-white p-4 border border-gray-200 rounded-xl mb-6 text-sm font-mono">
                    <div className="text-center mb-4 border-b border-dashed border-gray-300 pb-4">
                      <h2 className="text-xl font-bold uppercase">Resto App</h2>
                      <p className="text-xs text-gray-500">Jl. Teknologi No. 10, Makassar</p>
                      <p className="text-xs text-gray-500">Telp: 0812-3456-7890</p>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Order #{selectedOrder.id}</span>
                      <span>{format(parseISO(selectedOrder.createdAt), 'dd/MM/yy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>Kasir: {selectedOrder.user?.name}</span>
                      <span className="uppercase">{selectedOrder.status}</span>
                    </div>

                    <div className="border-b border-dashed border-gray-300 mb-4"></div>

                    <div className="space-y-2 mb-4">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.menu.name} <span className="text-gray-400">x{item.quantity}</span></span>
                          <span>{formatIDR(Number(item.price) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                      <div className="flex justify-between font-bold text-base">
                        <span>TOTAL</span>
                        <span>{formatIDR(selectedOrder.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Pajak (Inc)</span>
                        <span>-</span>
                      </div>
                    </div>

                    <div className="text-center mt-6 text-xs text-gray-400">
                      <p>Terima Kasih atas Kunjungan Anda!</p>
                      <p>WIFI: RestoApp_Guest / pass123</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {selectedOrder.status === 'PENDING' && (
                       <button onClick={() => handleUpdateStatus(selectedOrder.id, 'PAID')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2">
                         <CheckCircle size={18} /> Bayar
                       </button>
                    )}
                    <button onClick={handlePrint} className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2">
                      <Printer size={18} /> Print Struk
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;