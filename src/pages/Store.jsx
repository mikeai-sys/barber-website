import { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Minus, X, Trash2, Check, Loader2, Play, ShoppingCart, MessageCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { orderWhatsApp, openWhatsApp } from '../lib/notify';
import supabase from '../lib/supabase';

export default function Store() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [info, setInfo] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.from('products').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => setProducts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user) setInfo(i => ({ ...i, email: user.email || i.email }));
  }, [user]);

  const cats = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const q = query.toLowerCase().trim();
  const filtered = (cat === 'all' ? products : products.filter(p => p.category === cat)).filter(p => !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));

  const add = (p) => {
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: p.id, name: p.name, price: Number(p.price) || 0, qty: 1 }];
    });
    setCartOpen(true);
  };
  const setQty = (id, delta) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeItem = (id) => setCart(c => c.filter(i => i.id !== id));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const genRef = () => 'CMD-' + Math.random().toString(36).slice(2, 7).toUpperCase();

  const placeOrder = async () => {
    setErr('');
    if (!info.name.trim() || !info.phone.trim()) { setErr(t.common.name + ' + ' + t.common.phone); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('orders').insert({
        reference: genRef(), customer_name: info.name, customer_phone: info.phone, customer_email: info.email, address: info.address, notes: info.notes,
        items: cart, total, user_id: user?.id || null,
      }).select().single();
      if (!error) {
        const full = { ...data, items: data.items || cart };
        setDone(full); setCart([]);
      }
      else setErr(error.message || 'Error');
    } catch { setErr('Error'); } finally { setSubmitting(false); }
  };

  return (
    <div className="pt-[92px]">
      <section className="py-16 px-6 sm:px-8 text-center border-b border-[color:var(--color-line)]">
        <SectionTitle overline={t.store.title} title={t.store.title} subtitle={t.store.sub} />
      </section>

      <section className="py-14 px-6 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto mb-8 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-ash)]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.common.search} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-full pl-11 pr-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
        </div>
        {cats.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${cat === c ? 'btn-gold' : 'border border-[color:var(--color-line)] text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]'}`}>{c === 'all' ? t.common.all : c}</button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="shimmer rounded-lg h-80" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="luxe-card rounded-lg py-24 text-center"><ShoppingBag className="mx-auto text-[color:var(--color-line)] mb-4" size={44} /><p className="text-[color:var(--color-ash)]">{t.store.empty}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                <div className="luxe-card rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="aspect-square bg-[color:var(--color-smoke)] overflow-hidden relative">
                    {p.video_url ? <video src={p.video_url} controls playsInline poster={p.image_url || undefined} className="w-full h-full object-cover" />
                      : p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="text-[color:var(--color-line)]" size={40} /></div>}
                    {p.stock === 0 && <div className="absolute inset-0 bg-[color:var(--color-ink)]/60 flex items-center justify-center"><span className="text-xs uppercase tracking-wider text-[color:var(--color-bone)] border border-[color:var(--color-line)] px-3 py-1 rounded">{t.store.outStock}</span></div>}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    {p.category && <div className="text-[10px] tracking-luxe uppercase text-[color:var(--color-gold)] mb-1">{p.category}</div>}
                    <h3 className="font-display text-lg font-semibold text-[color:var(--color-bone)]">{p.name}</h3>
                    {p.description && <p className="text-sm text-[color:var(--color-ash)] mt-1 leading-relaxed flex-1 line-clamp-3">{p.description}</p>}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-[color:var(--color-gold)] font-semibold">{p.price ? `${p.price} DA` : t.common.priceOnRequest}</span>
                      <button disabled={p.available === false || p.stock === 0} onClick={() => add(p)} className="inline-flex items-center gap-1.5 btn-gold px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider disabled:opacity-40">
                        <Plus size={14} /> {t.store.add}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Floating cart button */}
      {count > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)} className="fixed bottom-24 right-5 rtl:right-auto rtl:left-5 z-40 bg-[color:var(--color-bone)] text-[color:var(--color-ink)] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl">
          <ShoppingCart size={22} />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-gold)] text-xs flex items-center justify-center border border-[color:var(--color-gold)]">{count}</span>
        </button>
      )}

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 z-40 bg-[color:var(--color-ink)]/70 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[color:var(--color-charcoal)] border-l border-[color:var(--color-line)] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-[color:var(--color-line)]">
                <h3 className="font-display text-xl font-semibold text-[color:var(--color-bone)] flex items-center gap-2"><ShoppingCart size={20} className="text-[color:var(--color-gold)]" /> {t.store.cart}</h3>
                <button onClick={() => setCartOpen(false)} className="text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]"><X size={22} /></button>
              </div>

              {done ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[color:var(--color-gold)]/15 flex items-center justify-center mb-5"><Check size={32} className="text-[color:var(--color-gold)]" /></div>
                  <h4 className="font-display text-2xl font-bold text-[color:var(--color-bone)]">{t.store.orderSuccess}</h4>
                  <p className="text-[color:var(--color-ash)] mt-2">{t.store.orderSub}</p>
                  <div className="mt-4 text-sm text-[color:var(--color-ash)]">{t.booking.ref}: <span className="font-mono text-[color:var(--color-gold)]">{done.reference}</span></div>
                  <a href={orderWhatsApp(done, lang)} target="_blank" rel="noopener noreferrer" className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-[#062b16] py-3.5 rounded-sm text-sm font-bold uppercase tracking-wider hover:brightness-110 transition">
                    <MessageCircle size={18} /> {t.store.sendWhatsApp}
                  </a>
                  <p className="text-xs text-[color:var(--color-ash)] mt-3">{t.store.whatsappNote}</p>
                  <button onClick={() => { setDone(null); setCheckout(false); setCartOpen(false); }} className="mt-4 btn-gold px-6 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider">{t.common.close}</button>
                </div>
              ) : cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[color:var(--color-ash)]"><ShoppingBag size={40} className="mb-3 text-[color:var(--color-line)]" />{t.store.cartEmpty}</div>
              ) : !checkout ? (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {cart.map(i => (
                      <div key={i.id} className="flex items-center gap-3 luxe-card rounded-lg p-3">
                        <div className="flex-1 min-w-0"><div className="text-sm text-[color:var(--color-bone)] truncate">{i.name}</div><div className="text-xs text-[color:var(--color-gold)]">{i.price} DA</div></div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setQty(i.id, -1)} className="w-7 h-7 rounded-md border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)]"><Minus size={13} /></button>
                          <span className="w-6 text-center text-sm text-[color:var(--color-bone)]">{i.qty}</span>
                          <button onClick={() => setQty(i.id, 1)} className="w-7 h-7 rounded-md border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-bone)]"><Plus size={13} /></button>
                        </div>
                        <button onClick={() => removeItem(i.id)} className="text-[color:var(--color-ash)] hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 border-t border-[color:var(--color-line)]">
                    <div className="flex justify-between mb-4"><span className="text-[color:var(--color-ash)]">{t.store.total}</span><span className="font-display text-xl font-bold text-[color:var(--color-gold)]">{total} DA</span></div>
                    <button onClick={() => setCheckout(true)} className="w-full btn-gold py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider">{t.store.checkout}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <button onClick={() => setCheckout(false)} className="text-xs text-[color:var(--color-ash)] hover:text-[color:var(--color-bone)]">← {t.store.cart}</button>
                    <input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder={`${t.common.name} *`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                    <input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} placeholder={`${t.common.phone} *`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                    <input value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} placeholder={`${t.common.email} (${t.common.optional})`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                    <input value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} placeholder={`${t.store.address} (${t.common.optional})`} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none" />
                    <textarea value={info.notes} onChange={e => setInfo({ ...info, notes: e.target.value })} placeholder={`${t.common.notes} (${t.common.optional})`} rows={2} className="w-full bg-[color:var(--color-smoke)] border border-[color:var(--color-line)] rounded-md px-4 py-3 text-sm text-[color:var(--color-bone)] focus:border-[color:var(--color-gold)] outline-none resize-none" />
                    {err && <p className="text-sm text-red-400">{err}</p>}
                  </div>
                  <div className="p-5 border-t border-[color:var(--color-line)]">
                    <div className="flex justify-between mb-4"><span className="text-[color:var(--color-ash)]">{t.store.total}</span><span className="font-display text-xl font-bold text-[color:var(--color-gold)]">{total} DA</span></div>
                    <button onClick={placeOrder} disabled={submitting} className="w-full btn-gold py-3.5 rounded-sm text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t.store.confirmOrder}</button>
                    <p className="text-xs text-[color:var(--color-ash)] text-center mt-3">{t.store.payNote}</p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
