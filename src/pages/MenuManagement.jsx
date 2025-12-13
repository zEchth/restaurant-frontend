import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Plus, Search, Edit2, Trash2, Tag, DollarSign, FileText, Layers, X } from 'lucide-react';
import Modal from '../components/Modal';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]); // State dinamis kategori
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // State Modal Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', categoryId: '', description: '', isAvailable: true
  });

  // State Modal Kategori
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchData();
  }, [search]);

  // Ambil Data Menu & Kategori sekaligus
  const fetchData = async () => {
    try {
      const [resMenu, resCat] = await Promise.all([
        api.get(`/menus?search=${search}&limit=100`),
        api.get('/categories')
      ]);
      setMenus(resMenu.data.data);
      setCategories(resCat.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC MENU ---
  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: Number(formData.price), categoryId: Number(formData.categoryId) };
      if (isEditMode) {
        await api.patch(`/menus/${selectedId}`, payload);
        toast.success('Menu berhasil diupdate');
      } else {
        await api.post('/menus', payload);
        toast.success('Menu baru berhasil dibuat');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu');
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Hapus menu ini?')) return;
    try {
      await api.delete(`/menus/${id}`);
      toast.success('Menu dihapus');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal hapus');
    }
  };

  // --- LOGIC KATEGORI ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { name: newCatName });
      toast.success('Kategori ditambah');
      setNewCatName('');
      // Refresh kategori saja
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      toast.error('Gagal tambah kategori');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategori dihapus');
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal hapus kategori');
    }
  };

  // Helpers Modal
  const openAddModal = () => {
    if (categories.length === 0) {
      toast.warn('Buat Kategori dulu sebelum buat Menu!');
      setIsCatModalOpen(true);
      return;
    }
    setIsEditMode(false);
    setFormData({ name: '', price: '', categoryId: categories[0]?.id, description: '', isAvailable: true });
    setIsModalOpen(true);
  };

  const openEditModal = (menu) => {
    setIsEditMode(true);
    setSelectedId(menu.id);
    setFormData({
      name: menu.name, price: menu.price, categoryId: menu.categoryId,
      description: menu.description || '', isAvailable: menu.isAvailable
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedId(null); };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500 text-sm mt-1">Atur menu dan kategori makanan</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <Layers size={18} /> Kelola Kategori
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
          >
            <Plus size={18} /> Tambah Menu
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" placeholder="Cari nama menu..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Table Menu */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Menu</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading data...</td></tr>
              ) : menus.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Tidak ada menu</td></tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{menu.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{menu.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                        <Tag size={12} /> {menu.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Rp {Number(menu.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${menu.isAvailable ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {menu.isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(menu)} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteMenu(menu.id)} className="p-2 border rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM MENU --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? 'Edit Menu' : 'Tambah Menu Baru'}>
        <form onSubmit={handleSubmitMenu} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nama Menu</label>
            <input type="text" required className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Harga</label>
              <input type="number" required min="0" className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Kategori</label>
              <select className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" className="w-5 h-5" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
            <label htmlFor="avail" className="text-sm text-gray-700">Tersedia</label>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Simpan</button>
        </form>
      </Modal>

      {/* --- MODAL KELOLA KATEGORI --- */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Kelola Kategori">
        <div className="space-y-6">
          {/* Form Tambah */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nama Kategori Baru..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              <Plus size={20} />
            </button>
          </form>

          {/* List Kategori */}
          <div className="border rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                <span className="font-medium text-gray-700">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {cat._count?.menus || 0} Menu
                  </span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Hapus Kategori"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            *Kategori hanya bisa dihapus jika tidak memiliki menu di dalamnya.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default MenuManagement;