from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT=Path(__file__).parent
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans'
pdfmetrics.registerFont(TTFont('Body',FONT+'.ttf'))
pdfmetrics.registerFont(TTFont('Bold',FONT+'-Bold.ttf'))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
ink=colors.HexColor('#263532'); muted=colors.HexColor('#576760'); accent=colors.HexColor('#426C60')
styles={
 'name':ParagraphStyle('name',fontName='Bold',fontSize=26,leading=31,textColor=ink,alignment=1,spaceAfter=6),
 'role':ParagraphStyle('role',fontName='Body',fontSize=12,leading=17,textColor=accent,alignment=1,spaceAfter=7),
 'contact':ParagraphStyle('contact',fontName='Body',fontSize=9,leading=14,textColor=muted,alignment=1,spaceAfter=2),
 'section':ParagraphStyle('section',fontName='Bold',fontSize=10,leading=14,textColor=accent,spaceBefore=15,spaceAfter=8),
 'title':ParagraphStyle('title',fontName='Bold',fontSize=11,leading=15,textColor=ink,spaceBefore=4,spaceAfter=3),
 'meta':ParagraphStyle('meta',fontName='Body',fontSize=9,leading=13,textColor=muted,spaceAfter=9),
 'body':ParagraphStyle('body',fontName='Body',fontSize=10,leading=14,textColor=ink,spaceAfter=7),
 'bullet':ParagraphStyle('bullet',fontName='Body',fontSize=10,leading=14,textColor=ink,leftIndent=11,firstLineIndent=-11,spaceAfter=7),
}
for s in styles.values(): s.allowWidows=0;s.allowOrphans=0
content=[
('name','TRAVIS J. JONES'),
('role','Software Engineer'),
('contact','Ypsilanti, Michigan  |  <link href="mailto:travisjohn.jones@gmail.com">travisjohn.jones@gmail.com</link>'),
('contact','<link href="https://www.travisjohnjones.com">travisjohnjones.com</link>  |  <link href="https://github.com/CosmonautJones">GitHub: CosmonautJones</link>  |  <link href="https://www.linkedin.com/in/travis-john-jones">LinkedIn</link>'),
('section','PROFILE'),
('body','Software engineer with eight years developing and supporting manufacturing ERP software. My strongest work connects established business systems with modern .NET components and practical AI tooling. I trace existing behavior, make changes that preserve it, and help other teams understand the systems they depend on.'),
('section','PROFESSIONAL EXPERIENCE'),
('title','Global Shop Solutions  |  Software Engineer'),
('meta','September 2018 - August 2026  |  The Woodlands, Texas'),
('body','Developed and supported business software across interconnected manufacturing workflows, from requirements and implementation through regression validation, release, and production support.'),
('title','Enterprise modernization and DataLayer'),
('bullet','• Contributed to the DataLayer modernization effort, moving ACU COBOL functionality toward Fujitsu COBOL and .NET interoperability, including object-oriented calls and PSQL data objects.'),
('bullet','• Modernized COBOL and VB.NET behavior into reusable C#/.NET components. Traced application, service, data-access, and legacy code paths to preserve business rules during migration.'),
('bullet','• Compared modernized DataLayer results with existing production behavior, investigated differences, and converted findings into focused fixes and regression coverage.'),
('title','Production engineering and collaboration'),
('bullet','• Built and maintained ERP features involving shipping, consignment, invoicing, returns, and related business rules; supported REST integrations and SQL/Entity Framework data access.'),
('bullet','• Investigated defects across object collections, services, SQL, and legacy methods. Documented reproducible cases, partnered on root-cause analysis, and validated repairs before release.'),
('bullet','• Worked with system owners across Shop Floor, BOM/Engineering, Sales & Shipping, Payroll, Accounts Receivable, and Accounts Payable to understand dependencies and clarify expected behavior.'),
('bullet','• Contributed code reviews, estimates, technical documentation, and regression checks; led Scrum stand-ups and retrospectives.'),
('break',''),
('title','TRAVIS J. JONES'),
('meta','Software Engineer  |  Selected contributions and technical background'),
('section','AI TOOLING AND ENGINEERING ENABLEMENT'),
('title','Read-only COBOL knowledge access  |  Global Shop Solutions'),
('body','Built an MCP interface that made core COBOL business logic accessible through AI tools. The entire QA department, support teams, and colleagues outside the CORE team used it to understand behavior without having to navigate the codebase alone.'),
('bullet','• Kept the interface read-only and added filters to strip sensitive data from the information exposed to assistants.'),
('title','Practical AI adoption  |  Global Shop Solutions'),
('body','Supported internal AI adoption through an AI Help Desk, training sessions, documentation, and demonstrations. Helped colleagues apply unfamiliar tools to engineering and support work.'),
('section','INDEPENDENT ENGINEERING'),
('title','TravOS / Builder OS  |  Independent project in development'),
('meta','Python  |  Agent workflows, validation, and durable task context'),
('body','Developing a workflow system for replaceable AI coding agents, with durable mission context, reproducible handoffs, and evidence required for task completion. Current work includes task-state persistence, context compilation, and artifact acceptance checks.'),
('section','TECHNICAL BACKGROUND'),
('body','<b>Languages and applications:</b> C#, .NET, VB.NET, ACU/Fujitsu COBOL, Python, TypeScript, JavaScript, React, REST/JSON APIs.'),
('body','<b>Data and quality:</b> SQL, SQL Server, PostgreSQL, PSQL, Entity Framework; unit, integration, API, end-to-end, and regression testing; Playwright and Vitest.'),
('body','<b>Engineering workflow:</b> Git/GitHub, SVN, CI/CD, Visual Studio, VS Code, MCP, AI-assisted development, technical documentation, and cross-team troubleshooting.'),
('section','EARLIER EXPERIENCE AND EDUCATION'),
('body','<b>Buzzles Concessions, LLC | Technical Supervisor | March 2015 - October 2017</b><br/>Maintained POS systems, hardware, security systems, and production equipment across four locations; trained staff and resolved operational issues.'),
('body','<b>Lambda Academy of Computer Science</b> | Software Engineering Program, 2018'),
('body','<b>San Jacinto College</b> | A.A.S., Electronics Technology and Communications Engineering, 2015'),
]
def footer(c,doc):
 c.setStrokeColor(colors.HexColor('#DDE5DF'));c.setLineWidth(.6);c.line(60,43,552,43)
 c.setFont('Body',8);c.setFillColor(muted);c.drawString(60,29,'TRAVIS J. JONES  /  SOFTWARE ENGINEER');c.drawRightString(552,29,str(doc.page))
story=[]
for kind,txt in content:
 story.append(PageBreak() if kind=='break' else Paragraph(txt,styles[kind]))
doc=SimpleDocTemplate(str(OUT/'Travis-Jones-Resume.pdf'),pagesize=(612,792),leftMargin=60,rightMargin=60,topMargin=48,bottomMargin=59,title='Travis J. Jones - Software Engineer',author='Travis J. Jones')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
import re
md=[]
for kind,txt in content:
 if kind=='break':md.append('\n---\n');continue
 txt=re.sub(r'<link href="([^"]+)"[^>]*>(.*?)</link>',r'[\2](\1)',txt)
 txt=txt.replace('<b>','**').replace('</b>','**').replace('<br/>','\n')
 prefix={'name':'# ','role':'','contact':'','section':'## ','title':'### ','meta':'','bullet':'','body':''}[kind]
 md.append(prefix+txt.replace('• ','- '))
(OUT/'Travis-Jones-Resume.md').write_text('\n\n'.join(md)+'\n')
import json
(OUT/'resume-content.json').write_text(json.dumps([{'type':kind,'html':txt} for kind,txt in content],indent=2))
print(OUT/'Travis-Jones-Resume.pdf')
