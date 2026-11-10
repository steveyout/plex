import React, { useState } from 'react';
import { useBrand } from '../utils/brand';
import { Sparkles, ShieldCheck, Zap, Globe, ChevronDown, Film, Tv } from 'lucide-react';

interface SEOSectionProps {
  onSelectGenre?: (genreId: number) => void;
}

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 878, name: 'Sci-Fi' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
];

export const SEOSection: React.FC<SEOSectionProps> = ({ onSelectGenre }) => {
  const brand = useBrand();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: '1080p & 4K Ultra HD Quality',
      desc: 'Crystal-clear video fidelity with premium surround sound across mobile, desktop, tablet, and smart TV screens.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Zero Ads & 100% Free Forever',
      desc: 'Experience pure, distraction-free movie and TV series streaming without popups, redirects, or subscription fees.',
    },
    {
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      title: 'Fast Buffer-Free Servers',
      desc: 'Redundant global content delivery nodes ensure instant playback start and seamless binge-watching.',
    },
    {
      icon: <Globe className="w-5 h-5 text-purple-400" />,
      title: 'Multi-Language Subtitles',
      desc: 'Accurate closed captions and multi-language subtitle tracks for foreign cinema and international TV series.',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="mt-16 mb-12 pt-10 border-t border-white/10 px-4 sm:px-6 max-w-7xl mx-auto select-text">
      {/* Semantic Title & Brand Pitch */}
      <div className="text-center max-w-4xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-white/80">
          <Film className="w-3.5 h-3.5" style={{ color: brand.accentColor }} />
          <span>Official {brand.name} Platform</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white/95 to-white/75">
          {brand.headingText}
        </h1>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-3xl mx-auto">
          {brand.introText}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              {feat.icon}
            </div>
            <h2 className="text-sm font-semibold text-white mb-1.5">{feat.title}</h2>
            <p className="text-xs text-white/60 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Popular Genres Internal Links */}
      <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Tv className="w-4 h-4" style={{ color: brand.accentColor }} />
          Explore Movies &amp; TV Series by Genre
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mb-5">
          Looking for something specific? Browse our curated library categorized by popular genres:
        </p>
        <div className="flex flex-wrap gap-2.5">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onSelectGenre && onSelectGenre(genre.id)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer"
            >
              {genre.name} Movies
            </button>
          ))}
        </div>
      </div>

      {/* Interactive FAQ Section with Schema-Compliant Microdata */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Frequently Asked Questions about {brand.name}
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Everything you need to know about streaming on {brand.domain}
          </p>
        </div>

        <div className="space-y-3">
          {brand.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer"
                aria-expanded={openFaq === idx}
              >
                <span className="text-sm font-semibold text-white/90">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/50 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
