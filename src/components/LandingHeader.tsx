import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { FaHome, FaTrophy, FaInfoCircle, FaBars, FaTimes } from 'react-icons/fa';

const LandingHeader = () => {
  const { isAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-primary-bdr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="DevDuel" className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-white font-bold text-xl md:text-2xl group-hover:text-primary transition-colors">
              DevDuel
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-white/70 hover:text-primary transition-colors flex items-center gap-2 text-sm"
            >
              <FaHome className="text-sm" />
              Главная
            </Link>
            <Link
              to="/rating"
              className="text-white/70 hover:text-primary transition-colors flex items-center gap-2 text-sm"
            >
              <FaTrophy className="text-sm" />
              Рейтинг
            </Link>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                const element = document.getElementById('faq');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="text-white/70 hover:text-primary transition-colors flex items-center gap-2 text-sm"
            >
              <FaInfoCircle className="text-sm" />
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuth ? (
              <Link
                to="/app"
                className="dd-btn px-4 py-2 text-sm md:px-6 md:py-2.5 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Войти в приложение</span>
                <span className="sm:hidden">Войти</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-sm md:px-6 md:py-2.5 bg-secondary-bg border border-primary-bdr text-white hover:border-primary transition-all"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="dd-btn px-4 py-2 text-sm md:px-6 md:py-2.5 whitespace-nowrap"
                >
                  Регистрация
                </Link>
              </>
            )}
            
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-white/70 hover:text-primary transition-colors p-2"
              aria-label="Меню"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTimes size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden overflow-hidden border-t border-primary-bdr"
            >
              <motion.nav
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 py-4"
              >
                {[
                  { to: '/', icon: FaHome, label: 'Главная' },
                  { to: '/rating', icon: FaTrophy, label: 'Рейтинг' },
                  { href: '#faq', icon: FaInfoCircle, label: 'FAQ', isAnchor: true },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.isAnchor ? (
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          const element = document.getElementById('faq');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="text-white/70 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <item.icon />
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to!}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-white/70 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <item.icon />
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
                {!isAuth && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 bg-secondary-bg border border-primary-bdr text-white hover:border-primary transition-all text-center block"
                    >
                      Войти
                    </Link>
                  </motion.div>
                )}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default LandingHeader;

