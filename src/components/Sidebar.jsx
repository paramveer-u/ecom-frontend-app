export default function Sidebar({
  categories = [],
  brands = [],
  filters,
  onChange,
  onReset,
}) {
  return (
    <aside className="filter-sidebar" aria-label="Product Filters">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '16px' }}>Filters</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          Reset All
        </button>
      </div>

      <div className="filter-block">
        <h4>Category</h4>
        <select
          className="form-select"
          value={filters.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name} ({cat.product_count ?? 0})
            </option>
          ))}
        </select>
      </div>

      <div className="filter-block">
        <h4>Brand</h4>
        <select
          className="form-select"
          value={filters.brand || ''}
          onChange={(e) => onChange('brand', e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-block">
        <h4>Price Range (INR)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            type="number"
            min="0"
            className="form-input"
            placeholder="Min ₹"
            value={filters.minPrice || ''}
            onChange={(e) => onChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            min="0"
            className="form-input"
            placeholder="Max ₹"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-block">
        <h4>Minimum Rating</h4>
        <select
          className="form-select"
          value={filters.minRating || ''}
          onChange={(e) => onChange('minRating', e.target.value)}
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5 ★ &amp; above</option>
          <option value="4">4.0 ★ &amp; above</option>
          <option value="3">3.0 ★ &amp; above</option>
        </select>
      </div>

      <div className="filter-block">
        <h4>Availability</h4>
        <select
          className="form-select"
          value={filters.inStock || ''}
          onChange={(e) => onChange('inStock', e.target.value)}
        >
          <option value="">All Items</option>
          <option value="true">In Stock Only</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>
    </aside>
  );
}
