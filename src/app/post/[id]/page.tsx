"use client"
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, Heart, MessageSquare, Send, 
  Loader2, User, Trash2, Reply, X, AlertCircle
} from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  const fetchAllData = useCallback(async (currentUserId?: string) => {
    if (!id) return;
    const numericId = Number(id);

    try {
      // 1. Загружаем пост
      const { data: posts } = await supabase.from('posts').select(`*, profiles:author_id(username, avatar_url)`).eq('id', numericId);
      if (!posts || posts.length === 0) {
        setPost(null);
        setLoading(false);
        return;
      }

      // 2. Лайки поста
      const { count: postLikesCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', numericId);

      // 3. КОММЕНТАРИИ: Загружаем ТОЛЬКО таблицу comments (без джойнов profiles)
      // Это исключит ошибку {}, если связи в базе настроены криво
      const { data: commData, error: commError } = await supabase
        .from('comments')
        .select('*') 
        .eq('post_id', numericId)
        .order('created_at', { ascending: true });

      if (commError) throw commError;

      const rawComments = commData || [];

      // 4. Обогащаем комментарии (Лайки + Профили по отдельности)
      const enrichedComments = await Promise.all(rawComments.map(async (c) => {
        // Загружаем профиль автора комментария
        const { data: prof } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', c.user_id)
          .single();

        // Загружаем лайки этого комментария
        const { count: cLikes } = await supabase
          .from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', c.id);

        let userLikedComment = false;
        if (currentUserId) {
          const { data: hasLiked } = await supabase
            .from('comment_likes')
            .select('*')
            .eq('comment_id', c.id)
            .eq('user_id', currentUserId)
            .maybeSingle();
          userLikedComment = !!hasLiked;
        }

        return { 
          ...c, 
          profiles: prof || { username: 'Gamer', avatar_url: null },
          like_count: cLikes || 0, 
          user_has_liked: userLikedComment 
        };
      }));

      setPost({ ...posts[0], likes_count: postLikesCount || 0 });
      setComments(enrichedComments);
    } catch (err) {
      console.error("Критическая ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      setUser(activeUser);
      fetchAllData(activeUser?.id);
    };
    init();
  }, [id, fetchAllData]);

  const handlePostLike = async () => {
    if (!user) return alert("Войдите!");
    const { data: existing } = await supabase.from('likes').select('*').eq('user_id', user.id).eq('post_id', post.id).maybeSingle();
    if (existing) await supabase.from('likes').delete().eq('id', existing.id);
    else await supabase.from('likes').insert({ user_id: user.id, post_id: post.id });
    fetchAllData(user.id);
  };

  const handleCommentLike = async (commentId: number) => {
    if (!user) return;
    const { data: existing } = await supabase.from('comment_likes').select('*').eq('user_id', user.id).eq('comment_id', commentId).maybeSingle();
    if (existing) await supabase.from('comment_likes').delete().eq('id', existing.id);
    else await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId });
    fetchAllData(user.id);
  };

  const sendComment = async () => {
    if (!user || !commentText.trim()) return;
    setIsSending(true);
    await supabase.from('comments').insert({
      post_id: Number(id),
      user_id: user.id,
      content: replyTo ? `@${replyTo.profiles?.username || 'Gamer'}, ${commentText.trim()}` : commentText.trim(),
      parent_id: replyTo?.id || null
    });
    setCommentText('');
    setReplyTo(null);
    fetchAllData(user.id);
    setIsSending(false);
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-[#8a2be2]" size={40} /></div>;
  if (!post) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 uppercase font-black italic">Пост не найден</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-all">
          <ChevronLeft size={20} /> <span className="text-[10px] font-black uppercase italic tracking-widest">Назад в ленту</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* ПОСТ */}
            <article className="bg-[#0d0d0e] border border-[#28282b] rounded-[2.5rem] p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1c] border border-[#8a2be2]/30 overflow-hidden flex items-center justify-center">
                  {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : <User className="text-[#8a2be2]" />}
                </div>
                <div>
                  <h1 className="font-black uppercase italic text-sm">{post.profiles?.username || 'Gamer'}</h1>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-lg text-gray-200 mb-6 whitespace-pre-wrap">{post.content}</div>
              {post.image_url && <img src={post.image_url} className="w-full rounded-[2rem] border border-[#28282b] mb-6" />}
              <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                <button onClick={handlePostLike} className="flex items-center gap-2 text-[10px] font-black italic uppercase transition-colors hover:text-red-500">
                  <Heart size={20} className={post.likes_count > 0 ? "fill-red-500 text-red-500" : "text-gray-500"} /> {post.likes_count}
                </button>
                <div className="flex items-center gap-2 text-[10px] font-black italic uppercase text-gray-500">
                  <MessageSquare size={20} /> {comments.length}
                </div>
              </div>
            </article>

            {/* ВВОД */}
            <section className="space-y-4">
              <div className="flex justify-between items-center ml-4">
                <h2 className="text-[10px] font-black uppercase italic tracking-[0.4em] text-[#8a2be2]">Обсуждение</h2>
                {replyTo && <button onClick={() => setReplyTo(null)} className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1">Отмена <X size={12}/></button>}
              </div>
              {user ? (
                <div className="bg-[#0d0d0e] border border-[#28282b] rounded-[2rem] p-4 flex gap-4 items-end">
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={replyTo ? `Ответ для ${replyTo.profiles?.username || 'Gamer'}...` : "Ваш ответ..."} className="flex-grow bg-transparent border-none outline-none text-sm p-3 resize-none h-24 text-gray-300" />
                  <button onClick={sendComment} disabled={isSending || !commentText.trim()} className="bg-[#8a2be2] p-5 rounded-2xl hover:bg-[#9d4edd] transition-all">
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </div>
              ) : <div className="p-8 bg-[#0d0d0e]/50 border border-dashed border-[#28282b] rounded-[2rem] text-center text-[10px] text-gray-600 font-black uppercase italic">Войдите, чтобы ответить</div>}
            </section>

            {/* СПИСОК */}
            <div className="space-y-4">
              {comments.length > 0 ? comments.map((comment) => (
                <div key={comment.id} className={`bg-[#0a0a0b] border border-[#28282b] p-6 rounded-[2rem] group transition-all hover:border-[#8a2be2]/20 ${comment.parent_id ? 'ml-10 border-l-[#8a2be2]/40' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1c] border border-white/5 flex items-center justify-center overflow-hidden">
                      {comment.profiles?.avatar_url ? <img src={comment.profiles.avatar_url} /> : <User size={14} className="text-gray-800"/>}
                    </div>
                    <span className="text-[11px] font-black uppercase italic text-[#8a2be2]">{comment.profiles?.username || 'Gamer'}</span>
                    <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setReplyTo(comment)} className="text-gray-600 hover:text-white"><Reply size={14}/></button>
                      {user?.id === comment.user_id && <button onClick={async () => { if(confirm("Удалить?")) { await supabase.from('comments').delete().eq('id', comment.id); fetchAllData(user.id); } }} className="text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 pl-11 mb-4">{comment.content}</p>
                  <div className="pl-11 flex items-center gap-4">
                    <button onClick={() => handleCommentLike(comment.id)} className="flex items-center gap-1.5 text-[10px] font-black uppercase italic">
                      <Heart size={14} className={comment.user_has_liked ? "fill-red-500 text-red-500" : "text-gray-700"} /> {comment.like_count}
                    </button>
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-20 text-[10px] font-black uppercase italic tracking-[.5em]">Тишина в чате...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}