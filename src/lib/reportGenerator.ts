import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import {
  type AreaScores,
  deriveAreaLabel,
  deriveOverallLabel,
  getAreaDetails,
  getResultTexts,
} from './funnel';
import { t, type Language } from './i18n';
import type { Lead } from '@shared/types';
interface ReportData {
  scores: AreaScores & { average: number };
  lang: Language;
  lead?: Partial<Lead>;
}
async function getLogoBase64(): Promise<string> {
  try {
    const response = await fetch('https://www.vonbusch.digital/img/logo_dark.svg');
    if (!response.ok) throw new Error('Logo fetch failed');
    const svgText = await response.text();
    return `data:image/svg+xml;base64,${btoa(svgText)}`;
  } catch (error) {
    console.error("Failed to fetch or convert logo:", error);
    // Return a placeholder or handle the error as needed
    return '';
  }
}
function generateReportHTML({ scores, lang, lead }: ReportData, logoBase64: string): string {
  const overall = deriveOverallLabel(scores.average, lang);
  const areaALabel = deriveAreaLabel(scores.areaA, lang);
  const areaBLabel = deriveAreaLabel(scores.areaB, lang);
  const areaCLabel = deriveAreaLabel(scores.areaC, lang);
  const areaDetails = getAreaDetails(lang);
  const resultTexts = getResultTexts(lang);
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US');
    return new Date(timestamp).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US');
  };
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #ffffff; color: #0f172a; }
      .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; background-color: white; box-sizing: border-box; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; }
      .logo { height: 40px; }
      .header-info { text-align: right; font-size: 12px; color: #6b7280; }
      .main-title { font-size: 28px; font-weight: 700; color: #1e293b; margin-top: 32px; margin-bottom: 8px; }
      .summary { font-size: 16px; color: #475569; margin-bottom: 32px; }
      .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #f8fafc; }
      .card-title { font-size: 16px; font-weight: 600; margin: 0 0 12px 0; }
      .ampel { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
      .card-text { font-size: 14px; color: #475569; margin-top: 12px; }
      .support-section { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px; }
      .support-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
      ul { padding-left: 20px; }
      li { margin-bottom: 8px; }
      .footer { margin-top: 48px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
      .lead-info { background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 24px; font-size: 14px; }
      .lead-info p { margin: 0 0 8px 0; }
      .bg-red { background-color: #fee2e2; color: #991b1b; }
      .bg-yellow { background-color: #fef3c7; color: #92400e; }
      .bg-green { background-color: #dcfce7; color: #166534; }
    </style>
  `;
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>${t(lang, 'adminTitle')}</title>
      ${styles}
    </head>
    <body>
      <div class="page">
        <header class="header">
          ${logoBase64 ? `<img src="${logoBase64}" alt="von Busch GmbH Logo" class="logo" />` : '<h1>von Busch GmbH</h1>'}
          <div class="header-info">
            <strong>von Busch GmbH</strong><br>
            Alfred-Bozi-Stra\u00DFe 12<br>
            33602 Bielefeld
          </div>
        </header>
        <main>
          <h1 class="main-title">${overall.headline}</h1>
          <p class="summary">${overall.summary}</p>
          ${lead && lead.company ? `
            <div class="lead-info">
              <p><strong>${t(lang, 'company')}:</strong> ${lead.company}</p>
              <p><strong>${t(lang, 'contact')}:</strong> ${lead.contact || ''}</p>
              <p><strong>${t(lang, 'tableDate')}:</strong> ${formatDate(lead.createdAt)}</p>
            </div>
          ` : ''}
          <div class="results-grid">
            <div class="card">
              <h2 class="card-title">${areaDetails.areaA.title}</h2>
              <span class="ampel ${areaALabel.level === 'low' ? 'bg-red' : areaALabel.level === 'medium' ? 'bg-yellow' : 'bg-green'}">${areaALabel.text}</span>
              <p class="card-text">${resultTexts[areaALabel.level]}</p>
            </div>
            <div class="card">
              <h2 class="card-title">${areaDetails.areaB.title}</h2>
              <span class="ampel ${areaBLabel.level === 'low' ? 'bg-red' : areaBLabel.level === 'medium' ? 'bg-yellow' : 'bg-green'}">${areaBLabel.text}</span>
              <p class="card-text">${resultTexts[areaBLabel.level]}</p>
            </div>
            <div class="card">
              <h2 class="card-title">${areaDetails.areaC.title}</h2>
              <span class="ampel ${areaCLabel.level === 'low' ? 'bg-red' : areaCLabel.level === 'medium' ? 'bg-yellow' : 'bg-green'}">${areaCLabel.text}</span>
              <p class="card-text">${resultTexts[areaCLabel.level]}</p>
            </div>
          </div>
          <section class="support-section">
            <h2 class="support-title">${t(lang, 'supportTitle')}</h2>
            <p>${t(lang, 'supportIntro')}</p>
            <ul>
              <li><strong>${t(lang, 'supportLi1')}</strong></li>
              <li><strong>${t(lang, 'supportLi2')}</strong></li>
              <li><strong>${t(lang, 'supportLi3')}</strong></li>
            </ul>
            <p>${t(lang, 'supportOutro')}</p>
          </section>
        </main>
        <footer class="footer">
          Ein Service der von Busch GmbH | Impressum | Datenschutz
        </footer>
      </div>
    </body>
    </html>
  `;
}
export async function downloadReport(data: ReportData) {
  const toastId = toast.loading('Generating PDF report...');
  try {
    const logoBase64 = await getLogoBase64();
    const reportHtml = generateReportHTML(data, logoBase64);
    const reportElement = document.createElement('div');
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-210mm'; // Position off-screen
    reportElement.style.top = '0';
    reportElement.innerHTML = reportHtml;
    document.body.appendChild(reportElement);
    const canvas = await html2canvas(reportElement.querySelector('.page') as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    document.body.removeChild(reportElement);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const filename = `Security-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
    toast.success('Report downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    toast.error('Failed to generate PDF report. Please try again.', { id: toastId });
  }
}