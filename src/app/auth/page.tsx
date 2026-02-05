"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Mail, Lock, User, Gamepad2, 
  ArrowRight, ShieldCheck, AlertCircle 
} from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Исправляем ошибку гидратации (чтобы клиент и сервер совпадали)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Вход
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        // Регистрация
        if (username.length < 3) throw new Error("Никнейм слишком короткий");

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });

        if (signUpError) throw signUpError;

        // Создание записи в таблице profiles, если регистрация успешна
        if (signUpData.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            username: username,
            updated_at: new Date().toISOString(),
          });
          if (profileError) console.error("Ошибка создания профиля:", profileError);
        }
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8a2be2]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8a2be2]/5 blur-[120px] rounded-full" />

      <div className="max-w-md w-full relative">
        <div className="bg-[#0d0d0e] border border-[#28282b] rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-sm">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-[#1a1a1c] border border-[#8a2be2]/30 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(138,43,226,0.1)]">
              <Gamepad2 className="text-[#8a2be2]" size={40} />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              {isLogin ? 'С возвращением' : 'Стать легендой'}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 italic">
              {isLogin ? 'Входи в игру' : 'Создай свой профиль'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="group relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#8a2be2] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Твой никнейм"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#161618] border border-[#28282b] rounded-2xl py-4 pl-14 pr-5 text-sm focus:border-[#8a2be2] outline-none transition-all text-white placeholder:text-gray-700 font-medium"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="group relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#8a2be2] transition-colors" size={18} />
              <input
                type="email"
                placeholder="Электронная почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161618] border border-[#28282b] rounded-2xl py-4 pl-14 pr-5 text-sm focus:border-[#8a2be2] outline-none transition-all text-white placeholder:text-gray-700 font-medium"
                required
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#8a2be2] transition-colors" size={18} />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161618] border border-[#28282b] rounded-2xl py-4 pl-14 pr-5 text-sm focus:border-[#8a2be2] outline-none transition-all text-white placeholder:text-gray-700 font-medium"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={16} />
                <p className="text-red-500 text-[10px] font-black uppercase italic leading-tight">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8a2be2] hover:bg-[#9d4edd] text-white font-black uppercase italic py-4 rounded-2xl transition-all shadow-lg shadow-[#8a2be2]/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isLogin ? 'Войти в HUB' : 'Присоединиться'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#28282b] flex flex-col gap-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[10px] text-gray-500 font-black uppercase italic hover:text-[#8a2be2] transition-colors text-center"
            >
              {isLogin ? 'Еще нет аккаунта? Регистрация' : 'Уже в системе? Авторизация'}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-700 text-[9px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
          <ShieldCheck size={12} /> SECURE GATEWAY v1.0
        </p>
      </div>
    </div>
  );
}