import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], emptyTitle = 'No products found', emptyMessage = 'Try adjusting your filters or search query.' }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
