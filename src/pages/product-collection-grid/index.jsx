import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FilterSidebar from './components/FilterSidebar';
import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import ProductGrid from './components/ProductGrid';
import QuickViewModal from './components/QuickViewModal';
import Button from '../../components/ui/Button';
import dataService from '../../services/dataService';
import productApi from '../../services/productApi';
import categoryApi from '../../services/categoryApi';
import apiClient from '../../services/api';

const ProductCollectionGrid = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart, getCartItemCount, cartItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistItems: wishlistState } = useCart();

  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('best-selling');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Derive wishlist ids from CartContext to drive heart fill state
  const wishlistItems = (wishlistState || []).map(w => w.id);

  // Filter state (price range and categories removed)
  const [filters, setFilters] = useState({
    dietary: [],
    brands: []
  });

  // Dynamic categories state
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoryMapping, setCategoryMapping] = useState({});

  // Generate dynamic categories from products
  const generateCategoriesFromProducts = (products, categoryMapping = {}) => {
    const categoryMap = {};
    
    // Default category ID to name mapping (fallback for when backend returns IDs)
    const defaultCategoryIdToName = {
      '1': 'Rice & Grains',
      '2': 'Pulses & Lentils', 
      '3': 'Spices & Masalas',
      '4': 'Cooking Oils',
      '5': 'Healthy Snacks',
      '6': 'Beverages',
      '7': 'Dairy Products',
      '8': 'Traditional Sweets',
      '9': 'Organic Products',
      '10': 'Herbal Products',
      '11': 'Skincare Products',
      '12': 'Haircare Products',
      '13': 'Millet Items',
      '14': 'Powders',
      '15': 'Handmade Soaps',
      // Add more mappings as needed
    };
    
    // Merge with fetched category mapping
    const combinedMapping = { ...defaultCategoryIdToName, ...categoryMapping };
    
    products.forEach(product => {
      const category = product?.category || 'misc';
      
      if (categoryMap[category]) {
        categoryMap[category].count++;
      } else {
        // Determine the display label
        let label;
        
        // Check if category is a numeric ID
        if (/^\d+$/.test(category)) {
          // It's a numeric ID, use mapping or generate generic name
          label = combinedMapping[category] || `Category ${category}`;
        } else {
          // It's already a name, format it nicely
          label = category
            .split(/[-_\s]+/) // Split on hyphens, underscores, or spaces
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        
        categoryMap[category] = {
          id: category,
          label: label,
          count: 1
        };
      }
    });

    return Object.values(categoryMap).sort((a, b) => a.label.localeCompare(b.label));
  };

  // Resolve relative image URLs returned by backend to absolute URLs using API base
  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.image_path || p?.thumbnailUrl;
    if (!candidate) return '/assets/images/no_image.png';
    if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('data:')) {
      return candidate;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  // Initialize products and apply URL filters (category, search)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Load categories from backend API first
        let categoryMapping = {};
        try {
          console.log('Fetching categories from backend API...');
          const categoriesRes = await categoryApi.getAll();
          if (Array.isArray(categoriesRes)) {
            // Create mapping from ID to name
            categoriesRes.forEach(cat => {
              if (cat.id && cat.name) {
                categoryMapping[cat.id.toString()] = cat.name;
              }
            });
            console.log('Successfully loaded category mapping:', categoryMapping);
          }
        } catch (e) {
          console.warn('Failed to load categories, using fallback mapping:', e?.message);
        }
        setCategoryMapping(categoryMapping);
        
        // Load products from backend API
        let apiProducts = [];
        try {
          console.log('Fetching products from backend API...');
          const res = await productApi.getAll();
          // Spring Boot API returns array directly
          apiProducts = Array.isArray(res) ? res : [];
          console.log('Successfully loaded products from API:', apiProducts.length);
        } catch (e) {
          console.warn('Backend API failed, falling back to local data:', e?.message);
          // Fallback to hardcoded data from dataService
          const response = await dataService.getProducts();
          apiProducts = response?.data || [];
          console.log('Loaded products from fallback data:', apiProducts.length);
        }

        // Normalize backend products to UI shape
        const normalizedProducts = apiProducts.map((p) => ({
          id: p?.id,
          name: p?.name || p?.title,
          category: p?.category || p?.categoryId || p?.subcategory || 'misc',
          subcategory: p?.subcategory,
          brand: p?.brand || p?.manufacturer || 'Brand',
          price: p?.price ?? p?.salePrice ?? p?.mrp ?? 0,
          salePrice: p?.salePrice ?? p?.price ?? p?.mrp ?? 0,
          originalPrice: p?.originalPrice ?? p?.mrp ?? p?.price ?? 0,
          rating: p?.rating ?? p?.ratingValue ?? 0,
          bestseller: Boolean(p?.bestseller),
          image: resolveImageUrl(p),
          description: p?.description || '',
          // Include stock fields when present; treat missing as unlimited
          stockQuantity: p?.stockQuantity ?? null,
          inStock: p?.inStock !== false, // Default to true if not specified
          weight: p?.weight || 'N/A'
        }));

        // Apply URL filters
        const categoryParam = (searchParams.get('category') || '').toLowerCase();
        const searchParamRaw = searchParams.get('search') || '';
        const searchParam = searchParamRaw.toLowerCase();

        let working = normalizedProducts;
        if (categoryParam) {
          working = working.filter(p => String(p?.category || '').toLowerCase() === categoryParam);
        }
        if (searchParam) {
          // Prefer exact name match; if none, fallback to substring contains
          const exact = working.filter(p => String(p?.name || '').toLowerCase() === searchParam);
          working = exact.length > 0 ? exact : working.filter(p => String(p?.name || '').toLowerCase().includes(searchParam));
        }

        setProducts(normalizedProducts);
        setFilteredProducts(working);
        
        // Generate categories from all products with mapping
        const categories = generateCategoriesFromProducts(normalizedProducts, categoryMapping);
        console.log('Generated categories for FilterSidebar:', categories);
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error loading products:', error);
        // Set empty array as fallback
        setProducts([]);
        setFilteredProducts([]);
        setAvailableCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [location.search]); // Depend on location.search for category filtering

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    if (filters?.dietary?.length > 0) {
      filtered = filtered?.filter(product =>
        filters?.dietary?.some(diet => product?.dietary?.includes(diet))
      );
    }

    // categories filtering removed (use URL/category routing instead)

    if (filters?.brands?.length > 0) {
      filtered = filtered?.filter(product =>
        filters?.brands?.includes(product?.brand)
      );
    }

    // Apply sorting
    switch (currentSort) {
      case 'price-low-high':
        filtered?.sort((a, b) => a?.salePrice - b?.salePrice);
        break;
      case 'price-high-low':
        filtered?.sort((a, b) => b?.salePrice - a?.salePrice);
        break;
      case 'newest':
        filtered?.sort((a, b) => b?.id - a?.id);
        break;
      case 'oldest':
        filtered?.sort((a, b) => a?.id - b?.id);
        break;
      case 'name-a-z':
        filtered?.sort((a, b) => a?.name?.localeCompare(b?.name));
        break;
      case 'name-z-a':
        filtered?.sort((a, b) => b?.name?.localeCompare(a?.name));
        break;
      case 'rating-high-low':
        filtered?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'best-selling':
      default:
        filtered?.sort((a, b) => (b?.bestseller ? 1 : 0) - (a?.bestseller ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters, currentSort]);

  // Handle filter changes
  const handleFilterChange = (filterType, newValue) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: newValue
    }));
  };

  const handleRemoveFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev?.[filterType]?.filter(item => item !== value)
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      dietary: [],
      brands: []
    });
  };

  // Handle product actions
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (product, variant = null, quantity = 1) => {
    const productToAdd = {
      id: product?.id,
      productId: product?.id, // Add productId for API compatibility
      name: product?.name,
      image: product?.image,
      price: variant?.price || product?.price, // Use 'price' instead of 'salePrice'
      originalPrice: variant?.originalPrice || product?.originalPrice,
      variant: variant?.weight || 'Default',
      category: product?.category,
      brand: product?.brand
    };

    addToCart(productToAdd, quantity);
    
    // Show success feedback
    console.log('Added to cart:', productToAdd);
  };

  const handleAddToWishlist = (productOrId) => {
    const product = typeof productOrId === 'object' ? productOrId : products.find(p => p.id === productOrId);
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        // pass stock info when available
        ...(product.stockQuantity !== undefined ? { stockQuantity: product.stockQuantity } : {}),
        ...(product.inStock !== undefined ? { inStock: product.inStock } : {})
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: 'Products', path: '/shop-for-dogs' }
  ];

  const categoryTitle = searchParams?.get('category')?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase()) || 'All Products';

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={getCartItemCount()}
        cartItems={cartItems}
        onSearch={(query) => console.log('Search:', query)}
      />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb customItems={breadcrumbItems} />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            {categoryTitle}
          </h1>
          <p className="font-body text-muted-foreground">
            Discover our collection of natural, handmade products crafted with love and tradition.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              isOpen={false}
              onClose={() => {}}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearAllFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setIsMobileFilterOpen(true)}
                iconName="Filter"
                iconPosition="left"
                className="lg:hidden"
              >
                Filters
              </Button>

              <div className="flex items-center gap-4">
                <span className="font-body text-sm text-muted-foreground">
                  {filteredProducts?.length} products
                </span>
                <SortDropdown
                  currentSort={currentSort}
                  onSortChange={setCurrentSort}
                />
              </div>
            </div>

            {/* Active Filter Chips */}
            <FilterChips
              activeFilters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />

            {/* Product Grid - HUFT-like layout: left category rail + right product cards */}
            <div className="flex gap-6">
              {/* Left category rail (desktop only) */}
              <aside className="hidden lg:block w-72">
                <div className="bg-white rounded shadow-sm overflow-hidden">
                  <ul className="divide-y">
                    {availableCategories?.length > 0 ? (
                      availableCategories.map((cat) => {
                        const catId = String(cat.id || cat.label).toLowerCase();
                        const isActive = (searchParams.get('category') || '').toLowerCase() === catId || (!searchParams.get('category') && catId === 'all products');
                        return (
                          <li key={catId} className={`flex items-center gap-4 px-4 py-3 cursor-pointer ${isActive ? 'bg-[rgba(255,131,62,0.06)]' : 'hover:bg-gray-50'}`}>
                            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center border ${isActive ? 'ring-2 ring-orange-400' : 'border-gray-100'}`}>
                              {/* small circular icon - fallback to first letter */}
                              <span className="text-sm font-medium text-gray-700">{(cat.label || '').charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${isActive ? 'text-amber-600' : 'text-gray-800'}`}>{cat.label}</div>
                              <div className="text-xs text-muted-foreground">{cat.count ?? ''} items</div>
                            </div>
                            <div className={`w-1 h-10 rounded-r ${isActive ? 'bg-orange-400' : 'bg-transparent'}`} />
                          </li>
                        );
                      })
                    ) : (
                      <li className="p-4 text-sm text-muted-foreground">No categories found</li>
                    )}
                  </ul>
                </div>
              </aside>

              {/* Right: products column */}
              <section className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loading ? (
                    // Simple placeholders
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="p-4 bg-white rounded-lg shadow-sm h-96 animate-pulse" />
                    ))
                  ) : filteredProducts?.length === 0 ? (
                    <div className="col-span-full p-8 text-center">No products found</div>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const img = resolveImageUrl(p);
                      // Simple deterministic discount pattern for chips
                      const discounts = [0, 8, 10, 20, 15];
                      const sizes = (p?.sizes && Array.isArray(p.sizes) && p.sizes.length > 0)
                        ? p.sizes
                        : ['250 gm', '2 kg', '5 kg'];

                      return (
                        <article key={p.id || idx} className="bg-white rounded-lg p-4 shadow-sm flex flex-col" style={{ minHeight: 380 }}>
                          <div className="relative flex items-start justify-center h-44 bg-slate-50 rounded-md overflow-hidden">
                            <img src={img} alt={p.name} className="max-h-40 object-contain" />

                            {/* Rating badge */}
                            <div className="absolute left-3 top-3 bg-white px-2 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>
                              <span className="text-sm font-semibold">{(p.rating || 0).toFixed(1)}</span>
                            </div>

                            {/* Optional top-right ribbon for first item */}
                            {idx === 0 && (
                              <div className="absolute right-0 top-0 transform translate-x-6 -translate-y-6">
                                <div className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-tl-md rounded-br-md">Steal the Deal</div>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex-1 flex flex-col">
                            <div className="text-sm text-amber-600 font-semibold">{p.brand || 'Brand'}</div>
                            <h3 className="font-medium text-gray-800 line-clamp-2 mt-1">{p.name}</h3>

                            {/* small tag badges (if any) */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(p?.tags || []).slice(0,3).map((t, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{t}</span>
                              ))}
                            </div>

                            {/* Sizes / weight chips */}
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              {sizes.map((sz, i) => (
                                <div key={i} className="flex flex-col items-start">
                                  <button type="button" className={`px-3 py-1 border rounded text-sm ${i===1 ? 'bg-green-600 text-white' : 'bg-white text-gray-700'} focus:outline-none`}>{sz}</button>
                                  {/* discount pill below some chips */}
                                  {discounts[i % discounts.length] > 0 && (
                                    <div className="mt-1 text-xs text-white bg-green-600 px-1 rounded text-center w-full">{discounts[i % discounts.length]}%</div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                              <div>
                                <div className="text-lg font-semibold">₹{(p.salePrice ?? p.price ?? 0).toLocaleString()}</div>
                                {p.originalPrice && p.originalPrice > (p.salePrice ?? p.price ?? 0) && (
                                  <div className="text-sm text-muted-foreground line-through">₹{p.originalPrice.toLocaleString()}</div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <button
                                  onClick={() => handleAddToCart(p, null, 1)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold shadow"
                                >
                                  Add
                                </button>
                                <div className="text-xs text-muted-foreground">{p.inStock === false ? 'Out of stock' : ''}</div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {/* Load More Button */}
            {!loading && filteredProducts?.length > 0 && hasMoreProducts && (
              <div className="text-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Simulate loading more products
                    setCurrentPage(prev => prev + 1);
                    // In real app, this would load more products
                    if (currentPage >= 3) {
                      setHasMoreProducts(false);
                    }
                  }}
                >
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Mobile Filter Sidebar */}
      <FilterSidebar
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearAllFilters}
        isMobile={true}
      />
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductCollectionGrid;