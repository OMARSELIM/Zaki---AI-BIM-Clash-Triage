import { RawClashData } from '../types';

export const parseClashCSV = (csvText: string): RawClashData[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
  
  // Mapping logic to find likely column names
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes('clash') && h.includes('name')) colMap['clashName'] = i;
    else if (h.includes('distance')) colMap['distance'] = i;
    else if (h.includes('item 1') && h.includes('name')) colMap['item1'] = i;
    else if (h.includes('item 2') && h.includes('name')) colMap['item2'] = i;
    else if (h.includes('item 1') && h.includes('layer')) colMap['layer1'] = i;
    else if (h.includes('item 2') && h.includes('layer')) colMap['layer2'] = i;
  });

  const data: RawClashData[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle CSV split with rudimentary quote handling
    // This is a simplified regex splitter for standard CSVs.
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    
    // Fallback if regex fails (simple split), removing quotes
    const row = values ? values.map(v => v.replace(/^"|"$/g, '').trim()) : lines[i].split(',').map(v => v.trim());

    if (!row || row.length < 2) continue;

    // Helper to safely get value by mapped index or fallback index
    const getVal = (key: string, fallbackIdx: number) => {
      const idx = colMap[key];
      return (idx !== undefined && row[idx]) ? row[idx] : (row[fallbackIdx] || 'Unknown');
    };

    // Assuming a somewhat standard Navisworks HTML report converted to CSV or generic CSV export
    // If specific columns aren't found, we make a best guess based on typical order
    data.push({
      id: `clash-${i}`,
      testName: 'Imported Test',
      clashName: getVal('clashName', 0),
      distance: getVal('distance', 1),
      item1: getVal('item1', 2) || row[3] || 'Unknown Item 1',
      item2: getVal('item2', 5) || row[6] || 'Unknown Item 2', // Assuming generic spacing
      layer1: getVal('layer1', 4) || 'Layer 1',
      layer2: getVal('layer2', 7) || 'Layer 2',
    });
  }

  return data;
};

export const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      const val = (row as any)[fieldName]?.toString().replace(/"/g, '""') || '';
      return `"${val}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
