import React from 'react';

const MobileWarning: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-primary-bg flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-bg border border-primary-bdr p-8 max-w-md text-center">
        <img src="/logo.svg" alt="DevDuel" className="w-16 h-16 mx-auto mb-6" />

        <h2 className="text-xl font-bold text-white mb-4">Увеличьте размер экрана</h2>
        <p className="text-white/80 mb-6">
          DevDuel предназначен для использования на компьютерах. Пожалуйста, увеличьте ширину окна браузера или откройте сайт с компьютера.
        </p>
        <div className="text-redDD text-sm">
          Минимальная ширина экрана: 1024px
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;

