"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage, Product, Player } from "@/lib/storage";

type RentalDetails = {
  name: string;
  email: string;
  address: string;
  startDate: string;
  returnDate: string;
  days: number;
  cautionFee: number;
  rentalCost: number;
  totalCost: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  orderType: "buy" | "rent";
  rentalDetails?: RentalDetails;
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOrderType, setModalOrderType] = useState<"buy" | "rent">("buy");
  const [modalQty, setModalQty] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();
  
  // Tabs & Sidebar States
  const [activeTab, setActiveTab] = useState<"all" | "games" | "cards" | "puzzles">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "rent" | "buy" | "both">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Rental Booking Modal Form
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [renterName, setRenterName] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [renterAddress, setRenterAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Helper functions for history pushState
  const selectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    if (typeof window !== "undefined") {
      window.history.pushState({ productId: prod.id }, "", `/shop?id=${prod.id}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const deselectProduct = () => {
    setSelectedProduct(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/shop");
    }
  };

  // Synchronize product select with URL search params so browser back/forward buttons work
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get("id");
      if (prodId) {
        const found = products.find(p => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
      }
      setSelectedProduct(null);
    };

    window.addEventListener("popstate", handlePopState);
    if (isLoaded && products.length > 0) {
      handlePopState();
    }
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLoaded, products]);

  // Load products catalog and verify login session from storage
  useEffect(() => {
    const loadData = async () => {
      await storage.syncFromServer();
      setProducts(storage.getProducts());
      
      if (typeof window !== "undefined") {
        const savedUserId = sessionStorage.getItem("gh_session_user_id");
        if (savedUserId) {
          const playersList = storage.getPlayers();
          const found = playersList.find(p => p.id === savedUserId);
          if (found) {
            setRenterName(found.name);
            setRenterEmail(found.email);
          }
        }
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Load persistent cart on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("gh_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          const sanitized = parsed.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            orderType: item.orderType || "buy",
            rentalDetails: item.rentalDetails
          }));
          setCart(sanitized);
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
      setCartLoaded(true);
    }
  }, []);

  // Save persistent cart on changes
  useEffect(() => {
    if (cartLoaded && typeof window !== "undefined") {
      localStorage.setItem("gh_cart", JSON.stringify(cart));
    }
  }, [cart, cartLoaded]);

  // Default type selection on product modal popup & reset quantity
  useEffect(() => {
    if (selectedProduct) {
      setModalQty(1);
      if (selectedProduct.availability === "rent") {
        setModalOrderType("rent");
      } else {
        setModalOrderType("buy");
      }
    }
  }, [selectedProduct]);

  // Lock body scroll when rental popup modal is open
  useEffect(() => {
    if (bookingProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingProduct]);

  // Helper to open booking form
  const openRentalBooking = (product: Product) => {
    setBookingProduct(product);
    // Set default dates: tomorrow and next day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setStartDate(tomorrow.toISOString().split('T')[0]);
    setReturnDate(dayAfter.toISOString().split('T')[0]);
  };

  // Helper to calculate rental days
  const getRentalDays = () => {
    if (!startDate || !returnDate) return 1;
    const s = new Date(startDate);
    const r = new Date(returnDate);
    const diffTime = r.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const addToCart = (product: Product, orderType: "buy" | "rent" = "buy", qty = 1, rentalDetails?: RentalDetails) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id && item.orderType === orderType);
      if (existing && orderType === "buy") {
        return prev.map(item => item.product.id === product.id && item.orderType === "buy" 
          ? { ...item, quantity: item.quantity + qty } 
          : item
        );
      }
      return [...prev, { product, quantity: qty, orderType, rentalDetails }];
    });
    setToastMessage(`Added ${qty}x ${product.name} to Cart!`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const updateQuantity = (productId: string, orderType: "buy" | "rent", amount: number) => {
    setCart((prev) => 
      prev.map(item => {
        if (item.product.id === productId && item.orderType === orderType) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: string, orderType: "buy" | "rent") => {
    setCart((prev) => prev.filter(item => !(item.product.id === productId && item.orderType === orderType)));
  };

  // Calculations for Split Wallets
  const cartTotal = cart.reduce((sum, item) => {
    if (item.orderType === "rent" && item.rentalDetails) {
      return sum + (item.rentalDetails.totalCost * item.quantity);
    }
    return sum + (item.product.price * item.quantity);
  }, 0);


  // Strict Filter matches based on feedback:
  // - available to buy: only show purchase-only games
  // - available to rent: only show rent-only games
  // - rent & buy both: only show dual options
  const filteredProducts = products.filter((product) => {
    // Category Filter
    if (activeTab === "games" && product.category !== "Board Games") return false;
    if (activeTab === "cards" && product.category !== "Card Games") return false;
    if (activeTab === "puzzles" && product.category !== "Puzzles") return false;
    
    // Type Filter (Strict mapping)
    if (typeFilter === "rent" && product.availability !== "rent") return false;
    if (typeFilter === "buy" && product.availability !== "purchase") return false;
    if (typeFilter === "both" && product.availability !== "both") return false;

    // Text Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
    }

    return true;
  });

  // Rental Cost Calculations
  const calculatedDays = getRentalDays();
  const rawRentPrice = bookingProduct ? (bookingProduct.rentPrice || Math.round(bookingProduct.price * 0.2)) : 0;
  const computedRentalCost = rawRentPrice * calculatedDays;
  const bookingCautionFee = 5000;
  const totalBookingCost = computedRentalCost + bookingCautionFee;

  // Handle Rental Form Submission
  const handleRentalBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProduct) return;
    
    const rentalDetails: RentalDetails = {
      name: renterName,
      email: renterEmail,
      address: renterAddress,
      startDate,
      returnDate,
      days: calculatedDays,
      cautionFee: bookingCautionFee,
      rentalCost: computedRentalCost,
      totalCost: totalBookingCost
    };

    addToCart(bookingProduct, "rent", 1, rentalDetails);
    setBookingProduct(null);
  };

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: "80px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontFamily: "var(--font-family)" }}>Loading Catalog Database...</div>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', fontFamily: "var(--font-family)" }}>
        
        {/* Back Link */}
        <button 
          onClick={deselectProduct}
          className="btn-secondary animate-hover-pop"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "none", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, padding: "0 0 25px 0", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Game Catalog
        </button>

        {/* Dynamic Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'start' }} className="animate-fade-in">
          
          {/* Left Column: Game Image Poster */}
          <div style={{ position: "sticky", top: "100px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.name} 
              style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid var(--card-border)' }} 
            />
          </div>

          {/* Right Column: Game Details and Purchase Actions */}
          <div className="corp-card" style={{ padding: '40px', border: '1px solid var(--card-border)', background: '#ffffff' }}>
            
            <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              {selectedProduct.category} Spec Sheet
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.2 }}>{selectedProduct.name}</h1>

            {/* Specs Badges */}
            {selectedProduct.specs && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
                {selectedProduct.specs.players && (
                  <span style={{ background: 'var(--bg-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedProduct.specs.players.replace(/👥|👥\s/g, "")}
                  </span>
                )}
                {selectedProduct.specs.playTime && (
                  <span style={{ background: 'var(--bg-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Play Time: {selectedProduct.specs.playTime.replace(/🕒|🕒\s/g, "")}
                  </span>
                )}
                {selectedProduct.specs.age && (
                  <span style={{ background: 'var(--bg-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Age: {selectedProduct.specs.age.replace(/👶|👶\s/g, "")}
                  </span>
                )}
              </div>
            )}

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '25px', fontSize: '1.05rem' }}>
              {selectedProduct.description}
            </p>

            {/* What's in the Box Checklist */}
            {selectedProduct.specs?.contents && (
              <div style={{ marginBottom: '30px', paddingBottom: '25px', borderBottom: '1px solid var(--card-border)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 700 }}>What's in the Box:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {selectedProduct.specs.contents.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rent or Buy Option Selector */}
            {(selectedProduct.availability === "both" || !selectedProduct.availability) && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '15px 20px',
                marginBottom: '30px',
                display: 'flex',
                gap: '15px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>Select Option:</span>
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <button 
                    type="button"
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: modalOrderType === "buy" ? 'var(--accent-primary)' : 'var(--card-border)',
                      background: modalOrderType === "buy" ? 'rgba(99, 102, 241, 0.05)' : 'white',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setModalOrderType("buy")}
                  >
                    Purchase Game
                  </button>
                  <button 
                    type="button"
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: modalOrderType === "rent" ? 'var(--accent-primary)' : 'var(--card-border)',
                      background: modalOrderType === "rent" ? 'rgba(99, 102, 241, 0.05)' : 'white',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setModalOrderType("rent")}
                  >
                    Rent Game
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₦{
                    (modalOrderType === "rent" 
                      ? (selectedProduct.rentPrice || Math.round(selectedProduct.price * 0.2))
                      : selectedProduct.price
                    ).toLocaleString()
                  }
                  {modalOrderType === "rent" && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}> / day</span>}
                </span>
                
                {/* Quantity counters */}
                {modalOrderType === "buy" && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--card-border)', alignSelf: 'flex-start' }}>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1rem' }} onClick={() => setModalQty(q => q > 1 ? q - 1 : 1)}>-</button>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>{modalQty}</span>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1rem' }} onClick={() => setModalQty(q => q + 1)}>+</button>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button 
                  className="btn-primary animate-hover-pop"
                  style={{ 
                    padding: '14px 35px', 
                    fontSize: '1rem', 
                    borderRadius: '8px', 
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(235, 94, 40, 0.2)',
                    border: 'none'
                  }}
                  onClick={() => {
                    if (modalOrderType === "rent") {
                      openRentalBooking(selectedProduct);
                    } else {
                      addToCart(selectedProduct, "buy", modalQty);
                    }
                    deselectProduct();
                  }}
                >
                  Add to Cart ({modalOrderType === "rent" ? "Rent" : `Buy x${modalQty}`})
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', fontFamily: "var(--font-family)" }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '5px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
          GamesHut Store
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', marginBottom: '30px' }}>
          Browse handpicked strategic board games, card games, and puzzles.
        </p>
      </div>

      {/* Search Input & Availability Filter Dropdown */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }} className="animate-fade-in">
        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "600px", flexDirection: "row" }}>
          
          {/* Search Box */}
          <div style={{ flex: 2, position: "relative" }}>
            <input 
              type="text" 
              placeholder="Search store items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: 'white',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
              }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>

          {/* Availability Select Dropdown */}
          <div style={{ flex: 1 }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '46px',
                padding: '0 12px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: 'white',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
              }}
            >
              <option value="all">All Options</option>
              <option value="buy">Purchase Only</option>
              <option value="rent">Rentals Only</option>
              <option value="both">Rent & Buy Available</option>
            </select>
          </div>

        </div>
      </div>

      {/* Category Tabs (iOS-style Segmented Control) */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }} className="animate-fade-in">
        <div style={{
          display: "flex",
          background: "var(--bg-primary)",
          border: "1px solid var(--card-border)",
          borderRadius: "30px",
          padding: "4px",
          width: "100%",
          maxWidth: "600px",
          justifyContent: "space-between"
        }}>
          {[
            { id: "all", label: "All Products" },
            { id: "games", label: "Board Games" },
            { id: "cards", label: "Card Games" },
            { id: "puzzles", label: "Puzzles" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: "10px 15px",
                  borderRadius: "26px",
                  border: "none",
                  background: isActive ? "white" : "transparent",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Removed legacy iOS-style availability filter pills */}

      {/* Two-Column Layout: Products Grid (Left) + Shopping Cart Sidebar (Right) */}
      <div className="shop-two-column-layout animate-fade-in">
        
        {/* Products Grid (at least two/three columns on desktop) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
          {filteredProducts.map(product => {
            const hasRent = product.availability === "rent" || product.availability === "both" || !product.availability;
            const hasBuy = product.availability === "purchase" || product.availability === "both" || !product.availability;
            const computedRentPrice = product.rentPrice || Math.round(product.price * 0.2);

            return (
              <div 
                key={product.id} 
                className="corp-card" 
                style={{ display: 'flex', flexDirection: 'column', padding: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                onClick={() => selectProduct(product)}
              >
                {/* 200px tall preview image cover */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f1f5f9'
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '5px' }}>
                    {product.availability === "rent" && (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>RENT ONLY</span>
                    )}
                    {product.availability === "purchase" && (
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>BUY ONLY</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {product.category}
                  </span>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '8px' }}>
                    {product.name}
                  </h3>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px', flexGrow: 1 }}>
                    {product.description}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: 'auto' }}>
                    {/* Compact Pricing Options */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                      {hasBuy && (
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                          Buy: ₦{product.price.toLocaleString()}
                        </span>
                      )}
                      {hasRent && (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>
                          Rent: ₦{computedRentPrice.toLocaleString()}/day
                        </span>
                      )}
                    </div>
                    
                    {/* Larger, Nicer action buttons */}
                    {product.availability === "both" || !product.availability ? (
                      <button 
                        className="btn-primary" 
                        style={{ 
                          width: '100%',
                          height: '46px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProduct(product);
                        }}
                      >
                        Choose Rent / Buy
                      </button>
                    ) : (
                      <button 
                        style={{ 
                          width: '100%',
                          height: '46px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          background: product.availability === "rent" ? '#e6f4ea' : 'var(--color-brand)',
                          color: product.availability === "rent" ? '#16a34a' : 'white',
                          borderWidth: product.availability === "rent" ? '1px' : '0px',
                          borderStyle: 'solid',
                          borderColor: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.availability === "rent") {
                            openRentalBooking(product);
                          } else {
                            addToCart(product, "buy");
                          }
                        }}
                      >
                        {product.availability === "rent" ? "Rent Now" : "Buy Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar Shopping Cart (pinned side-by-side on desktop) */}
        <div id="mobile-cart-target" className="corp-card" style={{ padding: '25px', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', borderBottom: '2px solid var(--card-border)', paddingBottom: '10px', display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Shopping Cart
          </h2>

          {cart.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
              Your cart is empty.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', maxHeight: '350px', overflowY: 'auto' }}>
                    {cart.map(item => {
                      const itemPrice = item.orderType === "rent" && item.rentalDetails
                        ? item.rentalDetails.totalCost
                        : item.product.price;
                      return (
                        <div key={`${item.product.id}-${item.orderType}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                              {item.product.name} 
                              <span style={{ fontSize: '0.75rem', marginLeft: '5px', padding: '2px 6px', borderRadius: '4px', background: item.orderType === "rent" ? '#fef3c7' : '#e6fffa', color: item.orderType === "rent" ? '#b45309' : '#047857', fontWeight: 700 }}>
                                {item.orderType === "rent" ? "RENT" : "BUY"}
                              </span>
                            </strong>
                            
                            {item.orderType === "rent" && item.rentalDetails ? (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                {item.rentalDetails.startDate} to {item.rentalDetails.returnDate} ({item.rentalDetails.days} days)<br />
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Refundable Deposit: ₦{item.rentalDetails.cautionFee.toLocaleString()}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₦{itemPrice.toLocaleString()} each</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button className="btn-secondary" style={{ padding: '2px 8px', borderRadius: '4px' }} onClick={() => updateQuantity(item.product.id, item.orderType, -1)}>-</button>
                            <span style={{ fontWeight: 700, minWidth: '15px', textAlign: 'center', color: 'var(--text-primary)' }}>{item.quantity}</span>
                            <button className="btn-secondary" style={{ padding: '2px 8px', borderRadius: '4px' }} onClick={() => updateQuantity(item.product.id, item.orderType, 1)}>+</button>
                            <button className="btn-secondary" style={{ padding: '2px 4px', color: '#ef4444', border: 'none', background: 'transparent' }} onClick={() => removeFromCart(item.product.id, item.orderType)}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '2px solid var(--card-border)', paddingTop: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Value</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.3rem' }}>₦{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '15px' }}
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>

    </div>

      {/* Product Detail Specifications Modal Removed */}

      {/* RENTAL BOOKING MODAL FORM */}
      {bookingProduct && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          zIndex: 1200,
          padding: '40px 10px',
          overflowY: 'auto'
        }}
        onClick={() => setBookingProduct(null)}
        >
          <form 
            onSubmit={handleRentalBookingSubmit}
            className="corp-card animate-fade-in" 
            style={{ maxWidth: '550px', width: '100%', background: '#ffffff', position: 'relative', padding: '30px', margin: '20px auto' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setBookingProduct(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              aria-label="Close rental"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Rent: {bookingProduct.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Complete the lease information below. Security deposit is fully refundable upon returning the game in original condition.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Your Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={renterName} 
                  onChange={(e) => setRenterName(e.target.value)}
                  placeholder="John Doe" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)' }}
                />
              </div>

              <div className="modal-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Contact Email</label>
                  <input 
                    type="email" 
                    required 
                    value={renterEmail} 
                    onChange={(e) => setRenterEmail(e.target.value)}
                    placeholder="you@company.com" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Delivery Address</label>
                  <input 
                    type="text" 
                    required 
                    value={renterAddress} 
                    onChange={(e) => setRenterAddress(e.target.value)}
                    placeholder="Delivery Location" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)' }}
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Rent Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Rent Return Date</label>
                  <input 
                    type="date" 
                    required 
                    value={returnDate} 
                    onChange={(e) => setReturnDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Dynamic Billing Calculations */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--card-border)',
                borderRadius: '10px',
                padding: '15px',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily Rate:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₦{rawRentPrice.toLocaleString()} / day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rental Duration:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{calculatedDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rental Subtotal:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₦{computedRentalCost.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Security Deposit (Refundable):</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>+₦{bookingCautionFee.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total Amount Due:</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>₦{totalBookingCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
              <button 
                type="button" 
                className="btn-secondary"
                style={{ flex: '1 1 auto', padding: '10px 18px', minWidth: '100px' }}
                onClick={() => setBookingProduct(null)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ flex: '1 1 auto', padding: '10px 18px', minWidth: '180px' }}
              >
                Confirm &amp; Add Rental
              </button>
            </div>
          </form>
        </div>
      )}

    </div>

      {/* Mobile-Only Sticky Cart Footer Bar (placed outside animated page wrapper for viewport-relative fixing) */}
      {cart.length > 0 && (
        <div className="mobile-only-sticky-cart" style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: 'var(--text-primary)',
          color: 'white',
          padding: '14px 20px',
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          fontFamily: 'var(--font-family)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'} in Cart
            </span>
            <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              ₦{cartTotal.toLocaleString()}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-secondary" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                color: 'white', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                fontWeight: 700, 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.8rem'
              }}
              onClick={() => {
                const element = document.getElementById("mobile-cart-target");
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View Cart
            </button>
            <button 
              className="btn-primary" 
              style={{ 
                background: 'white', 
                color: 'var(--text-primary)', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                fontWeight: 700, 
                border: 'none',
                fontSize: '0.8rem'
              }}
              onClick={() => router.push("/checkout")}
            >
              Checkout Now
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="cart-toast-notification" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--text-primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          zIndex: 2000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage}
        </div>
      )}
    </>
  );
}
