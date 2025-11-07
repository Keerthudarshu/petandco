import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useCart } from '../../contexts/CartContext';
import Footer from '../homepage/components/Footer';

const categories = [
  { id: 'all', label: 'All Walk Essentials', img: '/assets/images/walk/collar.webp' },
  { id: 'collar', label: 'Collar', img: '/assets/images/walk/collar.webp' },
  { id: 'leash', label: 'Leash', img: '/assets/images/walk/leash.webp' },
  { id: 'harness', label: 'Harness', img: '/assets/images/walk/harness.webp' },
  { id: 'name-tags', label: 'Name Tags', img: '/assets/images/walk/name-tag.webp' },
  { id: 'personalised', label: 'Personalised', img: '/assets/images/walk/personalised.webp' }
];

const sampleProducts = [
  { id: 'w1', name: 'Comfort Collar - Medium', image: '/assets/images/walk/collar1.webp', badges: ['Best Seller'], variants: ['S','M','L'], price: 299 },
  { id: 'w2', name: 'Reflective Leash', image: '/assets/images/walk/leash1.webp', badges: ['New'], variants: ['120 cm'], price: 349 },
  { id: 'w3', name: 'Soft Harness', image: '/assets/images/walk/harness1.webp', badges: ['Comfort'], variants: ['M','L'], price: 499 }
];

const ProductCard = ({ p }) => {
  const [qty] = useState(1);
  return (
    <article className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="h-8 flex items-center justify-start">
          <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-t-md">{p.badges?.[0]}</div>
        </div>
        <div className="mt-3 h-44 flex items-center justify-center bg-[#f6f8fb] rounded">
          <img src={p.image} alt={p.name} className="max-h-40 object-contain" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">{p.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.variants.map((v, i) => (
            <span key={i} className="text-xs px-2 py-1 border border-border rounded">{v}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">₹{p.price.toFixed(2)}</div>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-full">Add</button>
        </div>
      </div>
    </article>
  );
};

export default function WalkEssentials({ initialActive = 'All Walk Essentials' }) {
  const [active, setActive] = useState(initialActive);
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get('category');
      if (q) {
        const match = categories.find(c => c.label.toLowerCase() === q.toLowerCase());
        setActive(match ? match.label : q);
      }
    } catch (err) {}
  }, [location.search]);

  const topFilters = ['Material','Size','Color','Use Case','Price'];
  const [selectedTopFilter, setSelectedTopFilter] = useState(topFilters[0]);
  const topRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const drawerContentRef = useRef(null);
  const sectionRefs = useRef({});

  const openFilterAndScroll = (key) => {
    setSelectedTopFilter(key);
    setFilterOpen(true);
    const doScroll = () => {
      const container = drawerContentRef.current;
      const el = sectionRefs.current[key];
      if (container && el) {
        const drawerHeaderHeight = 64;
        const top = el.offsetTop;
        const scrollTo = Math.max(0, top - drawerHeaderHeight - 8);
        container.scrollTo({ top: scrollTo, behavior: 'smooth' });
        try { el.classList.add('section-highlight'); setTimeout(() => el.classList.remove('section-highlight'), 1400); } catch (e) {}
      }
    };
    setTimeout(doScroll, 220);
  };

  const routeMap = {
    'All Walk Essentials': '/shop-for-dogs/walk-essentials/all-walk-essentials',
    'Collar': '/shop-for-dogs/walk-essentials/collar',
    'Leash': '/shop-for-dogs/walk-essentials/leash',
    'Harness': '/shop-for-dogs/walk-essentials/harness',
    'Name Tags': '/shop-for-dogs/walk-essentials/name-tags',
    'Personalised': '/shop-for-dogs/walk-essentials/personalised'
  };

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const handleLeftWheel = (e) => { if (leftRef.current) { e.preventDefault(); leftRef.current.scrollTop += e.deltaY; } };
  const handleRightWheel = (e) => { if (rightRef.current) { e.preventDefault(); rightRef.current.scrollTop += e.deltaY; } };

  return (
    <>
      <Helmet>
        <title>Shop for Dogs — Walk Essentials | Roots Traditional</title>
      </Helmet>
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
            <div ref={leftRef} onWheel={handleLeftWheel} className="bg-white rounded border border-border overflow-hidden thin-gold-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
              <ul className="divide-y">
                {categories.map((c, idx) => (
                  <li key={c.id} className={`relative border-b ${active === c.label ? 'bg-[#fff6ee]' : ''}`}>
                    <button onClick={() => { setActive(c.label); const p = routeMap[c.label]; if (p) navigate(p); }} className="w-full text-left flex items-center gap-4 p-4 pr-6">
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border ${active === c.label ? 'ring-2 ring-orange-400' : 'border-gray-100'}`}>
                        <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{c.label}</span>
                    </button>
                    {active === c.label && (<div className="absolute right-0 top-0 h-full w-1 bg-orange-400" />)}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main ref={rightRef} onWheel={handleRightWheel} className="col-span-12 lg:col-span-9 xl:col-span-10" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 overflow-hidden">
                <div ref={topRef} className="hide-scrollbar overflow-x-auto pl-10 pr-10" style={{ whiteSpace: 'nowrap' }}>
                  <div className="inline-flex items-center gap-2">
                    {topFilters.map((t) => (
                      <button key={t} onClick={() => openFilterAndScroll(t)} className={`flex items-center gap-2 text-sm px-3 py-1 border border-border rounded-full bg-white ${selectedTopFilter === t ? 'ring-1 ring-orange-300' : ''}`} style={{ whiteSpace: 'nowrap' }}>
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sampleProducts.map(p => (<ProductCard key={p.id} p={p} />))}
            </div>
          </main>
        </div>
      </div>

      {/* footer + drawer omitted for brevity - reuse Drawer from other pages if needed */}
      <Footer />
    </>
  );
}
