# 빌드 컨텍스트는 프로젝트 루트: `backend.main:app`으로 실행해야 하기 때문
FROM python:3.13-slim
WORKDIR /app
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ backend/
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
