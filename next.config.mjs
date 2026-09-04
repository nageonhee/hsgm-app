/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 중 왼쪽 아래에 뜨는 Next.js 개발자 오버레이/툴바 비활성화
  devIndicators: false,
  // Cloud Run 배포를 위한 standalone 출력 모드
  output: 'standalone',
};

export default nextConfig;
