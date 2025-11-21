import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWindows,
  FaLinux,
  FaApple,
  FaTelegramPlane,
  FaCode,
  FaTrophy,
  FaUsers,
  FaChevronDown,
  FaEnvelope
} from 'react-icons/fa';
import { IoGlobeOutline } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';
import { SEOHead } from '../components/SEOHead';
import CanvasBackground from '../components/effects/CanvasBackground';
import LandingHeader from '../components/LandingHeader';
import CodeEditorAnimation from '../components/effects/CodeEditorAnimation';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Что такое DevDuel?',
    answer: 'DevDuel - это платформа для соревнований по программированию, где разработчики могут соревноваться друг с другом, решая задачи на время и повышая свой уровень.',
  },
  {
    question: 'Как начать играть?',
    answer: 'Просто зарегистрируйтесь на платформе, войдите в систему и начните игру. Вы будете сопоставлены с другим игроком и получите задачу для решения.',
  },
  {
    question: 'Какие языки программирования поддерживаются?',
    answer: 'DevDuel поддерживает множество популярных языков программирования, включая Python, JavaScript, TypeScript, Java, C++, Go, Rust и многие другие.',
  },
  {
    question: 'Как работает система рейтинга?',
    answer: 'Рейтинг рассчитывается на основе ваших побед и поражений. Чем больше вы выигрываете, тем выше ваш рейтинг и уровень.',
  },
  {
    question: 'Можно ли играть бесплатно?',
    answer: 'Да, DevDuel полностью бесплатен для всех пользователей. Просто зарегистрируйтесь и начинайте соревноваться!',
  },
  {
    question: 'Как получить поддержку?',
    answer: 'Вы можете связаться с нами через Telegram канал @DevDuel или написать на почту. Мы всегда готовы помочь!',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDownload = (platform: 'windows' | 'linux' | 'macos') => {
    if (platform === 'windows') {
      const link = document.createElement('a');
      link.href = 'https://api.devduel.ru/download/DevDuel-Setup.exe';
      link.download = 'DevDuel-Setup.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log(`Скачать для ${platform}`);
      alert(`Скачивание для ${platform} скоро будет доступно!`);
    }
  };

  const handleWebClick = () => {
    if (isAuth) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <SEOHead
        title="DevDuel - Соревнуйся в программировании"
        description="Соревнуйся в программировании с другими разработчиками. Решай задачи, повышай уровень, становись лучше!"
        keywords="программирование, соревнования, coding challenge, разработка, задачи по программированию, code duel"
      />
      <div className="relative min-h-screen bg-primary-bg overflow-hidden">
        <CanvasBackground />
        <LandingHeader />

        <div className="relative z-10 pt-20 md:pt-24">
          <section className="min-h-screen flex items-center justify-center px-4 py-12 pt-0 md:py-20 md:pt-0">
            <div className="max-w-7xl w-full px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h1
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary cursor-default"
                    style={{ textShadow: '0 0 40px rgba(131, 214, 197, 0.5)' }}
                  >
                    DevDuel
                  </h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed"
                  >
                    Соревнуйся в программировании с другими разработчиками. Решай задачи, повышай уровень, становись лучше!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-wrap gap-3 pt-4"
                  >
                    <button
                      onClick={() => handleDownload('windows')}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-secondary-bg border border-primary-bdr hover:border-primary transition-all group backdrop-blur-sm"
                    >
                      <FaWindows className="text-lg text-primary" />
                      <span className="text-sm md:text-base font-semibold text-white">Windows</span>
                    </button>

                    <button
                      onClick={() => handleDownload('linux')}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-secondary-bg border border-primary-bdr hover:border-primary transition-all group backdrop-blur-sm"
                    >
                      <FaLinux className="text-lg text-primary" />
                      <span className="text-sm md:text-base font-semibold text-white">Linux</span>
                    </button>

                    <button
                      onClick={() => handleDownload('macos')}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-secondary-bg border border-primary-bdr hover:border-primary transition-all group backdrop-blur-sm"
                    >
                      <FaApple className="text-lg text-primary" />
                      <span className="text-sm md:text-base font-semibold text-white">macOS</span>
                    </button>

                    <button
                      onClick={handleWebClick}
                      className="dd-btn flex items-center gap-2 px-4 py-2.5 group"
                    >
                      <IoGlobeOutline className="text-lg text-black" />
                      <span className="text-sm md:text-base font-semibold text-black">Веб версия</span>
                    </button>
                  </motion.div>


                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex justify-center lg:justify-end mt-8 lg:mt-0 h-[350px] items-center"
                >
                  <CodeEditorAnimation />
                </motion.div>
              </div>
            </div>
          </section>

          <section className="relative py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-primary text-center mb-16"
              >
                Возможности
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: FaCode,
                    title: 'Соревнуйся',
                    description: 'Решай задачи на время вместе с другими разработчиками',
                    color: 'text-primary',
                  },
                  {
                    icon: FaTrophy,
                    title: 'Развивайся',
                    description: 'Повышай свой уровень, решая задачи разной сложности',
                    color: 'text-blueDD',
                  },
                  {
                    icon: FaUsers,
                    title: 'Общайся',
                    description: 'Общайся с другими участниками в реальном времени',
                    color: 'text-pinkDD',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-secondary-bg border border-primary-bdr p-8 hover:border-primary transition-all backdrop-blur-sm"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <feature.icon className={`text-4xl ${feature.color} mb-4`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="relative py-20 px-4 scroll-mt-20">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-primary text-center mb-16"
              >
                Часто задаваемые вопросы
              </motion.h2>

              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-secondary-bg border border-primary-bdr overflow-hidden"
                  >
                    <motion.button
                      onClick={() => toggleFaq(index)}
                      whileHover={{ backgroundColor: 'rgba(36, 36, 36, 0.5)' }}
                      className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <span className="text-white font-semibold text-lg">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-primary" />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            exit={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 py-4 border-t border-primary-bdr"
                          >
                            <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-primary mb-8"
              >
                Нужна помощь?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white/80 mb-8"
              >
                Свяжитесь с нами через Telegram или напишите нам на почту
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <motion.a
                  href="https://t.me/DevDuel"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="dd-btn flex items-center gap-3 px-8 py-4 group"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FaTelegramPlane className="text-2xl text-black" />
                  </motion.div>
                  <span className="font-semibold">Telegram канал</span>
                </motion.a>
                <motion.a
                  href="mailto:azjson@yahoo.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 bg-secondary-bg border border-primary-bdr text-white hover:border-primary transition-all group backdrop-blur-sm"
                >
                  <motion.div
                    whileHover={{ rotate: -15 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FaEnvelope className="text-2xl text-primary" />
                  </motion.div>
                  <span className="font-semibold">Написать нам</span>
                </motion.a>
              </motion.div>
            </div>
          </section>

          <footer className="relative border-t border-primary-bdr bg-secondary-bg/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">


                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col w-full"
                >
                  <h3 className="text-primary font-bold text-xl mb-4">Навигация</h3>
                  <ul className="space-y-2 flex-grow">
                    <li>
                      <Link to="/" className="text-white/70 hover:text-primary transition-colors text-sm inline-block">
                        Главная
                      </Link>
                    </li>
                    <li>
                      <Link to="/rating" className="text-white/70 hover:text-primary transition-colors text-sm inline-block">
                        Рейтинг
                      </Link>
                    </li>
                    <li>
                      <Link to="/login" className="text-white/70 hover:text-primary transition-colors text-sm inline-block">
                        Войти
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-white/70 hover:text-primary transition-colors text-sm inline-block">
                        Регистрация
                      </Link>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col w-full"
                >
                  <h3 className="text-primary font-bold text-xl mb-4">Поддержка</h3>
                  <ul className="space-y-2 flex-grow">
                    <li>
                      <a
                        href="https://t.me/DevDuel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-primary transition-colors text-sm flex items-center gap-2"
                      >
                        <FaTelegramPlane className="text-sm" />
                        Telegram канал
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:azjson@yahoo.com"
                        className="text-white/70 hover:text-primary transition-colors text-sm flex items-center gap-2"
                      >
                        <FaEnvelope className="text-sm" />
                        azjson@yahoo.com
                      </a>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col w-full"
                >
                  <h3 className="text-primary font-bold text-xl mb-4">DevDuel</h3>
                  <p className="text-white/70 text-sm flex-grow">
                    Платформа для соревнований по программированию. Развивайся, соревнуйся, побеждай!
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t border-primary-bdr pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <p className="text-white/50 text-sm">
                  © {new Date().getFullYear()} DevDuel. Все права защищены. v{import.meta.env.VITE_APP_VERSION || '1.0.1'}
                </p>
                <div className="flex gap-6">
                  <Link
                    to="/privacy"
                    className="text-white/50 hover:text-primary transition-colors text-sm"
                  >
                    Политика конфиденциальности
                  </Link>
                  <Link
                    to="/terms"
                    className="text-white/50 hover:text-primary transition-colors text-sm"
                  >
                    Условия использования
                  </Link>
                </div>
              </motion.div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Landing;
