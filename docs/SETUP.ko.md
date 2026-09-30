# 설치·운영 안내

## 현재 연결 상태

전시 사이트에는 새 전시용 `/exec?api=archive` 주소가 연결되어 있습니다. 공개 행이 0개이면 운영자 요청에 따라 샘플 11팀을 미리보기 표시와 함께 보여줍니다. `수상작_아카이브` 탭에 정보를 입력하고 `published`를 체크하면 사이트를 새로 열거나 새로고침할 때 실제 수상작으로 전환됩니다. 실제 행과 샘플을 섞어서 표시하지 않으며, API 오류 시에는 오류 안내를 보여줍니다.

실제 수상작 운영을 시작할 때 `assets/js/config.js`의 `demoMode`를 `false`로 바꾸면 이후 모든 수상작을 비공개로 돌렸을 때에도 샘플이 다시 나타나지 않습니다. 메인 페이지는 `year: 2026`인 수상작을 표시하며 전체 아카이브에서는 다른 연도도 조회합니다.

## 1. 기존 구글시트에 수상작 탭 만들기

### 기존 설치에서 ‘미수상’ 기능 적용하기

1. Apps Script의 **ResearchArchive** 파일 전체를 최신 `apps-script/ResearchArchive.gs` 내용으로 교체하고 저장합니다.
2. 함수 목록에서 **`updateResearchArchiveAwards`**를 한 번 실행합니다. `award` 드롭다운과 헤더 메모만 갱신하며 기존 셀 값과 `published` 체크는 변경하지 않습니다.
3. **배포 → 배포 관리 → 현재 전시 API 배포 → 수정(연필) → 버전: 새 버전 → 배포**를 선택합니다. 기존 전시 `/exec` 주소를 그대로 유지합니다. 추첨용 배포는 변경하지 않습니다.
4. `award`에 **미수상**, `published`에 **TRUE(체크)**를 지정하면 전체 아카이브에만 **참가작**으로 표시됩니다. 메인 수상작 전시에는 표시되지 않습니다. 전체 아카이브의 ‘참가작’ 필터로 모아 볼 수 있습니다.

미수상은 팀 수 제한이 없으며 수상작의 1·2·3·5팀 정원에 포함되지 않습니다. `award` 공란과 오타는 계속 오류로 처리하므로 정확히 `미수상`을 입력하세요. 비공개 행은 어느 페이지에도 표시되지 않습니다.

**기존 구글시트 → 확장 프로그램 → Apps Script**에서 현재 추첨·참가자 정리 코드를 쓰는 프로젝트를 엽니다. 새 프로젝트를 만들지 않습니다.

1. **배포 → 배포 관리**에서 현재 추첨용 `/exec` 주소와 버전을 기록해 둡니다. 이 배포는 현재 버전 그대로 유지합니다.
2. 왼쪽 파일 목록의 **+ → 스크립트**를 눌러 `ResearchArchive`를 만들고 `apps-script/ResearchArchive.gs` 전체 내용을 붙여 넣습니다.
3. 기존 파일의 `function doGet() { ... }` 부분 **하나만** `apps-script/doGet-replacement.txt`의 함수로 교체합니다. 기존 `CONFIG`, `getSpreadsheet_()`, 추첨 함수, 참가자 정리 함수와 `Index.html`은 유지합니다. 다른 파일에 두 번째 `doGet`을 추가하면 안 됩니다.
4. 새 파일 상단의 `RESEARCH_ARCHIVE_CONFIG.webMode`는 **`'archive'`**로 둡니다. 기존 `getSpreadsheet_()`를 재사용하므로 구글시트에 연결된 프로젝트라면 시트 ID를 새로 넣지 않아도 됩니다. 기존 방식에서 `CONFIG.SPREADSHEET_ID`를 지정했다면 그 설정을 그대로 사용합니다.
5. 함수 목록에서 **`setupResearchArchive`**를 선택해 한 번 실행합니다. 시트 편집 권한이 있는 계정으로 승인합니다.
6. 기존 구글시트에 `수상작_아카이브` 탭이 추가됩니다. 이미 해당 탭이 있으면 헤더만 확인하고 기존 데이터를 덮어쓰지 않습니다.

