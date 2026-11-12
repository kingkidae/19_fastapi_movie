import { useEffect, useRef, useState } from 'react'
import { img, year } from '../api'

export function Card({ item, onOpen, rank }) {
  return (
    <button className={`card${rank ? ' card-ranked' : ''}`} onClick={() => onOpen(item)}>
      {rank && <span className="rank" aria-hidden="true">{rank}</span>}
      <span className="poster">
        <img src={img(item.poster, 'w342')} alt="" loading="lazy" decoding="async" />
        {item.rating > 0 && <span className="score">{item.rating.toFixed(1)}</span>}
      </span>
      <span className="card-title">{rank && <span className="sr-only">{rank}위 </span>}{item.title}</span>
      {!rank && <span className="card-sub">{year(item.date)}{item.type === 'tv' && ' 시리즈'}</span>}
    </button>
  )
}

export default function Row({ id, title, items, ranked, onOpen }) {
  const track = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const update = () => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 })
  }
  useEffect(update, [items])

  const page = (dir) => track.current.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })

  if (!items?.length) return null

  return (
    <section className={`row${ranked ? ' row-ranked' : ''}`} id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="row-title">{title}</h2>
      <div className="row-viewport">
        <button className="row-nav prev" aria-label={`${title} 이전`} hidden={edge.start} onClick={() => page(-1)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <div className="row-track" ref={track} onScroll={update}>
          {items.map((it, i) => <Card key={`${it.type}${it.id}`} item={it} onOpen={onOpen} rank={ranked ? i + 1 : null} />)}
        </div>
        <button className="row-nav next" aria-label={`${title} 다음`} hidden={edge.end} onClick={() => page(1)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  )
}
