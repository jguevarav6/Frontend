import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Item } from '../features/items/data-access/items.service';

/**
 * Servicio para exportar datos a diferentes formatos
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta items a formato CSV
   * @param items - Array de items a exportar
   * @param filename - Nombre del archivo (sin extensión)
   */
  exportToCSV(items: Item[], filename: string = 'items'): void {
    if (!items || items.length === 0) {
      return;
    }

    const headers = ['ID', 'Título', 'Contenido', 'Favorito'];
    const rows = items.map(item => [
      item.id,
      this.escapeCsvValue(item.title),
      this.escapeCsvValue(item.body),
      item.isFavorite ? 'Sí' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta items a formato PDF
   * @param items - Array de items a exportar
   * @param filename - Nombre del archivo (sin extensión)
   * @returns Promise que se resuelve cuando se completa la exportación
   */
  exportToPDF(items: Item[], filename: string = 'items'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!items || items.length === 0) {
          resolve();
          return;
        }

        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text('Listado de Items', 14, 22);

        // Fecha
        doc.setFontSize(11);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`Fecha de exportación: ${dateStr}`, 14, 30);

        // Tabla
        const tableData = items.map(item => [
          item.id.toString(),
          this.truncateText(item.title, 40),
          this.truncateText(item.body, 60),
          item.isFavorite ? '⭐' : ''
        ]);

        autoTable(doc, {
          startY: 35,
          head: [['ID', 'Título', 'Contenido', 'Favorito']],
          body: tableData,
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 60 },
            2: { cellWidth: 90 },
            3: { cellWidth: 20, halign: 'center' }
          }
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }

        doc.save(`${filename}.pdf`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Escapa valores para CSV
   */
  private escapeCsvValue(value: string): string {
    if (!value) return '';
    
    // Si contiene comas, comillas o saltos de línea, escapar
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Trunca texto para PDF
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  }

  /**
   * Descarga un archivo
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
