"""Original procedural motion, sample profiles and sample data. No external stock assets."""
from pathlib import Path
import json, math, re, urllib.request, urllib.parse
import numpy as np
from PIL import Image, ImageDraw
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
media = ROOT / 'assets/media'
data = ROOT / 'assets/data'
fonts = ROOT / 'assets/fonts'
for folder in [media, data, fonts]: folder.mkdir(parents=True, exist_ok=True)

# Open-source font subset dedicated to the video title; body uses system fonts.
font_url = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@900&text=' + urllib.parse.quote('누구나 연구자')
try:
    req = urllib.request.Request(font_url, headers={'User-Agent': 'Mozilla/5.0'})
    css = urllib.request.urlopen(req).read().decode()
    url = re.search(r'url\((https:[^)]+)\)', css).group(1)
    (fonts / 'display.woff2').write_bytes(urllib.request.urlopen(url).read())
    license_url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/OFL.txt'
    (fonts / 'OFL-NotoSansKR.txt').write_bytes(urllib.request.urlopen(license_url).read())
    print('Font downloaded')
except Exception as exc:
    print('Font download failed:', str(exc))

# Generate the seamless background using the dedicated motion generator.
import runpy
runpy.run_path(str(ROOT / 'scripts/make-motion.py'))

titles = ['AI와 함께 그리는\n지속 가능한 도시의 미래', '배움의 경계를 넓히는\n생성형 AI의 가능성', '우리의 바다를 위한\n새로운 에너지의 발견', '데이터로 읽는\n마음 건강의 변화', '사람을 향하는\n로봇 기술의 다음 걸음', '기후 위기 속\n새로운 식탁의 조건', '일상의 이동을\n바꾸는 작은 발견', '지역의 기억을\n연결하는 디지털 기록', '더 나은 돌봄을 위한\n의료 AI 연구', '새로운 소재로\n여는 순환의 가능성', '함께 살아가는\n도시의 생태 연구']
departments = ['도시공학 분야','교육학 분야','에너지공학 분야','심리학 분야','기계공학 분야','식품영양학 분야','교통 분야','인문학 분야','의료 분야','신소재 분야','환경 분야']
tags = ['AI,지속가능성,도시','AI,교육,연구동향','에너지,해양,지속가능성','데이터,마음건강','로봇,기술','기후,식품','도시,이동','디지털,기록','AI,의료','소재,순환','도시,생태']
palettes = [('#c9b895','#ede4d1','#6e7e72','#314c45'),('#c1cbcc','#e0e6e0','#70898b','#3f575d'),('#c6c6b2','#e9e7d7','#9b9c77','#596550'),('#d4c5bd','#e9ddd7','#a88d83','#795f57'),('#b9c6ce','#dfe7e7','#7a96a6','#435d70'),('#d0cfb3','#f0edcf','#a2a477','#647347'),('#d3bb9d','#eddbc3','#b29c7b','#726959'),('#b6c8c4','#d6e3dc','#6f9792','#375e5c'),('#c5bbcd','#e5dce9','#9a87a5','#695a79'),('#c0c7b5','#e5e5d9','#8e9b7f','#4f6246'),('#b3c5d0','#d6e2ea','#7c98b0','#465e79')]
winners=[]
awards=['총장상']+['최우수상']*2+['우수상']*3+['장려상']*5
for n,(title,award,palette) in enumerate(zip(titles,awards,palettes),1):
    bg, pale, mid, dark=palette
    profile=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="{pale}"/><stop offset="1" stop-color="{bg}"/></linearGradient><pattern id="lines" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="{dark}" stroke-width=".5" opacity=".08"/></pattern></defs><rect width="800" height="900" fill="url(#bg)"/><circle cx="{570 if n%2 else 220}" cy="260" r="300" fill="{pale}" opacity=".6"/><path d="M0 690L800 410V900H0Z" fill="{mid}" opacity=".23"/><text x="60" y="110" fill="{dark}" font-family="Georgia,serif" font-size="64" opacity=".48">{n:02}</text><path d="M80 160H720M80 740H720" stroke="{dark}" opacity=".15"/><circle cx="400" cy="345" r="113" fill="{mid}"/><path d="M151 900V723c0-149 101-248 249-248s249 99 249 248v177" fill="{dark}"/><path d="M290 485L400 630 510 485" fill="{pale}" opacity=".4"/><path d="M400 630V900" stroke="{pale}" opacity=".15"/><rect width="800" height="900" fill="url(#lines)"/><text x="60" y="815" fill="{pale}" font-size="12" letter-spacing="3" font-family="sans-serif">SAMPLE PROFILE / 2026</text></svg>'''
    (ROOT/f'assets/images/sample-{n:02}.svg').write_text(profile,encoding='utf-8')
    winners.append(dict(id=f'2026-sample-{n:02}',year=2026,award=award,name=f'샘플 연구팀 {n:02}',department=f'{departments[n-1]} · 미리보기',title=title.replace('\n',' '),summary='SciVal을 활용한 연구동향분석 포스터의 구성 예시입니다. 실제 제출 작품이 아닌 디자인 확인용 샘플입니다.',tags=tags[n-1],profileUrl=f'./assets/images/sample-{n:02}.svg',pdfUrl='./assets/media/sample-work.pdf',order=n,published=True))
(data/'demo.json').write_text(json.dumps({'ok':True,'winners':winners},ensure_ascii=False,indent=2),encoding='utf-8')
print('11 clearly labeled sample entries generated')

# Small self-contained demo PDF (no real winning submission).
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
c=canvas.Canvas(str(media/'sample-work.pdf'), pagesize=(595,842))
c.setFillColor(HexColor('#f6f5f1'));c.rect(0,0,595,842,fill=1,stroke=0)
c.setFillColor(HexColor('#172a28'));c.setFont('Helvetica',11);c.drawString(45,785,'DONG-A UNIVERSITY LIBRARY / RESEARCH ARCHIVE')
c.setFont('Helvetica-Bold',54);c.drawString(45,660,'EVERY QUESTION');c.drawString(45,595,'IS A BEGINNING.')
c.setStrokeColor(HexColor('#af803c'));c.line(45,560,550,560)
c.setFillColor(HexColor('#af803c'));c.setFont('Helvetica',15);c.drawString(45,520,'2026 / SAMPLE WORK / PREVIEW ONLY')
c.setFillColor(HexColor('#63706a'));c.setFont('Helvetica',12)
for i,line in enumerate(['This is a sample PDF for testing the archive viewer.','It is not an actual award-winning submission.','Replace the pdfUrl in your archive sheet with the public PDF link.']):c.drawString(45,460-i*23,line)
for i in range(8):
    c.setStrokeColor(HexColor('#b6c4b9'));c.circle(290,240,45+i*17,stroke=1,fill=0)
c.setFillColor(HexColor('#172a28'));c.setFont('Helvetica',9);c.drawString(45,40,'80 YEARS OF DONG-A / EVERYONE IS A RESEARCHER')
c.showPage();c.save()
print('Sample PDF generated')
