import type { ContractAnalysis } from '../../../shared/types.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface ExportOptions {
  format: 'pdf' | 'word' | 'excel' | 'csv' | 'json';
  contractName: string;
  analysis: ContractAnalysis;
  branded?: boolean; // For Business+ plans
}

export const exportContract = async (options: ExportOptions): Promise<Buffer> => {
  switch (options.format) {
    case 'pdf':
      return await exportToPDF(options);
    case 'word':
      return await exportToWord(options);
    case 'excel':
      return await exportToExcel(options);
    case 'csv':
      return await exportToCSV(options);
    case 'json':
      return await exportToJSON(options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

const exportToPDF = async (options: ExportOptions): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = 750;
  const margin = 50;
  const lineHeight = 14;
  const titleSize = 16;
  const headingSize = 12;

  // Title
  if (options.branded) {
    page.drawText('ContractIQ', {
      x: margin,
      y: y,
      size: 20,
      font: boldFont,
      color: rgb(0.39, 0.4, 0.95), // Indigo
    });
    y -= 30;
  }

  page.drawText(options.contractName, {
    x: margin,
    y: y,
    size: titleSize,
    font: boldFont,
  });
  y -= lineHeight * 2;

  // Summary
  page.drawText('Summary', {
    x: margin,
    y: y,
    size: headingSize,
    font: boldFont,
  });
  y -= lineHeight * 1.5;

  const summaryLines = wrapText(options.analysis.summary, 80);
  for (const line of summaryLines) {
    if (y < 50) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText(line, {
      x: margin,
      y: y,
      size: 10,
      font: font,
    });
    y -= lineHeight;
  }
  y -= lineHeight;

  // Key Parties
  page.drawText('Key Parties', {
    x: margin,
    y: y,
    size: headingSize,
    font: boldFont,
  });
  y -= lineHeight * 1.5;
  page.drawText(`Party 1: ${options.analysis.keyParties.party1}`, {
    x: margin,
    y: y,
    size: 10,
    font: font,
  });
  y -= lineHeight;
  page.drawText(`Party 2: ${options.analysis.keyParties.party2}`, {
    x: margin,
    y: y,
    size: 10,
    font: font,
  });
  y -= lineHeight * 2;

  // Enhanced Data Sections
  const { dates, financialDetails, legalInfo, contractMetadata, structuredTerms, performanceMetrics } = options.analysis;

  // Dates
  if (dates && (dates.startDate || dates.endDate || dates.signingDate || dates.effectiveDate)) {
    if (y < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText('Important Dates', {
      x: margin,
      y: y,
      size: headingSize,
      font: boldFont,
    });
    y -= lineHeight * 1.5;
    if (dates.startDate) {
      page.drawText(`Start Date: ${dates.startDate}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    if (dates.endDate) {
      page.drawText(`End Date: ${dates.endDate}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    if (dates.signingDate) {
      page.drawText(`Signing Date: ${dates.signingDate}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    if (dates.effectiveDate) {
      page.drawText(`Effective Date: ${dates.effectiveDate}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    y -= lineHeight;
  }

  // Financial Details
  if (financialDetails) {
    if (y < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText('Financial Details', {
      x: margin,
      y: y,
      size: headingSize,
      font: boldFont,
    });
    y -= lineHeight * 1.5;
    if (financialDetails.totalValue) {
      page.drawText(`Total Value: ${financialDetails.totalValue} ${financialDetails.currency || ''}`, {
        x: margin,
        y: y,
        size: 10,
        font: font,
      });
      y -= lineHeight;
    }
    if (financialDetails.paymentAmounts && financialDetails.paymentAmounts.length > 0) {
      page.drawText('Payment Schedule:', { x: margin, y: y, size: 10, font: boldFont });
      y -= lineHeight;
      financialDetails.paymentAmounts.forEach((payment) => {
        page.drawText(`  - ${payment.amount} ${financialDetails.currency || ''} (${payment.schedule})${payment.dueDate ? ` - Due: ${payment.dueDate}` : ''}`, {
          x: margin + 10,
          y: y,
          size: 9,
          font: font,
        });
        y -= lineHeight * 0.8;
      });
    }
    y -= lineHeight;
  }

  // Legal Information
  if (legalInfo && (legalInfo.governingLaw || legalInfo.jurisdiction || legalInfo.disputeResolution || legalInfo.venue)) {
    if (y < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText('Legal Information', {
      x: margin,
      y: y,
      size: headingSize,
      font: boldFont,
    });
    y -= lineHeight * 1.5;
    if (legalInfo.governingLaw) {
      page.drawText(`Governing Law: ${legalInfo.governingLaw}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    if (legalInfo.jurisdiction) {
      page.drawText(`Jurisdiction: ${legalInfo.jurisdiction}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    if (legalInfo.disputeResolution) {
      page.drawText(`Dispute Resolution: ${legalInfo.disputeResolution}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    if (legalInfo.venue) {
      page.drawText(`Venue: ${legalInfo.venue}`, { x: margin, y: y, size: 10, font: font });
      y -= lineHeight;
    }
    y -= lineHeight;
  }

  // Contract Metadata
  if (contractMetadata) {
    if (contractMetadata.contractType || contractMetadata.category) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Contract Information', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      if (contractMetadata.contractType) {
        page.drawText(`Type: ${contractMetadata.contractType}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      if (contractMetadata.category) {
        page.drawText(`Category: ${contractMetadata.category}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      y -= lineHeight;
    }
    if (contractMetadata.signatories && contractMetadata.signatories.length > 0) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Signatories', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      contractMetadata.signatories.forEach((sig) => {
        page.drawText(`${sig.name}${sig.title ? ` - ${sig.title}` : ''} (${sig.party})`, {
          x: margin,
          y: y,
          size: 10,
          font: font,
        });
        y -= lineHeight;
      });
      y -= lineHeight;
    }
  }

  // Key Obligations
  if (options.analysis.obligations && options.analysis.obligations.length > 0) {
    if (y < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText('Key Obligations', {
      x: margin,
      y: y,
      size: headingSize,
      font: boldFont,
    });
    y -= lineHeight * 1.5;

    options.analysis.obligations.forEach((obligation, index) => {
      if (y < 50) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      const obligationLines = wrapText(`${index + 1}. ${obligation}`, 80);
      obligationLines.forEach((line) => {
        if (y < 50) {
          const newPage = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        page.drawText(line, {
          x: margin,
          y: y,
          size: 10,
          font: font,
        });
        y -= lineHeight * 0.9;
      });
      y -= lineHeight * 0.5;
    });
    y -= lineHeight;
  }

  // Risk Flags
  if (options.analysis.riskFlags.length > 0) {
    if (y < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText('Risk Flags', {
      x: margin,
      y: y,
      size: headingSize,
      font: boldFont,
    });
    y -= lineHeight * 1.5;

    for (const risk of options.analysis.riskFlags) {
      if (y < 50) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText(`${risk.severity.toUpperCase()}: ${risk.title}`, {
        x: margin,
        y: y,
        size: 10,
        font: boldFont,
        color: risk.severity === 'high' ? rgb(0.9, 0.1, 0.1) : rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
      const descLines = wrapText(risk.description, 80);
      for (const line of descLines) {
        if (y < 50) {
          const newPage = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        page.drawText(line, {
          x: margin + 10,
          y: y,
          size: 9,
          font: font,
        });
        y -= lineHeight * 0.8;
      }
      if (risk.suggestion) {
        const suggestionLines = wrapText(`Suggestion: ${risk.suggestion}`, 80);
        for (const line of suggestionLines) {
          if (y < 50) {
            const newPage = pdfDoc.addPage([612, 792]);
            y = 750;
          }
          page.drawText(line, {
            x: margin + 10,
            y: y,
            size: 9,
            font: font,
            color: rgb(0.1, 0.6, 0.3),
          });
          y -= lineHeight * 0.8;
        }
      }
      y -= lineHeight;
    }
  }

  // Clause Explanations
  if (options.analysis.clauseExplanations && options.analysis.clauseExplanations.length > 0) {
    if (y < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    page.drawText('Clause Explanations', {
      x: margin,
      y: y,
      size: headingSize,
      font: boldFont,
    });
    y -= lineHeight * 1.5;

    for (const clause of options.analysis.clauseExplanations) {
      if (y < 50) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText(clause.clauseTitle, {
        x: margin,
        y: y,
        size: 10,
        font: boldFont,
      });
      y -= lineHeight;
      if (clause.clauseText) {
        const clauseTextLines = wrapText(`Clause: ${clause.clauseText}`, 80);
        for (const line of clauseTextLines) {
          if (y < 50) {
            const newPage = pdfDoc.addPage([612, 792]);
            y = 750;
          }
          page.drawText(line, {
            x: margin + 10,
            y: y,
            size: 9,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= lineHeight * 0.8;
        }
      }
      const explanationLines = wrapText(clause.explanation, 80);
      for (const line of explanationLines) {
        if (y < 50) {
          const newPage = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        page.drawText(line, {
          x: margin + 10,
          y: y,
          size: 9,
          font: font,
        });
        y -= lineHeight * 0.8;
      }
      y -= lineHeight;
    }
  }

  // Structured Terms
  if (structuredTerms) {
    if (structuredTerms.renewal) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Renewal Terms', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      page.drawText(`Auto-Renewal: ${structuredTerms.renewal.autoRenewal ? 'Yes' : 'No'}`, {
        x: margin,
        y: y,
        size: 10,
        font: font,
      });
      y -= lineHeight;
      if (structuredTerms.renewal.noticePeriod) {
        page.drawText(`Notice Period: ${structuredTerms.renewal.noticePeriod}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      if (structuredTerms.renewal.renewalTerm) {
        page.drawText(`Renewal Term: ${structuredTerms.renewal.renewalTerm}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      y -= lineHeight;
    }
    if (structuredTerms.termination) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Termination Terms', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      if (structuredTerms.termination.noticePeriod) {
        page.drawText(`Notice Period: ${structuredTerms.termination.noticePeriod}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      if (structuredTerms.termination.terminationFees) {
        page.drawText(`Termination Fees: ${structuredTerms.termination.terminationFees}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      if (structuredTerms.termination.conditions && structuredTerms.termination.conditions.length > 0) {
        page.drawText('Termination Conditions:', { x: margin, y: y, size: 10, font: boldFont });
        y -= lineHeight;
        structuredTerms.termination.conditions.forEach((condition) => {
          const conditionLines = wrapText(`  • ${condition}`, 80);
          conditionLines.forEach((line) => {
            page.drawText(line, { x: margin, y: y, size: 9, font: font });
            y -= lineHeight * 0.8;
          });
        });
        y -= lineHeight;
      }
      y -= lineHeight;
    }
    if (structuredTerms.intellectualProperty) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Intellectual Property', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      if (structuredTerms.intellectualProperty.ownership) {
        page.drawText(`Ownership: ${structuredTerms.intellectualProperty.ownership}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      if (structuredTerms.intellectualProperty.licensing) {
        page.drawText(`Licensing: ${structuredTerms.intellectualProperty.licensing}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      y -= lineHeight;
    }
    if (structuredTerms.confidentiality) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Confidentiality', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      if (structuredTerms.confidentiality.scope) {
        const scopeLines = wrapText(structuredTerms.confidentiality.scope, 80);
        scopeLines.forEach((line) => {
          page.drawText(line, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
      }
      if (structuredTerms.confidentiality.duration) {
        page.drawText(`Duration: ${structuredTerms.confidentiality.duration}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      if (structuredTerms.confidentiality.exceptions && structuredTerms.confidentiality.exceptions.length > 0) {
        page.drawText('Exceptions:', { x: margin, y: y, size: 10, font: boldFont });
        y -= lineHeight;
        structuredTerms.confidentiality.exceptions.forEach((exception) => {
          page.drawText(`  • ${exception}`, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
        y -= lineHeight;
      }
      y -= lineHeight;
    }
    if (structuredTerms.forceMajeure) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Force Majeure', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      if (structuredTerms.forceMajeure.definition) {
        const defLines = wrapText(`Definition: ${structuredTerms.forceMajeure.definition}`, 80);
        defLines.forEach((line) => {
          page.drawText(line, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
      }
      if (structuredTerms.forceMajeure.consequences) {
        const consLines = wrapText(`Consequences: ${structuredTerms.forceMajeure.consequences}`, 80);
        consLines.forEach((line) => {
          page.drawText(line, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
      }
      y -= lineHeight;
    }
    if (structuredTerms.insurance) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Insurance Requirements', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      if (structuredTerms.insurance.requirements && structuredTerms.insurance.requirements.length > 0) {
        page.drawText('Required Types:', { x: margin, y: y, size: 10, font: boldFont });
        y -= lineHeight;
        structuredTerms.insurance.requirements.forEach((req) => {
          page.drawText(`  • ${req}`, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
      }
      if (structuredTerms.insurance.minimumCoverage) {
        page.drawText(`Minimum Coverage: ${structuredTerms.insurance.minimumCoverage}`, { x: margin, y: y, size: 10, font: font });
        y -= lineHeight;
      }
      y -= lineHeight;
    }
  }

  // Performance Metrics
  if (performanceMetrics) {
    if (performanceMetrics.slas && performanceMetrics.slas.length > 0) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Service Level Agreements (SLAs)', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      performanceMetrics.slas.forEach((sla) => {
        const slaLines = wrapText(sla, 80);
        slaLines.forEach((line) => {
          page.drawText(`  - ${line}`, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
        y -= lineHeight * 0.5;
      });
      y -= lineHeight;
    }
    if (performanceMetrics.kpis && performanceMetrics.kpis.length > 0) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Key Performance Indicators (KPIs)', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      performanceMetrics.kpis.forEach((kpi) => {
        const kpiLines = wrapText(kpi, 80);
        kpiLines.forEach((line) => {
          page.drawText(`  - ${line}`, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
        y -= lineHeight * 0.5;
      });
      y -= lineHeight;
    }
    if (performanceMetrics.deliverables && performanceMetrics.deliverables.length > 0) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Deliverables', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      performanceMetrics.deliverables.forEach((deliverable) => {
        const deliverableLines = wrapText(deliverable, 80);
        deliverableLines.forEach((line) => {
          page.drawText(`  - ${line}`, { x: margin, y: y, size: 9, font: font });
          y -= lineHeight * 0.8;
        });
        y -= lineHeight * 0.5;
      });
      y -= lineHeight;
    }
    if (performanceMetrics.milestones && performanceMetrics.milestones.length > 0) {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
      }
      page.drawText('Milestones', {
        x: margin,
        y: y,
        size: headingSize,
        font: boldFont,
      });
      y -= lineHeight * 1.5;
      performanceMetrics.milestones.forEach((milestone) => {
        page.drawText(`${milestone.name}${milestone.date ? ` - ${milestone.date}` : ''}`, {
          x: margin,
          y: y,
          size: 10,
          font: font,
        });
        y -= lineHeight;
        if (milestone.description) {
          const descLines = wrapText(milestone.description, 80);
          descLines.forEach((line) => {
            page.drawText(`  ${line}`, { x: margin + 10, y: y, size: 9, font: font });
            y -= lineHeight * 0.8;
          });
        }
        y -= lineHeight * 0.5;
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

const exportToWord = async (options: ExportOptions): Promise<Buffer> => {
  const children: Paragraph[] = [];

  if (options.branded) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ContractIQ',
            bold: true,
            size: 32,
            color: '6366F1',
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      text: options.contractName,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'Summary',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: options.analysis.summary,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'Key Parties',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: `Party 1: ${options.analysis.keyParties.party1}`,
    }),
    new Paragraph({
      text: `Party 2: ${options.analysis.keyParties.party2}`,
    })
  );

  // Enhanced Data Sections
  const { dates, financialDetails, legalInfo, contractMetadata, structuredTerms, performanceMetrics } = options.analysis;

  if (dates && (dates.startDate || dates.endDate || dates.signingDate || dates.effectiveDate)) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Important Dates',
        heading: HeadingLevel.HEADING_2,
      })
    );
    if (dates.startDate) children.push(new Paragraph({ text: `Start Date: ${dates.startDate}` }));
    if (dates.endDate) children.push(new Paragraph({ text: `End Date: ${dates.endDate}` }));
    if (dates.signingDate) children.push(new Paragraph({ text: `Signing Date: ${dates.signingDate}` }));
    if (dates.effectiveDate) children.push(new Paragraph({ text: `Effective Date: ${dates.effectiveDate}` }));
  }

  if (financialDetails) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Financial Details',
        heading: HeadingLevel.HEADING_2,
      })
    );
    if (financialDetails.totalValue) {
      children.push(new Paragraph({
        text: `Total Value: ${financialDetails.totalValue} ${financialDetails.currency || ''}`,
      }));
    }
    if (financialDetails.paymentAmounts && financialDetails.paymentAmounts.length > 0) {
      children.push(new Paragraph({ text: 'Payment Schedule:' }));
      financialDetails.paymentAmounts.forEach((payment) => {
        children.push(new Paragraph({
          text: `  • ${payment.amount} ${financialDetails.currency || ''} (${payment.schedule})${payment.dueDate ? ` - Due: ${payment.dueDate}` : ''}`,
        }));
      });
    }
  }

  if (legalInfo && (legalInfo.governingLaw || legalInfo.jurisdiction || legalInfo.disputeResolution || legalInfo.venue)) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Legal Information',
        heading: HeadingLevel.HEADING_2,
      })
    );
    if (legalInfo.governingLaw) children.push(new Paragraph({ text: `Governing Law: ${legalInfo.governingLaw}` }));
    if (legalInfo.jurisdiction) children.push(new Paragraph({ text: `Jurisdiction: ${legalInfo.jurisdiction}` }));
    if (legalInfo.disputeResolution) children.push(new Paragraph({ text: `Dispute Resolution: ${legalInfo.disputeResolution}` }));
    if (legalInfo.venue) children.push(new Paragraph({ text: `Venue: ${legalInfo.venue}` }));
  }

  if (contractMetadata?.signatories && contractMetadata.signatories.length > 0) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Signatories',
        heading: HeadingLevel.HEADING_2,
      })
    );
    contractMetadata.signatories.forEach((sig) => {
      children.push(new Paragraph({
        text: `${sig.name}${sig.title ? ` - ${sig.title}` : ''} (${sig.party})`,
      }));
    });
  }

  // Key Obligations
  if (options.analysis.obligations && options.analysis.obligations.length > 0) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Key Obligations',
        heading: HeadingLevel.HEADING_2,
      })
    );
    options.analysis.obligations.forEach((obligation, index) => {
      children.push(new Paragraph({
        text: `${index + 1}. ${obligation}`,
      }));
    });
  }

  if (structuredTerms) {
    if (structuredTerms.renewal) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Renewal Terms',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: `Auto-Renewal: ${structuredTerms.renewal.autoRenewal ? 'Yes' : 'No'}`,
        })
      );
      if (structuredTerms.renewal.noticePeriod) {
        children.push(new Paragraph({ text: `Notice Period: ${structuredTerms.renewal.noticePeriod}` }));
      }
      if (structuredTerms.renewal.renewalTerm) {
        children.push(new Paragraph({ text: `Renewal Term: ${structuredTerms.renewal.renewalTerm}` }));
      }
      if (structuredTerms.renewal.conditions) {
        children.push(new Paragraph({ text: `Conditions: ${structuredTerms.renewal.conditions}` }));
      }
    }
    if (structuredTerms.termination) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Termination Terms',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (structuredTerms.termination.noticePeriod) {
        children.push(new Paragraph({ text: `Notice Period: ${structuredTerms.termination.noticePeriod}` }));
      }
      if (structuredTerms.termination.terminationFees) {
        children.push(new Paragraph({ text: `Termination Fees: ${structuredTerms.termination.terminationFees}` }));
      }
      if (structuredTerms.termination.conditions && structuredTerms.termination.conditions.length > 0) {
        children.push(new Paragraph({ text: 'Conditions:' }));
        structuredTerms.termination.conditions.forEach((condition) => {
          children.push(new Paragraph({ text: `  • ${condition}` }));
        });
      }
    }
    if (structuredTerms.intellectualProperty) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Intellectual Property',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (structuredTerms.intellectualProperty.ownership) {
        children.push(new Paragraph({ text: `Ownership: ${structuredTerms.intellectualProperty.ownership}` }));
      }
      if (structuredTerms.intellectualProperty.licensing) {
        children.push(new Paragraph({ text: `Licensing: ${structuredTerms.intellectualProperty.licensing}` }));
      }
      if (structuredTerms.intellectualProperty.restrictions) {
        children.push(new Paragraph({ text: `Restrictions: ${structuredTerms.intellectualProperty.restrictions}` }));
      }
    }
    if (structuredTerms.confidentiality) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Confidentiality',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (structuredTerms.confidentiality.scope) {
        children.push(new Paragraph({ text: `Scope: ${structuredTerms.confidentiality.scope}` }));
      }
      if (structuredTerms.confidentiality.duration) {
        children.push(new Paragraph({ text: `Duration: ${structuredTerms.confidentiality.duration}` }));
      }
      if (structuredTerms.confidentiality.exceptions && structuredTerms.confidentiality.exceptions.length > 0) {
        children.push(new Paragraph({ text: 'Exceptions:' }));
        structuredTerms.confidentiality.exceptions.forEach((exception) => {
          children.push(new Paragraph({ text: `  • ${exception}` }));
        });
      }
    }
    if (structuredTerms.forceMajeure) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Force Majeure',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (structuredTerms.forceMajeure.definition) {
        children.push(new Paragraph({ text: `Definition: ${structuredTerms.forceMajeure.definition}` }));
      }
      if (structuredTerms.forceMajeure.consequences) {
        children.push(new Paragraph({ text: `Consequences: ${structuredTerms.forceMajeure.consequences}` }));
      }
    }
    if (structuredTerms.insurance) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Insurance Requirements',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (structuredTerms.insurance.requirements && structuredTerms.insurance.requirements.length > 0) {
        children.push(new Paragraph({ text: 'Required Types:' }));
        structuredTerms.insurance.requirements.forEach((req) => {
          children.push(new Paragraph({ text: `  • ${req}` }));
        });
      }
      if (structuredTerms.insurance.minimumCoverage) {
        children.push(new Paragraph({ text: `Minimum Coverage: ${structuredTerms.insurance.minimumCoverage}` }));
      }
    }
  }

  if (performanceMetrics) {
    if (performanceMetrics.slas && performanceMetrics.slas.length > 0) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Service Level Agreements (SLAs)',
          heading: HeadingLevel.HEADING_2,
        })
      );
      performanceMetrics.slas.forEach((sla) => {
        children.push(new Paragraph({ text: `  • ${sla}` }));
      });
    }
    if (performanceMetrics.kpis && performanceMetrics.kpis.length > 0) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Key Performance Indicators (KPIs)',
          heading: HeadingLevel.HEADING_2,
        })
      );
      performanceMetrics.kpis.forEach((kpi) => {
        children.push(new Paragraph({ text: `  • ${kpi}` }));
      });
    }
    if (performanceMetrics.deliverables && performanceMetrics.deliverables.length > 0) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Deliverables',
          heading: HeadingLevel.HEADING_2,
        })
      );
      performanceMetrics.deliverables.forEach((deliverable) => {
        children.push(new Paragraph({ text: `  • ${deliverable}` }));
      });
    }
    if (performanceMetrics.milestones && performanceMetrics.milestones.length > 0) {
      children.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Milestones',
          heading: HeadingLevel.HEADING_2,
        })
      );
      performanceMetrics.milestones.forEach((milestone) => {
        children.push(new Paragraph({
          text: `${milestone.name}${milestone.date ? ` - ${milestone.date}` : ''}`,
        }));
        if (milestone.description) {
          children.push(new Paragraph({ text: `  ${milestone.description}` }));
        }
      });
    }
  }

  if (options.analysis.riskFlags.length > 0) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Risk Flags',
        heading: HeadingLevel.HEADING_2,
      })
    );

    for (const risk of options.analysis.riskFlags) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${risk.severity.toUpperCase()}: ${risk.title}`,
              bold: true,
              color: risk.severity === 'high' ? 'E11D48' : '000000',
            }),
          ],
        }),
        new Paragraph({
          text: risk.description,
        })
      );
      if (risk.suggestion) {
        children.push(new Paragraph({
          children: [
            new TextRun({
              text: `Suggestion: ${risk.suggestion}`,
              color: '10B981',
            }),
          ],
        }));
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  // Clause Explanations
  if (options.analysis.clauseExplanations && options.analysis.clauseExplanations.length > 0) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Clause Explanations',
        heading: HeadingLevel.HEADING_2,
      })
    );

    for (const clause of options.analysis.clauseExplanations) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: clause.clauseTitle,
              bold: true,
            }),
          ],
        })
      );
      if (clause.clauseText) {
        children.push(new Paragraph({
          children: [
            new TextRun({
              text: `Clause: ${clause.clauseText}`,
              color: '666666',
              italics: true,
            }),
          ],
        }));
      }
      children.push(new Paragraph({
        text: clause.explanation,
      }));
      children.push(new Paragraph({ text: '' }));
    }
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
};

const exportToExcel = async (options: ExportOptions): Promise<Buffer> => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet with enhanced data
  const summaryData: any[][] = [
    ['Contract Analysis Report'],
    ['Contract Name', options.contractName],
    [''],
    ['Summary', options.analysis.summary],
    [''],
    ['Key Parties'],
    ['Party 1', options.analysis.keyParties.party1],
    ['Party 2', options.analysis.keyParties.party2],
  ];

  // Add enhanced data
  const { dates, financialDetails, legalInfo, contractMetadata, structuredTerms, performanceMetrics } = options.analysis;

  if (dates) {
    summaryData.push([''], ['Important Dates']);
    if (dates.startDate) summaryData.push(['Start Date', dates.startDate]);
    if (dates.endDate) summaryData.push(['End Date', dates.endDate]);
    if (dates.signingDate) summaryData.push(['Signing Date', dates.signingDate]);
    if (dates.effectiveDate) summaryData.push(['Effective Date', dates.effectiveDate]);
  }

  if (financialDetails) {
    summaryData.push([''], ['Financial Details']);
    if (financialDetails.totalValue) {
      summaryData.push(['Total Value', `${financialDetails.totalValue} ${financialDetails.currency || ''}`]);
    }
    if (financialDetails.paymentAmounts && financialDetails.paymentAmounts.length > 0) {
      summaryData.push(['Payment Schedule']);
      financialDetails.paymentAmounts.forEach((payment) => {
        summaryData.push([`  ${payment.amount} ${financialDetails.currency || ''}`, `${payment.schedule}${payment.dueDate ? ` - Due: ${payment.dueDate}` : ''}`]);
      });
    }
  }

  if (legalInfo) {
    summaryData.push([''], ['Legal Information']);
    if (legalInfo.governingLaw) summaryData.push(['Governing Law', legalInfo.governingLaw]);
    if (legalInfo.jurisdiction) summaryData.push(['Jurisdiction', legalInfo.jurisdiction]);
    if (legalInfo.disputeResolution) summaryData.push(['Dispute Resolution', legalInfo.disputeResolution]);
    if (legalInfo.venue) summaryData.push(['Venue', legalInfo.venue]);
  }

  if (contractMetadata) {
    if (contractMetadata.contractType) summaryData.push([''], ['Contract Type', contractMetadata.contractType]);
    if (contractMetadata.category) summaryData.push(['Category', contractMetadata.category]);
    if (contractMetadata.signatories && contractMetadata.signatories.length > 0) {
      summaryData.push([''], ['Signatories']);
      contractMetadata.signatories.forEach((sig) => {
        summaryData.push([sig.name, `${sig.title || ''} (${sig.party})`]);
      });
    }
  }

  if (structuredTerms) {
    summaryData.push([''], ['Structured Terms']);
    if (structuredTerms.renewal) {
      summaryData.push(['Auto-Renewal', structuredTerms.renewal.autoRenewal ? 'Yes' : 'No']);
      if (structuredTerms.renewal.noticePeriod) summaryData.push(['Renewal Notice Period', structuredTerms.renewal.noticePeriod]);
      if (structuredTerms.renewal.renewalTerm) summaryData.push(['Renewal Term', structuredTerms.renewal.renewalTerm]);
    }
    if (structuredTerms.termination) {
      if (structuredTerms.termination.noticePeriod) summaryData.push(['Termination Notice Period', structuredTerms.termination.noticePeriod]);
      if (structuredTerms.termination.terminationFees) summaryData.push(['Termination Fees', structuredTerms.termination.terminationFees]);
    }
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Key Obligations sheet
  if (options.analysis.obligations && options.analysis.obligations.length > 0) {
    const obligationsData = [
      ['#', 'Obligation'],
      ...options.analysis.obligations.map((ob, index) => [index + 1, ob]),
    ];
    const obligationsSheet = XLSX.utils.aoa_to_sheet(obligationsData);
    XLSX.utils.book_append_sheet(workbook, obligationsSheet, 'Obligations');
  }

  // Risk Flags sheet
  if (options.analysis.riskFlags.length > 0) {
    const riskData = [
      ['Severity', 'Title', 'Description', 'Suggestion'],
      ...options.analysis.riskFlags.map(risk => [
        risk.severity,
        risk.title,
        risk.description,
        risk.suggestion || '',
      ]),
    ];
    const riskSheet = XLSX.utils.aoa_to_sheet(riskData);
    XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Flags');
  }

  // Clause Explanations sheet
  if (options.analysis.clauseExplanations && options.analysis.clauseExplanations.length > 0) {
    const clauseData = [
      ['Clause Title', 'Clause Text', 'Explanation', 'Importance'],
      ...options.analysis.clauseExplanations.map(clause => [
        clause.clauseTitle,
        clause.clauseText || '',
        clause.explanation,
        clause.importance,
      ]),
    ];
    const clauseSheet = XLSX.utils.aoa_to_sheet(clauseData);
    XLSX.utils.book_append_sheet(workbook, clauseSheet, 'Clause Explanations');
  }

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

const exportToCSV = async (options: ExportOptions): Promise<Buffer> => {
  const rows: string[][] = [
    ['Contract Analysis Report'],
    ['Contract Name', options.contractName],
    [''],
    ['Summary', options.analysis.summary],
    [''],
    ['Key Parties'],
    ['Party 1', options.analysis.keyParties.party1],
    ['Party 2', options.analysis.keyParties.party2],
  ];

  // Add enhanced data
  const { dates, financialDetails, legalInfo, contractMetadata, structuredTerms, performanceMetrics } = options.analysis;

  if (dates) {
    rows.push([''], ['Important Dates']);
    if (dates.startDate) rows.push(['Start Date', dates.startDate]);
    if (dates.endDate) rows.push(['End Date', dates.endDate]);
    if (dates.signingDate) rows.push(['Signing Date', dates.signingDate]);
    if (dates.effectiveDate) rows.push(['Effective Date', dates.effectiveDate]);
  }

  if (financialDetails) {
    rows.push([''], ['Financial Details']);
    if (financialDetails.totalValue) {
      rows.push(['Total Value', `${financialDetails.totalValue} ${financialDetails.currency || ''}`]);
    }
    if (financialDetails.paymentAmounts && financialDetails.paymentAmounts.length > 0) {
      rows.push(['Payment Schedule']);
      financialDetails.paymentAmounts.forEach((payment) => {
        rows.push([`${payment.amount} ${financialDetails.currency || ''}`, `${payment.schedule}${payment.dueDate ? ` - Due: ${payment.dueDate}` : ''}`]);
      });
    }
  }

  if (legalInfo) {
    rows.push([''], ['Legal Information']);
    if (legalInfo.governingLaw) rows.push(['Governing Law', legalInfo.governingLaw]);
    if (legalInfo.jurisdiction) rows.push(['Jurisdiction', legalInfo.jurisdiction]);
    if (legalInfo.disputeResolution) rows.push(['Dispute Resolution', legalInfo.disputeResolution]);
    if (legalInfo.venue) rows.push(['Venue', legalInfo.venue]);
  }

  if (contractMetadata) {
    if (contractMetadata.contractType) rows.push([''], ['Contract Type', contractMetadata.contractType]);
    if (contractMetadata.category) rows.push(['Category', contractMetadata.category]);
    if (contractMetadata.signatories && contractMetadata.signatories.length > 0) {
      rows.push([''], ['Signatories']);
      contractMetadata.signatories.forEach((sig) => {
        rows.push([sig.name, `${sig.title || ''} (${sig.party})`]);
      });
    }
  }

  if (structuredTerms) {
    rows.push([''], ['Structured Terms']);
    if (structuredTerms.renewal) {
      rows.push(['Auto-Renewal', structuredTerms.renewal.autoRenewal ? 'Yes' : 'No']);
      if (structuredTerms.renewal.noticePeriod) rows.push(['Renewal Notice Period', structuredTerms.renewal.noticePeriod]);
    }
    if (structuredTerms.termination) {
      if (structuredTerms.termination.noticePeriod) rows.push(['Termination Notice Period', structuredTerms.termination.noticePeriod]);
      if (structuredTerms.termination.terminationFees) rows.push(['Termination Fees', structuredTerms.termination.terminationFees]);
    }
  }

  // Key Obligations
  if (options.analysis.obligations && options.analysis.obligations.length > 0) {
    rows.push([''], ['Key Obligations']);
    rows.push(['#', 'Obligation']);
    options.analysis.obligations.forEach((ob, index) => {
      rows.push([String(index + 1), ob.replace(/\n/g, ' ')]);
    });
  }

  rows.push([''], ['Risk Flags']);
  rows.push(['Severity', 'Title', 'Description', 'Suggestion']);
  rows.push(...options.analysis.riskFlags.map(risk => [
    risk.severity,
    risk.title,
    risk.description.replace(/\n/g, ' '),
    (risk.suggestion || '').replace(/\n/g, ' '),
  ]));

  // Clause Explanations
  if (options.analysis.clauseExplanations && options.analysis.clauseExplanations.length > 0) {
    rows.push([''], ['Clause Explanations']);
    rows.push(['Clause Title', 'Clause Text', 'Explanation', 'Importance']);
    rows.push(...options.analysis.clauseExplanations.map(clause => [
      clause.clauseTitle,
      (clause.clauseText || '').replace(/\n/g, ' '),
      clause.explanation.replace(/\n/g, ' '),
      clause.importance,
    ]));
  }

  const csv = rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  return Buffer.from(csv, 'utf-8');
};

const exportToJSON = async (options: ExportOptions): Promise<Buffer> => {
  const json = JSON.stringify(
    {
      contractName: options.contractName,
      exportedAt: new Date().toISOString(),
      analysis: options.analysis,
    },
    null,
    2
  );
  return Buffer.from(json, 'utf-8');
};

const wrapText = (text: string, maxLength: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

