import { useEffect, useRef, useState } from 'react'
import { api, img, runtime, year } from '../api'
import { Card, Stars } from './Row'

export default function Detail({ target, onClose, onOpen }) {
  const dialog = useRef(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [playing, setPlaying] = useState(target.play)

  useEffect(() => {
    const el = dialog.current
    el.showModal()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    setData(null)
    setError(null)
    setPlaying(target.play)
    dialog.current.scrollTo({ top: 0 })
    api(`/${target.type}/${target.id}`, { signal: ctrl.signal })
      .then(setData)
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
    return () => ctrl.abort()
  }, [target])

  const facts = data && [
    year(data.date),
    data.seasons ? `시즌 ${data.seasons}개` : runtime(data.runtime),
    ...data.genres.slice(0, 3),
  ].filter(Boolean)

  return (
    <dialog
      ref={dialog}
      className="detail"
      aria-label={data?.title || '작품 정보'}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <div className="detail-panel">
        <button className="icon-btn detail-close" aria-label="닫기" onClick={() => dialog.current.close()}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>

        {error && <p className="notice">{error}</p>}
        {!data && !error && <div className="detail-loading" aria-busy="true" />}

        {data && (
          <>
            <div className="detail-media">
              {playing && data.trailer ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${data.trailer}?autoplay=1&rel=0`}
                  title={`${data.title} 예고편`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <img src={img(data.backdrop || data.poster, 'w1280')} alt="" />
              )}
            </div>

            <div className="detail-body">
              <div className="detail-head">
                <h2 className="detail-title">{data.title}</h2>
                {data.original !== data.title && <p className="detail-original">{data.original}</p>}
                <ul className="facts">
                  {data.rating > 0 && <li className="facts-score"><small className="score-label">평점:</small>{data.rating.toFixed(1)}<Stars rating={data.rating} /></li>}
                  {facts.map((f) => <li key={f}>{f}</li>)}
                </ul>
                {data.trailer && (
                  <button className="btn btn-primary" onClick={() => setPlaying((p) => !p)}>
                    {playing ? '예고편 닫기' : '예고편 보기'}
                  </button>
                )}
              </div>

              <div className="detail-text">
                {data.tagline && <p className="tagline">{data.tagline}</p>}
                <p className="overview">{data.overview || '아직 한국어 줄거리가 등록되지 않았습니다.'}</p>
                {data.director && (
                  <p className="credit"><span>{data.type === 'tv' ? '제작' : '감독'}</span>{data.director}</p>
                )}
              </div>

              {data.cast.length > 0 && (
                <section className="detail-section">
                  <h3>출연</h3>
                  <ul className="cast">
                    {data.cast.map((c) => (
                      <li key={c.name + c.role}>
                        {c.photo ? <img src={img(c.photo, 'w185')} alt="" loading="lazy" /> : <span className="cast-empty">{c.name[0]}</span>}
                        <strong>{c.name}</strong>
                        {c.role && <span>{c.role}</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {data.similar.length > 0 && (
                <section className="detail-section">
                  <h3>비슷한 작품</h3>
                  <div className="grid grid-tight">
                    {data.similar.map((it) => <Card key={it.id} item={it} onOpen={onOpen} />)}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
