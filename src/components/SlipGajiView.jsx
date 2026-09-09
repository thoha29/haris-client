import React from 'react';
import './SlipGajiView.css';

/**
 * SlipGajiView — Slip gaji bergaya spreadsheet
 * Props:
 *   - data: satu baris dari v_daftar_gaji (JOIN data_pribadi)
 *   - onDownloadExcel: function() — callback saat klik download Excel
 *   - showDownload: boolean — tampilkan tombol download (default: true)
 */
const SlipGajiView = ({ data: d, onDownloadExcel, showDownload = true }) => {
  if (!d) return null;

  const fmt = (val) => (val !== null && val !== undefined ? Number(val) : 0);

  // Tentukan shift/non-shift
  const isShift =
    d.tipe_kerja === 'shift' || (d.skema && Number(d.skema) > 0);

  // Kalkulasi
  const upah = fmt(d.upah);
  const tunj = fmt(d.tunj);
  const jumlahI = upah + tunj;

  const tunj_kehadiran = fmt(d.tunj_kehadiran);
  const premi_shift = fmt(d.premi_shift);
  const kjk = fmt(d.kelebihan_jam_kerja);
  const extra_fooding = fmt(d.extra_fooding);
  const upah_lembur = fmt(d.upah_lembur);
  const uang_makan_lembur = fmt(d.uang_makan_lembur);
  const total_tunjangan = fmt(d.total_tunjangan);

  const jht = fmt(d.jht);
  const jp = fmt(d.jp);
  const jkes = fmt(d.jkes);
  const totalPotongan = jht + jp + jkes;

  const gajiBruto = jumlahI + total_tunjangan;
  const upahBersih = gajiBruto - totalPotongan;

  const jmhari = fmt(d.jmhari) || fmt(d.hari) || 30;
  const jmlLembur = fmt(d.jml_lembur);
  const hrLembur = fmt(d.hr_lembur);

  // ── Helpers ──
  const RpCell = ({ val }) => (
    <td className="sgv-cell-rp">
      {val !== 0 ? (
        <>
          <span className="sgv-rp-prefix">Rp</span>
          <span className="sgv-rp-amount">{val.toLocaleString('id-ID')}</span>
        </>
      ) : (
        <span className="sgv-dash">-</span>
      )}
    </td>
  );

  const DetailRow = ({ num, label, qty, unit, mult, rp, indent = false, italic = false }) => (
    <tr className="sgv-detail-row">
      <td className="sgv-cell-num">{num !== undefined && num !== null ? `${num}.` : ''}</td>
      <td className={`sgv-cell-label${indent ? ' sgv-indent' : ''}`}>
        {italic ? <em>{label}</em> : label}
      </td>
      <td className="sgv-cell-qty">{qty !== undefined && qty !== null && qty !== 0 ? qty : ''}</td>
      <td className="sgv-cell-unit">
        {unit ? <em>{unit}</em> : ''}
      </td>
      <td className="sgv-cell-x">{mult !== undefined && mult !== null ? 'x' : ''}</td>
      <td className="sgv-cell-mult">
        {mult !== undefined && mult !== null ? mult.toLocaleString('id-ID') : ''}
      </td>
      <td className="sgv-cell-sep">:</td>
      <RpCell val={rp !== undefined && rp !== null ? rp : 0} />
    </tr>
  );

  const JumlahRow = ({ label, val }) => (
    <tr className="sgv-jumlah-row">
      <td colSpan={7} className="sgv-jumlah-label">{label}</td>
      <td className="sgv-jumlah-val">
        <span className="sgv-rp-prefix">Rp</span>
        <strong>{(val || 0).toLocaleString('id-ID')}</strong>
      </td>
    </tr>
  );

  const SectionHeader = ({ roman, label }) => (
    <tr className="sgv-section-header">
      <td className="sgv-section-roman">{roman}</td>
      <td colSpan={7} className="sgv-section-label">{label}</td>
    </tr>
  );

  const SubDinasRows = ({ hasExtra }) => (
    <>
      {['1. Akomodasi', '2. Uang Harian', '3. Uang Makan', '4. Transport Lokal'].map((lbl) => (
        <tr key={lbl} className="sgv-detail-row sgv-sub-row">
          <td className="sgv-cell-num"></td>
          <td className="sgv-cell-label sgv-indent">{lbl}</td>
          <td></td><td></td><td></td><td></td>
          <td className="sgv-cell-sep">:</td>
          <td className="sgv-cell-rp"><span className="sgv-dash">-</span></td>
        </tr>
      ))}
      {hasExtra && (
        <tr className="sgv-detail-row sgv-sub-row">
          <td className="sgv-cell-num"></td>
          <td className="sgv-cell-label sgv-indent">5. Penggantian Tiket dan Taksi air Port</td>
          <td></td><td></td><td></td><td></td>
          <td className="sgv-cell-sep">:</td>
          <td className="sgv-cell-rp"><span className="sgv-dash">-</span></td>
        </tr>
      )}
    </>
  );

  return (
    <div className="sgv-wrapper">
      {/* ── HEADER INFO ── */}
      <div className="sgv-doc-header">
        <div className="sgv-info-grid">
          {[
            ['NAMA PERUSAHAAN', 'PT SENTRAL SARI JAYA'],
            ['NAMA PEKERJA', d.nama_lengkap || d.nama || d.username || '-'],
            ['JABATAN / SISTEM KERJA', null],
            ['LOKASI', d.lokasi_kerja || d.lokasi_proyek || '-'],
          ].map(([label, val], i) => (
            <div key={i} className="sgv-info-row">
              <span className="sgv-info-label">{label}</span>
              <span className="sgv-info-sep">:</span>
              {i === 2 ? (
                <span className="sgv-info-val">
                  {d.jabatan || '-'}
                  <span className="sgv-slash"> / </span>
                  <span className={`sgv-badge ${isShift ? 'shift' : 'non-shift'}`}>
                    {isShift ? 'Shift' : 'Non-Shift'}
                  </span>
                </span>
              ) : (
                <span className="sgv-info-val">{val}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TABEL SLIP ── */}
      <div className="sgv-table-wrap">
        <table className="sgv-table">
          <colgroup>
            <col style={{ width: '3%' }} />
            <col style={{ width: '33%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '3%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '2%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <tbody>
            {/* ─── I: UPAH TETAP ─── */}
            <SectionHeader roman="I." label="UPAH TETAP (UT)" />
            <DetailRow num={1} label="Upah Pokok" qty={jmhari} unit="Hari" rp={upah} />
            <DetailRow num={2} label="TAUP" qty={jmhari} unit="Hari" rp={tunj} />
            <JumlahRow label="Jumlah  I" val={jumlahI} />

            {/* ─── I.I: UPAH TETAP DIBAYARKAN ─── */}
            <tr className="sgv-spacer"><td colSpan={8}></td></tr>
            <SectionHeader roman="I.I" label="UPAH TETAP (UT) DIBAYARKAN" />
            <DetailRow num={1} label="Upah Pokok" qty={jmhari} unit="Hari" rp={upah} />
            <DetailRow num={2} label="TAUP" qty={jmhari} unit="Hari" rp={tunj} />
            <JumlahRow label="Jumlah  I.I" val={jumlahI} />

            {/* ─── II: UPAH TIDAK TETAP ─── */}
            <tr className="sgv-spacer"><td colSpan={8}></td></tr>
            <SectionHeader roman="II." label="UPAH TIDAK TETAP" />

            {isShift ? (
              <>
                <DetailRow num={1} label="Tunjangan Kehadiran" qty={fmt(d.hari)} unit="Hari" mult={fmt(d.hari) > 0 ? Math.round(tunj_kehadiran / fmt(d.hari)) : undefined} rp={tunj_kehadiran} />
                <DetailRow num={2} label="Premi Shift" qty={fmt(d.hari)} unit="Hari" rp={premi_shift} />
                <DetailRow num={3} label="Kelebihan Jam Kerja (KJK)" qty={fmt(d.hari)} unit="Hari" rp={kjk} />
                <DetailRow num={4} label="Makan Lembur" qty={hrLembur || undefined} unit={hrLembur ? 'Kali' : undefined} mult={hrLembur ? 25000 : undefined} rp={uang_makan_lembur} />
                <DetailRow num={5} label="Upah Lembur (jam konversi)" qty={jmlLembur || undefined} unit={jmlLembur ? 'Jam' : undefined} mult={jmlLembur && hrLembur ? Math.round(upah_lembur / (jmlLembur || 1)) : undefined} rp={upah_lembur} />
                <DetailRow num={6} label="Extra Food" qty={fmt(d.hari)} unit="Hari" mult={25000} rp={extra_fooding} />
                <DetailRow num={7} label="Transport Lembur" rp={0} />
                <tr className="sgv-detail-row">
                  <td className="sgv-cell-num">8.</td>
                  <td className="sgv-cell-label">Biaya Perjalanan Dinas</td>
                  <td colSpan={5}></td>
                  <td className="sgv-cell-rp"></td>
                </tr>
                <SubDinasRows hasExtra={false} />
                <DetailRow num={9} label="DPLK" rp={0} />
              </>
            ) : (
              <>
                <DetailRow num={1} label="Tunjangan Kehadiran" qty={fmt(d.hari)} unit="Hari" mult={fmt(d.hari) > 0 ? Math.round(tunj_kehadiran / fmt(d.hari)) : undefined} rp={tunj_kehadiran} />
                <DetailRow num={2} label="Upah Lembur" qty={jmlLembur || undefined} unit={jmlLembur ? 'Jam' : undefined} mult={jmlLembur ? Math.round(upah_lembur / (jmlLembur || 1)) : undefined} rp={upah_lembur} />
                <DetailRow num={3} label="Makan Lembur" qty={hrLembur || undefined} unit={hrLembur ? 'Kali' : undefined} mult={hrLembur ? 25000 : undefined} rp={uang_makan_lembur} />
                <tr className="sgv-detail-row">
                  <td className="sgv-cell-num">4.</td>
                  <td className="sgv-cell-label">Biaya Perjalanan Dinas</td>
                  <td colSpan={5}></td>
                  <td className="sgv-cell-rp"></td>
                </tr>
                <SubDinasRows hasExtra={true} />
                <DetailRow num={5} label="DPLK" rp={0} />
              </>
            )}

            <JumlahRow label="Jumlah  II" val={total_tunjangan} />

            {/* ─── GAJI BRUTO ─── */}
            <tr className="sgv-spacer"><td colSpan={8}></td></tr>
            <tr className="sgv-bruto-row">
              <td colSpan={7} className="sgv-bruto-label">
                GAJI BRUTO &nbsp;( I.I + II )
              </td>
              <td className="sgv-bruto-val">
                <span className="sgv-rp-prefix">Rp</span>
                <strong>{gajiBruto.toLocaleString('id-ID')}</strong>
              </td>
            </tr>
            <tr className="sgv-spacer"><td colSpan={8}></td></tr>

            {/* ─── III: POTONGAN ─── */}
            <SectionHeader roman="III." label="POTONGAN" />
            <tr className="sgv-detail-row">
              <td className="sgv-cell-num">1.</td>
              <td className="sgv-cell-label">
                BPJS Ketenagakerjaan <em>(Jaminan Hari Tua)</em>
                <span className="sgv-pct"> : 2% * UT</span>
              </td>
              <td colSpan={4}></td>
              <td className="sgv-cell-sep">:</td>
              <RpCell val={jht} />
            </tr>
            <tr className="sgv-detail-row sgv-sub-row">
              <td className="sgv-cell-num"></td>
              <td className="sgv-cell-label sgv-indent">
                BPJS Ketenagakerjaan <em>(Jaminan Pensiun)</em>
                <span className="sgv-pct"> : 1% * UT</span>
              </td>
              <td colSpan={4}></td>
              <td className="sgv-cell-sep">:</td>
              <RpCell val={jp} />
            </tr>
            <tr className="sgv-detail-row">
              <td className="sgv-cell-num">2.</td>
              <td className="sgv-cell-label">
                BPJS Kesehatan
                <span className="sgv-pct"> : 1% * UT</span>
              </td>
              <td colSpan={4}></td>
              <td className="sgv-cell-sep">:</td>
              <RpCell val={jkes} />
            </tr>
            <DetailRow num={3} label="PPH Pasal 21" rp={0} />
            <DetailRow num={4} label="Potongan Pinjaman" rp={0} />
            <DetailRow num={5} label="Potongan Lain - Lain" rp={0} />
            <JumlahRow label="Jumlah  III" val={totalPotongan} />

            {/* ─── IV: PENYESUAIAN ─── */}
            <tr className="sgv-spacer"><td colSpan={8}></td></tr>
            <SectionHeader roman="IV." label="PENYESUAIAN GI" />
            <tr className="sgv-detail-row">
              <td className="sgv-cell-num">1.</td>
              <td className="sgv-cell-label"></td>
              <td colSpan={5}></td>
              <td className="sgv-cell-rp"><span className="sgv-dash">-</span></td>
            </tr>
            <JumlahRow label="Jumlah  IV" val={0} />

            {/* ─── TOTAL BERSIH ─── */}
            <tr className="sgv-spacer"><td colSpan={8}></td></tr>
            <tr className="sgv-net-row">
              <td colSpan={7} className="sgv-net-label">
                UPAH &nbsp;DITERIMA BERSIH &nbsp;(I+II-III+IV)
              </td>
              <td className="sgv-net-val">
                <span className="sgv-rp-prefix">Rp</span>
                <strong>{upahBersih.toLocaleString('id-ID')}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── TOMBOL DOWNLOAD ── */}
      {showDownload && onDownloadExcel && (
        <div className="sgv-actions">
          <button className="sgv-btn-excel" onClick={onDownloadExcel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:'6px'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 11h8v1.5H8V11zm0 3h8v1.5H8V14zm0 3h5v1.5H8V17z"/>
            </svg>
            Download Excel Slip Gaji
          </button>
        </div>
      )}
    </div>
  );
};

export default SlipGajiView;
