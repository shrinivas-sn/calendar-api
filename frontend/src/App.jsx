import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PlaygroundPage from './pages/PlaygroundPage';
import DocsPage from './pages/DocsPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Background Decorative Glows */}
        <div className="glow-backdrop">
          <div className="glow-circle-1"></div>
          <div className="glow-circle-2"></div>
        </div>

        {/* Navigation Bar */}
        <Navbar />

        {/* Main Routes */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </main>

        {/* Shared Footer */}
        <Footer />
      </div>
    </Router>
  );
}
