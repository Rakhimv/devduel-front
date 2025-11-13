import { motion } from "framer-motion";

const MaintenanceMode = () => {
  return (
    <div className="min-h-screen w-full bg-secondary-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="mb-8">
          <img 
            src="/logo.svg" 
            alt="DevDuel Logo" 
            className="w-32 h-32 mx-auto mb-6 opacity-90"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-primary-bg border border-primary-bdr p-8 rounded-lg"
        >
          <div className="mb-6">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Ведутся разработки и обновления
            </h1>
            <p className="text-xl text-white/80 mb-2">
              Мы работаем над улучшением платформы
            </p>
            <p className="text-lg text-white/60">
              Скоро всё заработает!
            </p>
          </div>
          
        
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenanceMode;

