/**
 * Production-grade PDF receipt generator for CoreInventory
 * Supports: Receipts, Deliveries, Transfers, Adjustments
 * Features: Logo, professional header, styled tables, signature/stamp space, footer
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const BRAND = {
  primary: [79, 70, 229] as [number, number, number],       // Indigo-600
  primaryDark: [55, 48, 163] as [number, number, number],    // Indigo-800
  dark: [15, 17, 23] as [number, number, number],            // Sidebar dark
  gray900: [17, 24, 39] as [number, number, number],
  gray600: [75, 85, 99] as [number, number, number],
  gray400: [156, 163, 175] as [number, number, number],
  gray200: [229, 231, 235] as [number, number, number],
  gray50: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentType = "receipt" | "delivery" | "transfer" | "adjustment";

interface PDFDocumentMeta {
  type: DocumentType;
  reference: string;
  status: string;
  createdAt: string | Date;
  validatedAt?: string | Date | null;
}

interface PDFPartyInfo {
  label: string;  // "Supplier", "Customer", "Source", etc.
  value: string;
  secondaryLabel?: string;  // "Destination", etc.
  secondaryValue?: string;
}

interface PDFTableColumn {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  width?: number;
}

interface PDFTableRow {
  [key: string]: string | number;
}

export interface PDFGeneratorOptions {
  meta: PDFDocumentMeta;
  party: PDFPartyInfo;
  columns: PDFTableColumn[];
  rows: PDFTableRow[];
  notes?: string;
  scheduledDate?: string | Date | null;
}

// ─── Title Map ────────────────────────────────────────────────────────────────

const DOC_TITLES: Record<DocumentType, string> = {
  receipt: "GOODS RECEIPT NOTE",
  delivery: "DELIVERY NOTE",
  transfer: "INTERNAL TRANSFER",
  adjustment: "INVENTORY ADJUSTMENT",
};

const DOC_SUBTITLES: Record<DocumentType, string> = {
  receipt: "Inbound Shipment Document",
  delivery: "Outbound Shipment Document",
  transfer: "Inter-Location Stock Movement",
  adjustment: "Physical Inventory Count Record",
};

// ─── Status Display ───────────────────────────────────────────────────────────

function getStatusStyle(status: string): { bg: [number, number, number]; text: [number, number, number]; label: string } {
  const s = status.toLowerCase();
  if (s === "done") return { bg: [220, 252, 231], text: [22, 101, 52], label: "COMPLETED" };
  if (s === "ready") return { bg: [219, 234, 254], text: [30, 64, 175], label: "READY" };
  if (s === "waiting") return { bg: [254, 249, 195], text: [133, 77, 14], label: "WAITING" };
  if (s === "canceled") return { bg: [254, 226, 226], text: [153, 27, 27], label: "CANCELED" };
  return { bg: [243, 244, 246], text: [55, 65, 81], label: "DRAFT" };
}

// ─── Draw Logo ────────────────────────────────────────────────────────────────

function drawLogo(doc: jsPDF, x: number, y: number) {
  // Draw the indigo square icon
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(x, y, 12, 12, 2, 2, "F");

  // Draw a small "box" icon inside resembling Package
  doc.setDrawColor(...BRAND.white);
  doc.setLineWidth(0.6);
  doc.rect(x + 3, y + 3.5, 6, 5, "S");
  doc.line(x + 3, y + 5.5, x + 9, y + 5.5); // lid line
  doc.line(x + 6, y + 5.5, x + 6, y + 8.5); // center line

  // Brand text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.dark);
  doc.text("CoreInventory", x + 15, y + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.gray400);
  doc.text("Warehouse Management System", x + 15, y + 11);
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export function generatePDF(opts: PDFGeneratorOptions): jsPDF {
  const { meta, party, columns, rows, notes, scheduledDate } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let cursorY = margin;


  // ━━━ TOP ACCENT BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, 4, "F");


  // ━━━ HEADER SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cursorY = 12;
  drawLogo(doc, margin, cursorY);

  // Document type badge (right side)
  const statusStyle = getStatusStyle(meta.status);
  const badgeText = statusStyle.label;
  const badgeW = doc.getTextWidth(badgeText) * 1.2 + 8;

  doc.setFillColor(...statusStyle.bg);
  doc.roundedRect(pageW - margin - badgeW, cursorY, badgeW, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...statusStyle.text);
  doc.text(badgeText, pageW - margin - badgeW / 2, cursorY + 4.7, { align: "center" });

  cursorY += 22;


  // ━━━ DOCUMENT TITLE SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decorative line
  doc.setDrawColor(...BRAND.gray200);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageW - margin, cursorY);
  cursorY += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.dark);
  doc.text(DOC_TITLES[meta.type], margin, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.gray400);
  doc.text(DOC_SUBTITLES[meta.type], margin, cursorY + 5);

  // Reference number on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.primary);
  doc.text(meta.reference, pageW - margin, cursorY, { align: "right" });

  cursorY += 14;

  // Bottom accent line under title
  doc.setFillColor(...BRAND.primary);
  doc.rect(margin, cursorY, 30, 0.8, "F");
  doc.setFillColor(...BRAND.gray200);
  doc.rect(margin + 30, cursorY, contentW - 30, 0.3, "F");

  cursorY += 8;


  // ━━━ INFO CARDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const cardW = (contentW - 6) / 3; // three cards with gaps
  const cardH = 22;
  const cardStartY = cursorY;

  // Card 1: Party Info
  doc.setFillColor(...BRAND.gray50);
  doc.roundedRect(margin, cardStartY, cardW, cardH, 2, 2, "F");
  doc.setDrawColor(...BRAND.gray200);
  doc.roundedRect(margin, cardStartY, cardW, cardH, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND.gray400);
  doc.text(party.label.toUpperCase(), margin + 4, cardStartY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.gray900);
  doc.text(truncateText(doc, party.value, cardW - 8), margin + 4, cardStartY + 10.5);

  if (party.secondaryLabel) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.gray400);
    doc.text(party.secondaryLabel.toUpperCase(), margin + 4, cardStartY + 15.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray900);
    doc.text(truncateText(doc, party.secondaryValue || "—", cardW - 8), margin + 4, cardStartY + 20);
  }

  // Card 2: Date Info
  const card2X = margin + cardW + 3;
  doc.setFillColor(...BRAND.gray50);
  doc.roundedRect(card2X, cardStartY, cardW, cardH, 2, 2, "F");
  doc.setDrawColor(...BRAND.gray200);
  doc.roundedRect(card2X, cardStartY, cardW, cardH, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND.gray400);
  doc.text("DOCUMENT DATE", card2X + 4, cardStartY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.gray900);
  doc.text(formatDate(meta.createdAt), card2X + 4, cardStartY + 10.5);

  if (scheduledDate) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.gray400);
    doc.text("SCHEDULED DATE", card2X + 4, cardStartY + 15.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray900);
    doc.text(formatDate(scheduledDate), card2X + 4, cardStartY + 20);
  } else if (meta.validatedAt) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.gray400);
    doc.text("VALIDATED ON", card2X + 4, cardStartY + 15.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.green);
    doc.text(formatDate(meta.validatedAt), card2X + 4, cardStartY + 20);
  }

  // Card 3: Document Info
  const card3X = margin + cardW * 2 + 6;
  doc.setFillColor(...BRAND.gray50);
  doc.roundedRect(card3X, cardStartY, cardW, cardH, 2, 2, "F");
  doc.setDrawColor(...BRAND.gray200);
  doc.roundedRect(card3X, cardStartY, cardW, cardH, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND.gray400);
  doc.text("DOCUMENT TYPE", card3X + 4, cardStartY + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.gray900);
  doc.text(meta.type.charAt(0).toUpperCase() + meta.type.slice(1), card3X + 4, cardStartY + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND.gray400);
  doc.text("TOTAL ITEMS", card3X + 4, cardStartY + 15.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.primary);
  doc.text(String(rows.length), card3X + 4, cardStartY + 20);

  cursorY = cardStartY + cardH + 8;


  // ━━━ ITEMS TABLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Section header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  doc.text("ITEM DETAILS", margin, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.gray400);
  doc.text(`${rows.length} line item${rows.length !== 1 ? "s" : ""}`, pageW - margin, cursorY, { align: "right" });
  cursorY += 3;

  const tableHeaders = columns.map(c => c.header);
  const tableBody = rows.map(row =>
    columns.map(col => String(row[col.key] ?? "—"))
  );

  // Add serial number column
  const headWithSr = ["#", ...tableHeaders];
  const bodyWithSr = tableBody.map((row, i) => [String(i + 1), ...row]);

  const colStyles: Record<number, { halign: "left" | "center" | "right"; cellWidth?: number }> = {
    0: { halign: "center", cellWidth: 10 },
  };
  columns.forEach((col, i) => {
    colStyles[i + 1] = { halign: col.align || "left" };
    if (col.width) colStyles[i + 1].cellWidth = col.width;
  });

  autoTable(doc, {
    startY: cursorY,
    head: [headWithSr],
    body: bodyWithSr,
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      lineWidth: 0,
      textColor: BRAND.gray900,
    },
    headStyles: {
      fillColor: BRAND.dark,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: colStyles,
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Re-draw header on new pages
      doc.setFillColor(...BRAND.primary);
      doc.rect(0, 0, pageW, 4, "F");
    },
  });

  // Get final Y after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable?.finalY ?? cursorY + 30;
  cursorY += 4;


  // ━━━ NOTES SECTION (if any) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (notes) {
    // Check if we need a new page
    if (cursorY + 25 > pageH - 50) {
      doc.addPage();
      doc.setFillColor(...BRAND.primary);
      doc.rect(0, 0, pageW, 4, "F");
      cursorY = 15;
    }

    doc.setFillColor(255, 251, 235); // amber-50
    doc.roundedRect(margin, cursorY, contentW, 16, 2, 2, "F");
    doc.setDrawColor(251, 191, 36); // amber-400
    doc.roundedRect(margin, cursorY, contentW, 16, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.amber);
    doc.text("NOTES & REMARKS", margin + 4, cursorY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray600);
    const splitNotes = doc.splitTextToSize(notes, contentW - 8);
    doc.text(splitNotes.slice(0, 2), margin + 4, cursorY + 10);

    cursorY += 20;
  }


  // ━━━ SIGNATURE & STAMP SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Check if we need a new page for signatures
  if (cursorY + 55 > pageH - 25) {
    doc.addPage();
    doc.setFillColor(...BRAND.primary);
    doc.rect(0, 0, pageW, 4, "F");
    cursorY = 15;
  }

  cursorY += 6;

  // Section header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  doc.text("AUTHORIZATION", margin, cursorY);
  cursorY += 6;

  const sigBoxW = (contentW - 8) / 3;
  const sigBoxH = 36;
  const sigLabels = ["Prepared By", "Verified By", "Authorized Signature"];

  sigLabels.forEach((label, i) => {
    const bx = margin + i * (sigBoxW + 4);

    // Box
    doc.setFillColor(...BRAND.white);
    doc.setDrawColor(...BRAND.gray200);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, cursorY, sigBoxW, sigBoxH, 2, 2, "S");

    // Label at top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND.gray400);
    doc.text(label.toUpperCase(), bx + sigBoxW / 2, cursorY + 5, { align: "center" });

    // Dashed signature line
    doc.setDrawColor(...BRAND.gray200);
    doc.setLineWidth(0.2);
    (doc as any).setLineDashPattern([1.5, 1.5], 0);
    doc.line(bx + 8, cursorY + sigBoxH - 10, bx + sigBoxW - 8, cursorY + sigBoxH - 10);
    (doc as any).setLineDashPattern([], 0);

    // "Sign here" placeholder
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...BRAND.gray400);
    doc.text("Name & Sign", bx + sigBoxW / 2, cursorY + sigBoxH - 5, { align: "center" });

    // Add stamp placeholder for the middle box
    if (i === 1) {
      doc.setDrawColor(...BRAND.gray200);
      doc.setLineWidth(0.15);
      // Draw circle for stamp
      doc.circle(bx + sigBoxW / 2, cursorY + 17, 7, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(...BRAND.gray400);
      doc.text("STAMP", bx + sigBoxW / 2, cursorY + 18, { align: "center" });
    }
  });

  cursorY += sigBoxH + 6;


  // ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const totalPages = (doc as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer line
    doc.setDrawColor(...BRAND.gray200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 16, pageW - margin, pageH - 16);

    // Left: generated info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...BRAND.gray400);
    doc.text(
      `Generated on ${new Date().toLocaleString()} • CoreInventory WMS`,
      margin,
      pageH - 11
    );

    // Center: confidential
    doc.setFont("helvetica", "italic");
    doc.setFontSize(5.5);
    doc.text("This document is system-generated and valid without signature when status is COMPLETED.", pageW / 2, pageH - 7, { align: "center" });

    // Right: page number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 11, { align: "right" });
  }

  return doc;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncateText(doc: jsPDF, text: string, maxW: number): string {
  if (doc.getTextWidth(text) <= maxW) return text;
  let t = text;
  while (doc.getTextWidth(t + "...") > maxW && t.length > 0) {
    t = t.slice(0, -1);
  }
  return t + "...";
}


// ─── Convenience Methods for Each Doc Type ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateReceiptPDF(receipt: any) {
  const rows = receipt.lines.map((l: { product?: { sku: string; name: string }; quantity: number; uom: string | null }) => ({
    sku: l.product?.sku || "—",
    product: l.product?.name || "—",
    quantity: `${l.quantity} ${l.uom || "Units"}`,
  }));

  return generatePDF({
    meta: {
      type: "receipt",
      reference: receipt.reference,
      status: receipt.status,
      createdAt: receipt.createdAt,
      validatedAt: receipt.validatedAt,
    },
    party: {
      label: "Supplier",
      value: receipt.supplierName ?? "Vendor",
      secondaryLabel: "Destination",
      secondaryValue: receipt.destinationLocationId?.split("-")[0] ?? "Warehouse",
    },
    columns: [
      { header: "SKU", key: "sku", width: 30 },
      { header: "Product Name", key: "product" },
      { header: "Quantity", key: "quantity", align: "right", width: 35 },
    ],
    rows,
    notes: receipt.notes,
    scheduledDate: receipt.scheduledDate,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateDeliveryPDF(delivery: any) {
  const rows = delivery.lines.map((l: { product?: { sku: string; name: string }; demandQuantity: number; doneQuantity: number; uom: string | null }) => ({
    sku: l.product?.sku || "—",
    product: l.product?.name || "—",
    demand: `${l.demandQuantity} ${l.uom || "Units"}`,
    done: `${l.doneQuantity} ${l.uom || "Units"}`,
  }));

  return generatePDF({
    meta: {
      type: "delivery",
      reference: delivery.reference,
      status: delivery.status,
      createdAt: delivery.createdAt,
      validatedAt: delivery.validatedAt,
    },
    party: {
      label: "Customer",
      value: delivery.customerName ?? "Customer",
      secondaryLabel: "Source Location",
      secondaryValue: delivery.sourceLocation?.name ?? "Internal",
    },
    columns: [
      { header: "SKU", key: "sku", width: 28 },
      { header: "Product Name", key: "product" },
      { header: "Demand Qty", key: "demand", align: "right", width: 30 },
      { header: "Done Qty", key: "done", align: "right", width: 30 },
    ],
    rows,
    notes: delivery.notes,
    scheduledDate: delivery.scheduledDate,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateTransferPDF(transfer: any) {
  const rows = transfer.lines.map((l: { product?: { sku: string; name: string }; quantity: number; uom: string | null }) => ({
    sku: l.product?.sku || "—",
    product: l.product?.name || "—",
    quantity: `${l.quantity} ${l.uom || "Units"}`,
  }));

  return generatePDF({
    meta: {
      type: "transfer",
      reference: transfer.reference,
      status: transfer.status,
      createdAt: transfer.createdAt,
      validatedAt: transfer.validatedAt,
    },
    party: {
      label: "Source Location",
      value: transfer.sourceLocation?.name ?? "Unknown",
      secondaryLabel: "Destination Location",
      secondaryValue: transfer.destinationLocation?.name ?? "Unknown",
    },
    columns: [
      { header: "SKU", key: "sku", width: 30 },
      { header: "Product Name", key: "product" },
      { header: "Transfer Qty", key: "quantity", align: "right", width: 35 },
    ],
    rows,
    notes: transfer.notes,
    scheduledDate: transfer.scheduledDate,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateAdjustmentPDF(adj: any) {
  const rows = adj.lines.map((l: { product?: { sku: string; name: string }; systemQuantity: number; countedQuantity: number; delta: number; uom: string | null }) => ({
    sku: l.product?.sku || "—",
    product: l.product?.name || "—",
    system: `${l.systemQuantity} ${l.uom || "Units"}`,
    counted: `${l.countedQuantity} ${l.uom || "Units"}`,
    diff: `${l.delta > 0 ? "+" : ""}${l.delta} ${l.uom || "Units"}`,
  }));

  return generatePDF({
    meta: {
      type: "adjustment",
      reference: adj.reference,
      status: adj.status,
      createdAt: adj.createdAt,
      validatedAt: adj.validatedAt,
    },
    party: {
      label: "Warehouse / Location",
      value: `${adj.location?.warehouse?.name ?? "Unknown"} / ${adj.location?.name ?? "Unknown"}`,
      secondaryLabel: "Reason",
      secondaryValue: adj.reason || "General Adjustment",
    },
    columns: [
      { header: "SKU", key: "sku", width: 25 },
      { header: "Product Name", key: "product" },
      { header: "System Qty", key: "system", align: "right", width: 25 },
      { header: "Counted Qty", key: "counted", align: "right", width: 25 },
      { header: "Difference", key: "diff", align: "right", width: 25 },
    ],
    rows,
    notes: adj.notes,
  });
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateStockReportPDF(products: any[]) {
  const rows = products.filter(p => p.stockPerLocation.length > 0).map(p => {
    const totalQty = p.stockPerLocation.reduce((s: number, sl: any) => s + sl.quantityOnHand, 0);
    const min = p.reorderRules[0]?.minQuantity;
    const status = totalQty === 0 ? "OUT_OF_STOCK" : (min && totalQty < min ? "LOW_STOCK" : "IN_STOCK");
    
    return {
      sku: p.sku || "—",
      name: p.name || "—",
      qty: `${totalQty.toLocaleString()} ${p.uom}`,
      status
    };
  });

  return generatePDF({
    meta: {
      type: "adjustment", // Using adjustment as a base for internal reports
      reference: `STK-${new Date().getTime().toString(36).toUpperCase()}`,
      status: "done",
      createdAt: new Date(),
    },
    party: {
      label: "Report Type",
      value: "Current Stock Inventory",
      secondaryLabel: "Scope",
      secondaryValue: "Global Warehouse Stock",
    },
    columns: [
      { header: "SKU", key: "sku", width: 30 },
      { header: "Product Description", key: "name" },
      { header: "On Hand", key: "qty", align: "right", width: 35 },
      { header: "Level Status", key: "status", align: "center", width: 35 },
    ],
    rows,
    notes: "This report shows real-time quantity on hand across all managed locations.",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateMoveHistoryPDF(ledgerItems: any[]) {
  const rows = ledgerItems.map(e => ({
    date: new Date(e.createdAt).toLocaleString(),
    op: e.operationType.toUpperCase(),
    ref: e.documentReference,
    product: e.product?.name || "—",
    location: `${e.location?.warehouse?.name} / ${e.location?.name}`,
    delta: `${e.quantityDelta > 0 ? "+" : ""}${e.quantityDelta}`,
  }));

  return generatePDF({
    meta: {
      type: "transfer",
      reference: `LED-${new Date().getTime().toString(36).toUpperCase()}`,
      status: "done",
      createdAt: new Date(),
    },
    party: {
      label: "Report Type",
      value: "Stock Movement Ledger",
      secondaryLabel: "Total Entries",
      secondaryValue: String(ledgerItems.length),
    },
    columns: [
      { header: "Date & Time", key: "date", width: 35 },
      { header: "Op", key: "op", width: 22 },
      { header: "Reference", key: "ref", width: 28 },
      { header: "Product", key: "product" },
      { header: "Delta", key: "delta", align: "right", width: 18 },
    ],
    rows,
    notes: "Historical audit trail of all inventory inward/outward and internal movements.",
  });
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateProductListPDF(products: any[]) {
  const rows = products.map(p => {
    const totalQty = p.stockPerLocation.reduce((s: number, sl: any) => s + (sl.quantityOnHand ?? 0), 0);
    return {
      sku: p.sku || "—",
      name: p.name || "—",
      category: p.category?.name || "—",
      uom: p.uom || "—",
      qty: totalQty.toLocaleString(),
    };
  });

  return generatePDF({
    meta: {
      type: "receipt",
      reference: `CAT-${new Date().getTime().toString(36).toUpperCase()}`,
      status: "done",
      createdAt: new Date(),
    },
    party: {
      label: "Report Type",
      value: "Product Catalog Report",
      secondaryLabel: "Total Products",
      secondaryValue: String(products.length),
    },
    columns: [
      { header: "SKU", key: "sku", width: 30 },
      { header: "Product Name", key: "name" },
      { header: "Category", key: "category", width: 30 },
      { header: "UoM", key: "uom", width: 20 },
      { header: "Total Stock", key: "qty", align: "right", width: 25 },
    ],
    rows,
    notes: "List of all active products in the system catalog including current aggregate stock levels.",
  });
}


// ─── Print helper (opens PDF in new tab for browser print) ────────────────────

export function printPDF(doc: jsPDF) {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => {
      win.print();
    });
  }
}
