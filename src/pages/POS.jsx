import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Eye, Tag, Info } from 'lucide-react'; // Tambah icon Eye, Tag, Info
import { toast } from 'react-toastify';
import Modal from '../components/Modal'; // Import Modal kita

const POS = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // State untuk Detail Menu (Modal)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Helper Format Rupiah
  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Helper Gambar Dummy
  const getImage = (category) => {
    const images = {
      'Makanan Berat': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'Minuman': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
      'Camilan': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80'
    };
    return images[category] || images['default'];
  };

  useEffect(() => {
    fetchMenus();
  }, [search]);

  const fetchMenus = async () => {
    try {
      const res = await api.get(`/menus?search=${search}&limit=100`); 
      setMenus(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logic Cart
  const addToCart = (menu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart.map(item => ({
          menuId: item.id,
          quantity: item.qty
        }))
      };
      await api.post('/orders', payload);
      toast.success('Pesanan Berhasil Dibuat! 🚀');
      setCart([]); 
    } catch (err) {
      toast.error('Gagal membuat pesanan');
    }
  };

  // Logic Detail Modal
  const openDetail = (menu) => {
    setSelectedMenu(menu);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedMenu(null), 200); // Delay biar animasi smooth
  };

  // Logic Add to Cart dari dalam Modal
  const handleAddToCartFromModal = () => {
    addToCart(selectedMenu);
    toast.success(`${selectedMenu.name} masuk keranjang`);
    closeDetail();
  };

  const categories = ['All', ...new Set(menus.map(m => m.category.name))];
  const filteredMenus = selectedCategory === 'All' 
    ? menus 
    : menus.filter(m => m.category.name === selectedCategory);

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden bg-gray-50">
      
      {/* LEFT SECTION: Menu Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pilih Menu</h1>
            <p className="text-gray-400 text-sm mt-1">Temukan makanan favorit pelanggan</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none text-gray-700"
            />
          </div>
        </header>

        {/* Categories Pills */}
        <div className="px-8 py-4 flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 pb-20">
          {loading ? (
             <div className="flex items-center justify-center h-64 text-gray-400">Loading menu...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenus.map((menu) => (
                <div key={menu.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative">
                  
                  {/* Image Container */}
                  <div 
                    className="relative h-40 rounded-xl overflow-hidden mb-4 cursor-pointer"
                    onClick={() => openDetail(menu)} // Klik gambar buka detail
                  >
                    <img 
                      src={getImage(menu.category.name)} 
                      alt={menu.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Badge Category */}
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                      <Tag size={10} /> {menu.category.name}
                    </div>
                  </div>

                  <div className="px-2 pb-2">
                    {/* Title & Info Button */}
                    <div className="flex justify-between items-start mb-1">
                      <h3 
                        className="font-bold text-gray-800 text-lg truncate cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => openDetail(menu)}
                      >
                        {menu.name}
                      </h3>
                      <button 
                        onClick={() => openDetail(menu)}
                        className="text-gray-400 hover:text-indigo-500 transition-colors p-1 -mr-2"
                      >
                        <Info size={18} />
                      </button>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                      {menu.description || 'Tidak ada deskripsi tersedia.'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-extrabold text-lg">{formatIDR(menu.price)}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Mencegah trigger openDetail saat klik tombol Plus
                          addToCart(menu);
                        }}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all active:scale-90"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart Sidebar (Tidak berubah) */}
      <div className="w-86 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" />
            Pesanan
          </h2>
          <p className="text-sm text-gray-400 mt-1">Kasir Mode</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500">Keranjang kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img src={getImage(item.category.name)} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                  <p className="text-indigo-600 text-sm font-semibold mt-1">{formatIDR(item.price)}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><Minus size={14}/></button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><Plus size={14}/></button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 self-start transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>{formatIDR(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Pajak (10%)</span>
              <span>{formatIDR(cartTotal * 0.1)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>{formatIDR(cartTotal * 1.1)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            Proses Pembayaran
          </button>
        </div>
      </div>

      {/* --- MODAL DETAIL MENU --- */}
      <Modal isOpen={isDetailOpen} onClose={closeDetail} title="Detail Menu">
        {selectedMenu && (
          <div className="space-y-6">
            {/* Gambar Besar */}
            <div className="relative h-56 rounded-xl overflow-hidden shadow-sm group">
               <img 
                 src={getImage(selectedMenu.category.name)} 
                 alt={selectedMenu.name} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/30">
                    {selectedMenu.category.name}
                  </span>
               </div>
            </div>

            {/* Info Menu */}
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-800">{selectedMenu.name}</h2>
                <span className="text-xl font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  {formatIDR(selectedMenu.price)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedMenu.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedMenu.isAvailable ? 'Ready Stock' : 'Habis'}
                </span>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-1">Deskripsi</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedMenu.description || 'Tidak ada deskripsi tambahan untuk menu ini.'}
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <button
              onClick={handleAddToCartFromModal}
              disabled={!selectedMenu.isAvailable}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={20} />
              {selectedMenu.isAvailable ? 'Tambah ke Pesanan' : 'Stok Habis'}
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default POS;