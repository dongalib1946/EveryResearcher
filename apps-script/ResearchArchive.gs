/** 누구나 연구자 · 공개 수상작 전용 API
 * 기존 프로젝트에 ResearchArchive.gs 파일로 추가하세요.
 * 기존 CONFIG / getSpreadsheet_()를 재사용합니다. doGet은 중복 선언하지 않습니다.
 * 기존 doGet 교체 방법: doGet-replacement.txt. 기존 추첨 배포 버전은 유지하세요.
 * 참가자 시트는 읽거나 수정하지 않습니다.
 */
const RESEARCH_ARCHIVE_CONFIG = Object.freeze({
  webMode: 'archive', // 이 버전으로 새 전시 API 배포. 기존 추첨 배포에는 적용하지 마세요.
  sheetName: '수상작_아카이브',
  headers: ['id', 'year', 'award', 'name', 'department', 'title', 'summary', 'tags', 'profileUrl', 'pdfUrl', 'order', 'published'],
  awards: ['총장상', '최우수상', '우수상', '장려상'],
  counts: { '총장상': 1, '최우수상': 2, '우수상': 3, '장려상': 5 }
});

/** 최초 1회 실행. 전용 탭이 없으면 생성하고, 기존 데이터는 보존합니다. */
function setupResearchArchive() {
  const book = getSpreadsheet_();
  const ARCHIVE = RESEARCH_ARCHIVE_CONFIG;
  let sheet = book.getSheetByName(ARCHIVE.sheetName);
  if (!sheet) sheet = book.insertSheet(ARCHIVE.sheetName);
  if (sheet.getLastRow() > 0) {
    researcherArchiveAssertHeaders_(sheet);
    console.log('기존 아카이브 시트를 확인했습니다. 기존 내용과 설정은 변경하지 않았습니다.');
    return;
  }
  sheet.getRange(1, 1, 1, ARCHIVE.headers.length).setValues([ARCHIVE.headers]);
  sheet.getRange(1, 1, 1, ARCHIVE.headers.length).setBackground('#172a28').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);
  const notes = [
    '고유 ID. 예: 2026-president-01. 연도가 달라도 중복 불가.',
    '전시 연도. 예: 2026', '총장상 / 최우수상 / 우수상 / 장려상',
    '공개할 이름 또는 팀명. 팀원 이름도 이 칸에 입력할 수 있습니다.',
    '공개용 학과·소속', '연구 작품 제목', '연구 소개 1~3문장',
    '쉼표로 구분. 예: AI,교육,연구동향',
    '공개 접근 가능한 HTTPS 이미지 URL 또는 Google Drive 파일 공유 링크',
    '공개 접근 가능한 HTTPS PDF URL 또는 Google Drive 파일 공유 링크',
    '같은 연도·상 안에서 표시 순서. 1부터 입력.',
    '체크한 행만 인터넷에 공개됩니다. 공개 동의를 확인한 정보만 입력하세요.'
  ];
  sheet.getRange(1, 1, 1, notes.length).setNotes([notes]);
  sheet.getRange(2, 12, 999, 1).insertCheckboxes();
  sheet.getRange(2, 3, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ARCHIVE.awards, true).setAllowInvalid(false).build());
  sheet.setColumnWidths(1, 12, 150);
  sheet.setColumnWidth(6, 350); sheet.setColumnWidth(7, 420);
  sheet.setColumnWidths(9, 2, 300);
  console.log('수상작_아카이브 탭이 준비되었습니다. 기존 참가자 탭은 변경하지 않았습니다.');
}

function researcherArchiveAssertHeaders_(sheet) {
  const ARCHIVE = RESEARCH_ARCHIVE_CONFIG;
  const headers = sheet.getRange(1, 1, 1, ARCHIVE.headers.length).getDisplayValues()[0];
  if (ARCHIVE.headers.some((key, index) => headers[index] !== key)) {
    throw new Error('아카이브 헤더가 예시와 다릅니다. 기존 내용을 덮어쓰지 않았습니다.');
  }
}

function researcherArchiveResponse_() {
  const ARCHIVE = RESEARCH_ARCHIVE_CONFIG;
  let payload;
  try {
    const sheet = getSpreadsheet_().getSheetByName(ARCHIVE.sheetName);
    if (!sheet) throw new Error('먼저 setupResearchArchive를 실행하세요.');
    researcherArchiveAssertHeaders_(sheet);
    const values = sheet.getDataRange().getValues();
    const ids = Object.create(null); const counts = Object.create(null); const winners = [];
    values.slice(1).forEach(function (cells, index) {
      if (cells[11] !== true && String(cells[11]).toUpperCase() !== 'TRUE') return;
      const row = {};
      ARCHIVE.headers.forEach(function (key, i) { row[key] = cells[i]; });
      row.id = String(row.id).trim(); row.year = Number(row.year);
      row.award = String(row.award).trim(); row.name = String(row.name).trim(); row.title = String(row.title).trim();
      if (!row.id || ids[row.id] || !row.name || !row.title || ARCHIVE.awards.indexOf(row.award) < 0 || !Number.isInteger(row.year) || row.year < 2026 || row.year > 2200) {
        throw new Error((index + 2) + '행의 ID, 연도, 상, 이름, 제목을 확인하세요.');
      }
      ['profileUrl', 'pdfUrl'].forEach(function (key) {
        row[key] = String(row[key] || '').trim();
        if (row[key] && !/^https:\/\//i.test(row[key])) throw new Error((index + 2) + '행의 링크는 HTTPS 주소여야 합니다.');
      });
      ids[row.id] = true;
      const group = row.year + ':' + row.award;
      counts[group] = (counts[group] || 0) + 1;
      if (counts[group] > ARCHIVE.counts[row.award]) throw new Error(group + ' 공개 팀 수가 시상 인원을 초과했습니다.');
      row.published = true; row.order = Number(row.order) || index + 1;
      ['department', 'summary', 'tags'].forEach(function (key) { row[key] = String(row[key] || ''); });
      winners.push(row);
    });
    payload = { ok: true, schemaVersion: 1, updatedAt: new Date().toISOString(), winners: winners };
  } catch (error) {
    console.error(error.message); // 상세 오류는 운영자 실행 로그에만 기록
    payload = { ok: false, error: 'ARCHIVE_UNAVAILABLE', winners: [] };
  }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

/** 전시 배포는 JSON만 반환하며 기존 추첨 HTML/RPC 화면을 제공하지 않습니다. */
function researcherArchiveRoute_(e) {
  if (RESEARCH_ARCHIVE_CONFIG.webMode === 'raffle') return null;
  if (RESEARCH_ARCHIVE_CONFIG.webMode === 'archive' && e && e.parameter && e.parameter.api === 'archive') {
    return researcherArchiveResponse_();
  }
  return ContentService.createTextOutput(JSON.stringify({
    ok: false, error: 'ARCHIVE_API_ONLY', message: '전시 API 주소에 ?api=archive를 붙여 주세요.'
  })).setMimeType(ContentService.MimeType.JSON);
}
