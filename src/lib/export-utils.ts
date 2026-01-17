/**
 * Common utilities for exporting project data (JSON, CSV, etc.)
 */

export function downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function jsonToCsv(items: Record<string, unknown>[]): string {
    if (items.length === 0) return "";

    const replacer = (_: string, value: unknown) => value === null ? '' : value;
    const header = Object.keys(items[0]);
    const csv = [
        header.join(','), // header line
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');

    return csv;
}

export function exportToJson(data: unknown, fileName: string) {
    downloadFile(JSON.stringify(data, null, 2), fileName, "application/json");
}

export function exportToCsv(data: Record<string, unknown>[], fileName: string) {
    const csv = jsonToCsv(data);
    downloadFile(csv, fileName, "text/csv");
}
