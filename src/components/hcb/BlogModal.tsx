import { useState, useMemo } from 'react';
import { X, Search, ChevronLeft, BookOpen } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from '@/data/blog';

interface BlogModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BlogModal({ open, onClose }: BlogModalProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.searchTerms.some((term) => term.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categoryLabel = BLOG_CATEGORIES.find((c) => c.id === selectedCategory)?.label;

  return (
    <Dialog.Root open={open} onOpenChange={(newOpen) => { if (!newOpen) { onClose(); setSelectedPost(null); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-[71] flex items-center justify-center p-4 outline-none sm:p-8"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close blog" />
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-espresso/15 bg-gradient-to-r from-[#005A9C] to-[#0047B5] px-6 py-5 sm:px-8">
              {selectedPost ? (
                <>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="inline-flex items-center gap-2 text-white hover:opacity-80 transition"
                    aria-label="Back to posts"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="text-sm font-semibold">Back</span>
                  </button>
                  <Dialog.Title className="text-lg font-bold text-white flex-1 line-clamp-1">
                    {selectedPost.title}
                  </Dialog.Title>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-white" />
                    <Dialog.Title className="text-lg font-bold text-white">
                      Pool Service Guide
                    </Dialog.Title>
                  </div>
                </>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white/20 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedPost ? (
                // Post Detail View
                <article className="max-w-3xl mx-auto px-6 py-8 sm:px-8">
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#005A9C]/10 text-[#005A9C] text-xs font-semibold uppercase tracking-wide mb-4">
                      {BLOG_CATEGORIES.find((c) => c.id === selectedPost.category)?.label}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-espresso mb-4">
                      {selectedPost.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-espresso/65">
                      <span>{selectedPost.readTime} min read</span>
                      <span>•</span>
                      <span>{selectedPost.category}</span>
                    </div>
                  </div>

                  <div
                    className="prose prose-sm sm:prose max-w-none text-espresso/80 leading-relaxed
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-espresso [&_h2]:mt-8 [&_h2]:mb-4
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-espresso [&_h3]:mt-6 [&_h3]:mb-3
                    [&_strong]:text-espresso [&_strong]:font-semibold
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                    [&_li]:text-espresso/80
                    [&_code]:bg-cream [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
                    "
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(selectedPost.content) }}
                  />

                  {/* CTA Section */}
                  <div className="mt-12 pt-8 border-t border-espresso/15">
                    <div className="bg-gradient-to-r from-[#005A9C]/10 to-transparent rounded-xl p-6 sm:p-8">
                      <h3 className="text-lg font-bold text-espresso mb-3">
                        Ready to take action?
                      </h3>
                      <p className="text-espresso/75 mb-5">
                        Get professional pool service from J & A Pools LLC. We're available for consultation, estimates, and immediate service needs.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href="#contact"
                          onClick={onClose}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#005A9C] text-white font-semibold hover:bg-[#0047B5] transition"
                        >
                          Schedule Service
                        </a>
                        <a
                          href="tel:+14806887254"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#005A9C] text-[#005A9C] font-semibold hover:bg-[#005A9C]/5 transition"
                        >
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ) : (
                // Post List View
                <div className="p-6 sm:p-8">
                  {/* Search Bar */}
                  <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-espresso/40 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search pool service guides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-espresso/20 focus:border-[#005A9C] focus:outline-none focus:ring-2 focus:ring-[#005A9C]/20 transition"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="mb-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        !selectedCategory
                          ? 'bg-[#005A9C] text-white'
                          : 'bg-cream text-espresso hover:bg-espresso/10'
                      }`}
                    >
                      All Topics
                    </button>
                    {BLOG_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                          selectedCategory === category.id
                            ? 'bg-[#005A9C] text-white'
                            : 'bg-cream text-espresso hover:bg-espresso/10'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>

                  {/* Post Grid */}
                  {filteredPosts.length > 0 ? (
                    <div className="grid gap-4 sm:gap-5">
                      {filteredPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="group text-left p-5 sm:p-6 rounded-xl border border-espresso/10 bg-cream/50 hover:border-[#005A9C] hover:bg-[#005A9C]/5 transition"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="inline-block px-2 py-1 rounded-full bg-[#005A9C]/10 text-[#005A9C] text-xs font-semibold uppercase mb-2">
                                {BLOG_CATEGORIES.find((c) => c.id === post.category)?.label}
                              </div>
                              <h3 className="text-lg font-bold text-espresso group-hover:text-[#005A9C] transition line-clamp-2">
                                {post.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-sm text-espresso/75 line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-espresso/50 font-medium">
                              {post.readTime} min read
                            </span>
                            <span className="text-[#005A9C] font-semibold group-hover:translate-x-1 transition">
                              Read →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-espresso/20 mx-auto mb-4" />
                      <p className="text-espresso/60 font-medium">No posts found matching your search.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Simple markdown to HTML converter
function parseMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<)(.+)$/gm, (match, p1) => {
      if (!match.startsWith('<')) return `<p>${match}</p>`;
      return match;
    })
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/(<\/ul>)<ul>/g, '');

  return html;
}
