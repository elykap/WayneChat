import { Routes, Route } from 'react-router-dom'
import WcButton from './components/WcButton'
import ThemeToggle from './components/ThemeToggle'
import Layout from './components/Layout'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LegalPage from './pages/LegalPage'

function App() {
  return (
    <>
      <WcButton />
      <ThemeToggle />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
