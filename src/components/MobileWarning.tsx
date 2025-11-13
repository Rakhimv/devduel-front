import React from 'react';

const MobileWarning: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-primary-bg flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-bg border border-primary-bdr p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Увеличьте размер экрана</h2>
        <p className="text-white/80 mb-6">
          DevDuel предназначен для использования на компьютерах. Пожалуйста, увеличьте ширину окна браузера или откройте сайт с компьютера.
        </p>
        <div className="text-white/60 text-sm">
          Минимальная ширина экрана: 1024px
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;

