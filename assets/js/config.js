// 새 전시 웹 앱의 /exec?api=archive 주소를 입력하세요. 기존 추첨 배포 주소와 구별합니다.
export const CONFIG = Object.freeze({
  apiUrl: 'https://script.google.com/macros/s/AKfycbxFwC9IiIiqavZeLXc9PPxt5aSfmeZ2RwK9kPVBUt6qd0exV4D6K2yLot0aJtZsx_Hx/exec?api=archive',
  demoMode: true, // 공개 수상작이 0개일 때만 샘플 표시. 실제 전시 운영 시 false로 변경.
  edition: 2026,
  requestTimeout: 15000,
  autoScrollAfterIntro: true,
});
