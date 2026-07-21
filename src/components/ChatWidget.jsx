import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { BUSINESS } from '../lib/business';

export default function ChatWidget() {
  const { dir } = useLang();

  return (
    <motion.a
      href={BUSINESS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      className={`fixed bottom-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-2xl transition-colors ${dir === 'rtl' ? 'left-6' : 'right-6'}`}
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} className="text-white" />
    </motion.a>
  );
}
