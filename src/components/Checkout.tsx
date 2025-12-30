import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CreditCard, ChevronRight, Camera } from 'lucide-react';
import { CartItem, ServiceType } from '../types';
import { formatPrice } from '../utils/format';
import { usePaymentMethods, PaymentMethod } from '../hooks/usePaymentMethods';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

type CheckoutStep = 'details' | 'payment';

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const [step, setStep] = useState<CheckoutStep>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [serviceType, setServiceType] = useState<ServiceType>('delivery');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State
  const { paymentMethods, loading: loadingPayments } = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const branches = [
    'Manila',
    'Quezon City',
    'Caloocan',
    'Pasig',
    'Parañaque'
  ];

  const timeSlots = React.useMemo(() => {
    const slots = [];
    const startTime = 9 * 60; // 9:00 AM in minutes
    const endTime = 21 * 60; // 9:00 PM in minutes
    const interval = 30;

    for (let time = startTime; time <= endTime; time += interval) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      const displayMinute = minutes.toString().padStart(2, '0');
      slots.push(`${displayHour}:${displayMinute} ${ampm}`);
    }
    return slots;
  }, []);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleProceedToPayment = () => {
    if (isDetailsValid) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = () => {
    const orderDetails = `
🛒 Hava Java ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
📅 Date: ${selectedDate}
⏰ Time: ${selectedTime}
${serviceType === 'delivery'
        ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}`
        : `🏢 Branch: ${selectedBranch}`}

💳 Payment Method: ${selectedPaymentMethod?.name || 'Cash'}
${selectedPaymentMethod?.account_number ? `Account: ${selectedPaymentMethod.account_number}` : ''}

📋 ORDER DETAILS:
${cartItems.map(item => {
          let itemDetails = `• ${item.name}`;
          if (item.selectedVariation) {
            itemDetails += ` (${item.selectedVariation.name})`;
          }
          if (item.selectedAddOns && item.selectedAddOns.length > 0) {
            itemDetails += ` + ${item.selectedAddOns.map(addOn =>
              addOn.quantity && addOn.quantity > 1
                ? `${addOn.name} x${addOn.quantity}`
                : addOn.name
            ).join(', ')}`;
          }
          if (item.selectedPromoOptions && item.promotion) {
            itemDetails += ` [Bundle: ${Object.entries(item.selectedPromoOptions).map(([id, qty]) => {
              const optionName = item.promotion?.options.find(o => o.id === id)?.name || 'Unknown';
              return `${qty}x ${optionName}`;
            }).join(', ')}]`;
          }
          itemDetails += ` x${item.quantity} - ₱${formatPrice(item.totalPrice * item.quantity)}`;
          return itemDetails;
        }).join('\n')}

💰 TOTAL: ₱${formatPrice(totalPrice)}

${notes ? `📝 Notes: ${notes}` : ''}

Kindly SEND this message to confirm your order. Thank you for choosing Hava Java!
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/CafeHavaJava?text=${encodedMessage}`;

    window.open(messengerUrl, '_blank');
  };

  const isDetailsValid =
    customerName &&
    contactNumber &&
    selectedDate &&
    selectedTime &&
    (serviceType === 'delivery' ? (address) : (selectedBranch));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => step === 'payment' ? setStep('details') : onBack()}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{step === 'payment' ? 'Back to Details' : 'Back to Cart'}</span>
        </button>
        <h1 className="text-3xl font-more-sugar font-semibold text-black ml-8">
          {step === 'payment' ? 'Payment' : 'Order Details'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {step === 'details' ? (
          <>
            {/* Order Summary for Step 1 */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:order-2">
              <h2 className="text-2xl font-more-sugar font-medium text-black mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                    <div>
                      <h4 className="font-medium text-black">{item.name}</h4>
                      {item.selectedVariation && (
                        <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                      )}
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                        </p>
                      )}
                      {item.selectedPromoOptions && item.promotion && (
                        <p className="text-sm text-gray-600">
                          Bundle: {Object.entries(item.selectedPromoOptions).map(([id, qty]) => {
                            const optionName = item.promotion?.options.find(o => o.id === id)?.name || 'Unknown';
                            return `${qty}x ${optionName}`;
                          }).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">₱{formatPrice(item.totalPrice)} x {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-black">₱{formatPrice(item.totalPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-red-200 pt-4">
                <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black">
                  <span>Total:</span>
                  <span>₱{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Step 1: Customer Details Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:order-1">
              <h2 className="text-2xl font-more-sugar font-medium text-black mb-6">Customer Information</h2>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleProceedToPayment(); }}>
                {/* Customer Information */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Receiver Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Contact Number *</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="09XX XXX XXXX"
                    required
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Service Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'delivery', label: 'Delivery', icon: '🛵' },
                      { value: 'pickup', label: 'Pickup', icon: '🏪' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setServiceType(option.value as ServiceType)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${serviceType === option.value
                          ? 'border-yellow-500 bg-yellow-400 text-white'
                          : 'border-gray-200 bg-white text-gray-700'
                          }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {serviceType === 'delivery' ? 'Delivery Date' : 'Pickup Date'} *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {serviceType === 'delivery' ? 'Delivery Time' : 'Pickup Time'} *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none bg-white"
                      required
                    >
                      <option value="" disabled>Select a time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Address or Branch Selection */}
                {serviceType === 'delivery' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Delivery Address *</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Enter your complete delivery address"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Landmark (optional)</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 flex items-center">
                        <span className="mr-2">ℹ️</span>
                        Shipping fee varies based on Lalamove rates and will be collected upon delivery.
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Select Branch *</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none bg-white"
                      required
                    >
                      <option value="" disabled>Select a branch</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Special Notes */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Special Instructions (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isDetailsValid}
                    className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${isDetailsValid
                      ? 'bg-yellow-400 text-white hover:bg-yellow-500 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <span>Proceed to Payment</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Step 2: Payment & Final Summary */
          <>
            {/* Left Column: Choose Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:order-1">
              <h2 className="text-2xl font-more-sugar font-medium text-black mb-6">Choose Payment Method</h2>

              <div className="space-y-4">
                {loadingPayments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading payment methods...</p>
                  </div>
                ) : (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedPaymentMethod?.id === method.id
                        ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-yellow-50'
                        }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {method.qr_code_url ? (
                            <img
                              src={method.qr_code_url}
                              alt={method.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-black">{method.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                            <p className="text-sm text-gray-600 font-mono">{method.account_number}</p>
                            {method.account_name && (
                              <span className="hidden sm:inline text-gray-300">|</span>
                            )}
                            <p className="text-xs text-gray-500">{method.account_name}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPaymentMethod?.id === method.id
                          ? 'border-yellow-400 bg-yellow-400'
                          : 'border-gray-300'
                          }`}>
                          {selectedPaymentMethod?.id === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedPaymentMethod && selectedPaymentMethod.qr_code_url && (
                <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                  <p className="text-sm font-medium text-gray-600 mb-4">Scan QR Code to Pay</p>
                  <img
                    src={selectedPaymentMethod.qr_code_url}
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-48 h-48 mx-auto rounded-lg shadow-sm border border-white"
                  />
                </div>
              )}

              {/* Payment Proof Required Note */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Camera className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-1">📸 Payment Proof Required</h3>
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Final Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:order-2 h-fit lg:sticky lg:top-8">
              <h2 className="text-2xl font-more-sugar font-medium text-black mb-6">Final Order Summary</h2>

              {/* Customer Details Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex border-b border-gray-200 pb-3 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                    <p className="font-medium text-black">{customerName}</p>
                    <p className="text-sm text-gray-600">{contactNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {serviceType === 'delivery' ? 'Delivery' : 'Pickup'}
                    </p>
                    <p className="font-medium text-black">{selectedDate}</p>
                    <p className="text-sm text-gray-600">{selectedTime}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {serviceType === 'delivery' ? 'Delivery Address' : 'Pickup Branch'}
                  </p>
                  <p className="text-sm text-gray-700">
                    {serviceType === 'delivery' ? address : selectedBranch}
                  </p>
                  {landmark && (
                    <p className="text-xs text-gray-500 mt-1">Note: {landmark}</p>
                  )}
                </div>
              </div>

              {/* Items Summary (Compact) */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Order Items</p>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                        {item.selectedVariation && <span className="text-gray-500 text-xs"> ({item.selectedVariation.name})</span>}
                      </span>
                      <span className="font-medium text-black">₱{formatPrice(item.totalPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-black">₱{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedPaymentMethod}
                  className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 ${selectedPaymentMethod
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <span>Place Order via Messenger</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  This will open Messenger with your order details pre-filled.
                </p>
                {!selectedPaymentMethod && (
                  <p className="text-xs text-center text-red-500 mt-1">Please select a payment method to proceed.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;