이전에 제공한 독립 프로젝트용 `Code.gs`를 기존 프로젝트에 추가했다면 해당 **이전 아카이브 파일만** 이번 `ResearchArchive.gs`로 교체하세요. 기존 추첨용 `Code.gs` 전체를 교체하지 마세요. 이번 패키지에는 혼동을 막기 위해 이전 독립 프로젝트용 파일을 포함하지 않습니다.

접수 탭의 개인정보는 복사하지 마세요. 사이트에 공개할 정보만 새 탭에 넣습니다. 시트 자체를 ‘웹에 게시’하거나 기존 구글시트 전체를 공개 공유할 필요는 없습니다.

## 2. 수상자 입력

한 행은 **한 팀 / 한 작품**입니다. 팀원이 여러 명이면 `name`에 `팀명 · 김○○, 이○○`처럼 넣을 수 있습니다. 프로필은 팀 사진이나 대표 이미지 1개를 사용합니다.

| 열 | 입력 내용 | 예시 |
| --- | --- | --- |
| id | 모든 연도에서 중복되지 않는 ID | 2026-president-01 |
| year | 전시 연도 | 2026 |
| award | 총장상 / 최우수상 / 우수상 / 장려상 / 미수상 | 미수상은 전체 아카이브에만 참가작으로 표시 |
| name | 공개할 이름 또는 팀명 | 연구팀 · 김○○, 이○○ |
| department | 학과 또는 소속 | ○○학과 |
| title | 연구 작품 제목 | 연구 작품의 제목 |
| summary | 짧은 작품 소개 | 연구의 질문과 발견을 1~3문장으로 작성 |
| tags | 쉼표로 구분한 키워드 | AI,도시,지속가능성 |
| profileUrl | 공개 이미지의 HTTPS 링크 | Google Drive 파일 공유 링크 또는 직접 이미지 URL |
| pdfUrl | 제출 PDF의 HTTPS 링크 | Google Drive 파일 공유 링크 또는 직접 PDF URL |
| order | 같은 시상 부문의 표시 순서 | 1 |
| published | 공개 여부 체크박스 | 체크 = 공개, 미체크 = 비공개 |

`id`, `year`, `award`, `name`, `title`은 공개 행에서 필수입니다. `profileUrl`이 비어 있으면 기본 프로필, `pdfUrl`이 비어 있으면 작품 준비 안내를 보여줍니다. 연도별 공개 인원은 **총장상 1팀 / 최우수상 2팀 / 우수상 3팀 / 장려상 5팀**을 넘을 수 없습니다. 일부 수상작만 먼저 공개할 수 있습니다.

붙여넣기용 헤더 예시는 `archive-template.tsv`를 참고하세요. 해당 예시 행은 모두 비공개 `FALSE`입니다. 기존 탭을 덮어쓰지 말고 필요한 행만 복사하세요.

## 3. 이미지·PDF 공유 권한

Google Drive에 파일을 업로드한 뒤, 해당 **파일의 공유 설정**에서 ‘링크가 있는 모든 사용자 / 뷰어’로 지정합니다. 공개에 동의한 이름과 프로필, 제출 작품만 사용하세요.

- 이미지: JPG·PNG·WebP, 세로 또는 정사각형 사진 권장. 인물을 중앙에 배치하세요. 카드마다 사진이 잘리는 비율이 다릅니다.
- PDF: Google Drive의 `https://drive.google.com/file/d/파일ID/view` 형태 링크를 그대로 넣으면 `/preview`로 변환합니다.
- 다른 파일 서버: `https://.../작품.pdf` 형태 링크도 가능하지만 서버가 iframe 표시를 차단하면 사이트 안에서 보이지 않을 수 있습니다. 이 경우 모달의 ‘원본 PDF 열기’를 사용합니다.
- Google Drive의 기관 정책·로그인 제한·사용량 제한에 따라 미리보기가 차단될 수 있습니다. 시크릿 창에서 이미지와 PDF를 먼저 확인하세요.

