import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/finance";

/**
 * Sistema compartido de generación de PDF para las herramientas financieras.
 * Todas las herramientas usan esta función para generar reportes detallados
 * con un diseño consistente y profesional.
 */

export interface PdfReportData {
  title: string;
  subtitle?: string;
  userName?: string;
  sections: PdfSection[];
  footer?: string;
}

export type PdfSection =
  | {
      type: "key-values";
      heading: string;
      rows: Array<{ label: string; value: string; highlight?: boolean }>;
    }
  | {
      type: "table";
      heading: string;
      headers: string[];
      rows: string[][];
      footnote?: string;
    }
  | {
      type: "text";
      heading: string;
      paragraphs: string[];
    };

const COLORS = {
  primary: [37, 99, 235] as [number, number, number], // blue-600
  primaryDark: [29, 78, 216] as [number, number, number],
  primaryLight: [219, 234, 254] as [number, number, number], // blue-100
  dark: [15, 23, 42] as [number, number, number], // slate-900
  gray: [100, 116, 139] as [number, number, number], // slate-500
  lightGray: [241, 245, 249] as [number, number, number], // slate-100
  white: [255, 255, 255] as [number, number, number],
  emerald: [5, 150, 105] as [number, number, number],
  rose: [225, 29, 72] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
};

/**
 * Genera y descarga un PDF detallado con el reporte de la herramienta.
 */
export function generatePdfReport(data: PdfReportData): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // ===== HEADER =====
  // Banda superior azul
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Título
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.title, margin, 35);

  // Subtítulo
  if (data.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.subtitle, margin, 52);
  }

  // Fecha a la derecha
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(9);
  doc.text(`Generado: ${dateStr}`, pageWidth - margin, 35, { align: "right" });
  if (data.userName) {
    doc.text(`Usuario: ${data.userName}`, pageWidth - margin, 52, {
      align: "right",
    });
  }

  y = 95;

  // ===== SECCIONES =====
  for (const section of data.sections) {
    // Verificar si hay espacio, si no, nueva página
    if (y > pageHeight - 100) {
      doc.addPage();
      y = margin;
    }

    if (section.type === "key-values") {
      y = renderKeyValues(doc, section, y, margin, contentWidth);
    } else if (section.type === "table") {
      y = renderTable(doc, section, y, margin, contentWidth, pageHeight);
    } else if (section.type === "text") {
      y = renderText(doc, section, y, margin, contentWidth);
    }

    y += 15;
  }

  // ===== FOOTER en cada página =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.setFont("helvetica", "normal");
    doc.text(
      data.footer || "Finanzas AR — Reporte de Herramienta Financiera",
      margin,
      pageHeight - 18
    );
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 18, {
      align: "right",
    });
  }

  // Descargar
  const fileName = `${data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${now.getTime()}.pdf`;
  doc.save(fileName);
}

function renderKeyValues(
  doc: jsPDF,
  section: Extract<PdfSection, { type: "key-values" }>,
  y: number,
  margin: number,
  contentWidth: number
): number {
  // Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.text(section.heading, margin, y);
  y += 8;

  // Usar autotable para los key-values (2 columnas: label, value)
  autoTable(doc, {
    startY: y,
    theme: "plain",
    body: section.rows.map((r) => [r.label, r.value]),
    columnStyles: {
      0: { cellWidth: contentWidth * 0.55, fontStyle: "normal" },
      1: {
        cellWidth: contentWidth * 0.45,
        fontStyle: "bold",
        halign: "right",
      },
    },
    styles: {
      fontSize: 10,
      cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
      textColor: COLORS.dark as unknown as number,
      lineColor: COLORS.lightGray as unknown as number,
      lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 },
    },
    didParseCell: (data) => {
      const row = section.rows[data.row.index];
      if (row?.highlight) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 12;
        data.cell.styles.textColor = COLORS.primary as unknown as number;
        data.cell.styles.fillColor = COLORS.primaryLight as unknown as number[];
      }
    },
  });

  // @ts-ignore — get last auto table end position
  return (doc as any).lastAutoTable.finalY + 5;
}

function renderTable(
  doc: jsPDF,
  section: Extract<PdfSection, { type: "table" }>,
  y: number,
  margin: number,
  contentWidth: number,
  pageHeight: number
): number {
  // Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.text(section.heading, margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [section.headers],
    body: section.rows,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.primary as unknown as number[],
      textColor: COLORS.white as unknown as number,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.dark as unknown as number,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray as unknown as number[],
    },
    styles: {
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      lineColor: COLORS.lightGray as unknown as number,
      lineWidth: 0.5,
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore
  let endY = (doc as any).lastAutoTable.finalY + 5;

  // Footnote
  if (section.footnote) {
    if (endY > pageHeight - 60) {
      doc.addPage();
      endY = margin;
    }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    const lines = doc.splitTextToSize(section.footnote, contentWidth);
    doc.text(lines, margin, endY + 5);
    endY += lines.length * 11 + 5;
  }

  return endY;
}

function renderText(
  doc: jsPDF,
  section: Extract<PdfSection, { type: "text" }>,
  y: number,
  margin: number,
  contentWidth: number
): number {
  // Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.text(section.heading, margin, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);

  for (const para of section.paragraphs) {
    const lines = doc.splitTextToSize(para, contentWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    }
    y += 4;
  }

  return y;
}

/**
 * Helper para formatear montos en ARS en el contexto de PDF.
 */
export { formatCurrency };
