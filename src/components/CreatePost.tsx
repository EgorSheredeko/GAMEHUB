"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendPost = async () => {
    if (!text.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from('posts')
      .insert([{ content: text, author_name: 'Казахстанский Игрок' }]);

    if (!error) {
      setText('');
      onPostCreated(); // Обновляем ленту без перезагрузки страницы
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-4">
      <textarea
        className="w-full bg-[#0a0a0a] border border-[#28282b] rounded-lg p-3 text-sm focus:border-[#8a2be2] outline-none transition-all"
        placeholder="Поделись игровым моментом или новостью..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <button 
          onClick={sendPost}
          disabled={loading}
          className="neo-button text-xs disabled:opacity-50"
        >
          {loading ? 'Публикация...' : 'ОПУБЛИКОВАТЬ'}
        </button>
      </div>
    </div>
  );
}