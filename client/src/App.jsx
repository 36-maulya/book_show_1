import React from 'react'
import NavBar from './components/NavBar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import Payment from './pages/Payment'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import {Toaster} from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import { useAppContext } from './context/AppContext'
import { SignIn } from '@clerk/clerk-react'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const {user ,isAdmin,loading}=useAppContext()
  return (
    <>
    <ToastContainer theme="dark" />
    <Toaster/>
      {!isAdminRoute && <NavBar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/movies' element={<Movies/>}/>
        <Route path='/movies/:id' element={<MovieDetails/>}/>
<Route path='/movies/:id/:date' element={<SeatLayout/>}/>
        <Route path='/payment' element={<Payment/>}/>
        <Route path='/my-bookings' element={<MyBookings/>}/>
        <Route path='/favorite' element={<Favorite/>}/>
        <Route path='/admin/*' element={
          // 1. Wait for loading to finish
          loading ? <div className='min-h-screen flex items-center justify-center'>Loading...</div> : 
          // 2. Once loaded, check if user is admin
          user && isAdmin ? <Layout/> : (
            <div className='min-h-screen flex justify-center items-center'>
              <SignIn fallbackRedirectUrl={'/admin'}/>
            </div>
          )
        }>
          <Route index element={<Dashboard/>}/>
          <Route path="add-shows" element={<AddShows/>}/>
          <Route path="list-shows" element={<ListShows/>}/>
          <Route path="list-bookings" element={<ListBookings/>}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}
export default App;