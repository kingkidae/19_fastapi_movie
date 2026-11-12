import { useEffect, useRef, useState } from 'react'
import { img, year } from '../api'

const DURATION = 8000
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Hero({ items, genres, onOpen }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef(null)
  const item = items[index]
  const go = (d) => setIndex((i) => (i + d + items.length) % items.length)

  useEffect(() => {
    if (paused || reduced() || items.length < 2) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), DURATION)
    return () => clearTimeout(t)
  }, [index, paused, items.length])

  if (!item) return null

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="추천 작품"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }}
      onPointerDown={(e) => { if (e.pointerType === 'touch') startX.current = e.clientX }}
      onPointerUp={(e) => {
        if (startX.current === null) return
        const dx = e.clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      onPointerCancel={() => { startX.current = null }}
    >
      <div className="hero-stage" aria-hidden="true">
        {items.map((it, i) => (
          <img
            key={it.id}
            className={i === index ? 'is-active' : ''}
            src={img(it.backdrop, 'original')}
            alt=""
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      <div className="hero-body" key={item.id}>
        <p className="hero-meta">
          <span className="tag">{item.type === 'tv' ? '시리즈' : '영화'}</span>
          {item.genres.slice(0, 2).map((g) => genres[g] && <span key={g}>{genres[g]}</span>)}
          {year(item.date) && <span>{year(item.date)}</span>}
        </p>
        <h1 className="hero-title"><span>{item.title}</span></h1>
        {item.original !== item.title && <p className="hero-original">{item.original}</p>}
        <p className="hero-overview">{item.overview || '아직 한국어 줄거리가 등록되지 않았습니다.'}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onOpen(item, true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none" /></svg>
            예고편 보기
          </button>
          <button className="btn btn-ghost" onClick={() => onOpen(item)}>상세 정보</button>
        </div>
      </div>

      <div className="hero-nav">
        <button className="hero-arrow" aria-label="이전 작품" onClick={() => go(-1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="hero-dots" role="tablist" aria-label="추천 작품 선택">
          {items.map((it, i) => (
            <button
              key={it.id}
              role="tab"
              aria-selected={i === index}
              aria-label={it.title}
              className={i === index ? 'is-active' : ''}
              onClick={() => setIndex(i)}
            >
              <i />
            </button>
          ))}
        </div>
        <button className="hero-arrow" aria-label="다음 작품" onClick={() => go(1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  )
}
