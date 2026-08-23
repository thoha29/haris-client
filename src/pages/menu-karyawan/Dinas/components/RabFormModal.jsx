import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

// Helper to generate array of dates between start and end date
const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  if (!startDateStr || !endDateStr) return dates;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const curr = new Date(start);
  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const formatDateLabel = (dateStr, dayIndex) => {
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Hari ke-${dayIndex + 1} (${formatted})`;
};

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val || 0);
};

const RabFormModal = ({ show, onClose, sppd, masterKomponenList, existingDetails, onSubmitRab }) => {
  // Dates in SPPD range
  const dates = useMemo(() => {
    if (!sppd) return [];
    return getDatesInRange(sppd.tanggal_mulai, sppd.tanggal_selesai);
  }, [sppd]);

  // Split master into Harian & Sekali
  const harianMaster = useMemo(() => {
    return (masterKomponenList || []).filter((k) => (k.tipe_komponen || 'harian') === 'harian');
  }, [masterKomponenList]);

  const sekaliMaster = useMemo(() => {
    return (masterKomponenList || []).filter((k) => k.tipe_komponen === 'sekali');
  }, [masterKomponenList]);

  // State: dailyItems: { [dateStr]: [ { id_komponen, nama_komponen, kategori, satuan, harga_satuan, selected } ] }
  const [dailyItems, setDailyItems] = useState({});

  // State: onceItems: [ { id_komponen, nama_komponen, kategori, satuan, harga_satuan, jumlah, selected } ]
  const [onceItems, setOnceItems] = useState([]);

  // Active Tab for daily view: selected date or 'all'
  const [activeDateTab, setActiveDateTab] = useState('');

  useEffect(() => {
    if (show && sppd && dates.length > 0) {
      const details = existingDetails || sppd.rab_details || [];

      // Initialize daily items for each date
      const initialDaily = {};
      dates.forEach((d) => {
        initialDaily[d] = harianMaster.map((k) => {
          const matched = details.find(
            (det) =>
              det.id_komponen === k.id &&
              det.tanggal === d &&
              det.tipe_komponen !== 'sekali'
          );
          const price = matched ? parseFloat(matched.harga_satuan) || 0 : 0;
          return {
            id_komponen: k.id,
            nama_komponen: k.nama_komponen,
            kategori: k.kategori,
            satuan: k.satuan,
            harga_satuan: price,
            selected: price > 0 || !!matched,
          };
        });
      });
      setDailyItems(initialDaily);
      setActiveDateTab(dates[0] || '');

      // Initialize once items
      const initialOnce = sekaliMaster.map((k) => {
        const matched = details.find(
          (det) =>
            det.id_komponen === k.id &&
            (det.tipe_komponen === 'sekali' || (!det.tanggal && det.tipe_komponen !== 'harian'))
        );
        const price = matched ? parseFloat(matched.harga_satuan) || 0 : 0;
        const qty = matched ? Number(matched.jumlah) || 1 : 1;
        return {
          id_komponen: k.id,
          nama_komponen: k.nama_komponen,
          kategori: k.kategori,
          satuan: k.satuan,
          harga_satuan: price,
          jumlah: qty,
          selected: price > 0 || !!matched,
        };
      });
      setOnceItems(initialOnce);
    }
  }, [show, sppd, dates, harianMaster, sekaliMaster, existingDetails]);

  if (!show || !sppd) return null;

  // Handle Daily Item change
  const handleDailyToggle = (dateStr, compId) => {
    setDailyItems((prev) => {
      const itemsForDate = prev[dateStr] || [];
      const updated = itemsForDate.map((item) =>
        item.id_komponen === compId ? { ...item, selected: !item.selected } : item
      );
      return { ...prev, [dateStr]: updated };
    });
  };

  const handleDailyPriceChange = (dateStr, compId, val) => {
    const num = parseFloat(val) || 0;
    setDailyItems((prev) => {
      const itemsForDate = prev[dateStr] || [];
      const updated = itemsForDate.map((item) =>
        item.id_komponen === compId
          ? { ...item, harga_satuan: num, selected: num > 0 ? true : item.selected }
          : item
      );
      return { ...prev, [dateStr]: updated };
    });
  };

  // Copy current day's values to all other days
  const handleCopyDayToAll = (fromDateStr) => {
    const currentValues = dailyItems[fromDateStr] || [];
    setDailyItems((prev) => {
      const updated = { ...prev };
      dates.forEach((d) => {
        updated[d] = currentValues.map((item) => ({ ...item }));
      });
      return updated;
    });

    Swal.fire({
      icon: 'success',
      title: 'Disalin',
      text: `Rincian biaya dari ${formatDateLabel(fromDateStr, dates.indexOf(fromDateStr))} berhasil disalin ke seluruh tanggal dinas!`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Handle Once Item change
  const handleOnceToggle = (compId) => {
    setOnceItems((prev) =>
      prev.map((item) =>
        item.id_komponen === compId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleOncePriceChange = (compId, val) => {
    const num = parseFloat(val) || 0;
    setOnceItems((prev) =>
      prev.map((item) =>
        item.id_komponen === compId
          ? { ...item, harga_satuan: num, selected: num > 0 ? true : item.selected }
          : item
      )
    );
  };

  const handleOnceQtyChange = (compId, val) => {
    const num = parseInt(val) || 1;
    setOnceItems((prev) =>
      prev.map((item) =>
        item.id_komponen === compId ? { ...item, jumlah: Math.max(1, num) } : item
      )
    );
  };

  // Calculate Subtotals
  let totalHarian = 0;
  Object.keys(dailyItems).forEach((d) => {
    const list = dailyItems[d] || [];
    list.forEach((item) => {
      if (item.selected && item.harga_satuan > 0) {
        totalHarian += item.harga_satuan;
      }
    });
  });

  let totalSekali = 0;
  onceItems.forEach((item) => {
    if (item.selected && item.harga_satuan > 0) {
      totalSekali += item.harga_satuan * (item.jumlah || 1);
    }
  });

  const grandTotal = totalHarian + totalSekali;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payloadDetails = [];

    // Collect daily details
    Object.keys(dailyItems).forEach((dateStr) => {
      const list = dailyItems[dateStr] || [];
      list.forEach((item) => {
        if (item.selected && item.harga_satuan > 0) {
          payloadDetails.push({
            id_komponen: item.id_komponen,
            tanggal: dateStr,
            tipe_komponen: 'harian',
            jumlah: 1,
            harga_satuan: item.harga_satuan,
            total: item.harga_satuan,
            keterangan: `${item.nama_komponen}`,
          });
        }
      });
    });

    // Collect once details
    const firstDayDate = dates[0] || (sppd.tanggal_mulai ? sppd.tanggal_mulai.split('T')[0] : null);
    onceItems.forEach((item) => {
      if (item.selected && item.harga_satuan > 0) {
        const qty = item.jumlah || 1;
        payloadDetails.push({
          id_komponen: item.id_komponen,
          tanggal: firstDayDate,
          tipe_komponen: 'sekali',
          jumlah: qty,
          harga_satuan: item.harga_satuan,
          total: item.harga_satuan * qty,
          keterangan: item.nama_komponen,
        });
      }
    });

    if (payloadDetails.length === 0) {
      Swal.fire('Peringatan', 'Silakan pilih dan isi nominal setidaknya satu komponen anggaran!', 'warning');
      return;
    }

    onSubmitRab(sppd.id_sppd, payloadDetails);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1060,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#1f4e78',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>
              Pengisian Rencana Anggaran Biaya (RAB) - SPPD: {sppd.nomor_sppd}
            </h3>
            <small style={{ color: '#cbd5e1' }}>
              Tujuan: {sppd.alamat_tujuan} | Periode: {sppd.tanggal_mulai} s/d {sppd.tanggal_selesai} ({sppd.total_hari} Hari)
            </small>
          </div>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.3rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto' }}>
            {/* Bagian 1: Biaya Harian Per Tanggal Dinas */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f4e78', margin: 0 }}>
                    1. Biaya Harian (Pencatatan Sepanjang Tanggal Dinas)
                  </h4>
                  <small style={{ color: '#64748b' }}>
                    Pilih dan isi komponen biaya per hari (Uang Saku, Uang Makan, Hotel, dll.)
                  </small>
                </div>
                {activeDateTab && (
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '5px 12px',
                      borderRadius: '5px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleCopyDayToAll(activeDateTab)}
                  >
                    Terapkan Nilai Hari Ini ke Semua Hari
                  </button>
                )}
              </div>

              {/* Date Navigation Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px', borderBottom: '1px solid #cbd5e1' }}>
                {dates.map((dateStr, idx) => {
                  const isActive = activeDateTab === dateStr;
                  const countFilled = (dailyItems[dateStr] || []).filter((i) => i.selected && i.harga_satuan > 0).length;
                  const daySubtotal = (dailyItems[dateStr] || []).reduce((acc, curr) => curr.selected ? acc + curr.harga_satuan : acc, 0);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setActiveDateTab(dateStr)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: isActive ? '2px solid #1f4e78' : '1px solid #cbd5e1',
                        backgroundColor: isActive ? '#1f4e78' : '#ffffff',
                        color: isActive ? '#ffffff' : '#334155',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        textAlign: 'left',
                      }}
                    >
                      <div>{formatDateLabel(dateStr, idx)}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px', color: isActive ? '#e0e7ff' : '#0f5132' }}>
                        {countFilled > 0 ? `${formatRupiah(daySubtotal)} (${countFilled} item)` : 'Belum diisi'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Table for Active Date */}
              {activeDateTab && (
                <div>
                  <table className="table table-bordered table-sm align-middle" style={{ fontSize: '0.88rem', marginBottom: 0, backgroundColor: '#ffffff' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                      <tr>
                        <th style={{ width: '45px', textAlign: 'center' }}>Pilih</th>
                        <th>Nama Komponen Harian</th>
                        <th>Kategori</th>
                        <th>Satuan</th>
                        <th style={{ width: '220px', textAlign: 'right' }}>Nominal Biaya Hari Ini (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dailyItems[activeDateTab] || []).length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                            Tidak ada master komponen bertipe Harian.
                          </td>
                        </tr>
                      ) : (
                        (dailyItems[activeDateTab] || []).map((item) => (
                          <tr key={item.id_komponen} style={{ backgroundColor: item.selected ? '#f8fafc' : '#ffffff' }}>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleDailyToggle(activeDateTab, item.id_komponen)}
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                              />
                            </td>
                            <td style={{ fontWeight: '600', color: '#1e293b' }}>{item.nama_komponen}</td>
                            <td><span className="badge-kategori">{item.kategori}</span></td>
                            <td>{item.satuan}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control-clean"
                                style={{ textAlign: 'right', fontWeight: '600', padding: '4px 8px' }}
                                placeholder="0"
                                value={item.harga_satuan || ''}
                                onChange={(e) => handleDailyPriceChange(activeDateTab, item.id_komponen, e.target.value)}
                                min="0"
                                step="1000"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bagian 2: Biaya Sekali (Lumpsum / Non-Harian) */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f4e78', marginBottom: '4px' }}>
                2. Biaya Sekali (Lumpsum / Tiket / Operasional Non-Harian)
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>
                Komponen yang dikeluarkan satu kali selama penugasan (Tiket Pesawat, Tol, PCR, Sewa Kendaraan, dll.)
              </p>

              <table className="table table-bordered table-sm align-middle" style={{ fontSize: '0.88rem', marginBottom: 0, backgroundColor: '#ffffff' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>Pilih</th>
                    <th>Nama Komponen Sekali</th>
                    <th>Kategori</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Jumlah</th>
                    <th style={{ width: '180px', textAlign: 'right' }}>Harga Satuan (Rp)</th>
                    <th style={{ width: '180px', textAlign: 'right' }}>Total (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {onceItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                        Tidak ada master komponen bertipe Sekali.
                      </td>
                    </tr>
                  ) : (
                    onceItems.map((item) => {
                      const itemTotal = (item.harga_satuan || 0) * (item.jumlah || 1);
                      return (
                        <tr key={item.id_komponen} style={{ backgroundColor: item.selected ? '#f8fafc' : '#ffffff' }}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => handleOnceToggle(item.id_komponen)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                          </td>
                          <td style={{ fontWeight: '600', color: '#1e293b' }}>{item.nama_komponen}</td>
                          <td><span className="badge-kategori">{item.kategori}</span></td>
                          <td>
                            <input
                              type="number"
                              className="form-control-clean"
                              style={{ textAlign: 'center', padding: '4px 6px' }}
                              value={item.jumlah || 1}
                              onChange={(e) => handleOnceQtyChange(item.id_komponen, e.target.value)}
                              min="1"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control-clean"
                              style={{ textAlign: 'right', fontWeight: '600', padding: '4px 8px' }}
                              placeholder="0"
                              value={item.harga_satuan || ''}
                              onChange={(e) => handleOncePriceChange(item.id_komponen, e.target.value)}
                              min="0"
                              step="1000"
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                            {formatRupiah(itemTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Grand Total Summary Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '14px 20px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Subtotal Harian ({dates.length} Hari): <strong>{formatRupiah(totalHarian)}</strong> | Subtotal Sekali: <strong>{formatRupiah(totalSekali)}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginRight: '10px' }}>Total Keseluruhan RAB:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803d' }}>{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              type="button"
              style={{
                backgroundColor: '#e2e8f0',
                color: '#334155',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-success-custom"
            >
              Ajukan RAB ke HRD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RabFormModal;
