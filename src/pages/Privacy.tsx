import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import LandingHeader from '../components/LandingHeader';
import CanvasBackground from '../components/effects/CanvasBackground';

const Privacy = () => {
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
              Политика конфиденциальности
            </h1>
            
            <div className="space-y-6 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Общие положения</h2>
                <p>
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                  пользователей платформы DevDuel. Используя наш сервис, вы соглашаетесь с условиями данной политики.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Собираемые данные</h2>
                <p>Мы собираем следующие типы данных:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Имя пользователя и адрес электронной почты</li>
                  <li>Данные профиля (аватар, уровень, рейтинг)</li>
                  <li>Технические данные (IP-адрес, тип браузера, устройство)</li>
                  <li>Данные о взаимодействии с платформой</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Использование данных</h2>
                <p>
                  Собранные данные используются для предоставления услуг платформы, улучшения пользовательского опыта, 
                  обеспечения безопасности и связи с пользователями.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Защита данных</h2>
                <p>
                  Мы применяем современные методы защиты данных, включая шифрование, безопасное хранение и 
                  ограниченный доступ к персональной информации.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Права пользователей</h2>
                <p>Вы имеете право:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Получать информацию о своих данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>
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

export default Privacy;

