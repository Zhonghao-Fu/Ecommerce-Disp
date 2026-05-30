import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

/**
 * Root App Component
 * Wraps the entire application with BrowserRouter
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <AppRouter />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
