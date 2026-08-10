import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../config/api';
import './profile.css';

function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'change-password' ? 'change-password' : 'info'
  );
  const [loading, setLoading] = useState(false);

  // Sync tab saat URL berubah
  useEffect(() => {
    setActiveTab(
      searchParams.get('tab') === 'change-password' ? 'change-password' : 'info'
    );
  }, [searchParams]);

  const username = localStorage.getItem('username') || '-';
  const role = localStorage.getItem('role') || '-';
  const userId = localStorage.getItem('userId') || '-';

  const [formData, setFormData] = useState({
    password_saat_ini: '',
    password_baru: '',
    password_baru_confirm: '',
  });

  const [showPw, setShowPw] = useState({
    saat_ini: false,
    baru: false,
    confirm: false,
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePw = (field) =>
    setShowPw((prev) => ({ ...prev, [field]: !prev[field] }));

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'change-password' ? { tab: 'change-password' } : {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password_saat_ini, password_baru, password_baru_confirm } = formData;

    if (password_baru !== password_baru_confirm) {
      Swal.fire({ icon: 'error', title: 'Tidak Cocok', text: 'Password baru dan konfirmasi harus sama.' });
      return;
    }
    if (password_baru.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Terlalu Pendek', text: 'Password baru minimal 6 karakter.' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await api.post(
        '/api/auth/change-password',
        { password_saat_ini, password_baru, password_baru_confirm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: res.data?.message || 'Password berhasil diubah.' });
      setFormData({ password_saat_ini: '', password_baru: '', password_baru_confirm: '' });
      switchTab('info');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal mengganti password.';
      Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-box">
        {/* Tab */}
        <div className="profile-tabs">
          <button
            className={`ptab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => switchTab('info')}
          >
            Informasi Akun
          </button>
          <button
            className={`ptab ${activeTab === 'change-password' ? 'active' : ''}`}
            onClick={() => switchTab('change-password')}
          >
            Ganti Password
          </button>
        </div>

        {/* Konten Informasi */}
        {activeTab === 'info' && (
          <div className="profile-content">
            <ul className="info-list">
              <li className="info-item">
                <span className="info-key">User ID</span>
                <span className="info-val">{userId}</span>
              </li>
              <li className="info-item">
                <span className="info-key">Username</span>
                <span className="info-val">{username}</span>
              </li>
              <li className="info-item">
                <span className="info-key">Role</span>
                <span className="info-val" style={{ textTransform: 'capitalize' }}>{role}</span>
              </li>
            </ul>
            {/* <button
              className="btn btn-outline-primary btn-sm mt-3"
              onClick={() => switchTab('change-password')}
            >
              <i className="bi bi-key me-1"></i> Ganti Password
            </button> */}
          </div>
        )}

        {/* Form Ganti Password */}
        {activeTab === 'change-password' && (
          <div className="profile-content">
            <form onSubmit={handleSubmit} className="pw-form">
              {/* Password Saat Ini */}
              <div className="mb-3">
                <label className="pw-label">Password Saat Ini</label>
                <div className="pw-field">
                  <input
                    type={showPw.saat_ini ? 'text' : 'password'}
                    className="pw-input"
                    name="password_saat_ini"
                    value={formData.password_saat_ini}
                    onChange={handleChange}
                    placeholder="Password saat ini"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => togglePw('saat_ini')}>
                    <i className={`bi ${showPw.saat_ini ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div className="mb-3">
                <label className="pw-label">Password Baru</label>
                <div className="pw-field">
                  <input
                    type={showPw.baru ? 'text' : 'password'}
                    className="pw-input"
                    name="password_baru"
                    value={formData.password_baru}
                    onChange={handleChange}
                    placeholder="Password baru (min. 6 karakter)"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => togglePw('baru')}>
                    <i className={`bi ${showPw.baru ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="mb-4">
                <label className="pw-label">Konfirmasi Password Baru</label>
                <div className="pw-field">
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    className="pw-input"
                    name="password_baru_confirm"
                    value={formData.password_baru_confirm}
                    onChange={handleChange}
                    placeholder="Ulangi password baru"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => togglePw('confirm')}>
                    <i className={`bi ${showPw.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Menyimpan...</>
                  ) : (
                    <><i className="bi bi-check-circle me-1"></i>Simpan</>
                  )}
                </button>
                {/* <button type="button" className="btn btn-light btn-sm" onClick={() => switchTab('info')} disabled={loading}>
                  Batal
                </button> */}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
