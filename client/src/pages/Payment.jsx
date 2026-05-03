import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { axios, getToken } = useAppContext()

  const { showId, selectedSeats, showData, totalAmount } = location.state || {}

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState('form') // form | processing | success

  const processDemoPayment = async () => {
    try {
      setIsProcessing(true)
      setPaymentStep('processing')

      // fake delay for recruiter effect
      await new Promise(resolve => setTimeout(resolve, 1500))

      const { data } = await axios.post(
        '/api/booking/create',
        {
          showId,
          selectedSeats,
          paymentMethod: 'demo_success',
          last4: '0000'
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      )

      if (data.success) {
        setPaymentStep('success')
        toast.success('Payment Successful 🎉')

        setTimeout(() => {
          navigate('/my-bookings')
        }, 2000)
      } else {
        toast.error(data.message || 'Booking failed')
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

  // ❌ missing data check
  if (!showId || !selectedSeats) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <h1 className='text-2xl font-bold mb-4'>No Booking Data</h1>
        <button
          onClick={() => navigate('/movies')}
          className='px-6 py-2 bg-primary rounded-full'
        >
          Go Back
        </button>
      </div>
    )
  }

  // ✅ SUCCESS SCREEN
  if (paymentStep === 'success') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <CheckCircleIcon className='w-24 h-24 text-green-500 mb-4' />
        <h1 className='text-3xl font-bold'>Payment Successful!</h1>
        <p className='text-gray-400 mt-2'>Redirecting to bookings...</p>
      </div>
    )
  }

  // ⏳ LOADING SCREEN
  if (paymentStep === 'processing') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white'>
        <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4'></div>
        <h1 className='text-xl font-bold'>Processing Payment...</h1>
      </div>
    )
  }

  // 💳 MAIN UI
  return (
    <div className='min-h-screen bg-gray-900 text-white py-10 px-4'>
      <div className='max-w-lg mx-auto'>

        {/* HEADER */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold'>Complete Payment</h1>
          <p className='text-gray-400'>Secure Demo Checkout</p>
        </div>

        {/* ORDER SUMMARY */}
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
            <span>
              {showData?.dateTime
                ? Object.keys(showData.dateTime).join(', ')
                : 'N/A'}
            </span>
          </div>

          <div className='border-t border-gray-700 my-4'></div>

          <div className='flex justify-between text-xl font-bold'>
            <span>Total</span>
            <span className='text-primary'>
              ₹{totalAmount || 0}
            </span>
          </div>
        </div>

        {/* SIMPLE DEMO PAYMENT BOX */}
        <div className='bg-gray-800 rounded-xl p-6 text-center'>

          <LockClosedIcon className='w-10 h-10 mx-auto text-primary mb-3' />

          <h2 className='text-lg font-semibold mb-2'>Demo Payment</h2>

          <p className='text-gray-400 text-sm mb-6'>
            Click below to simulate successful payment
          </p>

          <button
            onClick={processDemoPayment}
            disabled={isProcessing}
            className='w-full bg-primary hover:bg-primary-dull py-4 rounded-lg font-semibold text-lg transition'
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>

          <p className='mt-4 text-xs text-gray-500'>
            ⚡ Instant success demo • No card required
          </p>
        </div>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className='w-full mt-6 py-3 text-gray-400 hover:text-white'
        >
          ← Back
        </button>

      </div>
    </div>
  )
}

export default Payment