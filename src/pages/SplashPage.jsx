import './SplashPage.css'

function SplashPage() {
  return (
    <div className="splash">
      <main className="splash__main">
        <h1 className="splash__title">WayneChat</h1>
        <p className="splash__tagline">
          Anonymous chat for verified students and faculty
        </p>
        <button type="button" className="splash__cta">
          Enter
        </button>
      </main>
      <footer className="splash__footer">
        Verify with your school email to get started
      </footer>
    </div>
  )
}

export default SplashPage
