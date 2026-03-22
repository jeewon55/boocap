import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart3, Download } from 'lucide-react';

const MONTHS = [
'January', 'February', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December'];


function getDefaultMonth() {
  const now = new Date();
  let m = now.getMonth() - 1;
  let y = now.getFullYear();
  if (m < 0) {m = 11;y -= 1;}
  return { year: y, month: m };
}

export default function Landing() {
  const navigate = useNavigate();
  const { year: defYear, month: defMonth } = getDefaultMonth();
  const [year, setYear] = useState(defYear);
  const [month, setMonth] = useState(defMonth);
  const [showPicker, setShowPicker] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCreate = () => {
    navigate(`/create?year=${year}&month=${month}`);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-[100dvh] bg-hero flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <span className="font-display text-xl font-bold text-hero-foreground tracking-tight">
          BookRecap
        </span>
        <button
          onClick={handleCreate}
          className="text-xs font-body text-hero-sub hover:text-hero-foreground transition-colors tracking-wider uppercase">
          
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 md:px-12 lg:px-20 py-12 lg:py-0 max-w-7xl mx-auto w-full">
        {/* Left Column */}
        <div className="flex-1 max-w-xl space-y-8">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-hero-foreground">
            Visualize your{' '}
            <span className="text-hero-btn">intellectual growth.</span>
            <br />
            In one striking poster.
          </h1>

          <p className="text-base md:text-lg font-body text-hero-sub leading-relaxed max-w-md">
            Turn your monthly readings into a stunning data-driven trophy. Track, visualize, and share your reading journey.
          </p>

          {/* Input Group */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="h-14 px-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-hero-foreground font-body text-sm flex items-center gap-3 hover:bg-white/15 transition-colors min-w-[200px]">
                
                <BookOpen className="w-4 h-4 text-hero-btn flex-shrink-0" />
                <span>{MONTHS[month]} {year}</span>
              </button>

              {showPicker &&
              <div className="absolute top-full mt-2 left-0 bg-hero border border-white/20 rounded-2xl p-4 z-50 shadow-2xl min-w-[280px] animate-fade-in">
                  {/* Year selector */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {years.map((y) =>
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-body transition-colors ${
                    y === year ?
                    'bg-hero-btn text-hero-btn-foreground font-semibold' :
                    'text-hero-sub hover:text-hero-foreground hover:bg-white/10'}`
                    }>
                    
                        {y}
                      </button>
                  )}
                  </div>
                  {/* Month grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((m, i) =>
                  <button
                    key={m}
                    onClick={() => {setMonth(i);setShowPicker(false);}}
                    className={`px-2 py-2 rounded-xl text-xs font-body transition-colors ${
                    i === month && year === year ?
                    'bg-hero-btn text-hero-btn-foreground font-semibold' :
                    'text-hero-sub hover:text-hero-foreground hover:bg-white/10'}`
                    }>
                    
                        {m.slice(0, 3)}
                      </button>
                  )}
                  </div>
                </div>
              }
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCreate}
              className="h-14 px-8 bg-hero-btn text-hero-btn-foreground rounded-2xl font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]">
              
              Create My Recap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          













          
        </div>

        {/* Right Column — Poster Preview */}
        <div className="flex-shrink-0">
          <div
            className="relative transition-transform duration-700 ease-out"
            style={{
              transform: hovered ?
              'perspective(1000px) rotateY(-5deg) rotateX(3deg) translateY(-8px)' :
              'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            
            {/* Glow */}
            <div className="absolute -inset-6 bg-hero-btn/10 rounded-3xl blur-3xl transition-opacity duration-700"
            style={{ opacity: hovered ? 0.6 : 0.2 }} />

            {/* Card */}
            <div className="relative w-[280px] md:w-[320px] aspect-[4/5] bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
              {/* Mock poster content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Header */}
                <div>
                  <p className="text-hero-btn text-[10px] font-body tracking-[0.3em] uppercase">Monthly Recap</p>
                  <p className="text-hero-foreground font-display text-2xl font-black mt-1">
                    {MONTHS[month]}
                  </p>
                  <p className="text-hero-sub text-xs font-body">{year}</p>
                </div>

                {/* Book grid mock */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  {Array.from({ length: 6 }).map((_, i) =>
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-lg transition-all duration-500"
                    style={{
                      background: `hsl(${80 + i * 30}, ${40 + i * 8}%, ${25 + i * 5}%)`,
                      transform: hovered ? `translateY(${Math.sin(i * 1.2) * 4}px)` : 'translateY(0)',
                      transitionDelay: `${i * 60}ms`
                    }} />

                  )}
                </div>

                {/* Footer stats */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-hero-foreground font-display text-3xl font-black">6</p>
                    <p className="text-hero-sub text-[9px] font-body tracking-wider uppercase">books read</p>
                  </div>
                  <div className="flex gap-1">
                    {[20, 45, 30, 60, 50, 35].map((h, i) =>
                    <div
                      key={i}
                      className="w-2 bg-hero-btn/60 rounded-full transition-all duration-500"
                      style={{
                        height: hovered ? `${h}px` : `${h * 0.6}px`,
                        transitionDelay: `${i * 80}ms`
                      }} />

                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close picker on outside click */}
      {showPicker &&
      <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
      }
    </div>);

}