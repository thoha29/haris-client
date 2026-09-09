/**
 * Modular Overtime Calculator & Helpers for Client
 * Mengikuti perhitungan lembur pada v_lembur SQL
 */

export const OVERTIME_RATES = {
  HOLIDAY: {
    TIER_1_LIMIT: 8,
    TIER_1_MULTIPLIER: 2.0,
    TIER_2_MULTIPLIER: 4.0,
  },
  REGULAR: {
    TIER_1_LIMIT: 2,
    TIER_1_MULTIPLIER: 1.5,
    TIER_2_MULTIPLIER: 2.0,
  },
};

/**
 * Menghitung lembur konversi berdasarkan jam lembur aktual dan jenis hari / id_skema.
 * Rumus SQL:
 * - id_skema = 0 (Hari Kerja):
 *     total_jam_kerja > 2 => (total_jam_kerja - 2) * 2 + 3.5
 *     total_jam_kerja = 2 => 3.5
 *     total_jam_kerja < 2 => 1.5
 * - id_skema != 0 (Hari Libur):
 *     total_jam_kerja > 8 => (total_jam_kerja - 8) * 4 + 14 + 3
 *     total_jam_kerja = 8 => 14 + 3
 *     total_jam_kerja < 8 => total_jam_kerja * 2
 *
 * @param {number} actualHours - Jam lembur aktual / total jam kerja
 * @param {boolean|number|string} isHoliday - Apakah lembur di hari libur (id_skema != 0) atau nilai id_skema
 * @returns {number} Jam lembur konversi (dibulatkan 2 desimal)
 */
export function calculateLemburKonversi(actualHours, isHoliday = false) {
  const hours = parseFloat(actualHours) || 0;
  if (hours <= 0) return 0;

  // Cek apakah hari libur (id_skema != 0 / isHoliday = true)
  const isHolidayDay =
    isHoliday === true ||
    isHoliday === 'true' ||
    (typeof isHoliday === 'number' && isHoliday !== 0) ||
    (typeof isHoliday === 'string' &&
      isHoliday !== '' &&
      isHoliday !== '0' &&
      isHoliday !== 'false');

  let konversi = 0;

  if (isHolidayDay) {
    // id_skema != 0 (Hari Libur)
    if (hours > 8) {
      konversi = (hours - 8) * 4 + 14 + 3;
    } else if (hours === 8) {
      konversi = 14 + 3;
    } else {
      konversi = hours * 2;
    }
  } else {
    // id_skema = 0 (Hari Kerja)
    if (hours > 2) {
      konversi = (hours - 2) * 2 + 3.5;
    } else if (hours === 2) {
      konversi = 3.5;
    } else {
      konversi = 1.5;
    }
  }

  return Number(konversi.toFixed(2));
}

export const formatHours = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 Jam';
  const num = Number(val);
  return `${num.toFixed(1)} Jam`;
};
