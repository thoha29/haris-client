import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = ({ karyawan, periode, summary, items, monthName }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const namaKaryawan = karyawan?.nama_lengkap || karyawan?.username || 'Karyawan';
  const periodeText = `${monthName} ${periode?.year}`;

  // Header Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN HISTORI ABSEN & RINCIAN LEMBUR', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${periodeText}`, 14, 21);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 26);

  // Karyawan Info
  autoTable(doc, {
    startY: 30,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1 },
    body: [
      [
        { content: 'Nama:', styles: { fontStyle: 'bold', width: 25 } },
        namaKaryawan,
        { content: 'Jabatan:', styles: { fontStyle: 'bold', width: 25 } },
        karyawan?.jabatan || '-',
      ],
      [
        { content: 'NIK:', styles: { fontStyle: 'bold' } },
        karyawan?.nik || '-',
        { content: 'Divisi:', styles: { fontStyle: 'bold' } },
        karyawan?.divisi || '-',
      ],
      [
        { content: 'Lokasi Kerja:', styles: { fontStyle: 'bold' } },
        karyawan?.lokasi_kerja || '-',
        { content: 'Tipe Kerja:', styles: { fontStyle: 'bold' } },
        karyawan?.tipe_kerja || '-',
      ],
    ],
  });

  // Summary Metrics Table
  const summaryY = doc.lastAutoTable.finalY + 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Kehadiran & Lembur', 14, summaryY);

  autoTable(doc, {
    startY: summaryY + 2,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    head: [
      [
        'Total Jam Kerja',
        'Total Lembur Aktual',
        'Total Lembur Konversi',
        'Total HK',
        'Shift Siang',
        'Shift Malam',
        'Cuti Resmi',
        'OFF Murni',
        'Sakit/Izin/Alfa',
      ],
    ],
    body: [
      [
        `${Number(summary?.total_jam_kerja || 0).toFixed(1)} Jam`,
        `${Number(summary?.total_lembur_aktual || 0).toFixed(1)} Jam`,
        `${Number(summary?.total_lembur_konversi || 0).toFixed(1)} Jam`,
        `${summary?.total_hk || 0} Hari`,
        `${summary?.shift_siang || 0} Hari`,
        `${summary?.shift_malam || 0} Hari`,
        `${summary?.cuti_resmi || 0} Hari`,
        `${summary?.off_murni || 0} Hari`,
        `${summary?.sakit_izin_alfa || 0} Hari`,
      ],
    ],
  });

  // Detail Chronological Table
  const tableY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian Kronologis Kehadiran', 14, tableY);

  const tableBody = (items || []).map((item, index) => {
    const formattedDate = new Date(item.tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return [
      index + 1,
      formattedDate,
      item.status_label || '-',
      item.jam_kerja || '-',
      item.lembur_aktual > 0 ? `${item.lembur_aktual} Jam` : '0 Jam',
      item.lembur_konversi > 0 ? `${item.lembur_konversi} Jam` : '0 Jam',
    ];
  });

  autoTable(doc, {
    startY: tableY + 2,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
    styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 35 },
      2: { halign: 'left' },
      3: { halign: 'center', cellWidth: 35 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'center', cellWidth: 30 },
    },
    head: [['No', 'Tanggal', 'Status / Jenis Hari', 'Jam Kerja', 'Lembur Aktual', 'Lembur Konversi']],
    body: tableBody.length > 0 ? tableBody : [['-', '-', 'Tidak ada data', '-', '-', '-']],
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 8
      );
    },
  });

  const cleanFileName = `Histori_Absen_${namaKaryawan.replace(/[^a-zA-Z0-9]/g, '_')}_${periodeText.replace(/\s+/g, '_')}.pdf`;
  doc.save(cleanFileName);
};

export const exportToExcel = ({ karyawan, periode, summary, items, monthName }) => {
  const namaKaryawan = karyawan?.nama_lengkap || karyawan?.username || 'Karyawan';
  const periodeText = `${monthName} ${periode?.year}`;

  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility

  // Info Header
  csvContent += `"LAPORAN HISTORI ABSEN & RINCIAN LEMBUR"\n`;
  csvContent += `"Karyawan:","${namaKaryawan}"\n`;
  csvContent += `"NIK:","${karyawan?.nik || '-'}"\n`;
  csvContent += `"Jabatan:","${karyawan?.jabatan || '-'}"\n`;
  csvContent += `"Divisi:","${karyawan?.divisi || '-'}"\n`;
  csvContent += `"Lokasi Kerja:","${karyawan?.lokasi_kerja || '-'}"\n`;
  csvContent += `"Periode:","${periodeText}"\n\n`;

  // Summary Metrics
  csvContent += `"RINGKASAN REKAPITULASI"\n`;
  csvContent += `"Total Jam Kerja","Total Lembur Aktual","Total Lembur Konversi","Total HK","Shift Siang","Shift Malam","Cuti Resmi","OFF Murni","Sakit/Izin/Alfa"\n`;
  csvContent += `"${summary?.total_jam_kerja || 0} Jam","${summary?.total_lembur_aktual || 0} Jam","${summary?.total_lembur_konversi || 0} Jam","${summary?.total_hk || 0} Hari","${summary?.shift_siang || 0} Hari","${summary?.shift_malam || 0} Hari","${summary?.cuti_resmi || 0} Hari","${summary?.off_murni || 0} Hari","${summary?.sakit_izin_alfa || 0} Hari"\n\n`;

  // Table Data
  csvContent += `"RINCIAN KRONOLOGIS KEHADIRAN"\n`;
  csvContent += `"No","Tanggal","Status / Jenis Hari","Jam Kerja","Lembur Aktual (Jam)","Lembur Konversi (Jam)","Status Approval"\n`;

  (items || []).forEach((item, index) => {
    const formattedDate = new Date(item.tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    csvContent += `"${index + 1}","${formattedDate}","${item.status_label || '-'}","${item.jam_kerja || '-'}","${item.lembur_aktual || 0}","${item.lembur_konversi || 0}","${item.status_approval || '-'}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanFileName = `Histori_Absen_${namaKaryawan.replace(/[^a-zA-Z0-9]/g, '_')}_${periodeText.replace(/\s+/g, '_')}.csv`;
  link.setAttribute('download', cleanFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
