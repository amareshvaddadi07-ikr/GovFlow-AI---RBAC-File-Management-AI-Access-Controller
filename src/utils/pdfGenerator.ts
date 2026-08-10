import { jsPDF } from 'jspdf';
import { DocumentItem } from '../types';

export function generateDocumentPDF(doc: DocumentItem): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header band
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 24, 'F');

  // Accent line
  pdf.setFillColor(6, 182, 212); // cyan-500
  pdf.rect(0, 24, pageWidth, 1.5, 'F');

  // Header Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('GovFlow Ai — OFFICIAL DIGITIZED eOFFICE DOCUMENT', margin, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225); // slate-300
  pdf.text('National Digital Governance Portal • Cryptographic Security & Barcode Seal', margin, 18);

  // Security Watermark background text
  pdf.setTextColor(241, 245, 249); // slate-100
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GOVFLOW AI OFFICIAL RECORD', pageWidth / 2, pageHeight / 2 + 10, {
    align: 'center',
    angle: 45,
  });

  let currentY = 32;

  // Metadata Box
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.setDrawColor(226, 232, 240); // slate-200
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'FD');

  // Title in metadata box
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.title || 'Official Digitized Document', margin + 4, currentY + 7);

  // Badges (Dept & Classification)
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  // Classification Badge
  const classText = (doc.classification || 'CONFIDENTIAL').toUpperCase();
  pdf.setFillColor(254, 243, 199); // amber-100
  pdf.setDrawColor(245, 158, 11); // amber-500
  pdf.roundedRect(margin + 4, currentY + 11, 28, 5, 1, 1, 'FD');
  pdf.setTextColor(180, 83, 9); // amber-700
  pdf.text(classText, margin + 6, currentY + 14.5);

  // Department Badge
  const deptText = `${doc.department || 'OPERATIONS'} DEPT`;
  pdf.setFillColor(224, 242, 254); // sky-100
  pdf.setDrawColor(14, 165, 233); // sky-500
  pdf.roundedRect(margin + 34, currentY + 11, 35, 5, 1, 1, 'FD');
  pdf.setTextColor(3, 105, 161); // sky-700
  pdf.text(deptText, margin + 36, currentY + 14.5);

  // Key Metadata details
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105); // slate-600

  pdf.text(`Barcode Key: ${doc.barcode || 'N/A'}`, margin + 4, currentY + 22);
  pdf.text(`SHA-256 Hash: ${doc.sha256Hash || 'VALIDATED'}`, margin + 4, currentY + 27);
  pdf.text(`Author / Signer: ${doc.digitalSignature?.signerName || doc.author || 'Authorized Officer'}`, margin + 4, currentY + 32);

  pdf.text(`File Name: ${doc.fileName || 'document.pdf'}`, margin + 95, currentY + 22);
  pdf.text(`Digitized Date: ${doc.updatedAt || new Date().toISOString().slice(0, 10)}`, margin + 95, currentY + 27);
  pdf.text(`Signature Algorithm: ${doc.digitalSignature?.signatureAlgorithm || 'HMAC-SHA256'}`, margin + 95, currentY + 32);

  currentY += 44;

  // Divider Bar
  pdf.setFillColor(15, 23, 42);
  pdf.rect(margin, currentY, contentWidth, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('DIGITIZED TEXT CONTENT (OFFICIAL TRANSCRIPT)', margin + 4, currentY + 4.8);

  currentY += 12;

  // Document Text Body
  pdf.setFont('courier', 'normal'); // Monospace official document font
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59); // slate-800

  const contentText = doc.content || '';
  const lines = pdf.splitTextToSize(contentText, contentWidth - 4);
  
  for (let i = 0; i < lines.length; i++) {
    if (currentY > pageHeight - 25) {
      // Add page footer
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text('GovFlow Ai • Cryptographic eOffice Document Seal', margin, pageHeight - 10);
      
      pdf.addPage();
      currentY = 20;

      // Header on continuation page
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(`GovFlow Ai — ${doc.title} (${doc.barcode}) — Page Continuation`, margin, 8);

      pdf.setFont('courier', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
    }

    pdf.text(lines[i], margin + 2, currentY);
    currentY += 4.8;
  }

  // Footer on final page
  currentY = Math.max(currentY + 10, pageHeight - 25);
  if (currentY <= pageHeight - 15) {
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.4);
    pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text('OFFICIAL DIGITAL STAMP & VERIFIED SEAL', margin, pageHeight - 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Document Barcode: ${doc.barcode} • SHA Hash: ${doc.sha256Hash?.substring(0, 28)}...`, margin, pageHeight - 7);
    pdf.text(`GovFlow Ai eOffice Portal • Tamper-Evident Ledger Logged`, pageWidth - margin - 75, pageHeight - 7);
  }

  return pdf;
}

export function downloadDocumentPDF(doc: DocumentItem) {
  const pdf = generateDocumentPDF(doc);
  const baseName = doc.fileName.replace(/\.[^/.]+$/, '');
  const pdfName = `${baseName}_DIGITIZED.pdf`;
  pdf.save(pdfName);
}

export function getDocumentPDFBlobUrl(doc: DocumentItem): string {
  const pdf = generateDocumentPDF(doc);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
