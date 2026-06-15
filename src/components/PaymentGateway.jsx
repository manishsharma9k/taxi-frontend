import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone, Banknote, X, CheckCircle, Loader2 } from 'lucide-react';
import { FaGooglePay } from "react-icons/fa";
import { SiPhonepe, SiPaytm } from "react-icons/si";

const PaymentGateway = ({ amount, currency, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const paymentMethods = [
    { id: 'upi', title: 'UPI', subtitle: 'Google Pay, PhonePe, Paytm', icon: <Smartphone size={24} /> },
    { id: 'card', title: 'Credit/Debit Card', subtitle: 'Visa, Mastercard, RuPay', icon: <CreditCard size={24} /> },
    { id: 'wallet', title: 'TaxiNova Wallet', subtitle: 'Balance: ₹150.00', icon: <Wallet size={24} /> },
    { id: 'cash', title: 'Cash', subtitle: 'Pay directly to the captain', icon: <Banknote size={24} /> },
  ];

  const handlePaymentMethodClick = (methodId) => {
    setSelectedMethod(methodId);

    setTimeout(() => {
      if (methodId === 'cash') {
        processPayment('cash');
        return;
      }

      if (methodId === 'upi') {
        setShowQR(true);
        return;
      }

      processPayment(methodId);
    }, 400);
  };

  const processPayment = (method) => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Simulate success delay before closing
      setTimeout(() => {
        onSuccess(method);
      }, 1500);
      
    }, 2500);
  };

  const handleQRSuccess = () => {
    setShowQR(false);
    processPayment('upi');
  };

  if (showQR) {
    // Generate a dynamic UPI QR code using a free API
    const upiLink = `upi://pay?pa=taxinova@upi&pn=TaxiNova&am=${amount}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
        <div className="glass-panel animate-fade-in-up" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Scan to Pay {currency}{amount}</h3>
            <button onClick={() => setShowQR(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '4px solid var(--primary)' }}>
            <img src={qrUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px' }} />
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Scan with any UPI app (GPay, PhonePe, Paytm)</p>
          
          <button onClick={handleQRSuccess} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold' }}>
            I have made the payment
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
        <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <Loader2 size={48} color="var(--primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Processing Payment</h3>
          <p style={{ color: 'var(--text-muted)' }}>Please do not close this window or press back button.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
        <div className="glass-panel animate-fade-in-up" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Payment Successful</h3>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to your ride...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel animate-fade-in-up" style={{ padding: '0', maxWidth: '450px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Select Payment Method</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Amount to pay: <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{currency}{amount}</span></p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--border-color)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                onClick={() => handlePaymentMethodClick(method.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.25rem',
                  border: `2px solid ${selectedMethod === method.id ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  background: selectedMethod === method.id ? 'rgba(var(--primary-rgb, 250, 204, 21), 0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ color: selectedMethod === method.id ? 'var(--primary)' : 'var(--text-muted)', marginRight: '1rem' }}>
                  {method.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{method.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{method.subtitle}</div>
                </div>
                
                {/* Custom radio button */}
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: `2px solid ${selectedMethod === method.id ? 'var(--primary)' : 'var(--text-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedMethod === method.id && (
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* UPI Apps Icons (Extra Details) */}
          {selectedMethod === 'upi' && (
            <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}>
              <FaGooglePay size={36} color="var(--text-main)" />
              <SiPhonepe size={32} color="#5f259f" />
              <SiPaytm size={32} color="#00baf2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
