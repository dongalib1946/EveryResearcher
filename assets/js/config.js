// 새 전시 웹 앱의 /exec?api=archive 주소를 입력하세요. 기존 추첨 배포 주소와 구별합니다.
export const CONFIG = Object.freeze({
  apiUrl: '',
  demoMode: true, // 운영자 요청: 샘플 전시 공개. 실제 수상작 API 연결 시 false로 변경.
  edition: 2026,
  requestTimeout: 15000,
  autoScrollAfterIntro: true,
});
