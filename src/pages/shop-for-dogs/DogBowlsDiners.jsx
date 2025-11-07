import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useCart } from '../../contexts/CartContext';
import Footer from '../homepage/components/Footer';

const categories = [
  { id: 'all', label: 'All Dog Bowls & Diners', img: '/assets/images/bowls/all-bowls.webp' },
  { id: 'bowls', label: 'Bowls', img: '/assets/images/bowls/bowls.webp' },
  { id: 'diners', label: 'Diners', img: '/assets/images/bowls/diners.webp' },
  { id: 'anti-spill-mats', label: 'Anti Spill Mats', img: '/assets/images/bowls/anti-spill.webp' },
  { id: 'travel-fountain', label: 'Travel & Fountain', img: '/assets/images/bowls/travel.webp' }
];

const sampleProducts = [
  { id: 'bb1', name: 'Stainless Steel Bowl - Medium', image: '/assets/images/bowls/ss-bowl.webp', badges: ['Popular'], variants: ['S','M','L'], price: 349 },
  { id: 'bb2', name: 'Ceramic Diner Plate', image: '/assets/images/bowls/ceramic-plate.webp', badges: ['Handmade'], variants: ['One Size'], price: 499 },
  { id: 'bb3', name: 'Anti Spill Mat - Silicone', image: '/assets/images/bowls/anti-spill-mat.webp', badges: ['Non-Slip'], variants: ['One Size'], price: 299 }
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

export default function DogBowlsDiners({ initialActive = 'Bowls' }) {
  const [active, setActive] = useState(initialActive);
  const { getCartItemCount, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get('sub') || new URLSearchParams(location.search).get('category');
      if (q) {
        const match = categories.find(c => c.label.toLowerCase() === q.toLowerCase() || c.id === q.toLowerCase());
        setActive(match ? match.label : q);
      }
    } catch (err) {}
  }, [location.search]);

  const routeMap = {
    'All Dog Bowls & Diners': '/shop-for-dogs/dog-bowls-diners/all-dog-bowls-diners',
    'Bowls': '/shop-for-dogs/dog-bowls-diners/bowls',
    'Diners': '/shop-for-dogs/dog-bowls-diners/diners',
    'Anti Spill Mats': '/shop-for-dogs/dog-bowls-diners/anti-spill-mats',
    'Travel & Fountain': '/shop-for-dogs/dog-bowls-diners/travel-fountain'
  };

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const handleLeftWheel = (e) => { if (leftRef.current) { e.preventDefault(); leftRef.current.scrollTop += e.deltaY; } };
  const handleRightWheel = (e) => { if (rightRef.current) { e.preventDefault(); rightRef.current.scrollTop += e.deltaY; } };

  return (
    <>
      <Helmet>
        <title>{`Shop for Dogs — ${active} | Roots Traditional`}</title>
      </Helmet>
      <Header cartItemCount={getCartItemCount()} cartItems={cartItems} onSearch={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
            <div ref={leftRef} onWheel={handleLeftWheel} className="bg-white rounded border border-border overflow-hidden thin-gold-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
              <ul className="divide-y">
                {categories.map((c) => (
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
            <div className="mb-4">
              <div className="inline-flex items-center gap-2">
                {/* simple filter pills */}
                {['Material','Size','Durability','Price'].map(t => (
                  <button key={t} className="text-sm px-3 py-1 border border-border rounded-full bg-white">{t}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sampleProducts.map(p => (<ProductCard key={p.id} p={p} />))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}