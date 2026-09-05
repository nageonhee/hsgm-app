# HSGM (Home Smart Green Manager)

<div align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</div>

<br />

> **제조사 구분 없이 하나로 통합된 가전 관리, 실시간 원(₩) 단위 전력 모니터링, 누진세 시뮬레이션, 만능 IoT 리모컨 및 멀티모달 AI 고장 진단 & A/S 플랫폼**

---

## 📖 핵심 문제 정의 (Problem Statement)

현대 가정에서는 제조사(삼성, LG 등)별로 스마트홈 앱이 파편화되어 있어 다음과 같은 치명적인 불편을 겪고 있습니다:
1. **흩어진 가전 정보**: 각 제조사 앱을 따로 켜야 해서 전체 가전의 상태를 한눈에 파악하기 어렵습니다.
2. **난해한 전력 단위**: 단순 W, kWh 수치는 실제 내가 내야 할 전기요금과 직결되지 않아 체감이 어렵습니다.
3. **노후화된 효율 등급 기준의 혼선**: 5~10년 전 출시 당시 1등급 가전이 현재 강화된 기준으로는 3~4등급으로 전력을 과소비하고 있음에도 사용자는 이를 인지하기 어렵습니다.
4. **소모품 및 고장/A/S 관리의 번거로움**: 에러 코드 발생 시 매뉴얼을 찾기 어렵고 제조사별 출장 A/S 접수가 분절되어 있습니다.
---

## ✨ 핵심 기능 (Key Features)

### 1. 🏠 미니멀 홈 대시보드 (`/dashboard`)
- **딥 블랙 테마**: 순수 딥 블랙(`#000000`) 배경에 일렉트릭 블루 액센트를 적용한 프리미엄 UI (라이트 모드 완벽 호환 및 와트 뱃지 색상 자동 연동).
- **원(₩) 단위 요금 중심 표기**: 난해한 W/kWh 대신 **`₩35,600 /월`** 형태로 직관적인 예상 요금 표시.
- **인터랙티브 기기 히어로 뷰어**: 가전 종류별 실시간 전력 상태 조회 및 개별 제어.
- **스마트 핀(Pin) 기능**: 메인에 고정할 기기를 선택할 수 있으며, 고정된 기기가 없을 경우 전력 소모량(요금) 1위 기기를 자동으로 노출.

### 2. ⚡ 전력 모니터링 & 누진세 시뮬레이션 (`/energy`)
- **단일 메인 차트 연동**: `점유율 그래프(기본)`와 `시간대별 추이 그래프`를 단일 탭으로 전환.
- **가전 랭킹 클릭 실시간 필터링**: 하단 전기 먹는 하마 랭킹에서 특정 가전을 누르면 상단 차트가 해당 가전의 전력 추이로 즉시 전환.
- **한전 누진세 방어 예측**: 주말 가동 시 누진 단계 돌파 예상일 및 요금 폭탄 방어 시뮬레이션.

### 3. 📱 만능 IoT 통합 스마트 리모컨 (`/remote`)
- **스마트 드롭다운 셀렉터**: 수십 대의 가전도 드롭다운 직관적 아이콘(위아래 화살표) 셀렉터로 1초 만에 전환. (긴 기기명 자동 말줄임표 처리로 레이아웃 깨짐 방지)
- **기기별 맞춤형 물리 컨트롤러**:
  - 에어컨: 희망온도 `+/-`, 냉방/제습/송풍, 바람 세기.
  - TV: 볼륨/채널 컨트롤러, 4방향 D-Pad, OK 버튼, OTT 원터치 바로가기.
  - 청소기/공기청정기: 원터치 청소 시작/도크 복귀.

