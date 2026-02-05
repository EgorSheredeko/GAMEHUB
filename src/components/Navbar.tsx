"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Gamepad2 } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Проверяем юзера при загрузке
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // Слушаем изменения (вход/выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#1a1a1c] bg-black/60 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* ЛОГОТИП SULUGAMER */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => router.push('/')}
        >
          <div className="w-9 h-9 bg-[#8a2be2] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.2)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Sulu<span className="text-[#8a2be2]">Gamer</span>
          </span>
        </div>

        {/* ПРАВАЯ ЧАСТЬ С ТВОИМИ ИКОНКАМИ */}
        <div className="flex items-center gap-5">
          {user ? (
            <div className="flex items-center gap-5">
              
              {/* 1. ТВОЯ ИКОНКА ПАКЕТА */}
              <div 
                onClick={() => router.push('/marketplace')} 
                className="cursor-pointer text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag w-6 h-6">
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                  <path d="M3.103 6.034h17.794"></path>
                  <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
                </svg>
              </div>

              {/* 2. ТВОЯ ИКОНКА КОЛОКОЛЬЧИКА */}
              <div 
                onClick={() => alert('Уведомлений пока нет')} 
                className="cursor-pointer p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell w-6 h-6 text-gray-400 hover:text-[#8a2be2] transition-colors">
                  <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                </svg>
              </div>

              {/* 3. ТВОЙ КРУГ — ТЕПЕРЬ РАБОТАЕТ! */}
              <div 
                onClick={() => router.push('/profile')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8a2be2] to-blue-500 border border-[#28282b] cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                {/* Внутри круга первая буква ника для красоты */}
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] font-black text-white italic uppercase select-none">
                    {user.user_metadata?.username?.[0] || 'U'}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <button 
              onClick={() => router.push('/auth')}
              className="bg-[#8a2be2] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase italic hover:bg-[#9d4edd] transition-colors"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}