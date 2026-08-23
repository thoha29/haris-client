import React, { useState, useEffect, useMemo } from 'react';

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val || 0);
};

const formatDateLabel = (dateStr, idx) => {
  if (!dateStr) return `Hari ke-${idx + 1}`;
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Hari ke-${idx + 1} (${formatted})`;
};

const UserRabFormSection = ({
  tanggalMulai,
  tanggalSelesai,
  masterKomponenList,
  rabDetails,
  setRabDetails,
}) => {
  // Generate list of dates within the SPPD range
  const dates = useMemo(() => {
    if (!tanggalMulai || !tanggalSelesai) return [];
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    if (end < start) return [];

    const result = [];
    const curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      result.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }
    return result;
  }, [tanggalMulai, tanggalSelesai]);

  const [activeDateTab, setActiveDateTab] = useState('');

  // Daily components grouped by date: { '2026-08-20': [ { id_komponen, nama_komponen, ... } ] }
  const [dailyItems, setDailyItems] = useState({});

  // Once (lumpsum) components: [ { id_komponen, nama_komponen, ... } ]
  const [onceItems, setOnceItems] = useState([]);

  // Separate master components by type
  const harianMaster = useMemo(() => {
    return (masterKomponenList || []).filter(
      (k) => (k.tipe_komponen || 'harian') === 'harian'
    );
  }, [masterKomponenList]);

  const sekaliMaster = useMemo(() => {
    return (masterKomponenList || []).filter(
      (k) => (k.tipe_komponen || 'harian') === 'sekali'
    );
  }, [masterKomponenList]);

  // Initialize or synchronize daily items when date range changes
  useEffect(() => {
    if (dates.length > 0) {
      setDailyItems((prevDaily) => {
        const nextDaily = { ...prevDaily };
        dates.forEach((dateStr) => {
          if (!nextDaily[dateStr]) {
            nextDaily[dateStr] = harianMaster.map((k) => ({
              id_komponen: k.id,
              nama_komponen: k.nama_komponen,
              kategori: k.kategori,
              satuan: k.satuan,
              harga_satuan: 0,
              jumlah: 1,
              selected: false,
              keterangan: '',
            }));
          }
        });
        return nextDaily;
      });

      setActiveDateTab((prevTab) => (!prevTab || !dates.includes(prevTab) ? dates[0] : prevTab));
    } else {
      setDailyItems({});
      setActiveDateTab('');
    }
  }, [dates, harianMaster]);

  useEffect(() => {
    if (sekaliMaster.length > 0) {
      setOnceItems((prevOnce) => {
        if (prevOnce.length > 0) return prevOnce;
        return sekaliMaster.map((k) => ({
          id_komponen: k.id,
          nama_komponen: k.nama_komponen,
          kategori: k.kategori,
          satuan: k.satuan,
          harga_satuan: 0,
          jumlah: 1,
          selected: false,
          keterangan: '',
        }));
      });
    }
  }, [sekaliMaster]);

  // Sync to parent rabDetails array whenever dailyItems or onceItems change
  useEffect(() => {
    const flattened = [];

    // Daily items
    Object.keys(dailyItems).forEach((dateStr) => {
      (dailyItems[dateStr] || []).forEach((item) => {
        if (item.selected && (parseFloat(item.harga_satuan) > 0 || Number(item.jumlah) > 0)) {
          const qty = Number(item.jumlah) || 1;
          const price = parseFloat(item.harga_satuan) || 0;
          flattened.push({
            id_komponen: item.id_komponen,
            nama_komponen: item.nama_komponen,
            kategori: item.kategori,
            satuan: item.satuan,
            tipe_komponen: 'harian',
            tanggal: dateStr,
            jumlah: qty,
            harga_satuan: price,
            total: qty * price,
            keterangan: item.keterangan || '',
          });
        }
      });
    });

    // Once items
    const firstDayDate = dates[0] || (tanggalMulai ? (typeof tanggalMulai === 'string' ? tanggalMulai.split('T')[0] : '') : null);
    (onceItems || []).forEach((item) => {
      if (item.selected && (parseFloat(item.harga_satuan) > 0 || Number(item.jumlah) > 0)) {
        const qty = Number(item.jumlah) || 1;
        const price = parseFloat(item.harga_satuan) || 0;
        flattened.push({
          id_komponen: item.id_komponen,
          nama_komponen: item.nama_komponen,
          kategori: item.kategori,
          satuan: item.satuan,
          tipe_komponen: 'sekali',
          tanggal: firstDayDate,
          jumlah: qty,
          harga_satuan: price,
          total: qty * price,
          keterangan: item.keterangan || '',
        });
      }
    });

    setRabDetails(flattened);
  }, [dailyItems, onceItems, dates, tanggalMulai, setRabDetails]);

  // Handlers for daily items
  const handleToggleDaily = (dateStr, compId) => {
    setDailyItems((prev) => {
      const list = prev[dateStr] || [];
      const updated = list.map((item) => {
        if (item.id_komponen === compId) {
          const nextSel = !item.selected;
          return {
            ...item,
            selected: nextSel,
            jumlah: nextSel && (!item.jumlah || item.jumlah === 0) ? 1 : item.jumlah,
          };
        }
        return item;
      });
      return { ...prev, [dateStr]: updated };
    });
  };

  const handleChangeDaily = (dateStr, compId, field, value) => {
    setDailyItems((prev) => {
      const list = prev[dateStr] || [];
      const updated = list.map((item) => {
        if (item.id_komponen === compId) {
          return {
            ...item,
            [field]: value,
            selected: true, // Auto select when modified
          };
        }
        return item;
      });
      return { ...prev, [dateStr]: updated };
    });
  };

  // Copy current active date's inputs to ALL other dates in SPPD range
  const handleApplyToAllDays = () => {
    if (!activeDateTab || !dailyItems[activeDateTab]) return;

    const sourceItems = dailyItems[activeDateTab];
    setDailyItems((prev) => {
      const next = {};
      dates.forEach((d) => {
        next[d] = sourceItems.map((item) => ({
          ...item,
        }));
      });
      return next;
    });
  };

  // Handlers for once items
  const handleToggleOnce = (compId) => {
    setOnceItems((prev) =>
      prev.map((item) => {
        if (item.id_komponen === compId) {
          const nextSel = !item.selected;
          return {
            ...item,
            selected: nextSel,
            jumlah: nextSel && (!item.jumlah || item.jumlah === 0) ? 1 : item.jumlah,
          };
        }
        return item;
      })
    );
  };

  const handleChangeOnce = (compId, field, value) => {
    setOnceItems((prev) =>
      prev.map((item) => {
        if (item.id_komponen === compId) {
          return {
            ...item,
            [field]: value,
            selected: true,
          };
        }
        return item;
      })
    );
  };

  // Summary per component calculation
  const summaryPerKomponen = useMemo(() => {
    const map = {};
    (rabDetails || []).forEach((d) => {
      if (!map[d.id_komponen]) {
        map[d.id_komponen] = {
          id_komponen: d.id_komponen,
          nama_komponen: d.nama_komponen,
          satuan: d.satuan,
          tipe_komponen: d.tipe_komponen,
          total_qty: 0,
          total_biaya: 0,
        };
      }
      map[d.id_komponen].total_qty += Number(d.jumlah) || 0;
      map[d.id_komponen].total_biaya += parseFloat(d.total) || 0;
    });
    return Object.values(map);
  }, [rabDetails]);

  const grandTotal = useMemo(() => {
    return (rabDetails || []).reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  }, [rabDetails]);

  if (!tanggalMulai || !tanggalSelesai) {
    return (
      <div className="sppd-form-section" style={{ backgroundColor: '#f8fafc', textAlign: 'center', padding: '24px' }}>
        <h5 style={{ color: '#475569', marginTop: '8px' }}>Pengisian Rencana Anggaran Biaya (RAB)</h5>
        <p className="text-muted small">Silakan pilih Tanggal Mulai dan Tanggal Selesai dinas terlebih dahulu untuk membuka formulir rincian RAB.</p>
      </div>
    );
  }

  return (
    <div className="sppd-form-section animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>4. Rencana Anggaran Biaya (RAB) Penugasan</h4>
          <p className="text-muted small mb-0">
            Tentukan rincian estimasi biaya dinas (harian per tanggal & komponen sekali pakai) untuk diverifikasi oleh HRD.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>TOTAL ESTIMASI RAB</div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#16a34a' }}>
            {formatRupiah(grandTotal)}
          </div>
        </div>
      </div>

      {/* Bagian A: Komponen Harian */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            A. Biaya Harian ({dates.length} Hari Dinas)
          </h5>
          {dates.length > 1 && activeDateTab && (
            <button
              type="button"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              }}
              onClick={handleApplyToAllDays}
              title="Salin rincian hari ini ke semua tanggal dinas"
            >
              Terapkan Pengaturan Hari Ini ke Semua Hari
            </button>
          )}
        </div>

        {/* Date Tabs */}
        <div className="d-flex gap-2 overflow-auto pb-2 mb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
          {dates.map((dStr, idx) => {
            const isActive = activeDateTab === dStr;
            return (
              <button
                key={dStr}
                type="button"
                onClick={() => setActiveDateTab(dStr)}
                style={{
                  borderRadius: '20px',
                  padding: '6px 16px',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#0284c7' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  boxShadow: isActive ? '0 2px 4px rgba(2, 132, 199, 0.3)' : 'none',
                }}
              >
                {formatDateLabel(dStr, idx)}
              </button>
            );
          })}
        </div>

        {/* Table Harian for Active Date */}
        {activeDateTab && dailyItems[activeDateTab] && (
          <div className="table-responsive">
            <table className="table table-bordered align-middle" style={{ fontSize: '0.88rem' }}>
              <thead className="table-light">
                <tr style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ width: '45px', textAlign: 'center' }}>Pilih</th>
                  <th>Komponen Biaya</th>
                  <th style={{ width: '130px' }}>Kategori</th>
                  <th style={{ width: '90px' }}>Qty</th>
                  <th style={{ width: '170px' }}>Harga Satuan (Rp)</th>
                  <th style={{ width: '170px' }}>Total (Rp)</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {dailyItems[activeDateTab].map((item) => {
                  const qty = Number(item.jumlah) || 1;
                  const price = parseFloat(item.harga_satuan) || 0;
                  const total = qty * price;

                  return (
                    <tr key={item.id_komponen} style={{ backgroundColor: item.selected ? '#f0fdf4' : 'inherit' }}>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.selected}
                          onChange={() => handleToggleDaily(activeDateTab, item.id_komponen)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.nama_komponen}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Satuan: {item.satuan || '-'}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.kategori || 'Umum'}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ fontSize: '0.88rem' }}
                          min="1"
                          value={item.jumlah}
                          onChange={(e) => handleChangeDaily(activeDateTab, item.id_komponen, 'jumlah', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ fontSize: '0.88rem' }}
                          min="0"
                          step="1000"
                          placeholder="0"
                          value={item.harga_satuan || ''}
                          onChange={(e) => handleChangeDaily(activeDateTab, item.id_komponen, 'harga_satuan', e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: '700', color: item.selected ? '#16a34a' : '#64748b' }}>
                        {formatRupiah(total)}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.84rem' }}
                          placeholder="Catatan / rincian..."
                          value={item.keterangan || ''}
                          onChange={(e) => handleChangeDaily(activeDateTab, item.id_komponen, 'keterangan', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bagian B: Komponen Sekali Pakai */}
      {onceItems.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <h5 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '14px' }}>
            B. Biaya Sekali Pakai / Logistik (Transport Tiket, Bensin, Tol, dll.)
          </h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle" style={{ fontSize: '0.88rem' }}>
              <thead className="table-light">
                <tr style={{ color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ width: '45px', textAlign: 'center' }}>Pilih</th>
                  <th>Komponen Biaya</th>
                  <th style={{ width: '130px' }}>Kategori</th>
                  <th style={{ width: '90px' }}>Qty</th>
                  <th style={{ width: '170px' }}>Harga Satuan (Rp)</th>
                  <th style={{ width: '170px' }}>Total (Rp)</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {onceItems.map((item) => {
                  const qty = Number(item.jumlah) || 1;
                  const price = parseFloat(item.harga_satuan) || 0;
                  const total = qty * price;

                  return (
                    <tr key={item.id_komponen} style={{ backgroundColor: item.selected ? '#f0fdf4' : 'inherit' }}>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.selected}
                          onChange={() => handleToggleOnce(item.id_komponen)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.nama_komponen}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Satuan: {item.satuan || '-'}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.kategori || 'Umum'}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ fontSize: '0.88rem' }}
                          min="1"
                          value={item.jumlah}
                          onChange={(e) => handleChangeOnce(item.id_komponen, 'jumlah', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ fontSize: '0.88rem' }}
                          min="0"
                          step="1000"
                          placeholder="0"
                          value={item.harga_satuan || ''}
                          onChange={(e) => handleChangeOnce(item.id_komponen, 'harga_satuan', e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: '700', color: item.selected ? '#ca8a04' : '#64748b' }}>
                        {formatRupiah(total)}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.84rem' }}
                          placeholder="Catatan / rincian..."
                          value={item.keterangan || ''}
                          onChange={(e) => handleChangeOnce(item.id_komponen, 'keterangan', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bagian C: Ringkasan Akumulasi Total Per Komponen */}
      {summaryPerKomponen.length > 0 && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            Ringkasan Akumulasi Total per Komponen ({summaryPerKomponen.length} Komponen Terpilih)
          </h5>
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle" style={{ fontSize: '0.86rem', backgroundColor: '#fff' }}>
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                  <th>Nama Komponen</th>
                  <th style={{ width: '130px' }}>Tipe Komponen</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Total Kuantitas</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Total Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {summaryPerKomponen.map((comp, idx) => (
                  <tr key={comp.id_komponen}>
                    <td className="text-center">{idx + 1}</td>
                    <td style={{ fontWeight: '600' }}>{comp.nama_komponen}</td>
                    <td>
                      <span className={`badge ${comp.tipe_komponen === 'harian' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                        {comp.tipe_komponen === 'harian' ? 'Harian' : 'Sekali'}
                      </span>
                    </td>
                    <td className="text-center font-monospace">
                      {comp.total_qty} {comp.satuan || ''}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#15803d' }}>
                      {formatRupiah(comp.total_biaya)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: '800' }}>
                  <td colSpan="4" style={{ textAlign: 'right', fontSize: '0.92rem' }}>
                    GRAND TOTAL ESTIMASI BIAYA KESELURUHAN:
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '1rem', color: '#15803d' }}>
                    {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRabFormSection;
