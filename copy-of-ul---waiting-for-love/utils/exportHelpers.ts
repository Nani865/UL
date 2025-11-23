import { DateItem } from '../types';

export const generatePDF = async (dates: DateItem[], notes: Record<string, string>) => {
  // @ts-ignore - jspdf is loaded via CDN
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const margin = 20;
  let y = margin;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - (margin * 2);

  // Robust Text Sanitizer
  // 1. Normalizes Unicode (fixes fullwidth chars like Ｂ -> B)
  // 2. Removes accents/diacritics
  // 3. Replaces smart quotes
  // 4. Whitelists only basic ASCII punctuation and alphanumeric
  // This solves the garbage characters (Ø=Þ) and spacing issues in standard fonts.
  const sanitizeText = (str: string) => {
    if (!str) return "";
    return str
      .normalize('NFKD') 
      .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritics
      .replace(/[\u2018\u2019]/g, "'") // Smart quotes
      .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
      .replace(/[^a-zA-Z0-9\s\.,?!'"\-:;()@#\/]/g, '') // Keep only safe chars
      .trim();
  };

  // Title
  doc.setFont("helvetica", "bold"); 
  doc.setFontSize(22);
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text("UL - The Journey", margin, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.text("Created By Uday", margin, y);
  y += 6;
  doc.text("15/11/2025 - 26/02/2026", margin, y);
  y += 15;

  // Content
  doc.setFontSize(10);
  
  dates.forEach((item) => {
    const rawNote = notes[item.id] || "";
    
    // Header Logic
    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72);
    
    // Check if we need a new page for the Date Header
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(`${item.formattedDate} - ${item.label}`, margin, y);
    
    // Note Logic
    if (rawNote) {
      const cleanNote = sanitizeText(rawNote);
      
      if (cleanNote) {
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        // Calculate lines
        const splitLines = doc.splitTextToSize(cleanNote, contentWidth);
        
        // Check if note content fits
        if (y + (splitLines.length * 5) > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
        
        doc.text(splitLines, margin, y);
        y += (splitLines.length * 5) + 8;
      } else {
        // Note was present but sanitized to empty (e.g. only emojis)
        y += 8;
      }
    } else {
      y += 8;
    }
  });

  doc.save("UL_Journey_Uday.pdf");
};

export const generateShareImage = async (elementId: string) => {
  // @ts-ignore - html2canvas is loaded via CDN
  const html2canvas = window.html2canvas;
  const element = document.getElementById(elementId);
  
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null, 
    });
    
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "UL_Journey_Completed.png";
    link.click();
  } catch (error) {
    console.error("Error generating image:", error);
  }
};