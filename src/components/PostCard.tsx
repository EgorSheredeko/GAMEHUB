"use client"
import { Trash2, User, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PostCard({ post, currentUserId, onDelete }: any) {
  // Корзина появится только если ID залогиненного юзера совпадает с ID автора поста
  const isAuthor = currentUserId === post.author_id;

  const handleDelete = async () => {
    if (!confirm('Удалить этот пост?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      alert("Ошибка: " + error.message);
    } else {
      onDelete(); // Обновляем список постов
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden mb-4 transition-all hover:border-[#222]">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111] border border-[#222] rounded-full flex items-center justify-center text-[#8a2be2]">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-tight">
                {post.author_name || 'Gamer'}
              </h3>
              <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1 font-bold">
                <Calendar size={10} /> {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* КНОПКА УДАЛЕНИЯ */}
          {isAuthor && (
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>
    </div>
  );
}