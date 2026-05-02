import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { CreditCardIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { axios, getToken, user } = useAppContext()
  
  // Get booking details from location state
  const { showId, selectedSeats, showData, totalAmount } = location.state || {}
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState('form') // form, processing, success
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  // Demo card numbers that work
  const DEMO_CARDS = [
    '4242424242424242', // Success
    '4000002500003155', // Requires OTP
    '4000000000009995', // Decline
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16)
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim()
      setCardDetails(prev => ({ ...prev, cardNumber: formatted }))
      return
    }
    
    // Format expiry as MM/YY
    if (name === 'expiry') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4)
      if (cleaned.length >= 2) {
        const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
        setCardDetails(prev => ({ ...prev, expiry: formatted }))
      } else {
        setCardDetails(prev => ({ ...prev, expiry: cleaned }))
      }
      return
    }
    
    // Limit CVV to 4 digits
    if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4)
      setCardDetails(prev => ({ ...prev, cvv: cleaned }))
      return
    }
    
    setCardDetails(prev => ({ ...prev, [name]: value }))
  }

  const processDemoPayment = async () => {
    // Validate card details
    const cleanedCardNumber = cardDetails.cardNumber.replace(/\s/g, '')
    
    if (!cleanedCardNumber || cleanedCardNumber.length !== 16) {
      toast.error('Please enter a valid card number')
      return
    }
    
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      toast.error('Please enter expiry date')
      return
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast.error('Please enter CVV')
      return
    }
    
    if (!cardDetails.name) {
      toast.error('Please enter cardholder name')
      return
    }
    
    // Check for demo card behavior
    if (cleanedCardNumber === '4000000000009995') {
      toast.error('Payment declined. Please try another card.')
      return
    }
    
    if (cleanedCardNumber === '4000002500003155') {
      toast.error('OTP verification required. Use 4242 4242 4242 4242 for demo.')
      return
    }
    
    setIsProcessing(true)
    setPaymentStep('processing')
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      // Create booking with payment
      const { data } = await axios.post('/api/booking/create', {
        showId,
        selectedSeats,
        paymentMethod: 'demo_card',
        last4: cleanedCardNumber.slice(-4)
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      
      if (data.success) {
        setPaymentStep('success')
        toast.success('Payment successful! Booking confirmed.')
        
        // Redirect to bookings after delay
        setTimeout(() => {
          navigate('/my-bookings')
        }, 2000)
      } else {
        toast.error(data.message || 'Booking failed')
        setPaymentStep('form')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Payment failed')
      setPaymentStep('form')
    } finally {
      setIsProcessing(false)
    }
  }

  // If no booking data, show error
  if (!showId || !selectedSeats) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <h1 className='text-2xl font-bold mb-4'>No Booking Data</h1>
        <p className='text-gray-400 mb-6'>Please select seats first.</p>
        <button 
          onClick={() => navigate('/movies')}
          className='px-6 py-2 bg-primary rounded-full'
        >
          Browse Movies
        </button>
      </div>
    )
  }

  if (paymentStep === 'success') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <CheckCircleIcon className='w-24 h-24 text-green-500 mb-4' />
        <h1 className='text-3xl font-bold mb-2'>Payment Successful!</h1>
        <p className='text-gray-400'>Redirecting to your bookings...</p>
      </div>
    )
  }

  if (paymentStep === 'processing') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4'></div>
        <h1 className='text-2xl font-bold mb-2'>Processing Payment...</h1>
        <p className='text-gray-400'>Please wait while we process your payment.</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white py-10 px-4'>
      <div className='max-w-lg mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold'>Complete Payment</h1>
          <p className='text-gray-400 mt-2'>Secure checkout powered by BookShow</p>
        </div>

        {/* Order Summary */}
        <div className='bg-gray-800 rounded-xl p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Order Summary</h2>
          <div className='flex justify-between mb-2'>
            <span className='text-gray-400'>Movie</span>
            <span>{showData?.movie?.title || 'Movie'}</span>
          </div>
          <div className='flex justify-between mb-2'>
            <span className='text-gray-400'>Seats</span>
            <span>{selectedSeats?.join(', ')}</span>
          </div>
          <div className='flex justify-between mb-2'>
            <span className='text-gray-400'>Show Time</span>
            <span>{showData?.dateTime || 'N/A'}</span>
          </div>
          <div className='border-t border-gray-700 my-4'></div>
          <div className='flex justify-between text-xl font-bold'>
            <span>Total</span>
            <span className='text-primary'>${totalAmount || showData?.showPrice * selectedSeats?.length}</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className='bg-gray-800 rounded-xl p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-semibold'>Card Details</h2>
            <div className='flex items-center gap-2 text-gray-400'>
              <LockClosedIcon className='w-4 h-4' />
              <span className='text-sm'>Secure</span>
            </div>
          </div>

          {/* Card Number */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-400 mb-2'>Card Number</label>
            <div className='relative'>
              <CreditCardIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                name='cardNumber'
                value={cardDetails.cardNumber}
                onChange={handleInputChange}
                placeholder='1234 5678 9012 3456'
                className='w-full bg-gray-700 rounded-lg py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
            <p className='text-xs text-gray-500 mt-1'>Demo: Use 4242 4242 4242 4242</p>
          </div>

          {/* Expiry and CVV */}
          <div className='flex gap-4 mb-4'>
            <div className='flex-1'>
              <label className='block text-sm text-gray-400 mb-2'>Expiry</label>
              <input
                type='text'
                name='expiry'
                value={cardDetails.expiry}
                onChange={handleInputChange}
                placeholder='MM/YY'
                className='w-full bg-gray-700 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
            <div className='flex-1'>
              <label className='block text-sm text-gray-400 mb-2'>CVV</label>
              <input
                type='text'
                name='cvv'
                value={cardDetails.cvv}
                onChange={handleInputChange}
                placeholder='123'
                className='w-full bg-gray-700 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div className='mb-6'>
            <label className='block text-sm text-gray-400 mb-2'>Cardholder Name</label>
            <input
              type='text'
              name='name'
              value={cardDetails.name}
              onChange={handleInputChange}
              placeholder='John Doe'
              className='w-full bg-gray-700 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Pay Button */}
          <button
            onClick={processDemoPayment}
            disabled={isProcessing}
            className='w-full bg-primary hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-semibold text-lg transition'
          >
            {isProcessing ? 'Processing...' : `Pay $${totalAmount || showData?.showPrice * selectedSeats?.length}`}
          </button>

          {/* Footer */}
          <div className='mt-4 text-center text-gray-500 text-sm'>
            <p>This is a demo payment. No real charges will be made.</p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className='w-full mt-6 py-3 text-gray-400 hover:text-white transition'
        >
          ← Back to Seat Selection
        </button>
      </div>
    </div>
  )
}

export default Payment
