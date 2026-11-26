import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = {
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') || '',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    trending: searchParams.get('trending') || '',
    onSale: searchParams.get('onSale') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  };

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const queryObj = Object.fromEntries(
      Object.entries({ ...filters, limit: 12 }).filter(([, v]) => v !== '' && v !== null)
    );

    productService
      .getProducts(queryObj)
      .then((res) => {
        if (!active) return;
        setProducts(res.data?.products || []);
        setBrands(res.data?.brands || []);
        setPagination(res.data?.pagination || { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const resetAll = () => {
    setSearchParams({});
  };

  return (
    <div className="container page-shell">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-eyebrow">ElectroMart Catalog</div>
          <h1 className="section-title">
            {filters.search
              ? `Search results for "${filters.search}"`
              : filters.category
              ? categories.find((c) => c.slug === filters.category)?.name || 'Electronics'
              : 'All Electronics'}
          </h1>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {pagination.total} product{pagination.total === 1 ? '' : 's'} found
        </span>
      </div>

      <div className="catalog-layout">
        <Sidebar
          categories={categories}
          brands={brands}
          filters={filters}
          onChange={updateParam}
          onReset={resetAll}
        />

        <div>
          <div className="catalog-toolbar">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {filters.search && (
                <button
                  type="button"
                  className="badge badge-accent"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => updateParam('search', '')}
                >
                  Search: {filters.search} ×
                </button>
              )}
              {filters.category && (
                <button
                  type="button"
                  className="badge badge-info"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => updateParam('category', '')}
                >
                  Category: {filters.category} ×
                </button>
              )}
              {filters.brand && (
                <button
                  type="button"
                  className="badge badge-neutral"
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => updateParam('brand', '')}
                >
                  Brand: {filters.brand} ×
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
              <label htmlFor="sort-select" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Sort by:
              </label>
              <select
                id="sort-select"
                className="form-select"
                style={{ width: 'auto', minWidth: '185px' }}
                value={filters.sort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <Loading text="Filtering electronics..." />
          ) : (
            <>
              <ProductGrid
                products={products}
                emptyTitle="No matching electronics found"
                emptyMessage="Try clearing one of your active filters or searching for another brand or category."
              />

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => updateParam('page', String(pagination.page - 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 600, padding: '0 8px' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => updateParam('page', String(pagination.page + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
