import { useState, useEffect, useRef } from 'react';

const WORK_TIME = 25 * 60; // 25 minutes in seconds

export function useTimer(initialTime = WORK_TIME) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<any>(null); // Use any to avoid NodeJS namespace issues if types are missing

    const [mode, setMode] = useState<'work' | 'intermission'>('work');

    const start = () => setIsRunning(true);
    const pause = () => setIsRunning(false);
    // Sound effect (simple beep/chime using Data URI for portability)
    const playSound = () => {
        try {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play().catch(e => console.error("Audio play failed:", e));
        } catch (e) {
            console.error("Audio initialization failed:", e);
        }
    };

    const requestNotificationPermission = () => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const reset = () => {
        setIsRunning(false);
        setMode('work');
        setTimeLeft(WORK_TIME);
    };

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        playSound();
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("Time's up!", {
                                body: mode === 'work' ? "Time for a break!" : "Break is over! Back to work.",
                                icon: "/icon.png"
                            });
                        }

                        // Switch mode and time
                        if (mode === 'work') {
                            setMode('intermission');
                            return 5 * 60; // 5 minutes break
                        } else {
                            setMode('work');
                            return WORK_TIME; // Back to work
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, mode]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsRunning(prev => !prev);

    return {
        timeLeft,
        setTime: setTimeLeft,
        isRunning,
        mode,
        start,
        pause,
        reset,
        toggleTimer,
        formattedTime: formatTime(timeLeft),
        progress: mode === 'work'
            ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
            : ((5 * 60 - timeLeft) / (5 * 60)) * 100
    };
}
