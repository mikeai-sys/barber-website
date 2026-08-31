import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LangProvider } from "./contexts/LangContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import LiquidBackground from "./components/LiquidBackground";
import LoadingScreen from "./components/LoadingScreen";
import PageTransition from "./components/PageTransition";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Hairstyles from "./pages/Hairstyles";
import HairstyleDetail from "./pages/HairstyleDetail";
import ServiceDetail from "./pages/ServiceDetail";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Book from "./pages/Book";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Promos from "./pages/Promos";
import Store from "./pages/Store";
import AdsPopup from "./components/AdsPopup";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const location = useLocation();
  const { pathname } = location;
  const bare = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname === "/account";
  return (
    <div
      className={`min-h-screen flex flex-col ${bare ? "bg-[color:var(--color-ink)]" : "bg-transparent"}`}
    >
      {!bare && <LiquidBackground />}
      {!bare && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
            <Route path="/hairstyles" element={<PageTransition><Hairstyles /></PageTransition>} />
            <Route path="/hairstyle/:id" element={<PageTransition><HairstyleDetail /></PageTransition>} />
            <Route path="/service/:id" element={<PageTransition><ServiceDetail /></PageTransition>} />
            <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/store" element={<PageTransition><Store /></PageTransition>} />
            <Route path="/book" element={<PageTransition><Book /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Account /></PageTransition>} />
            <Route path="/promos" element={<PageTransition><Promos /></PageTransition>} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!bare && <Footer />}
      {!bare && <ChatWidget />}
      {!bare && <BackToTop />}
    </div>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  return (
    <LangProvider>
      <AuthProvider>
        <ToastProvider>
          {!loaded && <LoadingScreen onFinish={() => setLoaded(true)} />}
          <AdsPopup />
          <BrowserRouter>
            <ScrollTop />
            <Shell />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </LangProvider>
  );
}
