"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storage, Player, Product } from "@/lib/storage";

interface CartItem {
  product: Product;
  quantity: number;
  orderType: "buy" | "rent";
  rentalDetails?: {
    startDate: string;
    returnDate: string;
    days: number;
    cautionFee: number;
  };
}

const loadPaystack = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [matchedPlayer, setMatchedPlayer] = useState<Player | null>(null);
  const [applyVoucher, setApplyVoucher] = useState(false);
  const [applyCashWallet, setApplyCashWallet] = useState(false);
  const [isSessionUser, setIsSessionUser] = useState(false);

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTotal, setSuccessTotal] = useState(0);

  // Load Session and Cart
  useEffect(() => {
    const loadData = async () => {
      await storage.syncFromServer();
      
      if (typeof window !== "undefined") {
        const savedCart = localStorage.getItem("gh_cart");
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error("Failed to parse cart", e);
          }
        }
        setCartLoaded(true);

        const savedUserId = sessionStorage.getItem("gh_session_user_id");
        if (savedUserId) {
          const playersList = storage.getPlayers();
          const found = playersList.find(p => p.id === savedUserId);
          if (found) {
            setName(found.name);
            setEmail(found.email);
            setMatchedPlayer(found);
            setIsSessionUser(true);
            if (found.voucherWalletBalance > 0) {
              setApplyVoucher(true);
            }
            if (found.cashWalletBalance > 0) {
              setApplyCashWallet(true);
            }
          }
        }
      }
    };
    loadData();
  }, []);

  // Sync email to match wallet account
  useEffect(() => {
    if (!email.trim()) {
      setMatchedPlayer(null);
      setApplyVoucher(false);
      setApplyCashWallet(false);
      return;
    }
    const playersList = storage.getPlayers();
    const match = playersList.find(p => p.email.toLowerCase() === email.toLowerCase());
    setMatchedPlayer(match || null);
    if (!match) {
      setApplyVoucher(false);
      setApplyCashWallet(false);
    }
  }, [email]);

  // Reset checkboxes on payment method swap
  useEffect(() => {
    if (paymentMethod === "card") {
      setApplyVoucher(false);
      setApplyCashWallet(false);
    }
  }, [paymentMethod]);

  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const rate = item.orderType === "rent" && item.product.rentPrice 
        ? item.product.rentPrice 
        : item.product.price;
      const duration = item.orderType === "rent" && item.rentalDetails ? item.rentalDetails.days : 1;
      return sum + (rate * duration * item.quantity);
    }, 0);
  };

  const getCautionTotal = () => {
    return cart.reduce((sum, item) => {
      if (item.orderType === "rent" && item.rentalDetails) {
        return sum + (item.rentalDetails.cautionFee * item.quantity);
      }
      return sum;
    }, 0);
  };

  const subtotal = getSubtotal();
  const cautionTotal = getCautionTotal();
  const cartTotal = subtotal + cautionTotal;

  // Wallet discounts
  const appliedVoucherDiscount = applyVoucher && matchedPlayer 
    ? Math.min(matchedPlayer.voucherWalletBalance || 0, cartTotal) 
    : 0;

  const totalAfterVoucher = cartTotal - appliedVoucherDiscount;

  const appliedCashDiscount = applyCashWallet && matchedPlayer 
    ? Math.min(matchedPlayer.cashWalletBalance || 0, totalAfterVoucher) 
    : 0;

  const finalTotal = totalAfterVoucher - appliedCashDiscount;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);

    const executeCompleteOrder = (payRef?: string) => {
      let updatedVoucher = 0;
      let updatedCash = 0;

      if (matchedPlayer) {
        const playersList = storage.getPlayers();
        const updatedPlayers = playersList.map(p => {
          if (p.id === matchedPlayer.id) {
            const currentTxs = p.transactions || [];
            const newTxs = [];

            const cartDescriptions = cart.map(item => {
              if (item.orderType === "rent" && item.rentalDetails) {
                return `Rent ${item.product.name} (x${item.quantity}) (${item.rentalDetails.days} days)`;
              }
              return `Buy ${item.product.name} (x${item.quantity})`;
            }).join(", ");

            if (applyVoucher && appliedVoucherDiscount > 0) {
              updatedVoucher = p.voucherWalletBalance - appliedVoucherDiscount;
              newTxs.push({
                id: "tx_" + Math.random().toString(36).substr(2, 9),
                amount: -appliedVoucherDiscount,
                description: `Voucher Redem: ${cartDescriptions}`,
                date: new Date().toISOString().split('T')[0]
              });
            } else {
              updatedVoucher = p.voucherWalletBalance;
            }

            if (applyCashWallet && appliedCashDiscount > 0) {
              updatedCash = p.cashWalletBalance - appliedCashDiscount;
              newTxs.push({
                id: "tx_" + Math.random().toString(36).substr(2, 9),
                amount: -appliedCashDiscount,
                description: `Cash Wallet Pay: ${cartDescriptions}`,
                date: new Date().toISOString().split('T')[0]
              });
            } else {
              updatedCash = p.cashWalletBalance;
            }

            return {
              ...p,
              voucherWalletBalance: updatedVoucher,
              cashWalletBalance: updatedCash,
              transactions: [...currentTxs, ...newTxs]
            };
          }
          return p;
        });
        storage.setPlayers(updatedPlayers);
      }

      // Decrement product stocks and check for low stock warnings
      const currentProducts = storage.getProducts();
      const updatedProducts = currentProducts.map(p => {
        const cartMatch = cart.find(item => item.product.id === p.id);
        if (cartMatch) {
          const newStock = Math.max(0, (p.stock !== undefined ? p.stock : 10) - cartMatch.quantity);
          if (newStock < 3) {
            storage.addNotification(
              "admin",
              "Low Stock Alert",
              `Product "${p.name}" is running low on stock (${newStock} remaining). Please reorder.`,
              "inventory"
            );
          }
          return { ...p, stock: newStock };
        }
        return p;
      });
      storage.setProducts(updatedProducts);

      // Trigger In-App & Email notifications
      const cartDescriptions = cart.map(item => {
        if (item.orderType === "rent" && item.rentalDetails) {
          return `Rent ${item.product.name} (x${item.quantity}) (${item.rentalDetails.days} days)`;
        }
        return `Buy ${item.product.name} (x${item.quantity})`;
      }).join(", ");

      if (matchedPlayer) {
        storage.addNotification(
          matchedPlayer.id,
          "Order Checkout Successful",
          `Your checkout for ${cartDescriptions} (Total: ₦${cartTotal.toLocaleString()}) was successfully processed.${payRef ? ` Ref: ${payRef}` : ""}`,
          "ticket"
        );
      }

      storage.addNotification(
        "admin",
        "New Store Checkout",
        `New purchase order received from ${name || email} for total of ₦${cartTotal.toLocaleString()}: ${cartDescriptions}${payRef ? ` (Ref: ${payRef})` : ""}`,
        "inventory"
      );

      const itemsHtml = cart.map(item => `<li><strong>${item.product.name}</strong> (x${item.quantity}) - ${item.orderType === "rent" ? "Rental" : "Purchase"}</li>`).join("");
      storage.addEmailLog(
        email,
        name || (matchedPlayer ? matchedPlayer.name : "Valued Customer"),
        `Store Order Invoice: ₦${cartTotal.toLocaleString()}`,
        `<h3>Thank you for your order!</h3><p>We are processing your store order details:</p><ul>${itemsHtml}</ul><p><strong>Total Paid:</strong> ₦${cartTotal.toLocaleString()}</p>${payRef ? `<p><strong>Payment Reference:</strong> ${payRef}</p>` : ""}<p>We look forward to serving you again at the next event!</p>`,
        "notifications@gameshut.ng"
      );

      setSuccessTotal(cartTotal);
      setShowSuccess(true);
      setIsProcessing(false);

      setCart([]);
      localStorage.removeItem("gh_cart");
    };

    if (paymentMethod === "card" && finalTotal > 0) {
      loadPaystack().then(paystackLoaded => {
        if (!paystackLoaded) {
          alert("Failed to load Paystack payment gateway. Please check your internet connection.");
          setIsProcessing(false);
          return;
        }

        const handler = (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_2a9701ed926457f947c7e08497c3a96a6a525b02",
          email: email,
          amount: finalTotal * 100, // in kobo
          currency: "NGN",
          ref: "gsh_shop_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          callback: (response: any) => {
            executeCompleteOrder(response.reference);
          },
          onClose: () => {
            setIsProcessing(false);
            alert("Payment cancelled.");
          }
        });
        handler.openIframe();
      }).catch(err => {
        console.error("Paystack load error:", err);
        setIsProcessing(false);
      });
    } else {
      setTimeout(() => {
        executeCompleteOrder(paymentMethod === "wallet" ? "wallet_debit" : "free_checkout");
      }, 1500);
    }
  };

  if (!cartLoaded) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Checkout Details...</div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="container section-padding animate-fade-in" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="corp-card text-center" style={{ width: '100%', padding: '40px', border: '2px solid var(--accent-primary)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem', fontWeight: 'bold' }}>
            ✓
          </div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Order Completed Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: 1.6 }}>
            Thank you! Your strategy board game order has been logged and dispatch is coordinating delivery.
          </p>

          <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '8px' }}>
              Transaction Receipt
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Address:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{address}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Order Value:</span>
                <strong style={{ color: 'var(--text-primary)' }}>₦{successTotal.toLocaleString()}</strong>
              </div>
              {appliedVoucherDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Vouchers Applied:</span>
                  <strong>-₦{appliedVoucherDiscount.toLocaleString()}</strong>
                </div>
              )}
              {appliedCashDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)' }}>
                  <span>Cash Applied:</span>
                  <strong>-₦{appliedCashDiscount.toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--card-border)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total Charged:</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>₦{finalTotal.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <Link href="/shop" className="btn-primary" style={{ display: 'inline-block', width: '100%', padding: '14px', textDecoration: 'none', borderRadius: '10px' }}>
            Back to Game Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding animate-fade-in" style={{ fontFamily: 'var(--font-family)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span className="badge">Finalize Purchase</span>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
          Checkout
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Please fill in your delivery details and choose your preferred checkout method.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="corp-card text-center" style={{ padding: '60px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Your Cart is Empty</h2>
          <Link href="/shop" className="btn-primary" style={{ display: 'inline-block', padding: '12px 30px', textDecoration: 'none' }}>
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column: Form Details & Payment */}
          <div className="corp-card" style={{ padding: '35px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '25px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              Delivery & Billing Information
            </h2>
            
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Recipient Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Delivery Address</label>
                <textarea 
                  required 
                  rows={2} 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Suite, building, street, and city in Lagos"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', resize: 'none' }}
                />
              </div>

              <div className="modal-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..." 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>
                    Contact Email {isSessionUser && <span style={{ color: '#16a34a', fontSize: '0.75rem', marginLeft: '5px' }}>✓ Logged In</span>}
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSessionUser}
                    placeholder="you@company.com" 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--card-border)', 
                      background: isSessionUser ? 'rgba(0,0,0,0.02)' : 'var(--bg-primary)',
                      cursor: isSessionUser ? 'not-allowed' : 'text',
                      opacity: isSessionUser ? 0.8 : 1
                    }}
                  />
                </div>
              </div>

              {/* PAYMENT SELECTOR */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 700 }}>
                  Payment Method
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Card Gateway */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '2px solid ' + (paymentMethod === 'card' ? 'var(--color-brand)' : 'var(--card-border)'),
                    background: paymentMethod === 'card' ? 'rgba(235, 94, 40, 0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="pay-opt" 
                      value="card"
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pay with Card / Bank Transfer</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Standard checkout using Paystack / Flutterwave</span>
                    </div>
                  </label>

                  {/* Wallet balances */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '2px solid ' + (paymentMethod === 'wallet' ? 'var(--color-brand)' : 'var(--card-border)'),
                    background: paymentMethod === 'wallet' ? 'rgba(235, 94, 40, 0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="pay-opt" 
                      value="wallet"
                      checked={paymentMethod === 'wallet'} 
                      onChange={() => setPaymentMethod('wallet')}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Use GamesHut Account Balances</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Redeem your Voucher points or Cash Wallet funds</span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Wallet balances check */}
              {paymentMethod === 'wallet' && (
                <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  {matchedPlayer ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Verified Account: {matchedPlayer.walletId}
                      </span>
                      
                      {matchedPlayer.voucherWalletBalance > 0 ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={applyVoucher} 
                            onChange={(e) => setApplyVoucher(e.target.checked)} 
                            style={{ width: '16px', height: '16px' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            Apply Voucher Balance (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}>
                                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                              </svg>
                              {matchedPlayer.voucherWalletBalance.toLocaleString()} Vouchers
                            )
                          </span>
                        </label>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Voucher Balance: 0 available</span>
                      )}

                      {matchedPlayer.cashWalletBalance > 0 ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={applyCashWallet} 
                            onChange={(e) => setApplyCashWallet(e.target.checked)} 
                            style={{ width: '16px', height: '16px' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            Apply Cash Wallet (₦{matchedPlayer.cashWalletBalance.toLocaleString()})
                          </span>
                        </label>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cash Wallet: ₦0 available</span>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#854d0e', background: '#fef9c3', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ca8a04', lineHeight: 1.4 }}>
                      {email.trim() ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>No registered account matches <strong>{email}</strong>. Please ensure the email is correct or register on the Profile page.</span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Enter your registered account email in the <strong>Contact Email</strong> field above to load your Voucher and Cash balances.</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing Order..." : finalTotal === 0 ? "Place Order (Free)" : "Pay & Complete Order"}
              </button>

            </form>
          </div>

          {/* Right Column: Order Summary list */}
          <div className="corp-card" style={{ padding: '35px', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '25px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              Your Order Summary
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
              {cart.map((item, idx) => {
                const itemPrice = item.orderType === "rent" && item.product.rentPrice 
                  ? item.product.rentPrice 
                  : item.product.price;
                const duration = item.orderType === "rent" && item.rentalDetails ? item.rentalDetails.days : 1;
                const totalVal = itemPrice * duration * item.quantity;
                
                return (
                  <div key={`${item.product.id}-${item.orderType}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', fontSize: '0.9rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.product.name}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                        <span>Qty: {item.quantity} • {item.orderType === "rent" ? "Rental" : "Purchase"}</span>
                        {item.orderType === "rent" && item.rentalDetails && (
                          <div style={{ marginTop: '2px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {item.rentalDetails.startDate} to {item.rentalDetails.returnDate} ({item.rentalDetails.days} days)<br />
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Refundable Deposit: ₦{item.rentalDetails.cautionFee.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <strong style={{ color: 'var(--text-primary)', alignSelf: 'flex-start' }}>₦{totalVal.toLocaleString()}</strong>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Games Subtotal:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₦{subtotal.toLocaleString()}</span>
              </div>
              {cautionTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Refundable Deposits:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>+₦{cautionTotal.toLocaleString()}</span>
                </div>
              )}
              
              {appliedVoucherDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                  <span>Vouchers Applied:</span>
                  <span>-₦{appliedVoucherDiscount.toLocaleString()}</span>
                </div>
              )}

              {appliedCashDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  <span>Cash Applied:</span>
                  <span>-₦{appliedCashDiscount.toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--card-border)', paddingTop: '10px', marginTop: '10px' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Total Due:</strong>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }}>₦{finalTotal.toLocaleString()}</strong>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
