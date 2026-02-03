"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Flame, 
  Gamepad2, 
  Trophy, 
  ExternalLink 
} from 'lucide-react';
import CreatePost from '@/components/CreatePost';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);

  // Функция для загрузки постов
  const fetchPosts = async () => {
    try {
      // Сначала .select('*'), потом .order() — это критически важно
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Ошибка Supabase при загрузке:", error.message);
      } else if (data) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Системная ошибка:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* ЛЕВАЯ ПАНЕЛЬ: Навигация */}
      <aside className="hidden lg:block lg:col-span-3 space-y-4">
        <div className="glass-card p-6">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-[#8a2be2] mb-6 uppercase">
            Навигация
          </h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm font-medium text-white hover:text-[#8a2be2] cursor-pointer transition-colors group">
              <Flame size={18} className="text-[#8a2be2]" /> 
              Популярное
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-[#8a2be2] cursor-pointer transition-colors">
              <Gamepad2 size={18} /> 
              Мои игры
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-[#8a2be2] cursor-pointer transition-colors">
              <Trophy size={18} /> 
              Турниры
            </li>
          </ul>
        </div>
      </aside>

      {/* ЦЕНТР: Лента постов */}
      <div className="lg:col-span-6 space-y-6">
        {/* Компонент создания поста */}
        <CreatePost onPostCreated={fetchPosts} />

        <div className="flex items-center gap-4 py-2">
          <div className="h-[1px] bg-[#28282b] flex-grow"></div>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Лента SULU</span>
          <div className="h-[1px] bg-[#28282b] flex-grow"></div>
        </div>

        {/* Список постов */}
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="glass-card overflow-hidden transition-all hover:border-[#8a2be2]/50 group">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8a2be2] to-[#400080] border border-[#28282b]" />
                  <div>
                    <p className="font-bold text-sm text-white group-hover:text-[#8a2be2] transition-colors">
                      {post.author_name || 'Gamer'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(post.created_at).toLocaleString()} • {post.game_tag || 'Gaming'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-5 pb-6">
                <p className="text-sm leading-relaxed text-gray-200">{post.content}</p>
              </div>

              <div className="p-3 bg-[#0d0d0e]/50 border-t border-[#28282b] flex gap-6 px-5">
                <button className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-red-500 transition-colors uppercase">
                  <Heart size={16} /> 0
                </button>
                <button className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-[#8a2be2] transition-colors uppercase">
                  <MessageSquare size={16} /> Ответить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass-card">
            <p className="text-gray-600 text-sm italic">Постов пока нет. Будь первым!</p>
          </div>
        )}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: Маркетплейс */}
      <aside className="hidden lg:block lg:col-span-3 space-y-6">
        <div className="glass-card p-5 border-l-2 border-l-[#00E676]">
          <h3 className="text-[10px] font-black tracking-[0.2em] text-[#00E676] mb-4 uppercase">
            Маркетплейс
          </h3>
          <div className="p-4 bg-[#0a0a0a] rounded border border-[#28282b] text-center">
            <p className="text-[10px] text-gray-500">Скины CS2 скоро появятся</p>
          </div>
        </div>
      </aside>

    </div>
  );
}