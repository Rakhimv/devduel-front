import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TitleAnimation from './ui/TitleAnimation';

interface PreloaderProps {
  children: React.ReactNode;
}

const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [minDisplayTime, setMinDisplayTime] = useState(true);

  useEffect(() => {
    const minTimeTimer = setTimeout(() => {
      setMinDisplayTime(false);
    }, 3000);

    const checkReady = () => {
      if (document.readyState === 'complete' && !minDisplayTime) {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(() => {
        if (!minDisplayTime) {
          setIsLoading(false);
        } else {
          const readyCheck = setInterval(() => {
            if (!minDisplayTime) {
              clearInterval(readyCheck);
              setTimeout(() => setIsLoading(false), 500);
            }
          }, 100);
        }
      }, 500);
    } else {
      window.addEventListener('load', checkReady);
    }

    const readyInterval = setInterval(() => {
      if (document.readyState === 'complete' && !minDisplayTime) {
        clearInterval(readyInterval);
        setTimeout(() => setIsLoading(false), 500);
      }
    }, 100);

    return () => {
      clearTimeout(minTimeTimer);
      clearInterval(readyInterval);
      window.removeEventListener('load', checkReady);
    };
  }, [minDisplayTime]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-primary-bg"
          >
            <TitleAnimation />
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoading && children}
    </>
  );
};

export default Preloader;

