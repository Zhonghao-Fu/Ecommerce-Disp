import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

/**
 * Root App Component
 * Wraps the entire application with BrowserRouter
 * Supports GitHub Pages deployment with dynamic base path
 */
export default function App() {
  // GitHub Pages uses repository name as base path
  // Local development uses '/'
  const basename = import.meta.env.BASE_URL || '/'

  return (
    <BrowserRouter basename={basename !== '/' ? basename : undefined}>
      <div className="app">
        <Navbar />
        <main>
          <AppRouter basename={basename} />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
