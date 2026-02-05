"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, Heart, Share2, Flame, Gamepad2, 
  Loader2, Trash2, AlertTriangle, Trophy, TrendingUp, ExternalLink
} from 'lucide-react';
import CreatePost from '@/components/CreatePost';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Загрузка постов
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(username, avatar_url),
          likes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setPosts(data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  // Лайк поста
  const handleLike = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    if (!user) return alert("Войдите, чтобы лайкнуть!");
    
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (existingLike) {
      await supabase.from('likes').delete().eq('id', existingLike.id);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
    }
    fetchPosts();
  };

  // Удаление поста с подтверждением
  const deletePost = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const confirmed = window.confirm("⚠️ Вы уверены, что хотите удалить этот пост навсегда?");
    if (!confirmed) return;

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Ошибка при удалении");
    }
  };

  // Репорт поста
  const handleReport = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    if (!user) return alert("Войдите, чтобы отправить жалобу");
    
    const reason = window.prompt("Укажите причину жалобы (спам, оскорбления, другое):");
    if (!reason) return;

    const { error } = await supabase.from('reports').insert({
      target_post_id: postId,
      reporter_id: user.id,
      reason: reason
    });

    if (!error) {
      alert("✅ Жалоба отправлена модераторам.");
    } else {
      alert("Ошибка при отправке жалобы.");
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#8a2be2]/30">
      <main className="max-w-[1400px] mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ЛЕВАЯ ПАНЕЛЬ */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="glass-card p-6 border border-[#28282b] bg-[#0d0d0e]/50 rounded-2xl sticky top-24 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-[#8a2be2] uppercase mb-6 tracking-[0.2em] italic">Навигация</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-bold text-white hover:text-[#8a2be2] cursor-pointer transition-all group">
                    <div className="p-2 rounded-lg bg-[#1a1a1c] group-hover:bg-[#8a2be2]/20"><Flame size={18} className="text-[#8a2be2]" /></div>
                    Популярное
                  </li>
                  <li onClick={() => router.push('/profile')} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-[#8a2be2] cursor-pointer transition-all group">
                    <div className="p-2 rounded-lg bg-[#1a1a1c] group-hover:bg-[#8a2be2]/20"><Gamepad2 size={18} /></div>
                    Профиль
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-[#8a2be2] cursor-pointer transition-all group">
                    <div className="p-2 rounded-lg bg-[#1a1a1c] group-hover:bg-[#8a2be2]/20"><Trophy size={18} /></div>
                    Турниры
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* ЛЕНТА */}
          <div className="lg:col-span-6 space-y-6">
            {user ? <CreatePost user={user} onPostCreated={fetchPosts} /> : (
              <div className="p-6 bg-[#0d0d0e]/50 border border-[#28282b] rounded-2xl text-center text-[10px] font-black text-gray-600 uppercase italic tracking-widest">
                Войдите для создания постов
              </div>
            )}

            <div className="flex items-center gap-4 py-2 opacity-50">
              <div className="h-[1px] bg-[#28282b] flex-grow"></div>
              <span className="text-[10px] font-black uppercase italic tracking-[0.3em]">Лента сообщества</span>
              <div className="h-[1px] bg-[#28282b] flex-grow"></div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#8a2be2]" size={32} /></div>
            ) : posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => router.push(`/post/${post.id}`)}
                className="group relative bg-[#0a0a0b] border border-[#28282b] rounded-[2.5rem] hover:border-[#8a2be2]/40 transition-all cursor-pointer overflow-hidden shadow-xl active:scale-[0.99]"
              >
                {/* Шапка */}
                <div className="p-5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#8a2be2]/30 overflow-hidden flex items-center justify-center">
                      {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-[#8a2be2] transition-colors">{post.profiles?.username || 'Gamer'}</p>
                      <p className="text-[9px] text-gray-500 font-black uppercase">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleReport(e, post.id)}
                      className="p-2 text-gray-700 hover:text-orange-500 transition-colors"
                      title="Пожаловаться"
                    >
                      <AlertTriangle size={18} />
                    </button>
                    {user?.id === post.author_id && (
                      <button 
                        onClick={(e) => deletePost(e, post.id)} 
                        className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Контент */}
                <div className="p-6">
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 group-hover:text-white transition-colors">
                    {post.content}
                  </p>
                  {post.image_url && (
                    <div className="rounded-3xl border border-[#28282b] overflow-hidden">
                      <img src={post.image_url} alt="Post" className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                    </div>
                  )}
                </div>

                {/* Подвал */}
                <div className="px-8 py-4 bg-[#0d0d0e]/30 border-t border-white/5 flex items-center gap-8">
                  <button 
                    onClick={(e) => handleLike(e, post.id)} 
                    className="flex items-center gap-2 text-[10px] font-black uppercase italic hover:text-red-500 transition-colors"
                  >
                    <Heart size={20} className={post.likes?.[0]?.count > 0 ? "fill-red-500 text-red-500" : "text-gray-500"} />
                    {post.likes?.[0]?.count || 0}
                  </button>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-gray-500 group-hover:text-[#8a2be2] transition-colors">
                    <MessageSquare size={20} />
                    {post.comments?.[0]?.count || 0} ответов
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ПРАВАЯ ПАНЕЛЬ */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="glass-card p-6 border border-[#28282b] bg-[#0d0d0e]/50 rounded-2xl">
              <h4 className="text-[10px] font-black text-[#00E676] uppercase italic mb-6 tracking-widest flex items-center gap-2">
                <TrendingUp size={14} /> Тренды SULU
              </h4>
              <div className="space-y-4 text-[11px] font-bold uppercase italic text-gray-400">
                <p className="hover:text-white cursor-pointer transition-colors">#SULU_UPDATE</p>
                <p className="hover:text-white cursor-pointer transition-colors">#CS2_KZ</p>
              </div>
            </div>

            <div className="glass-card p-5 border-l-2 border-[#8a2be2] bg-[#0d0d0e]/50 rounded-2xl border border-[#28282b]">
              <h3 className="text-[10px] font-black text-white mb-4 uppercase italic">Sulu Market</h3>
              <div className="p-4 bg-black rounded-xl border border-dashed border-gray-800 text-center">
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Скоро: Торговля скинами</p>
                <ExternalLink size={12} className="mx-auto mt-2 text-gray-800" />
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}