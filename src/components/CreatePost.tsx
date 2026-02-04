"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ImagePlus, Send, Loader2, X, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Проверяем, вошел ли пользователь
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleUpload = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!content.trim() && !file) return;
    setLoading(true);

    try {
      let imageUrl = '';

      // 1. Загрузка изображения в Storage
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // 2. Вставка поста в таблицу
      const { error: insertError } = await supabase.from('posts').insert([
        { 
          content, 
          image_url: imageUrl,
          author_name: user.user_metadata?.username || user.email?.split('@')[0] || 'Gamer',
          author_id: user.id
        }
      ]);

      if (insertError) throw insertError;

      // Сброс состояния
      setContent('');
      setFile(null);
      onPostCreated(); 
    } catch (error: any) {
      console.error('Ошибка:', error);
      alert('Ошибка публикации: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4 border border-[#28282b] hover:border-[#8a2be2]/20 transition-colors">
      <div className="flex gap-3">
        {/* Аватарка (заглушка или из профиля) */}
        <div className="w-10 h-10 rounded-full bg-[#1a1a1c] border border-[#28282b] flex items-center justify-center shrink-0">
          <UserCircle size={24} className="text-gray-600" />
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={user ? `Что нового, ${user.user_metadata?.username || 'Gamer'}?` : "Войдите, чтобы написать пост..."}
          className="w-full bg-transparent border-none focus:ring-0 text-sm text-white resize-none h-20 placeholder:text-gray-600 mt-2"
        />
      </div>
      
      {/* Превью фото */}
      {file && (
        <div className="relative ml-13 w-40 h-40 rounded-xl overflow-hidden border border-[#8a2be2]/50 shadow-lg shadow-[#8a2be2]/10">
          <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
          <button 
            onClick={() => setFile(null)} 
            className="absolute top-2 right-2 bg-black/80 rounded-full p-1.5 hover:bg-red-500 transition-all active:scale-90"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center border-t border-[#28282b] pt-3">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-gray-400 hover:text-[#8a2be2] cursor-pointer transition-colors group">
            <ImagePlus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Фото/Видео</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              disabled={!user}
            />
          </label>
        </div>
        
        <button
          onClick={handleUpload}
          disabled={loading || (!content.trim() && !file)}
          className="bg-[#8a2be2] hover:bg-[#a04df5] disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#8a2be2]/20"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : !user ? (
            'Нужен вход'
          ) : (
            <>
              <Send size={14} />
              Опубликовать
            </>
          )}
        </button>
      </div>
    </div>
  );
}