## 4. Apps Script 웹 앱 배포

1. 같은 프로젝트에서 **배포 → 새 배포 → 유형: 웹 앱**. 설명을 `수상작 전시 API`로 지정합니다. **기존 추첨 배포를 수정하는 것이 아닙니다.**
2. 실행 사용자: **나**. 접근 권한: **모든 사용자**(로그인 없이 접근 가능한 옵션).
3. 새 `/exec` URL 뒤에 **`?api=archive`**를 붙입니다. `/dev`는 운영 사이트에서 사용하지 않습니다.
4. 시크릿 창에서 `/exec?api=archive`를 열어 `{"ok":true,...,"winners":[...]}` JSON 응답이 나오는지 확인합니다. 새 배포의 `/exec`만 열면 `ARCHIVE_API_ONLY` 안내가 나오는 것이 정상입니다.
5. `assets/js/config.js`를 다음과 같이 변경합니다.

```js
export const CONFIG = Object.freeze({
  apiUrl: 'https://script.google.com/macros/s/새전시배포ID/exec?api=archive',
  demoMode: false,
  edition: 2026,
  requestTimeout: 15000,
  autoScrollAfterIntro: true,
});
```

앞으로 전시 Apps Script를 수정하면 **전시 API 배포만** 배포 관리에서 새 버전으로 갱신합니다. **시트의 행만 수정할 때에는 재배포가 필요 없습니다.** 사이트는 페이지를 열거나 다시 불러올 때 최신 시트 내용을 요청합니다.

### 추첨과 전시의 배포를 나누는 이유

첨부한 기존 코드의 `getBootstrap()`은 참가자의 이름·학번이 포함된 목록을 추첨 화면에 반환합니다. 전시를 모든 사용자에게 공개하면서 이 추첨 화면까지 함께 제공하지 않도록, **새 전시 배포에서는 JSON API만 응답**하도록 구성했습니다. 이는 기존 추첨의 접근 정책이나 권한을 강화하는 변경은 아니며, 기존 배포는 기존 상태를 유지합니다.

| 구분 | 프로젝트 | 배포 버전 | 주소의 역할 |
| --- | --- | --- | --- |
| 기존 추첨 | 같은 프로젝트 | 기존 버전 유지 | 기존 `/exec`에서 추첨 화면 |
| 새 전시 API | 같은 프로젝트 | `webMode: 'archive'`인 새 버전 | 새 `/exec?api=archive`에서 공개 수상작 JSON |

