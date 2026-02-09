import { Link } from 'react-router-dom'
import './LegalPage.css'

function LegalPage() {
  return (
    <div className="legal">
      <div className="legal__inner">
        <h1 className="legal__title">Legal</h1>
        <section className="legal__section">
          <h2 className="legal__heading">Disclaimer</h2>
          <p className="legal__text">
          WayneChat is a student-built project and is not affiliated with, endorsed by, or sponsored by Wayne State University. All trademarks and names belong to their respective owners.
          </p>
        </section>
        <p className="legal__back">
          <Link to="/" className="legal__link">Back to home</Link>
        </p>
      </div>
    </div>
  )
}

export default LegalPage
