import { useEffect, useState } from "react";
import api from "../../../config/api";
import "./DataPribadi.css";

export default function DataPribadi() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("userId");
        const res = await api.get(`/api/data-pribadi/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && Object.keys(res.data).length > 0) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen">Memuat Informasi...</div>;

  if (!user) {
    return (
      <div className="data-container">
        <div className="empty-state">
          <h2>Data Belum Tersedia</h2>
          <p>Silakan hubungi HRD untuk melengkapi data Anda.</p>
        </div>
      </div>
    );
  }

  // Komponen Baris Informasi yang Rapih
  const InfoItem = ({ label, value }) => (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "-"}</span>
    </div>
  );

  return (
    <div className="data-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Profil Karyawan</h2>
        </div>

        <section className="profile-section">
          <h3 className="section-title">Informasi Pribadi</h3>
          <div className="info-grid">
            <InfoItem label="NIK" value={user.nik} />
            <InfoItem label="Nama Lengkap" value={user.nama_lengkap} />
            <InfoItem label="Tempat, Tgl Lahir" value={user.tanggal_lahir ? `${user.tempat_lahir}, ${new Date(user.tanggal_lahir).toLocaleDateString('id-ID')}` : "-"} />
            <InfoItem label="Jenis Kelamin" value={user.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <InfoItem label="Agama" value={user.agama} />
            <InfoItem label="Status Perkawinan" value={user.status_perkawinan} />
            <InfoItem label="Alamat" value={user.alamat} />
          </div>
        </section>

        <section className="profile-section">
          <h3 className="section-title">Informasi Kepegawaian</h3>
          <div className="info-grid">
            <InfoItem label="NIP" value={user.nip} />
            <InfoItem label="Jabatan" value={user.jabatan} />
            <InfoItem label="Divisi" value={user.divisi} />
            <InfoItem label="Status" value={user.status_karyawan} />
          </div>
        </section>

        <section className="profile-section">
          <h3 className="section-title">Informasi Pendidikan</h3>
          <div className="info-grid">
            <InfoItem label="Institusi" value={user.institusi} />
            <InfoItem label="Jurusan" value={user.jurusan} />
            <InfoItem label="Tahun Lulus" value={user.tahun_lulus} />
          </div>
        </section>
      </div>
    </div>
  );
}