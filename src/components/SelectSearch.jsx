import React, { useState, useEffect, useRef } from 'react';
import './SelectSearch.css';

/**
 * Global SelectSearch Component
 * 
 * Props:
 * - options: Array of objects or strings (e.g. [{ value: '1', label: 'Item 1' }] or ['Item 1', 'Item 2'])
 * - value: Currently selected value
 * - onChange: Callback when selection changes: onChange(selectedOptionValue, optionObject)
 * - placeholder: Placeholder text when no value selected
 * - searchPlaceholder: Placeholder inside search input
 * - name: Form field name
 * - valueKey: Key for value in object option (default: 'value')
 * - labelKey: Key for label in object option (default: 'label')
 * - disabled: Disable the select
 * - isClearable: Allow clearing selected option
 * - className: Additional CSS class for outer container
 * - style: Additional inline styles
 */
const SelectSearch = ({
  options = [],
  value = '',
  onChange,
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Cari...',
  name = '',
  valueKey = 'value',
  labelKey = 'label',
  disabled = false,
  isClearable = false,
  className = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options array into [{ value, label, original }] format
  const normalizedOptions = React.useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((opt) => {
      if (opt !== null && typeof opt === 'object') {
        return {
          value: opt[valueKey] !== undefined ? opt[valueKey] : '',
          label: opt[labelKey] !== undefined ? String(opt[labelKey]) : '',
          original: opt,
        };
      }
      return {
        value: opt,
        label: String(opt),
        original: opt,
      };
    });
  }, [options, valueKey, labelKey]);

  // Find currently selected option safely
  const selectedOption = normalizedOptions.find(
    (opt) =>
      value !== '' &&
      value !== undefined &&
      value !== null &&
      String(opt.value) === String(value)
  );

  // Filter options based on search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setSearchTerm('');
  };

  // Select an option
  const handleSelect = (opt) => {
    if (onChange) {
      onChange({
        target: { name, value: opt ? opt.value : '' },
        value: opt ? opt.value : '',
        option: opt ? opt.original : null,
      });
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    handleSelect(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`select-search-container ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      style={style}
    >
      <div className="select-search-header" onClick={handleToggle}>
        <span className={`select-search-value ${!selectedOption ? 'select-search-text-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="select-search-controls">
          {isClearable && selectedOption && !disabled && (
            <button
              type="button"
              className="select-search-clear"
              onClick={handleClear}
              title="Hapus pilihan"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
          <i className={`bi bi-chevron-down select-search-arrow ${isOpen ? 'rotated' : ''}`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="select-search-dropdown">
          <div className="select-search-box">
            <i className="bi bi-search select-search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="select-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="select-search-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <li
                  key={`${opt.value}-${idx}`}
                  className={`select-search-option ${
                    selectedOption && String(selectedOption.value) === String(opt.value)
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                  {selectedOption && String(selectedOption.value) === String(opt.value) && (
                    <i className="bi bi-check select-search-check"></i>
                  )}
                </li>
              ))
            ) : (
              <li className="select-search-empty">Tidak ada pilihan ditemukan</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectSearch;