저장된 코드를 사용하는 편집기 실행과 `/dev` 테스트는 최신 설정을 따릅니다. 따라서 현재 `/dev`에서 추첨 화면이 보이지 않는 것은 정상입니다. 추첨 이용자는 기존 버전으로 고정된 `/exec` 주소를 사용합니다. Apps Script는 여러 버전의 배포를 동시에 유지할 수 있습니다. [공식 배포 문서](https://developers.google.com/apps-script/concepts/deployments)

추후 추첨 코드를 다시 배포해야 한다면 `webMode`를 `'raffle'`로 바꾼 **새 버전**으로 추첨 배포만 갱신하세요. 전시 배포는 `'archive'`로 저장된 버전을 유지합니다. 추첨 배포까지 `'archive'` 버전으로 갱신하면 그 주소에서도 추첨 화면 대신 JSON이 나오므로 두 배포의 버전을 구별해야 합니다. 전시를 다음에 갱신할 때에는 반드시 `'archive'`로 다시 바꿔 버전을 생성하세요.

Google Workspace 조직에서 익명 웹 앱 배포를 막은 경우 관리자의 허용이 필요합니다. 실제 연결 전에는 이를 코드만으로 확인할 수 없습니다. 공개 API에는 체크한 공개용 필드만 반환합니다. 클라이언트에 API 비밀키나 시트 접근 토큰을 넣지 않습니다.

## 5. GitHub Pages 배포

1. GitHub에서 새 저장소를 생성합니다. GitHub Free에서는 공개 저장소를 사용합니다.
2. **프로젝트 폴더 안의 파일과 폴더**를 저장소 루트에 올립니다. `.github/workflows/pages.yml`도 포함해야 합니다.
3. 기본 브랜치 이름을 `main`으로 지정합니다. 다른 이름이면 워크플로의 `branches`도 변경합니다.
4. 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. **Actions → Deploy research archive → Run workflow**를 실행합니다. 이후 `main`에 올릴 때마다 자동 배포됩니다.
6. 완료 후 Pages 설정 또는 Actions 배포 결과에서 `https://계정.github.io/저장소/` 주소를 확인합니다.

사이트 링크와 자산 경로는 상대 경로라 저장소 하위 경로에서도 작동합니다. 로컬의 `node_modules`, `.env`, `test-results`, 실제 참가자 원본 명단 등은 올리지 않습니다. 제공된 `.gitignore`를 사용하세요.

### Git 명령으로 처음 올리는 경우

```sh
git init
git add .
git commit -m "Create research awards archive"
git branch -M main
git remote add origin https://github.com/계정/저장소.git
git push -u origin main
```

## 6. 다음 연도 운영

새 연도의 수상작을 같은 탭에 새 ID로 추가합니다. `assets/js/config.js`의 `edition`을 새 연도로 바꾸면 메인 전시는 해당 연도만 표시합니다. 전체 아카이브는 모든 공개 연도를 검색할 수 있습니다. HTML에 있는 2026 표기와 대회 소개·포스터·푸터 연도도 함께 갱신하세요.

장기 보존을 위해 작품 PDF와 프로필 원본을 기관 소유의 Drive 폴더에 보관하고, 시트의 수상작 탭을 정기적으로 내려받아 백업하세요. 이 사이트는 연결한 원본을 보여주는 구조이며 PDF 파일 자체를 별도 서버에 자동 복제하지 않습니다. 원본을 삭제하거나 공유 권한을 바꾸면 이전 전시에서도 작품이 열리지 않습니다.

## 연결 점검

전체 아카이브는 검색·시상 부문·연도 조건에 맞는 작품을 **한 페이지에 12개씩** 표시합니다. 13개 이상이면 하단 페이지 탐색이 나타나며, 조건을 바꾸면 첫 페이지로 돌아갑니다. 현재 페이지는 URL의 `page` 값으로 유지됩니다. 공개 데이터는 한 번 가져오고 현재 페이지의 카드만 그리므로, 페이지 이동 시 Apps Script 재요청은 하지 않습니다.

기본·샘플 프로필 이미지에는 고정 번호가 없습니다. 기존 `sample-01.svg`~`sample-12.svg` 주소도 그대로 사용할 수 있고, `profileUrl`을 비워 두면 번호 없는 공통 기본 이미지를 표시합니다. 새 참가작마다 번호별 이미지 파일을 만들 필요가 없습니다.

| 현상 | 확인할 내용 |
| --- | --- |
| 샘플이 계속 보임 | `demoMode:true`이고 API에 공개 행이 없는지, `published` 체크 여부와 필수 값, 올바른 탭·시트 연결 여부 |
| 수상작 공개 준비 화면 | `demoMode:false` 상태에서 API가 미설정이거나 공개 체크한 행이 없음 |
| 목록 불러오기 오류 | 새 `/exec?api=archive` 주소, 익명 접근, 전시 배포의 archive 모드, Apps Script 실행 로그, 헤더, 중복 ID, 시상 인원 |
| 프로필이 기본 이미지로 나옴 | 파일 공개 공유, 이미지 링크, Drive 정책 |
| PDF 모달이 빈 화면 | 원본 링크를 시크릿 창에서 열기, 공유 권한, iframe 제한 |
| 변경한 시트 내용이 반영되지 않음 | 사이트 새로고침, 올바른 시트 ID·탭 이름 확인 |
| 수정한 Apps Script가 반영되지 않음 | 배포 관리에서 새 버전으로 갱신했는지 |

설계 참고: [Apps Script Content Service 공식 문서](https://developers.google.com/apps-script/guides/content), [GitHub Pages 사용자 지정 워크플로 공식 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
