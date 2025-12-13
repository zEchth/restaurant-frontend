import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Plus, Search, Edit2, Trash2, Tag, DollarSign, FileText } from 'lucide-react';
import Modal from '../components/Modal';

// Kategori Hardcode (Sesuai Seed Database kita)
const CATEGORIES = [
  { id: 1, name: 'Makanan Berat' },
  { id: 2, name: 'Minuman' },
  { id: 3, name: 'Camilan' },
];

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: 1,
    description: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchMenus();
  }, [search]);

  const fetchMenus = async () => {
    try {
      // Fetch data dari backend (support search)
      const res = await api.get(`/menus?search=${search}&limit=100`);
      setMenus(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      await api.delete(`/menus/${id}`);
      toast.success('Menu berhasil dihapus');
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus menu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId)
      };

      if (isEditMode) {
        await api.patch(`/menus/${selectedId}`, payload);
        toast.success('Menu berhasil diupdate');
      } else {
        await api.post('/menus', payload);
        toast.success('Menu baru berhasil dibuat');
      }
      
      closeModal();
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu');
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: '', price: '', categoryId: 1, description: '', isAvailable: true });
    setIsModalOpen(true);
  };

  const openEditModal = (menu) => {
    setIsEditMode(true);
    setSelectedId(menu.id);
    setFormData({
      name: menu.name,
      price: menu.price,
      categoryId: menu.categoryId,
      description: menu.description || '',
      isAvailable: menu.isAvailable
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Menu</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola daftar menu restoran Anda</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} /> Tambah Menu
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama menu..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Modern Table */}
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
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Tidak ada menu ditemukan</td></tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{menu.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{menu.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                        <Tag size={12} /> {menu.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Rp {Number(menu.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        menu.isAvailable 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${menu.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {menu.isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(menu)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-all hover:border-gray-300"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(menu.id)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 text-red-500 transition-all hover:border-red-200"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={isEditMode ? 'Edit Menu' : 'Tambah Menu Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Contoh: Nasi Goreng"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[80px]"
              placeholder="Deskripsi singkat..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input 
              type="checkbox" 
              id="isAvailable"
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-700 font-medium select-none cursor-pointer">
              Menu Tersedia (Ready Stock)
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all"
            >
              {isEditMode ? 'Simpan Perubahan' : 'Buat Menu'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuManagement;