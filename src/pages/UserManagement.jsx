import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, User, Mail, Shield, Key } from "lucide-react";
import Modal from "../components/Modal";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Edit2 } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus akses karyawan ini?")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("Karyawan dihapus");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal hapus user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      // Jika password kosong saat edit, hapus dari payload (artinya tidak ganti pass)
      if (isEditMode && !payload.password) delete payload.password;

      if (isEditMode) {
        await api.patch(`/users/${selectedId}`, payload);
        toast.success("Data karyawan diupdate");
      } else {
        await api.post("/users", payload);
        toast.success("Karyawan baru ditambahkan");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal simpan data");
    }
  };

  // Helper Modal
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: "", email: "", password: "", role: "USER" });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Password dikosongkan (placeholder)
      role: user.role,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Karyawan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola akses staff dan admin
          </p>
        </div>
        <button
          onClick={
            openAddModal
          } /* GANTI: Panggil openAddModal agar form ter-reset */
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={18} /> Tambah Karyawan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Bergabung</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    {u.name.charAt(0)}
                  </div>
                  {u.name}
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {format(parseISO(u.createdAt), "dd MMM yyyy", { locale: id })}
                </td>

                {/* --- BAGIAN TOMBOL AKSI (DIUPDATE) --- */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* 1. Tombol Edit (BARU) */}
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                      title="Edit Karyawan"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* 2. Tombol Delete (LAMA) */}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-2 border rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      title="Hapus Karyawan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                {/* ------------------------------------ */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form (UPDATE UNTUK EDIT) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        /* JUDUL DINAMIS: Edit atau Tambah? */
        title={isEditMode ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <div className="relative mt-1">
              <User
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                required
                type="text"
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama staff..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Login
            </label>
            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                required
                type="email"
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@kafe.com"
              />
            </div>
          </div>

          {/* --- INPUT PASSWORD (DIUPDATE) --- */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              {/* Label berubah jika mode edit */}
              Password {isEditMode ? "(Opsional)" : "Awal"}
            </label>
            <div className="relative mt-1">
              <Key
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                /* Wajib diisi HANYA jika TAMBAH BARU (!isEditMode) */
                required={!isEditMode}
                type="password"
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                /* Placeholder berubah biar user paham */
                placeholder={
                  isEditMode ? "Kosongkan jika tidak diganti" : "******"
                }
              />
            </div>
          </div>
          {/* -------------------------------- */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Role / Jabatan
            </label>
            <div className="relative mt-1">
              <Shield
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <select
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="USER">Staff (Kasir)</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg mt-4"
          >
            {/* Teks Tombol Berubah */}
            {isEditMode ? "Simpan Perubahan" : "Simpan Karyawan"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
