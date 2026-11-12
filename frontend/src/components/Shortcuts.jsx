import { useEffect, useRef, useState } from 'react'
import { img } from '../api'

// 줄 바로가기: [줄 id, 라벨, 원 안 글자(없으면 그 줄 첫 작품 포스터), 배경, N 배지]
const LINKS = [
  ['top', 'TOP 10', 'TOP10', 'radial-gradient(circle at 30% 25%, #f4ff9a, #d7ff00 45%, #7a9400)'],
  ['trending', '이번 주 화제작'],
  ['now', '지금 극장에서', null, null, true],
  ['tv', '인기 시리즈', 'SERIES', 'radial-gradient(circle at 30% 25%, #ff9ab8, #ff2d6f 50%, #a3004a)'],
  ['korean', '한국 영화'],
  ['upcoming', '공개예정', 'SOON', 'radial-gradient(circle at 30% 25%, #ffd27a, #ff8a00 50%, #c24a00)'],
  ['rated', '평점 높은 영화', 'BEST', 'radial-gradient(circle at 30% 25%, #c9a6ff, #7b3dff 50%, #3a0fa8)'],
]

// 줄 바로가기 사이에 끼워 넣는 개별 작품(누르면 상세): [줄 id, 순번, N 배지]
const PICKS = [['tv', 0], ['upcoming', 0, true], ['rated', 0], ['trending', 1], ['korean', 1]]

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Shortcuts({ rows, onOpen }) {
  const track = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const update = () => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 })
  }
  useEffect(update, [rows])

  const page = (dir) => track.current.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })

  const links = LINKS.map(([id, label, text, bg, badge]) => ({
    key: id, label, text, bg, badge, poster: !text && rows[id]?.[0]?.poster, onClick: () => go(id),
  }))
  const picks = PICKS.flatMap(([id, i, badge]) => {
    const it = rows[id]?.[i]
    return it ? [{ key: `${id}-${i}`, label: it.title, poster: it.poster, badge, onClick: () => onOpen(it) }] : []
  })
  const list = links.flatMap((l, i) => (picks[i] ? [l, picks[i]] : [l]))

  return (
    <nav className="row-viewport shortcuts-viewport" aria-label="바로가기">
      <button className="row-nav prev" aria-label="바로가기 이전" hidden={edge.start} onClick={() => page(-1)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
      </button>
      <div className="shortcuts" ref={track} onScroll={update}>
        {list.map(({ key, label, text, bg, badge, poster, onClick }) => (
          <button key={key} className="shortcut" onClick={onClick}>
            <span className="shortcut-icon" style={bg ? { background: bg } : undefined}>
              {text ? <b>{text}</b> : poster && <img src={img(poster, 'w185')} alt="" loading="lazy" decoding="async" />}
              {badge && <i aria-hidden="true">N</i>}
            </span>
            <span className="shortcut-label">{label}</span>
          </button>
        ))}
      </div>
      <button className="row-nav next" aria-label="바로가기 다음" hidden={edge.end} onClick={() => page(1)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
      </button>
    </nav>
  )
}
