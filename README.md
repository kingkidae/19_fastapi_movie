# reel

TMDB 데이터로 영화·시리즈를 둘러보는 웹 앱. 백엔드는 FastAPI, 프론트는 React(Vite).

## 준비

루트의 `.env`에 TMDB 키를 넣는다. 둘 중 하나만 있어도 된다.

```
TMDB_API_KEY=...          # API 키 (v3)
TMDB_ACCESS_TOKEN=...     # API 읽기 액세스 토큰 (v4)
```

## 실행

```bash
# 백엔드 (http://127.0.0.1:8000)
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn main:app --reload

# 프론트 (http://localhost:5173, /api 요청은 백엔드로 프록시)
cd frontend
npm install
npm run dev
```

## API

| 경로 | 내용 |
|---|---|
| `GET /api/home` | 홈 화면의 모든 줄(트렌딩, TOP 10, 상영작, 개봉 예정, 평점순, 인기 시리즈, 한국 영화)과 장르 이름 |
| `GET /api/{movie\|tv}/{id}` | 상세 정보, 출연진, 예고편, 비슷한 작품 |
| `GET /api/search?q=` | 영화·시리즈 제목 검색 |
