import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import api from '@/lib/axios';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from './button';

// Session lifetime in minutes — must match SESSION_LIFETIME in .env (default 120)
const SESSION_LIFETIME_MS = (parseInt(import.meta.env.VITE_SESSION_LIFETIME ?? '120')) * 60 * 1000;
// Warn this many ms before expiry
const WARN_BEFORE_MS = 5 * 60 * 1000;

export function SessionTimeoutWarning() {
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(WARN_BEFORE_MS / 1000);
    const [extending, setExtending] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const warningTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const countdownRef = useRef<ReturnType<typeof setInterval>>();

    const resetTimers = () => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        setSecondsLeft(WARN_BEFORE_MS / 1000);

        clearTimeout(warningTimerRef.current);
        clearInterval(countdownRef.current);

        // Show warning when SESSION_LIFETIME - WARN_BEFORE_MS has elapsed
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsLeft(WARN_BEFORE_MS / 1000);

            countdownRef.current = setInterval(() => {
                setSecondsLeft(s => {
                    if (s <= 1) {
                        clearInterval(countdownRef.current);
                        // Session expired — redirect to login
                        router.visit('/login');
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        }, SESSION_LIFETIME_MS - WARN_BEFORE_MS);
    };

    // Track user activity
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        const onActivity = () => {
            // Only reset if warning isn't showing yet (don't reset during countdown)
            if (!showWarning) {
                resetTimers();
            }
        };

        events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
        resetTimers(); // Start on mount

        return () => {
            events.forEach(e => window.removeEventListener(e, onActivity));
            clearTimeout(warningTimerRef.current);
            clearInterval(countdownRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const extendSession = async () => {
        setExtending(true);
        try {
            // Ping the server to refresh the session
            await api.get('/me');
            resetTimers();
        } catch {
            router.visit('/login');
        } finally {
            setExtending(false);
        }
    };

    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const timeStr = mins > 0
        ? `${mins}m ${secs}s`
        : `${secs}s`;

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${(secondsLeft / (WARN_BEFORE_MS / 1000)) * 100}%` }}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Session expiring soon</h3>
                            <p className="text-[13px] text-gray-500 mt-0.5">
                                Your session will expire in{' '}
                                <span className="font-bold text-amber-600">{timeStr}</span>.
                                Any unsaved work will be lost.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 text-gray-500"
                            onClick={() => router.visit('/login')}
                        >
                            Sign out
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={extendSession}
                            disabled={extending}
                        >
                            {extending
                                ? <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                : <RefreshCw className="w-4 h-4 mr-2" />}
                            Stay signed in
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
