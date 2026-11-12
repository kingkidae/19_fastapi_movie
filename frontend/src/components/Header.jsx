import { useEffect, useRef, useState } from 'react'

const NAV = [['홈', 'top'], ['영화', 'now'], ['시리즈', 'tv'], ['개봉 예정', 'upcoming']]

export default function Header({ query, onQuery }) {
  const [solid, setSolid] = useState(false)
  const [searching, setSearching] = useState(false)
  const input = useRef(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { if (searching) input.current?.focus() }, [searching])

  const go = (id) => {
    onQuery('')
    if (id === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' })
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
  }

  const open = searching || query

  return (
    <header className={`header${solid || query ? ' is-solid' : ''}`}>
      <a className="logo" href="/" onClick={(e) => { e.preventDefault(); go('top') }}>MO<small>ti</small>VIE<small>te</small><i>.</i></a>
      <nav className="nav" aria-label="주요 메뉴">
        {NAV.map(([label, id]) => <button key={id} onClick={() => go(id)}>{label}</button>)}
      </nav>
      <form className={`search-box${open ? ' is-open' : ''}`} role="search" onSubmit={(e) => e.preventDefault()}>
        <button type="button" className="icon-btn" aria-label="검색" onClick={() => setSearching(true)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
        </button>
        <input
          ref={input}
          type="search"
          placeholder="영화·시리즈 제목으로 찾기"
          aria-label="작품 검색"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onBlur={() => !query && setSearching(false)}
          onKeyDown={(e) => e.key === 'Escape' && (onQuery(''), input.current.blur())}
        />
      </form>
    </header>
  )
}
