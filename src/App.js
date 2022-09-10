
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Explore from './pages/Explore'
import ForgotPassword from './pages/ForgotPassword'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import Signin from './pages/Signin'
import Signup from './pages/Signup'


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={< Explore />} />
          <Route path='/forgot-password' element={< ForgotPassword />} />
          <Route path='/offers' element={< Offers />} />
          <Route path='/profile' element={< PrivateRoute />}>
            <Route path='/profile' element={< Profile />} />
          </Route>
          <Route path='/profile' element={< Profile />} />
          <Route path='/sign-in' element={< Signin />} />
          <Route path='/sign-up' element={< Signup />} />
        </Routes>
        < Navbar />
              {/* Navbar */}
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
