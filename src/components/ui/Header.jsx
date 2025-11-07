import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import pawLottie from '../../assets/paw-lottie.json';
import { useAuth } from '../../contexts/AuthContext';

import Input from './Input';
import AnnouncementBar from './AnnouncementBar';
import MegaMenu from './MegaMenu';
import CartDrawer from './CartDrawer';
import { useCart } from '../../contexts/CartContext.jsx';
import LoginModal from './LoginModal';

const Header = ({ onSearch = () => {} }) => {
  const { cartItems, getCartItemCount, updateQuantity, removeFromCart } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const pawContainerRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const phrases = [
    'Search for shampoos',
    'Search for cat foods',
    'Search for dog foods',
    'Search for raincoats'
  ];
  const typingRef = useRef({ timer: null, phraseIndex: 0, charIndex: 0, deleting: false });
  const [animatedText, setAnimatedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsSearchOpen(false);
    setIsAccountDropdownOpen(false);
  }, [location]);

  // Measure header height and set spacer so page content is pushed below fixed header
  useEffect(() => {
    const update = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    // measure after a short delay to allow images/fonts to load
    update();
    const t = setTimeout(update, 100);
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccountDropdownOpen && !event.target.closest('.account-dropdown')) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountDropdownOpen]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    let ignore = false;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const list = await fetch('/api/products');
        let items = await list.json();
        const qLower = q.toLowerCase();
        items = items.filter(p => String(p?.name || p?.title || '').toLowerCase().includes(qLower));
        const limited = items.slice(0, 8).map(p => ({
          id: p?.id,
          name: p?.name || p?.title,
          price: p?.price ?? p?.salePrice ?? 0,
          image: p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path
        }));
        if (!ignore) {
          setSuggestions(limited);
          setSuggestionsOpen(true);
        }
      } catch (e) {
        if (!ignore) {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } finally {
        if (!ignore) setSearchLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Typing animation effect for placeholder overlay
  useEffect(() => {
    // if user interacted or input has value, stop animation
    if (isSearchFocused || (searchQuery && searchQuery.trim() !== '')) {
      // clear any timers
      if (typingRef.current.timer) {
        clearTimeout(typingRef.current.timer);
        typingRef.current.timer = null;
      }
      setAnimatedText('');
      return;
    }

    let mounted = true;

    const tick = () => {
      const state = typingRef.current;
      const phrase = phrases[state.phraseIndex];

      if (!state.deleting) {
        // type next char
        state.charIndex = Math.min(state.charIndex + 1, phrase.length);
        if (mounted) setAnimatedText(phrase.slice(0, state.charIndex));

        if (state.charIndex === phrase.length) {
          // pause at end, then start deleting
          state.timer = setTimeout(() => {
            state.deleting = true;
            tick();
          }, 1000);
          return;
        }
        state.timer = setTimeout(tick, 80);
      } else {
        // deleting
        state.charIndex = Math.max(state.charIndex - 1, 0);
        if (mounted) setAnimatedText(phrase.slice(0, state.charIndex));

        if (state.charIndex === 0) {
          state.deleting = false;
          state.phraseIndex = (state.phraseIndex + 1) % phrases.length;
          state.timer = setTimeout(tick, 300);
          return;
        }
        state.timer = setTimeout(tick, 40);
      }
    };

    // reset state and start
    typingRef.current.timer && clearTimeout(typingRef.current.timer);
    typingRef.current.deleting = false;
    typingRef.current.charIndex = 0;
    // keep previous phraseIndex to continue loop smoothly
    tick();

    return () => {
      mounted = false;
      if (typingRef.current.timer) {
        clearTimeout(typingRef.current.timer);
        typingRef.current.timer = null;
      }
    };
  }, [isSearchFocused, searchQuery]);

  // Blinking cursor
  useEffect(() => {
    // Only blink when animatedText is present
    let id = null;
    if (animatedText !== '') {
      id = setInterval(() => {
        setShowCursor(s => !s);
      }, 530);
    } else {
      setShowCursor(true);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [animatedText]);

  // Mount Lottie paw animation into the paw container (loads lottie-web from CDN if needed)
  useEffect(() => {
    const container = pawContainerRef.current;
    if (!container) return;

    let anim = null;
    let scriptEl = null;

    const mount = () => {
      try {
        if (window.lottie && container) {
          anim = window.lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: pawLottie,
          });
        }
      } catch (err) {
        // fail silently - keep SVG trail as fallback
        // eslint-disable-next-line no-console
        console.error('Failed to mount Lottie paw animation', err);
      }
    };

    if (window.lottie) {
      mount();
    } else {
      // inject CDN script
      scriptEl = document.createElement('script');
      scriptEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js';
      scriptEl.async = true;
      scriptEl.onload = mount;
      scriptEl.onerror = () => {
        // eslint-disable-next-line no-console
        console.error('Failed to load lottie-web from CDN');
      };
      document.body.appendChild(scriptEl);
    }

    return () => {
      if (anim && anim.destroy) anim.destroy();
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery?.trim()) params.set('search', searchQuery.trim());
      const target = `/shop-for-dogs${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(target);
    if (searchQuery?.trim() && onSearch) onSearch(searchQuery.trim());
  };

  const navigationItems = [
    { label: 'Products', path: '/shop-for-dogs' },
    { label: 'Account', path: '/user-account-dashboard' },
  ];

  return (
    <>
  <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
  {/* Top blue bar (Become a Franchisee | Store Locator | Track Order) */}
  <div className="bg-[#d4af37] text-[#0f1724] py-2 text-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a className="hover:underline" href="#">Become a Franchisee</a>
            <span className="text-white/60">|</span>
            <a className="hover:underline" href="#">Store Locator</a>
            <span className="text-white/60">|</span>
            <a className="hover:underline" href="#">Track Order</a>
          </div>
          <div className="hidden sm:flex items-center text-sm font-medium">
            <span>GST 2.0 Reforms</span>
          </div>
        </div>
      </div>

      {/* Main white header with logo, large rounded search, and right actions */}
      <div className="bg-white border-b border-[#e6e6e6] py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left: small orange square logo */}
            <Link to="/homepage" className="flex items-center mr-6 relative">
              <div className="w-14 h-14 bg-[#ff7a00] lg:bg-transparent rounded-md flex items-center justify-center">
                {/* keep using existing logo if present, fallback to logo.png */}
                <img src="/assets/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e)=>{e.target.onerror=null; e.target.src='/assets/images/logo.png'}} />
              </div>
              {/* Lottie paw animation container (positioned relative to the logo) */}
              <div
                ref={pawContainerRef}
                className="pointer-events-none hidden sm:block"
                aria-hidden="true"
                style={{ position: 'absolute', left: 48, top: -6, width: 44, height: 44 }}
              />
            </Link>

            {/* Center: large rounded search */}
            <div className="flex-1 mx-6 max-w-xl">
              <form onSubmit={handleSearch} className="relative">
                <div className="gradient-outline flex items-center bg-white rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-150 relative">
                  <Icon name="Search" size={16} className="text-gray-400 mr-3" />
                  <Input
                    ref={inputRef}
                    type="search"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 border-0 focus:ring-0 placeholder-gray-400 text-xs"
                  />

                  {/* Animated placeholder overlay (click focuses input) */}
                  {/* Show only when input is empty and not focused */}
                  {(!isSearchFocused && (!searchQuery || searchQuery?.trim() === '')) && (
                    <button
                      type="button"
                      onClick={() => {
                        inputRef.current?.focus();
                      }}
                      className="absolute left-10 right-4 top-1/2 -translate-y-1/2 text-left text-gray-400 text-xs pointer-events-auto"
                    >
                      <span>{animatedText}{showCursor ? '|' : ' '}</span>
                    </button>
                  )}

                </div>
                {/* Suggestions dropdown preserved */}
                {suggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-warm z-50 overflow-hidden">
                    {suggestions.map(item => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/product-detail-page?id=${item.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 text-left"
                      >
                        <img src={item.image || '/assets/images/no_image.png'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm text-foreground line-clamp-1">{item.name}</div>
                          <div className="text-xs text-muted-foreground">₹{(item.price || 0).toFixed(2)}</div>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                      </button>
                    ))}
                    <div className="border-t border-border">
                      <button
                        onClick={handleSearch}
                        className="w-full text-left p-3 text-sm hover:bg-muted/40"
                      >
                        View all results
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right actions: pincode, wishlist, cart, login/signup button */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-700 space-x-2">
                <Icon name="MapPin" size={18} className="text-gray-600" />
                <span className="font-medium">560091</span>
              </div>

              <Link to="/wishlist" className="flex items-center text-sm text-gray-700 hover:text-primary">
                <Icon name="Heart" size={20} />
                <span className="ml-2 hidden sm:inline">Wishlist</span>
              </Link>

              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center text-gray-800 hover:text-primary"
                aria-label="Open cart"
              >
                <Icon name="ShoppingCart" size={22} />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#10b981] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
                <span className="ml-2 hidden sm:inline">Cart</span>
              </button>

              {user ? (
                <div className="relative account-dropdown">
                  <button
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-800 hover:text-primary"
                  >
                    <Icon name="User" size={18} />
                    <span className="hidden sm:inline font-medium">{user.name || user.email?.split('@')[0]}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center bg-[#ff7a00] text-white px-4 py-2 rounded-full shadow-sm hover:brightness-95 transition-all duration-150"
                >
                  <Icon name="User" size={16} />
                  <span className="ml-2">Login/Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
        {/* Category Navigation Row (below main header) */}
  <div className="bg-[#fff6e6] border-t border-b border-[#f0e0b8] relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'dogs');
                    setActiveMegaCategory(willOpen ? 'dogs' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>Dogs</span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'cats');
                    setActiveMegaCategory(willOpen ? 'cats' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>Cats</span>
                  <Icon name="ChevronDown" size={16} />
                </button>
              

                <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary">
                  <span>HUFT Hub</span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                <button
                  className={`flex items-center gap-2 text-sm font-medium ${activeMegaCategory === 'pharmacy' ? 'text-primary' : 'text-foreground'} hover:text-primary`}
                  onClick={() => {
                    const willOpen = !(isMegaMenuOpen && activeMegaCategory === 'pharmacy');
                    setActiveMegaCategory(willOpen ? 'pharmacy' : null);
                    setIsMegaMenuOpen(willOpen);
                  }}
                >
                  <span>Pharmacy</span>
                  <span className="bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">NEW</span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary">
                  <span>HUFT Spa</span>
                  <span className="bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">NEW</span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary">
                  <span>HUFT Outlet</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="bg-[#ff7a00] text-white text-xs font-semibold px-2 py-0.5 rounded">60% Off</span>
                </div>
              </div>

              {/* Brand badges removed as requested */}
            </div>
          </div>
        </div>
        </div>

        {/* Spacer to push page content below the fixed header */}
        <div aria-hidden="true" style={{ height: headerHeight }} className="w-full" />

          {/* Mobile Navigation Menu (moved out of the empty sticky header) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              {navigationItems?.map((item, index) => (
                <div key={index}>
                  {item?.hasDropdown ? (
                    <button
                      onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                      className="flex items-center justify-between w-full font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2"
                    >
                      <span>{item?.label}</span>
                      <Icon
                        name="ChevronDown"
                        size={16}
                        className={`transform transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item?.path}
                      className="block font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2"
                    >
                      {item?.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile-only links */}
              {user ? (
                <>
                  <Link
                    to="/user-account-dashboard"
                    className="flex items-center space-x-2 font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2 sm:hidden"
                  >
                    <Icon name="User" size={16} />
                    <span>My Account</span>
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await signOut();
                      navigate('/');
                    }}
                    className="flex items-center space-x-2 font-body font-medium text-destructive hover:text-destructive/80 transition-colors duration-200 py-2 sm:hidden"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/user-login"
                  className="flex items-center space-x-2 font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2 sm:hidden"
                >
                  <Icon name="User" size={16} />
                  <span>Sign In</span>
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Mega Menu (positioned relative to the category nav container) */}
        <MegaMenu
          isOpen={isMegaMenuOpen}
          activeCategory={activeMegaCategory}
          onClose={() => { setIsMegaMenuOpen(false); setActiveMegaCategory(null); }}
        />
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      {/* Login Modal */}
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
    </>
  );
};

export default Header;