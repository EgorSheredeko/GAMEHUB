"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } }
      });
      if (error) alert(error.message);
      else alert('Проверьте почту для подтверждения!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-card">
      <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-widest text-center">
        {isLogin ? 'Вход в SULU' : 'Регистрация'}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Твой никнейм"
              className="w-full bg-[#0d0d0e] border border-[#28282b] rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#8a2be2] outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#0d0d0e] border border-[#28282b] rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#8a2be2] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full bg-[#0d0d0e] border border-[#28282b] rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#8a2be2] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8a2be2] hover:bg-[#a04df5] text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
        >
          {loading ? 'Ждем...' : isLogin ? <><LogIn size={18}/> Войти</> : <><UserPlus size={18}/> Создать аккаунт</>}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-500 text-sm">
        {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 text-[#8a2be2] font-bold hover:underline"
        >
          {isLogin ? "Зарегистрируйся" : "Войди"}
        </button>
      </p>
    </div>
  );
}