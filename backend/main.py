import asyncio
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

API_KEY = os.getenv("TMDB_API_KEY", "").strip()
ACCESS_TOKEN = os.getenv("TMDB_ACCESS_TOKEN", "").strip()
LANG = {"language": "ko-KR", "region": "KR"}

app = FastAPI(title="Movie API")
client = httpx.AsyncClient(base_url="https://api.themoviedb.org/3", timeout=10)


async def tmdb(path: str, **params):
    # v4 읽기 토큰이 있으면 헤더 인증, 없으면 v3 api_key 쿼리 인증
    if ACCESS_TOKEN:
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    elif API_KEY:
        headers, params = {}, {**params, "api_key": API_KEY}
    else:
        raise HTTPException(500, ".env에 TMDB_API_KEY 또는 TMDB_ACCESS_TOKEN을 넣어 주세요.")
    try:
        r = await client.get(path, params={**LANG, **params}, headers=headers)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"TMDB에 연결하지 못했습니다: {e}") from e
    if r.status_code == 401:
        raise HTTPException(500, "TMDB 키가 올바르지 않습니다. .env 값을 확인해 주세요.")
    if r.status_code == 404:
        raise HTTPException(404, "작품을 찾을 수 없습니다.")
    r.raise_for_status()
    return r.json()


def items(data, media=None):
    out = []
    for x in data.get("results", []):
        kind = media or x.get("media_type")
        if kind not in ("movie", "tv") or not x.get("poster_path"):
            continue
        out.append({
            "id": x["id"],
            "type": kind,
            "title": x.get("title") or x.get("name"),
            "original": x.get("original_title") or x.get("original_name"),
            "overview": x.get("overview"),
            "poster": x.get("poster_path"),
            "backdrop": x.get("backdrop_path"),
            "rating": round(x.get("vote_average") or 0, 1),
            "date": x.get("release_date") or x.get("first_air_date") or "",
            "genres": x.get("genre_ids", []),
        })
    return out


@app.get("/api/home")
async def home():
    rows = {
        "trending": ("/trending/all/week", None),
        "top": ("/trending/movie/day", "movie"),
        "now": ("/movie/now_playing", "movie"),
        "upcoming": ("/movie/upcoming", "movie"),
        "rated": ("/movie/top_rated", "movie"),
        "tv": ("/tv/popular", "tv"),
        "korean": ("/discover/movie", "movie"),
    }
    extra = {"korean": {"with_original_language": "ko", "sort_by": "popularity.desc"}}
    results = await asyncio.gather(*(tmdb(p, **extra.get(k, {})) for k, (p, _) in rows.items()))
    genres = await asyncio.gather(tmdb("/genre/movie/list"), tmdb("/genre/tv/list"))
    names = {g["id"]: g["name"] for gs in genres for g in gs["genres"]}
    return {
        "rows": {k: items(d, rows[k][1]) for k, d in zip(rows, results)},
        "genres": names,
    }


@app.get("/api/{kind}/{item_id}")
async def detail(kind: str, item_id: int):
    if kind not in ("movie", "tv"):
        raise HTTPException(404, "작품을 찾을 수 없습니다.")
    d = await tmdb(f"/{kind}/{item_id}", append_to_response="credits,videos,similar",
                   include_video_language="ko,en")
    videos = [v for v in d.get("videos", {}).get("results", [])
              if v.get("site") == "YouTube" and v.get("type") in ("Trailer", "Teaser")]
    crew = d.get("credits", {}).get("crew", [])
    return {
        "id": d["id"],
        "type": kind,
        "title": d.get("title") or d.get("name"),
        "original": d.get("original_title") or d.get("original_name"),
        "tagline": d.get("tagline"),
        "overview": d.get("overview"),
        "backdrop": d.get("backdrop_path"),
        "poster": d.get("poster_path"),
        "rating": round(d.get("vote_average") or 0, 1),
        "date": d.get("release_date") or d.get("first_air_date") or "",
        "runtime": d.get("runtime") or (d.get("episode_run_time") or [None])[0],
        "seasons": d.get("number_of_seasons"),
        "genres": [g["name"] for g in d.get("genres", [])],
        "director": next((c["name"] for c in d.get("created_by", [])), None)
                    or next((c["name"] for c in crew if c.get("job") == "Director"), None),
        "cast": [{"name": c["name"], "role": c.get("character"), "photo": c.get("profile_path")}
                 for c in d.get("credits", {}).get("cast", [])[:12]],
        "trailer": videos[0]["key"] if videos else None,
        "similar": items(d.get("similar", {}), kind)[:12],
    }


@app.get("/api/search")
async def search(q: str = Query(min_length=1, max_length=100)):
    return items(await tmdb("/search/multi", query=q, include_adult="false"))
