import { useEffect, useState } from 'react'
import { api } from './api'
import Header from './components/Header'
import Hero from './components/Hero'
import Row, { Card } from './components/Row'
import Detail from './components/Detail'

const ROWS = [
  ['top', '오늘의 영화 TOP 10', true],
  ['trending', '이번 주 많이 본 콘텐츠'],
  ['now', '지금 극장에서'],
  ['tv', '인기 시리즈'],
  ['korean', '한국 영화 인기작'],
  ['upcoming', '곧 개봉해요'],
  ['rated', '평점이 높은 영화'],
]

export default function App() {
  const [home, setHome] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [open, setOpen] = useState(null) // { type, id, play }

  const load = () => {
    setError(null)
    api('/home').then(setHome).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  useEffect(() => {
    const q = query.trim()
    if (!q) return setResults(null)
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      api(`/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then(setResults)
        .catch((e) => e.name !== 'AbortError' && setResults([]))
    }, 300)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

  const openItem = (item, play = false) => setOpen({ type: item.type, id: item.id, play })

  return (
    <>
      <Header query={query} onQuery={setQuery} />
      <main>
        {error ? (
          <div className="notice">
            <p>{error}</p>
            <button className="btn btn-ghost" onClick={load}>다시 불러오기</button>
          </div>
        ) : query.trim() ? (
          <section className="search">
            <h1 className="search-title">
              ‘{query.trim()}’ 검색 결과 {results && <span>{results.length}편</span>}
            </h1>
            {results?.length === 0 && <p className="muted">일치하는 작품이 없습니다. 철자를 확인하거나 다른 제목으로 찾아보세요.</p>}
            <div className="grid">
              {results?.map((it) => <Card key={`${it.type}${it.id}`} item={it} onOpen={openItem} />)}
            </div>
          </section>
        ) : !home ? (
          <Skeleton />
        ) : (
          <>
            <Hero items={home.rows.trending.filter((x) => x.backdrop).slice(0, 6)} genres={home.genres} onOpen={openItem} />
            <div className="rows">
              {ROWS.map(([key, title, ranked]) => (
                <Row key={key} id={key} title={title} items={ranked ? home.rows[key].slice(0, 10) : home.rows[key]} ranked={ranked} onOpen={openItem} />
              ))}
            </div>
            <footer className="footer">
              <span className="logo">MO<small>ti</small>VIE<small>te</small><i>.</i></span>
              <p>작품 정보와 이미지는 TMDB에서 제공받습니다. 이 서비스는 TMDB의 승인이나 인증을 받지 않았습니다.</p>
            </footer>
          </>
        )}
      </main>
      {open && <Detail target={open} onClose={() => setOpen(null)} onOpen={openItem} />}
    </>
  )
}

function Skeleton() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="불러오는 중">
      <div className="sk-hero" />
      <div className="sk-row">{Array.from({ length: 7 }, (_, i) => <div key={i} />)}</div>
    </div>
  )
}
