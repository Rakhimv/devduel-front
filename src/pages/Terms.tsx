import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import LandingHeader from '../components/LandingHeader';
import CanvasBackground from '../components/effects/CanvasBackground';

const Terms = () => {
  return (
    <div className="relative min-h-screen bg-primary-bg overflow-hidden">
      <CanvasBackground />
      <LandingHeader />
      
      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-blueDD transition-colors mb-8"
          >
            <FaArrowLeft />
            <span>Вернуться на главную</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-secondary-bg border border-primary-bdr p-8 md:p-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8">
              Условия использования
            </h1>
            
            <div className="space-y-6 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Принятие условий</h2>
                <p>
                  Используя платформу DevDuel, вы соглашаетесь с настоящими Условиями использования. 
                  Если вы не согласны с какими-либо условиями, пожалуйста, не используйте наш сервис.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Использование платформы</h2>
                <p>При использовании DevDuel вы обязуетесь:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Предоставлять достоверную информацию при регистрации</li>
                  <li>Не использовать платформу в незаконных целях</li>
                  <li>Не нарушать права других пользователей</li>
                  <li>Не пытаться взломать или нарушить работу системы</li>
                  <li>Соблюдать правила честной игры</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Интеллектуальная собственность</h2>
                <p>
                  Все материалы платформы, включая дизайн, код, логотипы и контент, являются собственностью 
                  DevDuel и защищены законами об интеллектуальной собственности.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Ответственность</h2>
                <p>
                  DevDuel предоставляет платформу "как есть". Мы не несем ответственности за результаты 
                  соревнований, действия других пользователей или технические сбои.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Модерация и блокировка</h2>
                <p>
                  Мы оставляем за собой право модерировать контент, блокировать пользователей за нарушение 
                  правил и удалять аккаунты при необходимости.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Изменения условий</h2>
                <p>
                  Мы можем изменять настоящие Условия использования в любое время. Продолжая использовать 
                  платформу после изменений, вы соглашаетесь с новыми условиями.
                </p>
              </section>

           
              <section>
                <p className="text-white/60 text-sm mt-8">
                  Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

