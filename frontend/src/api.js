export const img = (path, size = 'w500') => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null)

export async function api(path, opts) {
  let res
  try {
    res = await fetch(`/api${path}`, opts)
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new Error('서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인해 주세요.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof body.detail === 'string' ? body.detail : '서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인해 주세요.')
  }
  return body
}

export const year = (date) => date?.slice(0, 4)

export function runtime(min) {
  if (!min) return null
  const h = Math.floor(min / 60)
  return h ? `${h}시간 ${min % 60}분` : `${min}분`
}
