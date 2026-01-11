import { useState, useEffect, useRef } from 'react';

const WORK_TIME = 25 * 60; // 25 minutes in seconds

export function useTimer(initialTime = WORK_TIME) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<any>(null); // Use any to avoid NodeJS namespace issues if types are missing

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
        setTimeLeft(initialTime);
    };

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        playSound();
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("Time's up!", {
                                body: "Your focus session has ended.",
                                icon: "/icon.png" // Assumes an icon exists, or browser default
                            });
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

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
        start,
        pause,
        reset,
        toggleTimer,
        formattedTime: formatTime(timeLeft),
        progress: ((initialTime - timeLeft) / initialTime) * 100
    };
}
