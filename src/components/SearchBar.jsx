import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { productService } from '../services/productService';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productService.getSuggestions(trimmed);
        setSuggestions(res.data || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <Search size={17} color="#7B889E" />
        <input
          type="search"
          className="search-input"
          placeholder="Search laptops, phones, audio, brands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          aria-label="Search electronics"
        />
        <button type="submit" className="btn btn-navy btn-sm">
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              className="suggestion-item"
              style={{
                width: '100%',
                textAlign: 'left',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false);
                navigate(`/products/${item.id}`);
              }}
            >
              <img
                src={resolveImageUrl(item.primary_image)}
                alt={item.name}
                className="suggestion-thumb"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--navy-900)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {item.brand} · {item.category_name}
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--navy-900)' }}>
                {formatCurrency(item.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
