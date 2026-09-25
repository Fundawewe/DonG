import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DialInLog, StaffMember, CafeBranch } from '../types';

export interface QCPdfExportOptions {
  branch: CafeBranch;
  logs: DialInLog[];
  generatedBy: string;
  notes?: string;
}

export interface StaffPdfExportOptions {
  branch: CafeBranch;
  staffList: StaffMember[];
  generatedBy: string;
  notes?: string;
}

/**
 * Generates and downloads a high-resolution, print-ready PDF for Daily Espresso QC Shift Handover
 */
export const exportDailyQCToPDF = ({
  branch,
  logs,
  generatedBy,
  notes
}: QCPdfExportOptions): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Header Background Accent Banner
  doc.setFillColor(20, 20, 20); // Dark espresso charcoal
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Brand Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BARISTA OS', 14, 13);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(210, 210, 210);
  doc.text('Daily Espresso QC Calibration & Shift Handover Report', 14, 21);

  // Right Header Info (Branch & Timestamp)
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Location: ${branch.name}`, pageWidth - 14, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Handover Date: ${dateStr} at ${timeStr}`, pageWidth - 14, 17, { align: 'right' });
  doc.text(`Supervisor: ${generatedBy} | Ref: QC-${now.getTime().toString().slice(-6)}`, pageWidth - 14, 23, { align: 'right' });

  // 2. Summary KPI Metrics Box
  let currentY = 36;
  const sweetSpotCount = logs.filter(l => l.status === 'sweet-spot').length;
  const totalLogs = logs.length;
  const complianceRate = totalLogs > 0 ? Math.round((sweetSpotCount / totalLogs) * 100) : 0;
  const avgEY = totalLogs > 0 ? (logs.reduce((acc, l) => acc + l.extractionYieldPercent, 0) / totalLogs).toFixed(2) : '0.00';
  const avgTDS = totalLogs > 0 ? (logs.reduce((acc, l) => acc + l.tdsPercent, 0) / totalLogs).toFixed(2) : '0.00';
  const approvedCount = logs.filter(l => l.approvedForShift).length;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, currentY, pageWidth - 28, 18, 2, 2, 'FD');

  const colWidth = (pageWidth - 28) / 5;
  const kpis = [
    { label: 'TOTAL SHOTS LOGGED', value: `${totalLogs} Pulls` },
    { label: 'SCA SWEET SPOT COMPLIANCE', value: `${complianceRate}% (${sweetSpotCount}/${totalLogs})` },
    { label: 'MEAN EXTRACTION (EY %)', value: `${avgEY}% EY` },
    { label: 'MEAN CONCENTRATION (TDS)', value: `${avgTDS}% TDS` },
    { label: 'SHIFT APPROVED RECIPES', value: `${approvedCount} Approved` }
  ];

  kpis.forEach((kpi, idx) => {
    const startX = 14 + (idx * colWidth);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.label, startX + 5, currentY + 6);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(kpi.value, startX + 5, currentY + 13);

    if (idx < 4) {
      doc.setDrawColor(225, 225, 225);
      doc.line(startX + colWidth, currentY + 3, startX + colWidth, currentY + 15);
    }
  });

  currentY += 24;

  // 3. QC Calibration Logs Table
  const tableRows = logs.map(log => {
    const ratio = (log.yieldOut / log.doseIn).toFixed(2);
    const statusText = log.status === 'sweet-spot' ? 'SWEET SPOT' :
                       log.status === 'under-extracted' ? 'UNDER-EXT' :
                       log.status === 'over-extracted' ? 'OVER-EXT' : 'CHANNELING';

    return [
      log.timestamp.split(' ')[1] || log.timestamp,
      log.recipeName,
      log.baristaName.split(' ')[0],
      `${log.doseIn}g -> ${log.yieldOut}g\n(1:${ratio})`,
      `${log.timeSeconds}s`,
      `${log.grindSetting}\n${log.brewTemp}°C`,
      `${log.tdsPercent}%`,
      `${log.extractionYieldPercent}%`,
      statusText,
      `${log.sensoryScores.overallScore}/100\nAc:${log.sensoryScores.acidity} Sw:${log.sensoryScores.sweetness}`,
      log.approvedForShift ? 'APPROVED' : 'RE-CALIBRATE',
      log.adjustmentsMade || log.tastingNotes
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Time',
      'Espresso Origin / Recipe',
      'Barista',
      'Dose -> Yield',
      'Time',
      'Grind / Temp',
      'TDS %',
      'EY %',
      'Diagnosis',
      'Cup Score',
      'Approval',
      'Calibration Notes / Bar Adjustments'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [40, 40, 40],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 26 },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 22, halign: 'center' },
      9: { cellWidth: 20, halign: 'center' },
      10: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      11: { cellWidth: 'auto' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    didParseCell: (data) => {
      // Color status cells
      if (data.section === 'body' && data.column.index === 8) {
        if (data.cell.raw === 'SWEET SPOT') {
          data.cell.styles.textColor = [16, 120, 70];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'UNDER-EXT') {
          data.cell.styles.textColor = [180, 100, 0];
        } else {
          data.cell.styles.textColor = [200, 30, 30];
        }
      }
      if (data.section === 'body' && data.column.index === 10) {
        if (data.cell.raw === 'APPROVED') {
          data.cell.styles.textColor = [16, 120, 70];
        } else {
          data.cell.styles.textColor = [200, 30, 30];
        }
      }
    }
  });

  // 4. Handover Sign-off Block (Bottom of page or next page if needed)
  const finalY = (doc as any).lastAutoTable?.finalY || 140;
  let signY = finalY + 8;

  // Check if sign-off fits on current page (requires ~30mm)
  if (signY > pageHeight - 35) {
    doc.addPage();
    signY = 20;
  }

  doc.setDrawColor(210, 210, 210);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(14, signY, pageWidth - 28, 24, 2, 2, 'FD');

  const signColWidth = (pageWidth - 28) / 3;

  // Col 1: Outgoing Barista Sign-off
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('OUTGOING HEAD BARISTA SIGN-OFF', 18, signY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('Signature: ___________________________', 18, signY + 12);
  doc.text(`Date & Time: ${dateStr} ${timeStr}`, 18, signY + 19);

  // Col 2: Incoming Shift Lead Sign-off
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('INCOMING SHIFT SUPERVISOR ACCEPTANCE', 18 + signColWidth, signY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('Signature: ___________________________', 18 + signColWidth, signY + 12);
  doc.text('Bar Calibration Accepted: [  ] YES   [  ] NO', 18 + signColWidth, signY + 19);

  // Col 3: Shift Notes
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('SPECIAL SHIFT INSTRUCTIONS / MACHINE NOTES', 18 + (signColWidth * 2), signY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const notesText = notes || 'All group heads purged and backflushed. Grinder collars locked to calibrated recipe targets.';
  doc.text(doc.splitTextToSize(notesText, signColWidth - 10), 18 + (signColWidth * 2), signY + 11);

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Barista OS Specialty Coffee Operating System · Handover Record Generated ${dateStr} · Printed for physical store compliance archives`,
    14,
    pageHeight - 6
  );

  // Save PDF
  const filename = `BaristaOS_DailyQC_${branch.name.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Generates and downloads a high-resolution, print-ready PDF for Staff Roster & Performance Shift Handover
 */
export const exportStaffPerformanceToPDF = ({
  branch,
  staffList,
  generatedBy,
  notes
}: StaffPdfExportOptions): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Header Background Accent Banner
  doc.setFillColor(20, 20, 20); // Dark espresso
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('BARISTA OS', 14, 13);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(210, 210, 210);
  doc.text('Staff Performance & Shift Roster Handover Report', 14, 21);

  // Right Header
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Location: ${branch.name}`, pageWidth - 14, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Report Date: ${dateStr} ${timeStr}`, pageWidth - 14, 17, { align: 'right' });
  doc.text(`Manager: ${generatedBy}`, pageWidth - 14, 23, { align: 'right' });

  let currentY = 36;

  // 2. Summary KPI Box
  const activeCount = staffList.filter(s => s.status === 'on-shift').length;
  const breakCount = staffList.filter(s => s.status === 'break').length;
  const totalShotsAll = staffList.reduce((acc, s) => acc + s.totalShotsLogged, 0);
  const avgQcScore = Math.round(staffList.reduce((acc, s) => acc + s.averageExtractionScore, 0) / Math.max(1, staffList.length));

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'FD');

  const colW = (pageWidth - 28) / 4;
  const staffKpis = [
    { label: 'STAFF ON ACTIVE DUTY', value: `${activeCount} on bar (${breakCount} on break)` },
    { label: 'TOTAL ROSTER SIZE', value: `${staffList.length} Team Members` },
    { label: 'TEAM QC EXTRACTION SCORE', value: `${avgQcScore}% Avg` },
    { label: 'CUMULATIVE DRINKS PULLED', value: `${totalShotsAll.toLocaleString()} Shots` }
  ];

  staffKpis.forEach((kpi, idx) => {
    const startX = 14 + (idx * colW);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.label, startX + 4, currentY + 5.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(kpi.value, startX + 4, currentY + 12);

    if (idx < 3) {
      doc.setDrawColor(220, 220, 220);
      doc.line(startX + colW, currentY + 2.5, startX + colW, currentY + 13.5);
    }
  });

  currentY += 22;

  // 3. Staff Roster & Performance Table
  const tableRows = staffList.map(staff => {
    const statusLabel = staff.status === 'on-shift' ? 'ON SHIFT' :
                        staff.status === 'break' ? 'ON BREAK' : 'OFF DUTY';
    const certsStr = staff.examCertifications.map(c => c.split(':')[0]).join(', ');

    return [
      staff.name,
      staff.role,
      statusLabel,
      `${staff.dialInStreakDays} days`,
      staff.totalShotsLogged.toLocaleString(),
      `${staff.averageExtractionScore}%`,
      `${staff.shiftHoursLogged} hrs`,
      certsStr || 'Training in progress'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Barista Name',
      'Role & Title',
      'Shift Status',
      'QC Streak',
      'Total Shots',
      'Mean Score',
      'Hours',
      'Accreditations & Certifications'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [40, 40, 40],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 'auto' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'ON SHIFT') {
          data.cell.styles.textColor = [16, 120, 70];
        } else if (data.cell.raw === 'ON BREAK') {
          data.cell.styles.textColor = [180, 100, 0];
        } else {
          data.cell.styles.textColor = [120, 120, 120];
        }
      }
    }
  });

  // 4. Handover Sign-off Block
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  let signY = finalY + 10;

  if (signY > pageHeight - 45) {
    doc.addPage();
    signY = 20;
  }

  doc.setDrawColor(210, 210, 210);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(14, signY, pageWidth - 28, 28, 2, 2, 'FD');

  const halfWidth = (pageWidth - 28) / 2;

  // Left: Outgoing Shift Supervisor
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('OUTGOING SHIFT SUPERVISOR CONFIRMATION', 18, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('I confirm active station assignments and hours recorded above.', 18, signY + 12);
  doc.text('Signature: _______________________________ Date: ___________', 18, signY + 22);

  // Right: Incoming Shift Lead / Store Manager
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('INCOMING SHIFT MANAGER ACCEPTANCE', 18 + halfWidth, signY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(notes || 'Bar assignments verified. Break schedules and opening duties accepted.', 18 + halfWidth, signY + 12);
  doc.text('Signature: _______________________________ Date: ___________', 18 + halfWidth, signY + 22);

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Barista OS Shift Handover System · Generated ${dateStr} ${timeStr} · File in Store Operations Binder`,
    14,
    pageHeight - 6
  );

  // Save PDF
  const filename = `BaristaOS_StaffRoster_${branch.name.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
