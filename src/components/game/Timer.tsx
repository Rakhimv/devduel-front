import { useEffect, useState } from "react";
import type { GameTimer } from "../../types/game";

export const Timer: React.FC<{ startTime: string; duration: number }> = ({ startTime, duration }) => {
    const [timer, setTimer] = useState<GameTimer>({ minutes: 10, seconds: 0, isActive: false });

    useEffect(() => {
        const startTimeMs = new Date(startTime).getTime();
        const endTime = startTimeMs + duration;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            if (remaining <= 0) {
                setTimer({ minutes: 0, seconds: 0, isActive: false });
                return;
            }
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setTimer({ minutes, seconds, isActive: true });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startTime, duration]);

    return (
        <div className="text-4xl font-bold text-yellow-500">
            {`${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`}
        </div>
    );
};