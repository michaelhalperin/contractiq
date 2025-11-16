import jsPDF from 'jspdf';
import type { Contract, ContractAnalysis } from '../../../shared/types';

export const generatePDF = (contract: Contract, analysis: ContractAnalysis): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text('Contract Analysis Report', margin, yPos);
  yPos += 15;

  // Contract Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(`File: ${contract.fileName}`, margin, yPos);
  yPos += 8;
  doc.setFont(undefined, 'normal');
  doc.text(`Type: ${contract.fileType.toUpperCase()}`, margin, yPos);
  yPos += 8;
  doc.text(`Analyzed: ${new Date(contract.updatedAt).toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  // Summary Section
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Executive Summary', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - 2 * margin);
  summaryLines.forEach((line: string) => {
    checkPageBreak(8);
    doc.text(line, margin, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Key Information
  if (analysis.keyParties || analysis.duration || analysis.paymentTerms) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Key Information', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    if (analysis.keyParties) {
      checkPageBreak(8);
      doc.setFont(undefined, 'bold');
      doc.text('Parties:', margin, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 6;
      doc.text(`${analysis.keyParties.party1} ↔ ${analysis.keyParties.party2}`, margin + 5, yPos);
      yPos += 8;
    }

    if (analysis.duration) {
      checkPageBreak(8);
      doc.setFont(undefined, 'bold');
      doc.text('Duration:', margin, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 6;
      doc.text(analysis.duration, margin + 5, yPos);
      yPos += 8;
    }

    if (analysis.paymentTerms) {
      checkPageBreak(8);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Terms:', margin, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 6;
      doc.text(analysis.paymentTerms, margin + 5, yPos);
      yPos += 10;
    }
  }

  // Risk Flags Section
  if (analysis.riskFlags && analysis.riskFlags.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(244, 63, 94); // Rose
    doc.text('Risk Flags', margin, yPos);
    yPos += 10;

    analysis.riskFlags.forEach((risk, index) => {
      checkPageBreak(25);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${risk.title}`, margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const severityColor = risk.severity === 'high' ? [239, 68, 68] : risk.severity === 'medium' ? [245, 158, 11] : [59, 130, 246];
      doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.text(`Severity: ${risk.severity.toUpperCase()}`, margin + 5, yPos);
      yPos += 6;

      doc.setTextColor(0, 0, 0);
      const descLines = doc.splitTextToSize(risk.description, pageWidth - 2 * margin - 5);
      descLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });

      if (risk.suggestion) {
        yPos += 3;
        checkPageBreak(8);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(59, 130, 246);
        const suggestionLines = doc.splitTextToSize(`Suggestion: ${risk.suggestion}`, pageWidth - 2 * margin - 5);
        suggestionLines.forEach((line: string) => {
          checkPageBreak(5);
          doc.text(line, margin + 5, yPos);
          yPos += 5;
        });
        doc.setFont(undefined, 'normal');
      }
      yPos += 5;
    });
  }

  // Key Obligations
  if (analysis.obligations && analysis.obligations.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129); // Green
    doc.text('Key Obligations', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    analysis.obligations.forEach((obligation) => {
      checkPageBreak(8);
      const obligationLines = doc.splitTextToSize(`• ${obligation}`, pageWidth - 2 * margin);
      obligationLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin, yPos);
        yPos += 6;
      });
    });
    yPos += 5;
  }

  // Clause Explanations
  if (analysis.clauseExplanations && analysis.clauseExplanations.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Clause Explanations', margin, yPos);
    yPos += 10;

    analysis.clauseExplanations.forEach((clause, index) => {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${clause.clauseTitle}`, margin, yPos);
      yPos += 7;

      const importanceColor = clause.importance === 'critical' ? [239, 68, 68] : clause.importance === 'important' ? [245, 158, 11] : [16, 185, 129];
      doc.setFontSize(10);
      doc.setTextColor(importanceColor[0], importanceColor[1], importanceColor[2]);
      doc.text(`Importance: ${clause.importance.toUpperCase()}`, margin + 5, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const explanationLines = doc.splitTextToSize(clause.explanation, pageWidth - 2 * margin - 5);
      explanationLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by ContractIQ`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `${contract.fileName.replace(/\.[^/.]+$/, '')}_analysis.pdf`;
  doc.save(fileName);
};

