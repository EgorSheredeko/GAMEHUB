"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // МАГИЯ: Слушаем подтверждение с телефона в реальном времени
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { username },
            emailRedirectTo: 'http://localhost:3000/' // Важно для теста дома!
          }
        });
        if (error) throw error;
        setWaiting(true);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 font-sans">
      <div className="w-full max-w-md bg-[#0a0a0a] p-8 rounded-3xl border border-[#1a1a1a] shadow-2xl">
        {!waiting ? (
          <>
            <h1 className="text-3xl font-black italic mb-6 tracking-tighter uppercase text-[#8a2be2]">Sulu // {isLogin ? 'Вход' : 'Регистрация'}</h1>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <input type="text" placeholder="НИКНЕЙМ" required className="w-full bg-[#111] border border-[#222] p-4 rounded-xl focus:border-[#8a2be2] outline-none" onChange={e => setUsername(e.target.value)} />
              )}
              <input type="email" placeholder="EMAIL" required className="w-full bg-[#111] border border-[#222] p-4 rounded-xl focus:border-[#8a2be2] outline-none" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="ПАРОЛЬ" required className="w-full bg-[#111] border border-[#222] p-4 rounded-xl focus:border-[#8a2be2] outline-none" onChange={e => setPassword(e.target.value)} />
              <button disabled={loading} className="w-full bg-[#8a2be2] p-4 rounded-xl font-bold uppercase hover:scale-[1.02] transition-transform active:scale-95">
                {loading ? 'Секунду...' : isLogin ? 'Войти' : 'Создать аккаунт'}
              </button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-gray-500 hover:text-white uppercase tracking-widest font-bold">
              {isLogin ? 'Создать аккаунт' : 'Уже есть профиль? Войти'}
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 border-4 border-[#8a2be2] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-bold mb-4 uppercase">Проверь почту</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Мы отправили письмо на <b>{email}</b>.<br/> 
              Нажми на кнопку в письме <b>на телефоне</b>,<br/> 
              и этот экран сам тебя впустит.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}