import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { checkMaintenanceMode } from "../api/api";
import MaintenanceMode from "./MaintenanceMode";

const MaintenanceGuard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const data = await checkMaintenanceMode();
        setIsMaintenanceMode(data.enabled);
      } catch (error) {
        console.error('Ошибка проверки режима обслуживания:', error);
        setIsMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-secondary-bg flex items-center justify-center">
        <div className="text-white/60">Загрузка...</div>
      </div>
    );
  }

  if (isAdmin) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-secondary-bg flex items-center justify-center">
        <div className="text-white/60">Загрузка...</div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return <MaintenanceMode />;
  }

  return <Outlet />;
};

export default MaintenanceGuard;

