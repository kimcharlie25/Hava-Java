import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { CartItem, ServiceType } from '../types';
import { formatPrice } from '../utils/format';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
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
  }, []);

  // Set default payment method when payment methods are loaded - ${serviceType === 'delivery' ? `🛵 DELIVERY FEE: Shipping fee varies based on Lalamove` : ''}




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
    customerName &&
    contactNumber &&
    selectedDate &&
    selectedTime &&
    (serviceType === 'delivery' ? (address) : (selectedBranch));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Cart</span>
        </button>
        <h1 className="text-3xl font-more-sugar font-semibold text-black ml-8">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
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

        {/* Customer Details Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-more-sugar font-medium text-black mb-6">Customer Information</h2>

          <form className="space-y-6">
            {/* Customer Information */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Receiver Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none"
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
                      ? 'border-hava-yellow bg-hava-yellow text-black'
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none bg-white"
                  required
                >
                  <option value="" disabled>Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hava-yellow focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!isDetailsValid}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${isDetailsValid
                ? 'bg-hava-yellow text-black hover:bg-yellow-400 hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Place Order via Messenger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;