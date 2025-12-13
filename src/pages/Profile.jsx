import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  CheckCircle,
  Edit2,
  Key,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import Modal from "../components/Modal";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  // State Modal Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Kosongkan jika tidak ingin ganti password
  });

  if (!user) return null;

  // Buka Modal & Isi data saat ini
  const openModal = () => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Kirim hanya yang perlu
      const payload = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;

      await api.patch(`/users/${user.id}`, payload);

      toast.success(
        "Profil berhasil diupdate! Silakan login ulang untuk melihat perubahan."
      );
      setIsModalOpen(false);

      // Opsional: Logout otomatis agar data di token ter-refresh
      setTimeout(() => logout(), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal update profil");
    }
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  const roleColor =
    user.role === "ADMIN"
      ? "from-indigo-500 to-purple-600"
      : "from-blue-500 to-cyan-500";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola informasi akun Anda
          </p>
        </div>

        {/* TOMBOL EDIT PROFIL */}
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Edit2 size={16} /> Edit Profil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KARTU PROFIL UTAMA (KIRI) - Sama seperti sebelumnya */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className={`h-32 bg-gradient-to-r ${roleColor}`}></div>
            <div className="px-6 pb-6 text-center relative">
              <div className="w-24 h-24 mx-auto -mt-12 bg-white rounded-full p-1.5 shadow-lg">
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-2xl font-bold`}
                >
                  {getInitials(user.name)}
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {user.name}
              </h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="mt-4 flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    user.role === "ADMIN"
                      ? "bg-purple-50 text-purple-700 border-purple-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}
                >
                  <Shield size={12} /> {user.role}
                </span>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL INFORMASI (KANAN) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-indigo-600" size={20} /> Informasi Pribadi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Alamat Email
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Hak Akses (Role)
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Shield size={18} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">{user.role}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Bergabung Sejak
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">
                    {/* Menggunakan data statis jika createdAt tidak ada di token */}
                    {user.createdAt
                      ? format(parseISO(user.createdAt), "dd MMMM yyyy", {
                          locale: id,
                        })
                      : format(new Date(), "dd MMMM yyyy", { locale: id })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Account Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={20} /> Status Akun
            </h3>
            <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-800">
              <div className="p-2 bg-emerald-100 rounded-full">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold">Akun Aktif</h4>
                <p className="text-sm opacity-80">
                  Anda memiliki akses penuh ke fitur{" "}
                  {user.role === "ADMIN" ? "Administrator" : "Staff"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL EDIT PROFILE --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profil Saya"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                type="text"
                required
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="email"
                required
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Ganti Password (Opsional)
            </label>
            <div className="relative mt-1">
              <Key
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="password"
                placeholder="Biarkan kosong jika tidak diganti"
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-400">
            *Role tidak dapat diubah sendiri. Hubungi Admin untuk perubahan
            akses.
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
          >
            Simpan Perubahan
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
