"use client"
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Settings, LogOut, Gamepad2, Mail, ChevronLeft,
  Edit3, Check, X, Camera, Trophy, Loader2, Grid, 
  Users, UserPlus, Heart, MessageSquare
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  
  // Счетчики
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Редактирование
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/auth');
        return;
      }

      setUser(authUser);
      setBio(authUser.user_metadata?.bio || '');
      setUsername(authUser.user_metadata?.username || '');

      // 1. Загружаем посты пользователя
      const { data: userPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', authUser.id)
        .order('created_at', { ascending: false });
      
      setPosts(userPosts || []);

      // 2. Считаем подписчиков (кто подписан на нас)
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', authUser.id);
      
      setFollowersCount(followers || 0);

      // 3. Считаем наши подписки (на кого подписаны мы)
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', authUser.id);
      
      setFollowingCount(following || 0);

    } catch (err) {
      console.error("Ошибка при загрузке данных профиля:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updateData = type === 'avatar' 
        ? { avatar_url: publicUrl } 
        : { cover_url: publicUrl };

      await supabase.auth.updateUser({ data: updateData });
      
      await fetchProfileData();
      alert("Успешно обновлено!");
    } catch (error: any) {
      alert("Ошибка загрузки: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { username, bio }
    });
    if (!error) {
      setIsEditing(false);
      fetchProfileData();
    }
    setIsSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#8a2be2]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#8a2be2]/30 pb-20">
      <main className="max-w-5xl mx-auto p-4 pt-8">
        
        {/* Кнопка назад */}
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-6 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase italic tracking-widest">Назад в ленту</span>
        </button>

        {/* ШАПКА ПРОФИЛЯ */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0d0d0e] border border-[#28282b] shadow-2xl">
          
          {/* ОБЛОЖКА */}
          <div className="h-48 md:h-64 bg-[#1a1a1c] relative group">
            {user?.user_metadata?.cover_url ? (
              <img src={user.user_metadata.cover_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#8a2be2]/10 to-blue-900/10" />
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
              <Camera className="text-white mr-2" />
              <span className="text-xs font-black uppercase italic">Сменить фон</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} disabled={uploading} />
            </label>
          </div>

          <div className="px-6 md:px-10 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-20">
              
              {/* АВАТАРКА */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#050505] bg-[#1a1a1c] overflow-hidden flex items-center justify-center shadow-2xl bg-gradient-to-tr from-[#8a2be2] to-blue-500">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black italic uppercase text-white">
                      {(username || user?.email)?.[0]}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} disabled={uploading} />
                </label>
              </div>

              {/* ИНФОРМАЦИЯ */}
              <div className="flex-grow text-center md:text-left pt-2">
                {isEditing ? (
                  <input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="bg-black/60 border border-[#8a2be2] rounded-xl px-4 py-1 text-2xl font-black italic uppercase outline-none text-white w-full max-w-sm"
                  />
                ) : (
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    {username || 'Gamer'}
                  </h1>
                )}
                
                {/* СЧЕТЧИКИ (Followers/Following/Rating) */}
                <div className="flex items-center justify-center md:justify-start gap-8 mt-4">
                  <div className="text-center group cursor-pointer">
                    <p className="text-xl font-black group-hover:text-[#8a2be2] transition-colors">{followersCount}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Следят</p>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <p className="text-xl font-black group-hover:text-[#8a2be2] transition-colors">{followingCount}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Следит</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-[#8a2be2]">{posts.length * 15}</p>
                    <p className="text-[9px] text-[#8a2be2]/50 uppercase font-black tracking-widest">Рейтинг</p>
                  </div>
                </div>
              </div>

              {/* КНОПКИ УПРАВЛЕНИЯ */}
              <div className="flex gap-2">
                {isEditing ? (
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="bg-[#8a2be2] p-3 rounded-xl hover:bg-[#9d4edd] transition-all shadow-lg"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-[#1a1a1c] border border-[#28282b] p-3 rounded-xl hover:border-[#8a2be2] transition-all group"
                  >
                    <Edit3 size={20} className="text-gray-400 group-hover:text-[#8a2be2]" />
                  </button>
                )}
                <button 
                  onClick={() => { supabase.auth.signOut(); router.push('/auth'); }} 
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* БИОГРАФИЯ */}
            <div className="mt-8 p-6 bg-black/20 border border-white/5 rounded-2xl relative">
              <p className="text-[10px] font-black text-[#8a2be2] uppercase mb-2 tracking-[0.2em] italic">Player Bio</p>
              {isEditing ? (
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="w-full bg-black/40 border border-[#28282b] rounded-xl p-4 text-sm outline-none focus:border-[#8a2be2] resize-none h-24 text-gray-200"
                  placeholder="Расскажите о своих любимых играх..."
                />
              ) : (
                <p className="text-gray-400 italic text-sm leading-relaxed">
                  {bio || "Этот геймер пока предпочитает оставаться инкогнито..."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* СЕТКА ПОСТОВ */}
        <div className="mt-12">
          <div className="flex justify-center gap-12 border-b border-[#1a1a1c] mb-8">
            <button className="pb-4 border-b-2 border-[#8a2be2] flex items-center gap-2 text-[10px] font-black uppercase italic tracking-[0.3em] text-white">
              <Grid size={16} /> Посты
            </button>
            <button className="pb-4 border-b-2 border-transparent flex items-center gap-2 text-[10px] font-black uppercase italic tracking-[0.3em] text-gray-600 hover:text-white transition-colors">
              <Trophy size={16} /> Достижения
            </button>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {posts.map((post) => (
                <div key={post.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-[#28282b] bg-[#0d0d0e]">
                  {post.image_url ? (
                    <img src={post.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <p className="text-[10px] text-gray-600 font-bold uppercase italic text-center line-clamp-4">
                        {post.content}
                      </p>
                    </div>
                  )}
                  {/* Overlay при наведении */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <div className="flex items-center gap-1 text-xs font-black italic text-white"><Heart size={16} /> 0</div>
                    <div className="flex items-center gap-1 text-xs font-black italic text-white"><MessageSquare size={16} /> 0</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#0d0d0e] rounded-3xl border border-dashed border-[#28282b]">
              <p className="text-xs font-black text-gray-700 uppercase italic tracking-widest">Нет публикаций</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}