import React, { useState, useEffect, useMemo } from 'react';
import { generateDateList, isSameDay, formatDateId } from './utils/dateUtils';
import { DateItem, ProgressStats } from './types';
import { DateCard } from './components/DateCard';
import { ProgressBar } from './components/ProgressBar';
import { generatePDF, generateShareImage } from './utils/exportHelpers';

const App: React.FC = () => {
  // 1. Generate full list of dates
  const dates = useMemo(() => generateDateList(), []);
  
  // 2. State for checked dates
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ul-app-checked-dates');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("Failed to load checks from local storage", e);
      return new Set();
    }
  });

  // 3. State for Journal Notes
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ul-app-notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load notes from local storage", e);
      return {};
    }
  });

  const [today, setToday] = useState<Date>(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Update today's date periodically
  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, []);

  // Save checks
  useEffect(() => {
    try {
      localStorage.setItem('ul-app-checked-dates', JSON.stringify(Array.from(checkedIds)));
    } catch (e) {
      console.error("Failed to save checks", e);
    }
  }, [checkedIds]);

  // Save notes
  useEffect(() => {
    try {
      localStorage.setItem('ul-app-notes', JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes", e);
    }
  }, [notes]);

  // --- Notification Logic ---
  
  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      new Notification('Reminders Enabled', {
        body: 'You will be reminded at 9 PM to check UL.',
        icon: 'https://cdn-icons-png.flaticon.com/512/833/833472.png'
      });
    }
  };

  // Timer for 9 PM Notification
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkTime = () => {
      const now = new Date();
      // Check if it's 9 PM (21:00)
      if (now.getHours() === 21) {
        // Prevent spamming: only send if we haven't sent one today
        const lastSent = localStorage.getItem('ul-last-notification-date');
        const todayStr = now.toDateString();

        if (lastSent !== todayStr) {
          // Check if today is already done, if so, maybe don't notify? 
          // But Uday might want to read it, so we notify anyway.
          
          new Notification('UL Reminder', {
            body: 'Hi Uday, remember to mark your day.',
            icon: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
            tag: 'ul-daily-reminder'
          });
          
          localStorage.setItem('ul-last-notification-date', todayStr);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    checkTime(); // Initial check

    return () => clearInterval(interval);
  }, [notificationPermission]);

  // --- End Notification Logic ---

  // Handlers
  const toggleDate = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      const isCurrentlyChecked = next.has(id);

      if (isCurrentlyChecked) {
        next.delete(id);
      } else {
        const index = dates.findIndex(d => d.id === id);
        if (index !== -1) {
          for (let i = 0; i <= index; i++) {
            next.add(dates[i].id);
          }
        }
      }
      return next;
    });
  };

  const handleNoteChange = (id: string, text: string) => {
    setNotes(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await generatePDF(dates, notes);
    setIsExporting(false);
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    await generateShareImage('export-card');
    setIsExporting(false);
  };

  // Stats
  const stats: ProgressStats = useMemo(() => {
    const total = dates.length;
    const completed = checkedIds.size;
    const remaining = total - completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, remaining, percentage };
  }, [dates, checkedIds]);
  
  const isComplete = stats.completed === stats.total;

  // Scroll to today on mount
  useEffect(() => {
    setTimeout(() => {
      const todayElement = document.getElementById('date-card-today');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }, []);

  return (
    <div className="min-h-screen text-gray-800 pb-20 selection:bg-rose-200">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="pt-16 pb-10 text-center relative z-10 px-4">
        <h1 className="font-sans font-bold text-6xl md:text-8xl text-rose-900 mb-2 tracking-tight">UL</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-8 bg-rose-300"></div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-rose-700 font-bold">Created By Uday</p>
          <div className="h-px w-8 bg-rose-300"></div>
        </div>
        <p className="font-sans text-lg md:text-xl text-rose-800/80 italic">
          Counting the days until love returns.
        </p>

        {/* Notification Bell */}
        {notificationPermission === 'default' && (
          <button 
            onClick={requestNotificationPermission}
            className="mt-6 mx-auto flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white rounded-full text-xs text-rose-500 font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Enable 9PM Reminders
          </button>
        )}
      </header>

      {/* Progress Section */}
      <section className="relative z-10">
        <ProgressBar stats={stats} />
      </section>

      {/* Main List */}
      <main className="max-w-xl mx-auto px-4 relative z-10 space-y-4">
        {dates.map((item) => {
          const isItemToday = isSameDay(item.dateObject, today);
          
          return (
            <div 
              key={item.id} 
              id={isItemToday ? 'date-card-today' : undefined}
            >
              <DateCard 
                item={item}
                isChecked={checkedIds.has(item.id)}
                isToday={isItemToday}
                note={notes[item.id] || ''}
                onToggle={toggleDate}
                onNoteChange={handleNoteChange}
              />
            </div>
          );
        })}
      </main>

      {/* Completion & Export Section - Visible when 100% complete */}
      {isComplete && (
        <section className="max-w-xl mx-auto px-4 mt-12 mb-8 relative z-10 animate-fade-in">
          <div id="export-card" className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-3xl border border-rose-200 shadow-xl text-center">
            <h2 className="font-sans font-bold text-3xl text-rose-900 mb-2">Journey Completed</h2>
            <p className="text-rose-700 mb-6 font-sans">15/11/2025 — 26/02/2026</p>
            <div className="w-16 h-1 bg-rose-300 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-700 italic mb-8 font-sans">
              "The wait is over. Love has returned."
            </p>
            <div className="flex justify-center items-center gap-2 text-xs uppercase text-rose-400 font-bold tracking-widest">
              <span>UL</span>
              <span>•</span>
              <span>By Uday</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-6 py-3 bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Generating...' : 'Export Journal PDF'}
            </button>
            <button 
              onClick={handleExportImage}
              disabled={isExporting}
              className="px-6 py-3 bg-white text-rose-600 border-2 border-rose-200 rounded-full font-bold shadow-md hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Share Image
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-20 text-center pb-10 relative z-10 px-4">
        <div className="flex justify-center mb-4">
          <svg className="w-6 h-6 text-rose-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <p className="font-sans font-bold text-lg text-rose-800 italic">
          “Love is patient. I’m waiting.”
        </p>
        <p className="text-xs text-rose-300 mt-2 font-sans opacity-60 font-semibold">
          From 15/11/2025 to 26/02/2026
        </p>
      </footer>

      {/* Floating Action Button (Scroll to Top) */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-white/80 backdrop-blur text-rose-500 p-3 rounded-full shadow-lg border border-rose-100 hover:bg-white transition-all z-20"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

    </div>
  );
};

export default App;