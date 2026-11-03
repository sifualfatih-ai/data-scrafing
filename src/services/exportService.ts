/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import { BusinessLead } from '../types';

/**
 * Sanitizes cell values to prevent CSV / Formula Injection (DDE injection).
 * If a string begins with '=', '+', '-', or '@', it prepends a single quote.
 */
export function sanitizeCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Generates standardized filename based on location and current date:
 * e.g. datascrafing_leads_bandung_2026-11-02.xlsx
 */
export function generateFilename(location: string, extension: 'xlsx' | 'csv'): string {
  const cleanLoc = (location || 'indonesia')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  return `datascrafing_leads_${cleanLoc}_${dateStr}.${extension}`;
}

/**
 * Exports leads to Microsoft Excel (.xlsx) using SheetJS with sanitized text formatting
 */
export function exportToExcel(leads: BusinessLead[], location: string) {
  if (!leads || leads.length === 0) {
    throw new Error('Tidak ada data leads untuk diekspor.');
  }

  // Build row objects with clean headers and sanitized values
  const rowData = leads.map((lead, index) => {
    return {
      'No': index + 1,
      'Nama Perusahaan': sanitizeCellValue(lead.name),
      'Status Website': lead.websiteStatus,
      'Verifikasi HTTP Domain': lead.websiteVerification?.status || 'Belum Diuji',
      'Nomor WhatsApp / Kontak': sanitizeCellValue(lead.normalizedPhone || '-'),
      'Tipe Kontak': lead.contactType === 'WHATSAPP' ? 'WhatsApp Ready' : lead.contactType === 'LANDLINE' ? 'Telepon Kantor' : 'Tidak Ada',
      'Alamat Lengkap': sanitizeCellValue(lead.fullAddress || '-'),
      'Kota': sanitizeCellValue(lead.location),
      'Jenis Usaha': sanitizeCellValue(lead.category),
      'Rating Maps': lead.rating ? `${lead.rating} ⭐` : '-',
      'Jumlah Ulasan': lead.userRatingsTotal || 0,
      'Link Google Maps': lead.googleMapsUrl,
      'Website / Media Sosial': sanitizeCellValue(lead.websiteUrl || (lead.websiteStatus === 'NO WEBSITE' ? 'Tidak Ada' : '-')),
      'Status Outreach': lead.outreachStatus || 'Belum Dihubungi',
      'Tanggal Pengambilan': lead.dateScraped,
      'Sumber Data': lead.isDemo ? 'Heuristic Database' : 'TeamoRouter AI Intelligence',
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rowData);

  // Ensure phone column is treated strictly as TEXT string to prevent Excel scientific notation
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const phoneColIndex = 4; // Column E: "Nomor WhatsApp / Kontak"

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: phoneColIndex });
    const cell = worksheet[cellAddress];
    if (cell && cell.v !== undefined) {
      cell.t = 's'; // string type
      cell.z = '@'; // text format
    }
  }

  // Calculate auto column widths
  const colWidths = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama Perusahaan
    { wch: 20 }, // Status Website
    { wch: 22 }, // Verifikasi HTTP
    { wch: 24 }, // Nomor Kontak
    { wch: 18 }, // Tipe Kontak
    { wch: 45 }, // Alamat Lengkap
    { wch: 16 }, // Kota
    { wch: 20 }, // Jenis Usaha
    { wch: 12 }, // Rating
    { wch: 14 }, // Jumlah Ulasan
    { wch: 38 }, // Maps Link
    { wch: 32 }, // Website
    { wch: 20 }, // Status Outreach
    { wch: 16 }, // Tanggal
    { wch: 24 }, // Sumber Data
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SaaS Leads Database');

  // Generate buffer and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  const filename = generateFilename(location, 'xlsx');
  saveAs(blob, filename);
}

/**
 * Exports leads to CSV format with UTF-8 BOM and Formula Injection prevention
 */
export function exportToCSV(leads: BusinessLead[], location: string) {
  if (!leads || leads.length === 0) {
    throw new Error('Tidak ada data leads untuk diekspor.');
  }

  const headers = [
    'No',
    'Nama Perusahaan',
    'Status Website',
    'Verifikasi HTTP',
    'Nomor WhatsApp / Kontak',
    'Tipe Kontak',
    'Alamat Lengkap',
    'Kota',
    'Jenis Usaha',
    'Rating',
    'Jumlah Ulasan',
    'Google Maps Link',
    'Website / Medsos',
    'Status Outreach',
    'Tanggal Pengambilan'
  ];

  const rows = leads.map((l, i) => {
    return [
      i + 1,
      `"${sanitizeCellValue(l.name).replace(/"/g, '""')}"`,
      `"${l.websiteStatus}"`,
      `"${l.websiteVerification?.status || 'Belum Diuji'}"`,
      `"\t${sanitizeCellValue(l.normalizedPhone || '-')}"`,
      `"${l.contactType}"`,
      `"${sanitizeCellValue(l.fullAddress || '').replace(/"/g, '""')}"`,
      `"${sanitizeCellValue(l.location)}"`,
      `"${sanitizeCellValue(l.category)}"`,
      `"${l.rating || '-'}"`,
      `"${l.userRatingsTotal || 0}"`,
      `"${l.googleMapsUrl}"`,
      `"${sanitizeCellValue(l.websiteUrl || '').replace(/"/g, '""')}"`,
      `"${l.outreachStatus || 'Belum Dihubungi'}"`,
      `"${l.dateScraped}"`
    ];
  });

  // UTF-8 Byte Order Mark (\uFEFF)
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = generateFilename(location, 'csv');
  saveAs(blob, filename);
}
