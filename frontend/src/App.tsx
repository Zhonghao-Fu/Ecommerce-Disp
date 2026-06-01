import AppRouter from './router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

/**
 * Root App Component
 * Note: BrowserRouter is now in main.tsx for GitHub Pages redirect support
 */
export default function App() {
  // GitHub Pages uses repository name as base path
  // Local development uses '/'
  const basename = import.meta.env.BASE_URL || '/'

  return (
    <div className="app">
      <Navbar />
      <main>
        <AppRouter basename={basename} />
      </main>
      <Footer />
    </div>
  )
}