### 4. 🤖 실시간 스트리밍 AI 진단 & 코칭 (`/coaching`)
- **멀티모달 고장 진단 & 공식 A/S 연결**: 카메라로 에러 코드를 비추거나 영상/사진을 업로드하면 Vision AI가 실시간 분석하여 원인 파악 및 조치법(RAG)을 제공.
- **제품 라벨 스캔 및 자동 기기 등록**: 가전제품 명판(라벨) 스캔 시 모델명, 연식, 전력 스펙을 완벽한 DB 포맷(JSON Schema)으로 자동 추출하여 즉시 인벤토리에 등록.
- **에너지 절약 솔루션 원스톱 처리**: "에어컨 1도 올리면?", "주말 종일 틀면?" 등 대화형 질의응답을 스트리밍 렌더링.

### 5. 🏷️ 가전 인벤토리 & 효율 등급 환산 (`/devices`)
- **에너지 등급 강화 환산 시스템**: 출시 당시 기준과 2026년 현행 강화 기준을 비교 분석하여 교체 필요성 제시.
- **상세 하드웨어 스펙 그리드**: 냉방면적, 정격 용량, 소비전력, 모터/컴프레서 정보 제공.
- **소모품 최저가 구매 링크 연동**: 필터, 먼지봉투 등 교체 주기 알림 및 최저가 쇼핑몰 연결.

---

## 📝 시스템 프롬프트 및 응답 스키마 (System Prompt & Schema)

이 프로젝트의 프론트엔드는 백엔드 AI 모델(GPT-4 등)과 통신할 수 있도록 설계되었습니다. 
AI 모델에 주입해야 할 **시스템 프롬프트(System Prompt)는 `prompts/system_prompt.md` 파일에 통합되어 관리**됩니다.

특히 사용자가 **카메라 뷰파인더로 에러 사진을 촬영하여 전송(고장 진단)**했을 경우, 프론트엔드는 AI로부터 아래와 같은 **JSON 포맷의 응답**을 기대하며, 이를 파싱하여 시각적인 A/S 예약 카드 UI로 렌더링합니다. (해당 내용은 시스템 프롬프트에도 명시되어 있습니다.)

```json
{
  "isDiagnosis": true,
  "diagnosisResult": {
    "code": "식별된 에러코드 (예: dE) 또는 시각 분석 상태 요약 (예: 누수 감지)",
    "device": "대상 기기명 (예: LG 트롬 세탁기)",
    "cause": "에러 발생 원인",
    "solution": "사용자가 직접 할 수 있는 1차 자가 조치법",
    "phone": "해당 제조사 A/S 센터 전화번호",
    "asUrl": "해당 제조사 A/S 예약 웹사이트 URL"
  },
  "content": "사진을 분석했습니다. 아래 진단 결과를 확인해 주세요."
}
```

또한, 사용자가 **새로운 가전 기기의 제품 라벨(명판) 사진을 스캔하여 등록**하려고 할 경우, 모델명과 성능 제원을 자동으로 추출하여 아래의 JSON 포맷으로 반환해야 합니다.

```json
{
  "isRegistration": true,
  "registrationData": {
    "name": "기본 기기 이름 (예: LG 트롬 드럼 세탁기)",
    "category": "air_conditioner | refrigerator | washer | tv | cooker | air_purifier | robot_cleaner",
    "brand": "제조사 (예: LG전자)",
    "model": "추출된 제품 번호/모델명 (예: FX24GNB)",
    "icon": "AirVent | Refrigerator | WashingMachine | Tv | Utensils | Wind | Disc",
    "releaseEnergyGrade": 1,
    "releaseYear": "2019",
    "isSmartControl": true,
    "controlType": "wifi | none",
    "specs": {
      "capacity": "24kg (제품군에 따라 area, screenSize 등으로 유동적)",
      "powerConsumption": "350Wh/회 또는 1800W"
    },
    "asInfo": {
      "center": "해당 제조사 서비스센터 이름",
      "phone": "A/S 연락처 (예: 1544-7777)",
      "siteUrl": "A/S 접수 웹사이트 URL",
      "warrantyPeriod": "추론된 보증기간 (예: 모터 10년)"
    }
  },
  "content": "제품 라벨을 성공적으로 스캔했습니다. 기기를 등록할까요?"
}
```

---

## 🛠️ 기술 스택 (Tech Stack)

