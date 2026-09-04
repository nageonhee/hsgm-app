# ============================================
# 1단계: 의존성 설치 (Dependencies)
# ============================================
FROM node:20-slim AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================
# 2단계: 빌드 (Builder)
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 시 필요한 환경변수 (NEXT_PUBLIC_* 은 빌드 타임에 필요)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Next.js 빌드 (standalone 모드)
RUN npm run build

# ============================================
# 3단계: 실행 환경 (Runner)
# ============================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# standalone 서버 복사
COPY --from=builder /app/.next/standalone ./
# 정적 파일 복사
COPY --from=builder /app/.next/static ./.next/static
# public 폴더 복사
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
