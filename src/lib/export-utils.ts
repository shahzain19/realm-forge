import JSZip from 'jszip';
import { supabase } from './supabase';

export function downloadFile(content: string | Blob, fileName: string, contentType: string) {
    const a = document.createElement("a");
    const file = content instanceof Blob ? content : new Blob([content], { type: contentType });
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

export async function generateProjectBundle(projectId: string) {
    const zip = new JSZip();
    const folder = zip.folder("project-export");

    // 1. Fetch Project Details
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (project) {
        folder?.file("project-info.json", JSON.stringify(project, null, 2));
        folder?.file("README.md", `# ${project.name}\n\n${project.description || ''}\n\nExported from RealmForge.`);
    }

    // 2. Fetch GDDs
    const { data: docs } = await supabase.from('project_documents').select('*').eq('project_id', projectId);
    if (docs && docs.length > 0) {
        const docFolder = folder?.folder("documents");
        docs.forEach(doc => {
            const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            docFolder?.file(filename, JSON.stringify(doc.content, null, 2));
        });
    }

    // 3. Fetch Milestones
    const { data: milestones } = await supabase.from('milestones').select('*').eq('project_id', projectId);
    if (milestones && milestones.length > 0) {
        folder?.file("roadmap.json", JSON.stringify(milestones, null, 2));
        folder?.file("roadmap.csv", jsonToCsv(milestones));
    }

    // 4. Fetch Systems
    const { data: systems } = await supabase.from('systems').select('*').eq('project_id', projectId);
    if (systems && systems.length > 0) {
        folder?.file("systems.json", JSON.stringify(systems, null, 2));
    }

    // Generate Zip
    const content = await zip.generateAsync({ type: "blob" });
    downloadFile(content, `${project?.name || 'project'}-export.zip`, "application/zip");
}
