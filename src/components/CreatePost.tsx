"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ImagePlus, Send, Loader2, User } from 'lucide-react';

// Добавляем интерфейс для типизации пропсов
interface CreatePostProps {
  user: {
    id: string;
    user_metadata?: {
      username?: string;
    };
  } | null;
  onPostCreated: () => void | Promise<void>;
}

export default function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert([
        {
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          author_id: user.id,
        },
      ]);

      if (error) throw error;

      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      
      // Вызываем обновление ленты
      if (onPostCreated) await onPostCreated();
      
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      alert('Не удалось опубликовать пост');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0d0d0e] border border-[#28282b] rounded-[2.5rem] p-6 shadow-2xl mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1c] border border-white/5 flex items-center justify-center shrink-0">
            <User size={20} className="text-gray-600" />
          </div>
          <div className="flex-grow">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Что нового в мире игр?"
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-700 resize-none h-24 pt-2 text-sm font-medium"
            />
          </div>
        </div>

        {showImageInput && (
          <div className="relative group ml-16">
            <ImagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#8a2be2] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Вставьте ссылку на изображение..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[#161618] border border-[#28282b] rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:border-[#8a2be2] outline-none transition-all"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5 ml-16">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`flex items-center gap-2 text-[10px] font-black uppercase italic transition-all ${
              showImageInput ? 'text-[#8a2be2]' : 'text-gray-600 hover:text-white'
            }`}
          >
            <ImagePlus size={18} />
            {showImageInput ? 'Убрать фото' : 'Добавить фото'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-[#8a2be2] hover:bg-[#9d4edd] disabled:bg-gray-800 disabled:text-gray-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-[#8a2be2]/10 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}