


import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWindows, FaLinux, FaApple } from 'react-icons/fa';
import { IoGlobeOutline } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuth } = useAuth();

  const handleDownload = (platform: 'windows' | 'linux' | 'macos') => {
    // TODO: Добавить логику скачивания для соответствующей платформы
    console.log(`Скачать для ${platform}`);
    // Пока просто показываем сообщение
    alert(`Скачивание для ${platform} скоро будет доступно!`);
  };

  const handleWebClick = () => {
    if (isAuth) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        {/* Заголовок */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-greenDD via-blueDD to-pinkDD bg-clip-text text-transparent"
        >
          DevDuel
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
        >
          Соревнуйся в программировании с другими разработчиками. Решай задачи, повышай уровень, становись лучше!
        </motion.p>

        {/* Кнопки скачивания */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          {/* Windows */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('windows')}
            className="flex items-center gap-3 px-6 py-4 bg-secondary-bg border border-primary-bdr rounded-lg hover:border-blueDD transition-colors group"
          >
            <FaWindows className="text-2xl text-blueDD group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm text-gray-400">Скачать для</div>
              <div className="text-lg font-semibold text-white">Windows</div>
            </div>
          </motion.button>

          {/* Linux */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('linux')}
            className="flex items-center gap-3 px-6 py-4 bg-secondary-bg border border-primary-bdr rounded-lg hover:border-orangeDD transition-colors group"
          >
            <FaLinux className="text-2xl text-orangeDD group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm text-gray-400">Скачать для</div>
              <div className="text-lg font-semibold text-white">Linux</div>
            </div>
          </motion.button>

          {/* macOS */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('macos')}
            className="flex items-center gap-3 px-6 py-4 bg-secondary-bg border border-primary-bdr rounded-lg hover:border-pinkDD transition-colors group"
          >
            <FaApple className="text-2xl text-pinkDD group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm text-gray-400">Скачать для</div>
              <div className="text-lg font-semibold text-white">macOS</div>
            </div>
          </motion.button>

          {/* Веб версия */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWebClick}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-greenDD to-blueDD border border-greenDD rounded-lg hover:shadow-lg hover:shadow-greenDD/50 transition-all group"
          >
            <IoGlobeOutline className="text-2xl text-white group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm text-white/80">Открыть</div>
              <div className="text-lg font-semibold text-white">Веб версия</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 pt-8 border-t border-primary-bdr"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400">
            <div>
              <h3 className="text-greenDD font-semibold mb-2">Соревнуйся</h3>
              <p className="text-sm">Решай задачи на время вместе с другими разработчиками</p>
            </div>
            <div>
              <h3 className="text-blueDD font-semibold mb-2">Развивайся</h3>
              <p className="text-sm">Повышай свой уровень, решая задачи разной сложности</p>
            </div>
            <div>
              <h3 className="text-pinkDD font-semibold mb-2">Общайся</h3>
              <p className="text-sm">Общайся с другими участниками в реальном времени</p>
            </div>
          </div>
        </motion.div>

        {/* Кнопки авторизации для неавторизованных пользователей */}
        {!isAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 flex gap-4 justify-center"
          >
            <Link
              to="/login"
              className="px-6 py-3 bg-secondary-bg border border-primary-bdr rounded-lg hover:border-greenDD transition-colors text-white font-semibold"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-greenDD to-blueDD border border-greenDD rounded-lg hover:shadow-lg hover:shadow-greenDD/50 transition-all text-white font-semibold"
            >
              Зарегистрироваться
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Landing;

