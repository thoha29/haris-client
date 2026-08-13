import React from 'react';
import './Pagination.css';
import SelectSearch from './SelectSearch';

/**
 * Reusable Frontend Pagination Component
 * 
 * Props:
 * - currentPage: 1-indexed number
 * - totalItems: number
 * - pageSize: number or 'Semua'
 * - onPageChange: function(page)
 * - onPageSizeChange: function(size)
 * - pageSizeOptions: array (default [10, 25, 50, 100, 'Semua'])
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100, 'Semua'],
}) => {
  if (totalItems === 0) return null;

  const isAll = pageSize === 'Semua' || pageSize >= totalItems;
  const effectivePageSize = isAll ? totalItems : Number(pageSize);
  const totalPages = isAll ? 1 : Math.ceil(totalItems / effectivePageSize);

  const startItem = isAll ? 1 : (currentPage - 1) * effectivePageSize + 1;
  const endItem = isAll ? totalItems : Math.min(currentPage * effectivePageSize, totalItems);

  // Generate page numbers array to display
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  const optionsSelect = pageSizeOptions.map((opt) => ({
    value: opt,
    label: opt === 'Semua' ? 'Tampilkan Semua' : `${opt} Per Halaman`,
  }));

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Menampilkan <strong>{startItem}</strong> - <strong>{endItem}</strong> dari <strong>{totalItems}</strong> data
        </span>
        {onPageSizeChange && (
          <div className="pagination-size-selector">
            <SelectSearch
              options={optionsSelect}
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.value)}
              placeholder="Per Halaman"
            />
          </div>
        )}
      </div>

      {!isAll && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange && onPageChange(1)}
            title="Halaman Pertama"
          >
            <i className="bi bi-chevron-double-left"></i>
          </button>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            title="Halaman Sebelumnya"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {getPageNumbers().map((num, idx) => (
            num === '...' ? (
              <span key={`dots-${idx}`} className="pagination-dots">...</span>
            ) : (
              <button
                key={`page-${num}`}
                type="button"
                className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                onClick={() => onPageChange && onPageChange(num)}
              >
                {num}
              </button>
            )
          ))}

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            title="Halaman Selanjutnya"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange && onPageChange(totalPages)}
            title="Halaman Terakhir"
          >
            <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
