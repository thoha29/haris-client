/**
 * Format waktu dari desimal jam ke "X jam Y menit"
 * @param {number|string} decimalHours - Jam dalam bentuk desimal (misal: 1.5)
 * @returns {string} Format "1 jam 30 menit"
 */
export const formatJamMenit = (decimalHours) => {
  if (decimalHours === null || decimalHours === undefined || decimalHours === '') return '-';
  const total = parseFloat(decimalHours);
  if (isNaN(total) || total < 0) return '-';
  if (total === 0) return '0 menit';
  const jam = Math.floor(total);
  const menit = Math.round((total - jam) * 60);
  if (jam > 0 && menit > 0) return `${jam} jam ${menit} menit`;
  if (jam > 0) return `${jam} jam`;
  return `${menit} menit`;
};

/**
 * Format waktu dari menit total ke "X jam Y menit"
 * @param {number} totalMenit - Total menit (misal: 90)
 * @returns {string} Format "1 jam 30 menit"
 */
export const formatMenitKeJamMenit = (totalMenit) => {
  if (totalMenit === null || totalMenit === undefined || totalMenit === '') return '-';
  const total = parseInt(totalMenit, 10);
  if (isNaN(total) || total < 0) return '-';
  if (total === 0) return '0 menit';
  const jam = Math.floor(total / 60);
  const menit = total % 60;
  if (jam > 0 && menit > 0) return `${jam} jam ${menit} menit`;
  if (jam > 0) return `${jam} jam`;
  return `${menit} menit`;
};
