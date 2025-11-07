import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../AppImage';

const MegaMenu = ({ isOpen, onClose, activeCategory }) => {
  const categories = [
    {
      title: 'Food Items',
      items: [
  { name: 'Unpolished Pulses, Dals & Rice', path: '/shop-for-dogs?category=unpolished-pulses-dals-rice' },
  { name: 'Poha / Aval', path: '/shop-for-dogs?category=poha-aval' },
  { name: 'Sugars & Honey', path: '/shop-for-dogs?category=sugars-honey' },
  { name: 'Millet Items', path: '/shop-for-dogs?category=millet-items' }
      ],
      image: '/assets/images/category-food.jpg'
    },
    {
      title: 'Spices & Powders',
      items: [
  { name: 'Powders', path: '/shop-for-dogs?category=powders' },
  { name: 'Herbal Powders', path: '/shop-for-dogs?category=herbal-powders' },
  { name: 'Fries', path: '/shop-for-dogs?category=fries' }
      ],
      image: '/assets/images/category-spices.jpg'
    },
    {
      title: 'Personal Care',
      items: [
  { name: 'Haircare Products', path: '/shop-for-dogs?category=haircare-products' },
  { name: 'Skincare Products', path: '/shop-for-dogs?category=skincare-products' },
  { name: 'Herbal Handmade Soaps', path: '/shop-for-dogs?category=herbal-handmade-soaps' }
      ],
      image: '/assets/images/category-personal-care.jpg'
    },
    {
      title: 'Health & Wellness',
      items: [
  { name: 'Herbal Products', path: '/shop-for-dogs?category=herbal-products' },
  { name: 'Snacks', path: '/shop-for-dogs?category=snacks' }
      ],
      image: '/assets/images/category-health.jpg'
    }
  ];

  // mobile menu tree used by the drawer (keeps items lightweight; some navigations use query-style links for compatibility)
  const mobileMenu = [
    {
      key: 'shop-dogs',
      label: 'Shop for Dogs',
      icon: '/assets/icons/menu-dot.svg',
      children: [
        { label: 'Dog Food', type: 'query', category: 'dog-food', subs: ['Daily Meals','Dry Food','Wet Food','Grain Free','Puppy Food','Hypoallergenic','Veterinary Food','Food Toppers & Gravy','All Dog Food'] },
        { label: 'Dog Grooming', type: 'query', category: 'dog-grooming', subs: ['Brushes & Combs','Dry Bath, Wipes & Perfume','Ear, Eye & PawCare','Oral Care','Shampoo & Conditioner','Tick & Flea Control','All Dog Grooming'] },
        { label: 'Dog Treats', type: 'query', category: 'dog-treats', subs: ['Biscuits & Snacks','Soft & Chewy','Natural Treats','Puppy Treats','Vegetarian Treats','Dental Chew','Grain Free Treat','All Dog Treats'] },
        { label: 'Walk Essentials', path: '/shop-for-dogs/walk-essentials' },
        { label: 'Dog Toys', path: '/shop-for-dogs/dog-toys' },
        { label: 'Dog Bedding', path: '/shop-for-dogs/dog-bedding' },
        { label: 'Dog Clothing & Accessories', path: '/shop-for-dogs/dog-clothing' },
        { label: 'Dog Bowls & Diners', path: '/shop-for-dogs/dog-bowls-diners' },
        { label: 'Dog Health & Hygiene', path: '/shop-for-dogs/dog-health-hygiene' },
        { label: 'Dog Travel & Supplies', path: '/shop-for-dogs/dog-travel-supplies' },
        { label: 'Dog Training Essentials', path: '/shop-for-dogs/dog-training-essentials' },
        { label: 'Pet Lovers', path: '/gift-cards' }
      ]
    },
    { key: 'shop-cats', label: 'Shop for Cats', icon: '/assets/icons/menu-dot.svg', path: '/shop-for-cats' }
  ];

  const [visible, setVisible] = useState(false);
  // mobile drawer navigation state: a simple stack of views
  const [mobileStack, setMobileStack] = useState([{ title: 'Menu', items: null, key: 'root' }]);

  const pushMobileView = (view) => setMobileStack(s => [...s, view]);
  const popMobileView = () => setMobileStack(s => (s.length > 1 ? s.slice(0, s.length - 1) : s));
  const resetMobileView = () => setMobileStack([{ title: 'Menu', items: null, key: 'root' }]);

  useEffect(() => {
    // trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const slugify = (s) => {
    return String(s || '')
      .toLowerCase()
      .replace(/&/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .split(/\s+/)
      .join('-');
  };

  const closeWithAnimation = (cb) => {
    setVisible(false);
    // wait for animation to finish before calling onClose/navigation
    setTimeout(() => {
      if (typeof onClose === 'function') onClose();
      if (typeof cb === 'function') cb();
    }, 220);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay for drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1001] lg:hidden transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => closeWithAnimation()}
      />

      {/* Mobile Left Drawer (exact layout per reference) */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-white z-[1002] lg:hidden shadow-2xl overflow-y-auto transform transition-transform duration-200 ${visible ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Blue gradient header */}
        <div className="px-4 py-3" style={{ background: 'linear-gradient(180deg,#0b66b2,#0f4a8a)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-semibold">Dog Toys = Daily Joy</h3>
            <button onClick={onClose} aria-label="Close menu" className="text-white text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Primary category list with icons (mobile nested drawer) */}
        <nav className="px-3 py-3">
          {(() => {
            const current = mobileStack[mobileStack.length - 1] || { title: 'Menu', items: null };
            return (
              <div>
                <div className="flex items-center mb-2">
                  {mobileStack.length > 1 ? (
                    <button onClick={popMobileView} className="mr-2 text-sm text-foreground">←</button>
                  ) : null}
                  <h4 className="text-sm font-semibold text-foreground">{current.title}</h4>
                  {mobileStack.length > 1 && (
                    <button onClick={resetMobileView} className="ml-auto text-xs text-muted-foreground">Home</button>
                  )}
                </div>

                {/* root: show top-level entries */}
                {(!current.items || current.key === 'root') && (
                  <div>
                    {mobileMenu.map((m, i) => (
                      <button key={i} onClick={() => { if (m.children) { pushMobileView({ title: m.label, items: m.children, key: m.key }); } else if (m.path) { window.location.href = m.path; closeWithAnimation(); } }} className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-muted text-left">
                        <img src={m.icon} alt="dot" className="w-6 h-6" />
                        <span className="text-sm text-foreground">{m.label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {/* if current.view has items then show them */}
                {current.items && (
                  <div>
                    {current.items.map((it, idx) => (
                      <div key={idx}>
                        {it.subs ? (
                          <button onClick={() => pushMobileView({ title: it.label, items: it.subs.map(s => ({ label: s, path: it.type === 'query' ? `/shop-for-dogs?category=${it.category}&sub=${encodeURIComponent(s)}` : undefined })) })} className="w-full text-left px-2 py-2 hover:bg-muted">{it.label} <span className="text-xs text-muted-foreground">▶</span></button>
                        ) : it.path ? (
                          <button onClick={() => { window.location.href = it.path; closeWithAnimation(); }} className="w-full text-left px-2 py-2 hover:bg-muted">{it.label}</button>
                        ) : (
                          <button onClick={() => pushMobileView({ title: it.label, items: (it.items || []).map(x => ({ label: x })) })} className="w-full text-left px-2 py-2 hover:bg-muted">{it.label}</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* leaf: when items are plain labels with path property */}
                {current.items && current.items.length && typeof current.items[0] === 'string' && (
                  <div>
                    {current.items.map((label, id) => {
                      // label may be string in some pushed views - build a fallback query link
                      const path = `/shop-for-dogs?sub=${encodeURIComponent(label)}`;
                      return <button key={id} onClick={() => { window.location.href = path; closeWithAnimation(); }} className="w-full text-left px-2 py-2 hover:bg-muted">{label}</button>;
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="my-3 border-t border-border" />

          {/* Secondary menu items with badges */}
          <ul className="space-y-2 px-1">
            {[
              { label: 'HUFT Outlet Sale', path: '/outlet', badge: '60% Off' },
              { label: 'Pharmacy', path: '/pharmacy', badge: 'NEW' },
              { label: 'HUFT Spa', path: '/spa', badge: 'App Exclusive' },
              { label: 'HUFT Hub', path: '/hub' },
              { label: 'Store & Spa Locator', path: '/locator' },
              { label: 'Become a Franchisee', path: '/franchise' },
              { label: 'Join our Birthday Club', path: '/birthday' }
            ].map((it, i) => (
              <li key={i}>
                <button
                  onClick={() => { window.location.href = it.path; onClose(); }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-muted text-sm text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <img src="/assets/icons/menu-dot.svg" alt="dot" className="w-5 h-5" />
                    <span>{it.label}</span>
                  </span>
                  {it.badge && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-white" style={{ background: it.badge === 'NEW' ? '#ff6b6b' : '#ff9f43' }}>{it.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Brands row */}
          <div className="mt-4 px-3">
            <div className="flex items-center gap-3">
              <img src="/assets/images/brands/sara.png" alt="Sara's" className="h-8" />
              <img src="/assets/images/brands/hearty.png" alt="Hearty" className="h-8" />
              <img src="/assets/images/brands/meowsi.png" alt="Meowsi" className="h-8" />
              <img src="/assets/images/brands/fashi.png" alt="FashiDog" className="h-8" />
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 px-3 pb-6 border-t border-border">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/adopt-a-pet" onClick={onClose}>Adopt a Pet</a></li>
              <li><a href="/track-order" onClick={onClose}>Track Order</a></li>
              <li><a href="/contact" onClick={onClose}>Contact Us</a></li>
              <li><a href="/faqs" onClick={onClose}>FAQs & Exchange Policy</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Keep existing desktop mega menu markup (unchanged) */}
      <div className="absolute top-full left-0 w-full bg-card shadow-warm-lg border-t border-border z-[1002] lg:relative lg:shadow-warm-xl max-h-[70vh] overflow-y-auto">
        <div className="container mx-auto px-3 py-2">
          {/* If activeCategory is dogs, render the full dog mega menu */}
            {activeCategory === 'dogs' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">DOG FOOD</h4>
                <ul className="space-y-0.5">
                  {['Daily Meals','Dry Food','Wet Food','Grain Free','Puppy Food','Hypoallergenic','Veterinary Food','Food Toppers & Gravy','All Dog Food'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=dog-food&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">DOG GROOMING</h4>
                <ul className="space-y-0.5">
                  {['Brushes & Combs','Dry Bath, Wipes & Perfume','Ear, Eye & PawCare','Oral Care','Shampoo & Conditioner','Tick & Flea Control','All Dog Grooming'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=dog-grooming&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
                <hr className="my-1" />
                <h4 className="text-sm font-semibold text-foreground mb-1">WALK ESSENTIALS</h4>
                <ul className="space-y-0.5">
                  {['Collar','Leash','Harness','Name Tags','Personalised','All Walk Essentials'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/walk-essentials/${slugify(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
                {/* Travel Essentials moved to its own final column for clearer layout */}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">DOG TREATS <span className="ml-2 bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">#1TREATS</span></h4>
                <ul className="space-y-0.5">
                  {['Biscuits & Snacks','Soft & Chewy','Natural Treats','Puppy Treats','Vegetarian Treats','Dental Chew','Grain Free Treat','All Dog Treats'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=dog-treats&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">DOG TOYS</h4>
                <ul className="space-y-0.5">
                  {['Balls','Chew Toys','Crinkle Toys','Fetch Toys','Interactive Toys','Plush Toys','Rope Toys','Squeaker Toys','All Dog Toys'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/dog-toys/${t.toLowerCase().split(' ').join('-')}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
                <hr className="my-1" />
                <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">DOG BEDDING</h4>
                <ul className="space-y-0.5">
                  {['Beds','Blankets & Cushions','Mats','Personalised Bedding','Tents','All Dog Bedding'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/dog-bedding/${t.toLowerCase().split(' ').join('-')}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">DOG CLOTHING & ACCESSORIES</h4>
                <ul className="space-y-0.5">
                  {['Festive Special','T-Shirts & Dresses','Sweatshirts','Sweaters','Bow Ties & Bandanas','Raincoats','Shoes & Socks','Jackets','Personalised','All Dog Clothing'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/dog-clothing/${t.toLowerCase().split(' ').join('-')}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
                <hr className="my-1" />
                <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">DOG BOWLS & DINERS</h4>
                <ul className="space-y-0.5">
                  {['All Dog Bowls & Diners','Bowls','Diners','Anti Spill Mats','Travel & Fountain'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/dog-bowls-diners/${slugify(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">DOG HEALTH & HYGIENE</h4>
                <ul className="space-y-0.5">
                  {['Oral Care','Supplements','Tick & Flea Control','All Dog Health & Hygiene'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/dog-health-hygiene/${slugify(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
                <hr className="my-1" />
                <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">DOG TRAINING ESSENTIALS</h4>
                <ul className="space-y-0.5">
                  {['Agility','All Training Essentials','Stain & Odour'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=dog-training&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">PET LOVERS</h4>
                  <div className="flex items-center gap-2">
                    <Link to="/gift-cards" onClick={onClose} className="bg-[#ff7a00] text-white px-3 py-1 rounded text-sm font-semibold">GIFT CARDS</Link>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">TRAVEL ESSENTIALS</h4>
                <ul className="space-y-1">
                  {['All Travel Supplies','Carriers','Travel Bowls','Travel Beds','Water Bottles'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/dog-travel-supplies/${slugify(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          ) : activeCategory === 'cats' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">CAT FOOD</h4>
                <ul className="space-y-0.5">
                  {['Dry Food','Wet Food','Grain Free Food','Kitten Food','Veterinary Food','Supplements','All Cat Food'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-food&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>

                <hr className="my-1" />

                <h4 className="text-sm font-semibold text-foreground mb-1">CAT TREATS</h4>
                <ul className="space-y-0.5">
                  {['Crunchy Treats','Creamy Treats','Grain Free Treats','Chew Treats','All Cat Treats'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-treats&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">CAT LITTER & SUPPLIES</h4>
                <ul className="space-y-1">
                  {['Litter','Litter Trays','Scooper','Stain & Odour','All Litter & Supplies'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-litter&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>

                <hr className="my-1" />

                <h4 className="text-sm font-semibold text-foreground mb-1">CAT TOYS</h4>
                <ul className="space-y-0.5">
                  {['Catnip Toys','Interactive Toys','Plush Toys','Teaser & Wands','All Toys'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-toys&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">TREES, BEDS & SCRATCHERS</h4>
                <ul className="space-y-1">
                  {['Beds','Mats','Tents','Blankets & Cushions','Trees & Scratchers','Personalised','All Beds & Scratchers'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-bedding&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>

                <hr className="my-2" />

                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-1">PET LOVERS</h4>
                  <Link to="/gift-cards" onClick={onClose} className="bg-[#ff7a00] text-white px-3 py-1 rounded text-sm font-semibold">GIFT CARDS</Link>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">CAT BOWLS</h4>
                <ul className="space-y-1">
                  {['Bowls','Travel & Fountain'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs/cat-bowls/${slugify(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">CAT COLLARS & ACCESSORIES</h4>
                <ul className="space-y-1">
                  {['Collars','Leash & Harness Set','Name Tags','Bow Ties & Bandanas','All Collars & Accessories'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-collars&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">CAT GROOMING</h4>
                <ul className="space-y-1">
                  {['Brushes & Combs','Dry Bath, Wipes & Perfume','Ear, Eye & PawCare','Oral Care','Shampoo & Conditioner','Tick & Flea Control','All Grooming'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=cat-grooming&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          ) : activeCategory === 'pharmacy' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">PHARMACY FOR DOGS</h4>
                <ul className="space-y-0.5">
                  {['Medicines for Skin','Joint & Mobility','Digestive Care','All Dog Pharmacy'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=pharmacy-dogs&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">PHARMACY FOR CATS</h4>
                <ul className="space-y-0.5">
                  {['Skin & Coat Care','Worming','Oral Care','All Cat Pharmacy'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=pharmacy-cats&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">MEDICINES</h4>
                <ul className="space-y-0.5">
                  {['Antibiotics','Antifungals','Anti Inflammatories','Pain Relief','All Medicines'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=medicines&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">SUPPLEMENTS</h4>
                <ul className="space-y-0.5">
                  {['Vitamins & Minerals','Joint Supplements','Probiotics & Gut Health','Skin & Coat Supplements','All Supplements'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=supplements&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">PRESCRIPTION FOOD</h4>
                <ul className="space-y-0.5">
                  {['Renal Support','Hypoallergenic Diets','Digestive Support','Weight Management','All Prescription Food'].map((t,i)=> (
                    <li key={i}><Link to={`/shop-for-dogs?category=prescription-food&sub=${encodeURIComponent(t)}`} onClick={onClose} className="block py-0.5 text-sm leading-tight text-muted-foreground hover:text-primary">{t}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {categories?.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="h-20 rounded-md overflow-hidden">
                    <Image
                      src={category?.image}
                      alt={category?.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {category?.title}
                    </h3>
                    <ul className="space-y-0.5">
                      {category?.items?.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link
                            to={item?.path}
                            onClick={onClose}
                            className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 block py-0.5 leading-tight"
                          >
                            {item?.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured Section removed per request (New Arrivals block) */}
        </div>
      </div>
    </>
  );
};

export default MegaMenu;