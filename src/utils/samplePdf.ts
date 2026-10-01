/**
 * Helper to generate simple, valid PDF Data URIs for demo documents
 * and convert user-uploaded files to Data URIs.
 */

export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Creates a minimal valid PDF as a base64 string
 */
export function createSimplePdfDataUri(title: string, subtitle: string, contentLines: string[]): string {
  // Minimal valid PDF 1.4 binary structure
  const textStream = `
BT
/F1 18 Tf
50 750 Td
(${escapePdf(title)}) Tj
0 -24 Td
/F1 12 Tf
(${escapePdf(subtitle)}) Tj
0 -30 Td
/F1 10 Tf
${contentLines.map((line) => `(${escapePdf(line)}) Tj 0 -15 Td`).join('\n')}
ET
  `.trim();

  const streamLength = textStream.length;

  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${textStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000323 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return `data:application/pdf;base64,${btoa(unescape(encodeURIComponent(pdfBody)))}`;
}

function escapePdf(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Pre-generated sample PDF for Kalasalingam Academic Calendar
export const SAMPLE_CALENDAR_PDF = createSimplePdfDataUri(
  'KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION',
  'OFFICIAL ACADEMIC CALENDAR - 2024-2025 (ODD SEMESTER)',
  [
    '1. Commencement of Classes: July 15, 2024',
    '2. Continuous Assessment Test I (CAT-1): August 26 - August 31, 2024',
    '3. Continuous Assessment Test II (CAT-2): October 14 - October 19, 2024',
    '4. Practical End Semester Examinations: November 11 - November 16, 2024',
    '5. Theory End Semester Examinations: November 20 - December 06, 2024',
    '6. Minimum Mandatory Attendance Requirement: 85%',
    '7. Condonation Eligibility (Subject to Medical/OD Approval): 75% to 84.9%',
    '8. Re-registration / Detention: Below 75% strictly ineligible for exams.',
    '',
    'Published by: Office of the Controller of Examinations & Academic Dean',
    'Kalasalingam Academy of Research and Education (Deemed to be University)'
  ]
);

// Pre-generated sample PDF for Examination Timetable Circular
export const SAMPLE_CIRCULAR_PDF = createSimplePdfDataUri(
  'KARE - CONTROLLER OF EXAMINATIONS',
  'CIRCULAR: END SEMESTER EXAMS - ATTENDANCE & HALL TICKET',
  [
    'Ref: KARE/COE/ESE/2024/091',
    'Date: September 28, 2024',
    '',
    'All B.Tech/M.Tech students are hereby informed that the attendance freeze date',
    'for the current semester is October 28, 2024.',
    'Students who have maintained 85% and above will be issued digital hall tickets directly.',
    'Students between 75% and 84.9% must submit their medical certificates to their',
    'respective HoD and Dean for condonation processing.',
    '',
    'Students with attendance below 75% in any course will NOT be permitted to sit for',
    'the End Semester Examination in that course as per university regulations.',
    '',
    'By Order of: Controller of Examinations, Kalasalingam University'
  ]
);
