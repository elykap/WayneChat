import { Outlet, Link } from 'react-router-dom'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="layout__footer">
        <Link to="/legal" className="layout__footer-link">
          Legal
        </Link>
      </footer>
    </div>
  )
}

export default Layout
