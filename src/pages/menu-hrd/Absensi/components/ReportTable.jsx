import React from 'react';

const ReportTable = ({ items, onDeleteItem }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (statusLabel) => {
    const label = (statusLabel || '').toLowerCase();
    if (label.includes('masuk') || label.includes('hadir')) return 'status-masuk';
    if (label.includes('lembur')) return 'status-lembur';
    if (label.includes('cuti')) return 'status-cuti';
    if (label.includes('sakit') || label.includes('izin')) return 'status-izin';
    if (label.includes('alpha')) return 'status-alpha';
    return 'status-default';
  };

  return (
    <div className="report-table-container">
      <table className="report-table">
        <thead>
          <tr>
            <th>TANGGAL ABSEN</th>
            <th>STATUS / JENIS HARI</th>
            <th>JAM KERJA</th>
            <th>LEMBUR AKTUAL</th>
            <th>LEMBUR KONVERSI</th>
            {/* <th className="text-center">AKSI HAPUS</th> */}
          </tr>
        </thead>
        <tbody>
          {items && items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td className="fw-semibold">{formatDate(item.tanggal)}</td>
                <td>
                  <span className={`status-tag ${getStatusClass(item.status_label)}`}>
                    {item.status_label}
                  </span>
                </td>
                <td className="text-muted-dark">{item.jam_kerja}</td>
                <td className="fw-bold">{item.lembur_aktual > 0 ? `${item.lembur_aktual} Jam` : '0 Jam'}</td>
                <td className="fw-bold text-blue">
                  {item.lembur_konversi > 0 ? `${item.lembur_konversi} Jam` : '0 Jam'}
                </td>
                {/* <td className="text-center">
                  {item.can_delete ? (
                    <button
                      className="btn-delete-row"
                      onClick={() => onDeleteItem(item)}
                      title="Hapus data ini"
                    >
                      <i className="bi bi-trash-fill"></i> Hapus
                    </button>
                  ) : (
                    <span className="text-muted-small">-</span>
                  )}
                </td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center empty-table-cell">
                Tidak ada histori absensi untuk periode ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
