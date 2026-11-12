# MOtiVIEte

TMDB 데이터로 영화·시리즈를 둘러보는 웹 앱. 백엔드는 FastAPI, 프론트는 React(Vite).

## 준비

루트의 `.env`에 TMDB 키를 넣는다. 둘 중 하나만 있어도 된다.

```
TMDB_API_KEY=...          # API 키 (v3)
TMDB_ACCESS_TOKEN=...     # API 읽기 액세스 토큰 (v4)
```

## 실행

```bash
# 모든 명령은 프로젝트 루트에서 실행한다 (backend 폴더 안에서는 실행되지 않음)

# 처음 한 번 설치
python -m venv backend\.venv
backend\.venv\Scripts\pip install -r backend\requirements.txt
npm install
npm --prefix frontend install

# 백엔드(http://127.0.0.1:8000) + 프론트(http://localhost:5173) 동시 실행
npm run dev

# 따로 실행하려면
npm run backend
npm run frontend
```

## 배포 (AWS EC2 + Docker)

서버 `15.165.113.4`에서 `docker compose`로 `web`(nginx + 빌드된 프론트)과 `backend`(FastAPI) 컨테이너를 실행한다. TMDB 키는 서버의 `~/19_fastapi_movie/.env`에만 있다.

- **자동**: `master`에 push하면 GitHub Actions가 서버의 `deploy.sh`를 실행한다 (Secrets `EC2_HOST`, `EC2_SSH_KEY` 필요).
- **수동**: push 후 루트에서 `npm run deploy`.

`deploy.sh`는 `git pull` → `docker compose up -d --build` → 옛 이미지 정리를 한다.

## API

| 경로 | 내용 |
|---|---|
| `GET /api/home` | 홈 화면의 모든 줄(트렌딩, TOP 10, 상영작, 개봉 예정, 평점순, 인기 시리즈, 한국 영화)과 장르 이름 |
| `GET /api/{movie\|tv}/{id}` | 상세 정보, 출연진, 예고편, 비슷한 작품 |
| `GET /api/search?q=` | 영화·시리즈 제목 검색 |
