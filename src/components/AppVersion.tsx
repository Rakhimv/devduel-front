import { useEffect, useState } from 'react';

const AppVersion = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.1';
    setVersion(appVersion);
  }, []);

  if (!version) return null;

  return (
    <div className="fixed bottom-4 right-4 text-white/40 text-xs font-mono z-50 pointer-events-none">
      v{version}
    </div>
  );
};

export default AppVersion;

