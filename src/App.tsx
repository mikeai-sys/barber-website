import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LangProvider } from "./contexts/LangContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import LiquidBackground from "./components/LiquidBackground";
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
import AdsPopup from "./components/AdsPopup";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname === "/account";
  return (
    <div
      className={`min-h-screen flex flex-col ${bare ? "bg-[color:var(--color-ink)]" : "bg-transparent"}`}
    >
      {!bare && <LiquidBackground />}
      {!bare && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/hairstyles" element={<Hairstyles />} />
          <Route path="/hairstyle/:id" element={<HairstyleDetail />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/dashboard" element={<Account />} />
          <Route path="/promos" element={<Promos />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!bare && <Footer />}
      {!bare && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AdsPopup />
        <BrowserRouter>
          <ScrollTop />
          <Shell />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
