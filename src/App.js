import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
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
          <Route path='/forgot-passord' element={< ForgotPassword />} />
          <Route path='/offers' element={< Offers />} />
          <Route path='/profile' element={< Signin />} />
          <Route path='/sign-in' element={< Signin />} />
          <Route path='/sign-up' element={< Signup />} />
        </Routes>
        < Navbar />
              {/* Navbar */}
      </Router>
    </>
  )
}

export default App