| 영역 | 기술 |
|---|---|
| **Framework** | **Next.js 16 (App Router, Turbopack)** |
| **Language** | **JavaScript (ES Modules)**, React 19 |
| **Styling** | **Tailwind CSS v4**, CSS Variables, Lucide Icons |
| **Database & Auth** | **Supabase (PostgreSQL, Row Level Security, Auth SSR)** |
| **Charts & Data Viz** | **Recharts** (Interactive Area/Donut/Bar Chart) |
| **Vision & Camera** | **HTML5 `navigator.mediaDevices.getUserMedia`** |
| **AI Streaming** | **Vercel AI SDK**, Custom Safe Markdown Parser |
| **PWA** | Web App Manifest, Cache-free Network First Service Worker |

---

## 📁 프로젝트 폴더 구조

```
HSGM/
├── app/
│   ├── api/coaching/route.js    # AI 코칭 & 매뉴얼 RAG 스트리밍 엔드포인트
│   ├── auth/                    # Supabase Auth 로그인 & 회원가입
│   ├── coaching/                # 대화형 AI 진단 & 코칭 (고장 진단 스캐너 포함)
│   │   └── routines/            # 맞춤형 에코 루틴(자동화) 설정
│   ├── dashboard/               # 메인 요금 중심 대시보드
│   ├── devices/                 # 가전 인벤토리, 상세 스펙, 카메라 스캔 등록
│   ├── energy/                  # 실시간 전력 점유율/추이 차트 및 누진세 예측
│   ├── remote/                  # 드롭다운 기반 만능 IoT 스마트 리모컨
│   ├── social/                  # 이웃 비교 소셜 리포트
│   ├── globals.css              # 딥 블랙 테마 & 스크롤바 제어
│   └── layout.js                # 루트 레이아웃 (Providers 연동)
├── components/
│   ├── coaching/                # 진단 스캐너 모달(DiagnosisScannerModal) 및 마크다운 렌더러
│   ├── dashboard/               # 히어로 비주얼 컨트롤러(DynamicDashboard) 및 각종 위젯
│   ├── layout/                  # AppShell, Header, SideNav(PC 고정), BottomNav(모바일 하단 탭)
│   └── ui/                      # Base UI 기반 모던 UI 컴포넌트
├── contexts/                    # AuthContext, DeviceContext (전역 상태 관리)
├── data/                        # 가전/에너지/소셜 Mock 데이터셋
├── prompts/                     # LLM 연동용 시스템 프롬프트 (JSON 스키마 정의 포함)
│   └── system_prompt.md         # AI 진단 어시스턴트 메인 프롬프트
├── services/                    # Supabase DB 연동 및 Fallback 서비스 레이어
└── supabase/schema.sql          # PostgreSQL RLS 데이터베이스 스키마
```

---

## 🚀 시작하기 (Getting Started)

### 1. 환경 변수 설정 (`.env.local`)
루트 디렉토리에 `.env.local` 파일을 생성하거나 `.env.example`을 복사하여 아래 설정 값을 작성합니다:
```env
# Gemini API Key 및 사용할 AI 모델 지정 (기본값: gemini-3.6-flash)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Supabase 연동 (선택 사항)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 웹앱을 확인할 수 있습니다.

### 4. Vercel 배포 (Deployment)

1. GitHub 레포지토리에 소스 코드를 푸시합니다.
2. [Vercel Dashboard](https://vercel.com)에 로그인 후 **Import Project**를 통해 해당 레포지토리를 연결합니다.
3. **Environment Variables** 설정 섹션에 아래 변수들을 등록합니다:
   - `GEMINI_API_KEY`: Google Gemini API Key
   - `GEMINI_MODEL`: `gemini-3.6-flash` (또는 원하는 Gemini 모델)
   - `NEXT_PUBLIC_SUPABASE_URL`: (선택) Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (선택) Supabase Anon Key
4. **Deploy** 버튼을 누르면 자동 빌드 및 배포가 완료됩니다.
