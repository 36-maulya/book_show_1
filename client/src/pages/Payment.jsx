import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { CreditCardIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { axios, getToken } = useAppContext()

  // ✅ SAFE STATE HANDLING (FIXED)
  const state = location.state || {}
  const showId = state.showId || null
  const selectedSeats = state.selectedSeats || []
  const showData = state.showData || null
  const totalAmount = state.totalAmount || 0

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState('form')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16)
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim()
      setCardDetails(prev => ({ ...prev, cardNumber: formatted }))
      return
    }

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

    if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4)
      setCardDetails(prev => ({ ...prev, cvv: cleaned }))
      return
    }

    setCardDetails(prev => ({ ...prev, [name]: value }))
  }

  const processDemoPayment = async () => {
    const cleanedCardNumber = cardDetails.cardNumber.replace(/\s/g, '')

    if (!cleanedCardNumber || cleanedCardNumber.length !== 16) {
      toast.error('Invalid card number')
      return
    }

    setIsProcessing(true)
    setPaymentStep('processing')

    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // ✅ SAFE TOKEN HANDLING
      const token = await getToken().catch(() => null)

      const { data } = await axios.post('/api/booking/create', {
        showId,
        selectedSeats,
        paymentMethod: 'demo_card'
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (data.success) {
        setPaymentStep('success')
        toast.success('Payment successful!')
        setTimeout(() => navigate('/my-bookings'), 2000)
      } else {
        toast.error('Booking failed')
        setPaymentStep('form')
      }

    } catch (error) {
      console.error(error)
      toast.error('Payment failed')
      setPaymentStep('form')
    } finally {
      setIsProcessing(false)
    }
  }

  // ✅ SAFE FALLBACK (FIXED)
  if (!showId || selectedSeats.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <h1 className='text-2xl font-bold mb-4'>No Booking Data</h1>
        <button onClick={() => navigate('/movies')} className='px-6 py-2 bg-primary rounded-full'>
          Browse Movies
        </button>
      </div>
    )
  }

  // ✅ SAFE TOTAL CALCULATION
  const finalAmount = totalAmount || ((showData?.showPrice || 0) * (selectedSeats.length || 0))

  return (
    <div className='min-h-screen bg-gray-900 text-white py-10 px-4'>
      <div className='max-w-lg mx-auto'>

        <h1 className='text-3xl font-bold text-center mb-6'>Payment</h1>

        <div className='bg-gray-800 p-6 rounded-xl mb-6'>
          <p>Seats: {selectedSeats.join(', ')}</p>
          <p>Total: ${finalAmount}</p>
        </div>

        <button
          onClick={processDemoPayment}
          disabled={isProcessing}
          className='w-full bg-primary py-3 rounded-lg'
        >
          {isProcessing ? 'Processing...' : `Pay $${finalAmount}`}
        </button>

      </div>
    </div>
  )
}

export default Payment