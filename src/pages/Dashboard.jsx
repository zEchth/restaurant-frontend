import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingOrders: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Ambil 100 order terakhir untuk kalkulasi statistik
      // (Di production sebaiknya buat endpoint khusus analytics di backend)
      const res = await api.get('/orders?limit=100&sort=desc');
      const orders = res.data.data;

      // 1. Hitung Statistik Kartu
      const totalRevenue = orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        pendingOrders
      });

      setRecentOrders(orders.slice(0, 5)); // Ambil 5 order terbaru

      // 2. Siapkan Data Grafik (Omset 7 Hari Terakhir)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return format(d, 'yyyy-MM-dd');
      });

      const chart = last7Days.map(dateStr => {
        // Cari order di tanggal ini
        const dayRevenue = orders
          .filter(o => o.createdAt.startsWith(dateStr) && o.status !== 'CANCELLED')
          .reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
        
        return {
          date: format(parseISO(dateStr), 'dd MMM', { locale: id }), // Format: 14 Des
          revenue: dayRevenue
        };
      });

      setChartData(chart);

    } catch (err) {
      console.error("Gagal ambil data dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0
  }).format(val);

  // Komponen Kartu Statistik
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'} font-medium`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend === 'up' ? '+12.5%' : '-2.4%'}
        </span>
        <span className="text-gray-400 ml-2">dari kemarin</span>
      </div>
    </div>
  );

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Selamat datang kembali, {user?.name} 👋</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          <Calendar size={18} />
          {format(new Date(), 'dd MMMM yyyy', { locale: id })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendapatan" 
          value={formatIDR(stats.totalRevenue)} 
          icon={DollarSign} 
          color="bg-emerald-500"
          trend="up"
        />
        <StatCard 
          title="Total Pesanan" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          color="bg-blue-500"
          trend="up"
        />
        <StatCard 
          title="Rata-rata Order" 
          value={formatIDR(stats.avgOrderValue)} 
          icon={TrendingUp} 
          color="bg-purple-500"
          trend="down"
        />
        <StatCard 
          title="Pesanan Pending" 
          value={stats.pendingOrders} 
          icon={Users} 
          color="bg-orange-500"
          trend="up"
        />
      </div>

      {/* Charts & Recent Orders Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Analitik Penjualan (7 Hari)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  formatter={(value) => [formatIDR(value), 'Pendapatan']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Pesanan Terbaru</h3>
            <button className="text-sm text-indigo-600 font-medium hover:underline">Lihat Semua</button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                    #{order.id}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{format(parseISO(order.createdAt), 'HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">{formatIDR(order.totalPrice)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-gray-400 text-center py-4">Belum ada pesanan.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;