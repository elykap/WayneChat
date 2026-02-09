import { Link } from 'react-router-dom'
import './WcButton.css'

function WcButton({ isLoggedIn = false }) {
  const to = isLoggedIn ? '/home' : '/'
  return (
    <Link to={to} className="wc-button" aria-label="WayneChat home">
      WC
    </Link>
  )
}

export default WcButton
