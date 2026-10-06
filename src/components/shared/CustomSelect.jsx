import { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiOutlineSearch } from 'react-icons/hi';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  name, 
  placeholder = "Select an option", 
  className = "",
  searchable = false,
  menuPlacement = "bottom"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value?.toString() === value?.toString());
  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[42px] flex items-center justify-between bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-all duration-300 cursor-pointer text-left"
      >
        <span className={`block truncate mr-2 ${selectedOption ? 'text-[var(--input-text)]' : 'text-[var(--input-placeholder)]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown 
          className={`w-5 h-5 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-luxury-gold' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full ${menuPlacement === 'top' ? 'bottom-full mb-2' : 'mt-2'} bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-[var(--shadow-card)] overflow-hidden animate-fade-in-up`}>
          {searchable && (
            <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center gap-2">
              <HiOutlineSearch className="w-4 h-4 text-[var(--text-muted)] ml-2" />
              <input 
                type="text" 
                className="w-full bg-transparent border-none px-2 py-1.5 text-sm text-[var(--input-text)] focus:outline-none placeholder-[var(--text-muted)]" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onClick={(e) => e.stopPropagation()} 
                autoFocus
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onChange) {
                        // Mock a standard event object to keep compatibility with existing handlers
                        onChange({ target: { name, value: option.value } });
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 cursor-pointer ${
                      value?.toString() === option.value?.toString()
                        ? 'bg-luxury-gold text-black font-medium' 
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
