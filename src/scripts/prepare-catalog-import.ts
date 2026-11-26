import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { slugify } from '../lib/validations/product';
import {
  ALLOWED_FORMATS,
  MAX_GALLERY_IMAGES,
} from '../lib/storage/cloudinary-constants';
import {
  CatalogImportFile,
  ImportReport,
  RawImportColor,
  RawImportProduct,
  runCatalogImport,
} from './import-catalog';

const DEFAULT_DROP_DIR = 'data/damro-import';
const DEFAULT_IMAGES_DIR = 'data/damro-import/images';
const DEFAULT_OUTPUT_FILE = 'data/damro-import/prepared-catalog.json';

type FlatRow = Record<string, unknown>;

function normalizeHeaderKey(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function getField(row: FlatRow, ...aliases: string[]): unknown {
  const normalizedEntries = new Map<string, unknown>();
  for (const [k, v] of Object.entries(row)) {
    normalizedEntries.set(normalizeHeaderKey(k), v);
  }
  for (const alias of aliases) {
    const val = normalizedEntries.get(normalizeHeaderKey(alias));
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return val;
    }
  }
  return undefined;
}

function parseNumberField(val: unknown): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : 0;
  }
  if (typeof val !== 'string') return 0;
  const cleaned = val.replace(/[^\d.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOptionalNumber(val: unknown): number | undefined {
  if (val === undefined || val === null || String(val).trim() === '') return undefined;
  const parsed = parseNumberField(val);
  return parsed > 0 ? parsed : undefined;
}

function parseBooleanField(val: unknown, fallback: boolean): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val !== 'string') return fallback;
  const norm = val.trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(norm)) return true;
  if (['false', '0', 'no', 'n'].includes(norm)) return false;
  return fallback;
}

function splitListField(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => String(v || '').trim()).filter(Boolean);
  }
  if (typeof val !== 'string' || !val.trim()) return [];
  const trimmed = val.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v || '').trim()).filter(Boolean);
      }
    } catch {
      // fall through to delimiter split
    }
  }
  const delimiter = trimmed.includes('|') ? '|' : trimmed.includes(';') ? ';' : ',';
  return trimmed
    .split(delimiter)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseColorsField(val: unknown): RawImportColor[] {
  if (Array.isArray(val)) {
    return val
      .filter((c) => c && typeof c === 'object' && typeof (c as any).name === 'string')
      .map((c: any) => ({
        name: c.name.trim(),
        hex: typeof c.hex === 'string' && c.hex.trim() ? c.hex.trim() : '#211710',
        inStock: c.inStock !== false,
        ...(typeof c.image === 'string' && c.image.trim() ? { image: c.image.trim() } : {}),
        ...(typeof c.price === 'number' ? { price: c.price } : {}),
        ...(typeof c.originalPrice === 'number' ? { originalPrice: c.originalPrice } : {}),
      }));
  }

  if (typeof val !== 'string' || !val.trim()) return [];
  const trimmed = val.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parseColorsField(parsed);
      }
    } catch {
      // fall through to delimited string format (`Name|#Hex; Name2|#Hex2`)
    }
  }

  const items = trimmed.includes(';')
    ? trimmed.split(';')
    : trimmed.includes(',')
      ? trimmed.split(',')
      : [trimmed];

  return items
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [rawName, rawHex] = entry.split('|').map((s) => s.trim());
      return {
        name: rawName,
        hex: rawHex || '#211710',
        inStock: true,
      };
    })
    .filter((c) => Boolean(c.name));
}

function parseDimensionsField(row: FlatRow): RawImportProduct['dimensions'] {
  const rawDim = getField(row, 'dimensions', 'Dimensions');
  if (rawDim && typeof rawDim === 'object' && !Array.isArray(rawDim)) {
    const d = rawDim as Record<string, unknown>;
    return {
      width: String(d.width || '').trim(),
      depth: String(d.depth || '').trim(),
      height: String(d.height || '').trim(),
      seatHeight: String(d.seatHeight || '').trim(),
      bedBaseHeight: String(d.bedBaseHeight || '').trim(),
      weight: String(d.weight || '').trim(),
    };
  }
  if (typeof rawDim === 'string' && rawDim.trim().startsWith('{')) {
    try {
      const d = JSON.parse(rawDim);
      return {
        width: String(d.width || '').trim(),
        depth: String(d.depth || '').trim(),
        height: String(d.height || '').trim(),
        seatHeight: String(d.seatHeight || '').trim(),
        bedBaseHeight: String(d.bedBaseHeight || '').trim(),
        weight: String(d.weight || '').trim(),
      };
    } catch {
      // fallback to flat columns
    }
  }

  return {
    width: String(getField(row, 'width', 'dimensions.width') || '').trim(),
    depth: String(getField(row, 'depth', 'dimensions.depth') || '').trim(),
    height: String(getField(row, 'height', 'dimensions.height') || '').trim(),
    seatHeight: String(getField(row, 'seatHeight', 'seat_height', 'dimensions.seatHeight') || '').trim(),
    bedBaseHeight: String(
      getField(row, 'bedBaseHeight', 'bed_base_height', 'dimensions.bedBaseHeight') || ''
    ).trim(),
    weight: String(getField(row, 'weight', 'dimensions.weight') || '').trim(),
  };
}

/**
 * RFC 4180 compliant CSV parser (handles UTF-8 BOM, CRLF, quoted commas/newlines, escaped `""`).
 */
export function parseCsvRows(csvText: string): FlatRow[] {
  const clean = csvText.replace(/^\uFEFF/, '');
  const matrix: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
    } else if (ch === '\r' && next === '\n') {
      currentRow.push(currentField);
      matrix.push(currentRow);
      currentRow = [];
      currentField = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      currentRow.push(currentField);
      matrix.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    matrix.push(currentRow);
  }

  const nonEmptyRows = matrix.filter((r) => r.some((cell) => cell.trim() !== ''));
  if (nonEmptyRows.length < 2) return [];

  const headers = nonEmptyRows[0].map((h) => h.trim());
  return nonEmptyRows.slice(1).map((cols) => {
    const obj: FlatRow = {};
    for (let i = 0; i < headers.length; i++) {
      if (!headers[i]) continue;
      obj[headers[i]] = (cols[i] ?? '').trim();
    }
    return obj;
  });
}

/**
 * Zero-dependency .xlsx parser using Python 3 standard library (`zipfile` + `xml.etree.ElementTree`).
 * Legacy binary `.xls` attempts Excel COM conversion if Microsoft Excel is installed on Windows.
 */
export async function parseExcelRows(filePath: string): Promise<FlatRow[]> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.xls') {
    const tempCsv = `${filePath}.__converted.csv`;
    const psScript = `
      $ErrorActionPreference = 'Stop';
      $excel = New-Object -ComObject Excel.Application;
      try {
        $excel.Visible = $false;
        $excel.DisplayAlerts = $false;
        $wb = $excel.Workbooks.Open('${filePath.replace(/'/g, "''")}');
        $wb.SaveAs('${tempCsv.replace(/'/g, "''")}', 62);
        $wb.Close($false);
      } finally {
        $excel.Quit();
      }
    `;
    try {
      execFileSync('powershell', ['-NoProfile', '-Command', psScript], { stdio: 'pipe' });
      const csvText = await fs.readFile(tempCsv, 'utf8');
      await fs.unlink(tempCsv).catch(() => undefined);
      return parseCsvRows(csvText);
    } catch {
      await fs.unlink(tempCsv).catch(() => undefined);
      throw new Error(
        `Legacy binary .xls file "${filePath}" could not be converted (Excel COM unavailable). Please save the workbook as .xlsx or .csv and re-run.`
      );
    }
  }

  const pyParser = `
import json, sys, zipfile
import xml.etree.ElementTree as ET

path = sys.argv[1]
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

with zipfile.ZipFile(path, 'r') as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in ss_root.findall('m:si', ns):
            texts = [t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
            shared_strings.append(''.join(texts))

    sheet_name = 'xl/worksheets/sheet1.xml'
    if sheet_name not in z.namelist():
        candidates = sorted([n for n in z.namelist() if n.startswith('xl/worksheets/sheet') and n.endswith('.xml')])
        if not candidates:
            print('[]')
            sys.exit(0)
        sheet_name = candidates[0]

    sheet_root = ET.fromstring(z.read(sheet_name))
    def col_to_idx(ref):
        col = ''.join(ch for ch in ref if ch.isalpha())
        idx = 0
        for ch in col:
            idx = idx * 26 + (ord(ch.upper()) - ord('A') + 1)
        return max(0, idx - 1)

    rows = []
    for row in sheet_root.findall('.//m:sheetData/m:row', ns):
        row_map = {}
        max_col = -1
        for c in row.findall('m:c', ns):
            ref = c.attrib.get('r', '')
            col_idx = col_to_idx(ref) if ref else (max_col + 1)
            max_col = max(max_col, col_idx)
            cell_type = c.attrib.get('t', '')
            val = ''
            if cell_type == 's':
                v = c.find('m:v', ns)
                if v is not None and v.text is not None:
                    s_idx = int(v.text)
                    val = shared_strings[s_idx] if s_idx < len(shared_strings) else ''
            elif cell_type == 'inlineStr':
                val = ''.join(t.text or '' for t in c.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'))
            else:
                v = c.find('m:v', ns)
                val = v.text if (v is not None and v.text is not None) else ''
            row_map[col_idx] = val.strip() if isinstance(val, str) else val
        if row_map:
            arr = [row_map.get(i, '') for i in range(max_col + 1)]
            if any(str(x).strip() != '' for x in arr):
                rows.append(arr)

    if len(rows) < 2:
        print('[]')
        sys.exit(0)

    headers = [str(h).strip() for h in rows[0]]
    out = []
    for r in rows[1:]:
        obj = {}
        for i, h in enumerate(headers):
            if not h:
                continue
            obj[h] = r[i] if i < len(r) else ''
        out.append(obj)
    print(json.dumps(out))
`;

  const stdout = execFileSync('python', ['-c', pyParser, filePath], {
    encoding: 'utf8',
    maxBuffer: 25 * 1024 * 1024,
  });
  return JSON.parse(stdout) as FlatRow[];
}

async function listFolderImageFiles(imagesDirAbs: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(imagesDirAbs, { withFileTypes: true });
    return entries
      .filter((e) => {
        if (!e.isFile()) return false;
        const ext = path.extname(e.name).replace('.', '').toLowerCase();
        const normalizedExt = ext === 'jpg' ? 'jpeg' : ext;
        return ALLOWED_FORMATS.includes(normalizedExt as (typeof ALLOWED_FORMATS)[number]);
      })
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function unwrapImageProxyUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    const inner = parsed.searchParams.get('url');
    if (inner && /^https?:\/\//i.test(inner)) {
      return inner;
    }
  } catch {
    // non-URL or local relative filename
  }
  return trimmed;
}

function inferCategoryFromStartUrl(startUrl: string): string {
  const lower = startUrl.toLowerCase();
  if (lower.includes('/recliners')) return 'Recliners';
  if (lower.includes('/sofas') || lower.includes('/sofa-sets')) return 'Sofas';
  if (lower.includes('/chairs')) return 'Chairs';
  if (lower.includes('/beds')) return 'Beds';
  if (lower.includes('/wardrobes')) return 'Wardrobes';
  if (lower.includes('/dining')) return 'Dining Sets';
  if (lower.includes('/mattresses')) return 'Mattresses';
  if (lower.includes('/centre-tables') || lower.includes('/center-tables')) return 'Centre Tables';
  if (lower.includes('/tv')) return 'TV Stands';
  if (lower.includes('/office-tables')) return 'Office Tables';
  if (lower.includes('/study')) return 'Study Tables';
  return '';
}

function inferReclinerSubCategoryFromName(name: string): string {
  if (/electric|\bpower\b|zero gravity/i.test(name)) {
    return 'Motorized Recliners';
  }
  if (/genuine leather|\bleather\b/i.test(name)) {
    return 'Genuine Leather Loungers';
  }
  if (/fabric/i.test(name)) {
    return 'Fabric Swivel Recliners';
  }
  return 'Manual Rocker Recliners';
}

function inferWardrobeSubCategoryFromName(name: string): string {
  if (/4[ -]?door|four[ -]?door/i.test(name)) {
    return '4-Door Grand Armoires';
  }
  if (/sliding/i.test(name)) {
    return 'Sliding Door Wardrobes';
  }
  if (/walk[ -]?in/i.test(name)) {
    return 'Walk-in Closets';
  }
  return '3-Door Wardrobes';
}

function inferBedSubCategoryFromName(name: string): string {
  if (/hydraulic|storage/i.test(name)) {
    return 'Hydraulic Storage Beds';
  }
  if (/upholstered/i.test(name)) {
    return 'Upholstered Headboards';
  }
  return 'Queen Size Beds';
}

async function resolveRowImages(
  rawImages: string[],
  productName: string,
  sku: string | undefined,
  inputDirAbs: string,
  imagesDirAbs: string,
  outputDirAbs: string,
  folderImageFiles: string[]
): Promise<string[]> {
  const resolvedPaths: string[] = [];

  for (const item of rawImages) {
    const trimmed = unwrapImageProxyUrl(item);
    if (!trimmed) continue;

    if (/^https?:\/\//i.test(trimmed)) {
      resolvedPaths.push(trimmed);
      continue;
    }

    const candidates = [
      path.isAbsolute(trimmed) ? trimmed : '',
      path.resolve(imagesDirAbs, trimmed),
      path.resolve(inputDirAbs, trimmed),
      path.resolve(process.cwd(), trimmed),
    ].filter(Boolean);

    let matchedAbs = '';
    for (const c of candidates) {
      try {
        const stat = await fs.stat(c);
        if (stat.isFile()) {
          matchedAbs = c;
          break;
        }
      } catch {
        // continue checking candidate paths
      }
    }

    if (matchedAbs) {
      resolvedPaths.push(path.relative(outputDirAbs, matchedAbs).replace(/\\/g, '/'));
    } else {
      // Preserve unresolved filename so import-catalog validation reports the exact missing image
      resolvedPaths.push(trimmed);
    }
  }

  // If no explicit images were specified in the row, auto-pair files from the images folder matching SKU or slug prefix
  if (resolvedPaths.length === 0 && folderImageFiles.length > 0 && productName) {
    const productSlug = slugify(productName);
    const normalizedSku = (sku || '').trim().toLowerCase();

    const autoMatched = folderImageFiles.filter((fileName) => {
      const base = path.basename(fileName, path.extname(fileName)).toLowerCase();
      if (normalizedSku && (base === normalizedSku || base.startsWith(`${normalizedSku}-`) || base.startsWith(`${normalizedSku}_`))) {
        return true;
      }
      if (productSlug && (base === productSlug || base.startsWith(`${productSlug}-`) || base.startsWith(`${productSlug}_`))) {
        return true;
      }
      return false;
    });

    for (const match of autoMatched.slice(0, MAX_GALLERY_IMAGES)) {
      const abs = path.resolve(imagesDirAbs, match);
      resolvedPaths.push(path.relative(outputDirAbs, abs).replace(/\\/g, '/'));
    }
  }

  return resolvedPaths.slice(0, MAX_GALLERY_IMAGES);
}

async function normalizeToRawProduct(
  row: FlatRow,
  inputDirAbs: string,
  imagesDirAbs: string,
  outputDirAbs: string,
  folderImageFiles: string[]
): Promise<RawImportProduct> {
  const name = String(getField(row, 'name', 'productName', 'Product Name', 'title', 'data') || '').trim();
  const skuRaw = getField(row, 'sku', 'SKU', 'productCode', 'code');
  const sku = skuRaw ? String(skuRaw).trim() : undefined;

  const startUrl = String(getField(row, 'web_scraper_start_url', 'sourceUrl') || '').trim();
  const sourceCategory = String(
    getField(row, 'sourceCategory', 'category', 'Category', 'categoryLabel') ||
    inferCategoryFromStartUrl(startUrl)
  ).trim();
  const explicitSubCategory = String(
    getField(row, 'sourceSubCategory', 'subCategory', 'subcategory', 'Sub Category') || ''
  ).trim();
  const sourceSubCategory =
    explicitSubCategory ||
    (sourceCategory.toLowerCase() === 'recliners'
      ? inferReclinerSubCategoryFromName(name)
      : sourceCategory.toLowerCase() === 'beds'
      ? inferBedSubCategoryFromName(name)
      : sourceCategory.toLowerCase() === 'wardrobes'
      ? inferWardrobeSubCategoryFromName(name)
      : '');

  // Detect MRP-only rows: data2 starts with "MRP" prefix and data3 is absent.
  // In such rows data2 holds only the MRP value, there is no separate selling price.
  // Setting price=0 causes import-catalog.ts to skip the product as missing info,
  // rather than incorrectly treating the MRP number as a selling price.
  const rawData2 = String(getField(row, 'price', 'sellingPrice', 'Selling Price', 'offerPrice', 'data2') || '').trim();
  const rawData3 = String(getField(row, 'originalPrice', 'mrp', 'MRP', 'listPrice', 'data3') || '').trim();
  const isMrpOnlyRow = /^\s*MRP\s*/i.test(rawData2) && !rawData3;
  const price = isMrpOnlyRow ? 0 : parseNumberField(rawData2);
  const originalPrice = isMrpOnlyRow
    ? parseNumberField(rawData2)   // the MRP ₹ value from data2 becomes originalPrice
    : parseNumberField(rawData3);

  const shortDescription = String(
    getField(row, 'shortDescription', 'short_description', 'summary', 'description') || ''
  ).trim();
  const fullDescription = String(
    getField(row, 'fullDescription', 'full_description', 'longDescription', 'specifications') ||
    shortDescription
  ).trim();

  const rawImages = splitListField(
    getField(row, 'images', 'imageUrls', 'Image URLs', 'image', 'primaryImage')
  );
  const images = await resolveRowImages(
    rawImages,
    name,
    sku,
    inputDirAbs,
    imagesDirAbs,
    outputDirAbs,
    folderImageFiles
  );

  const materials = splitListField(getField(row, 'materials', 'material', 'Material'));
  const colors = parseColorsField(getField(row, 'colors', 'colours', 'Colors', 'finishes'));
  const colorNameVal = getField(row, 'colorName', 'color');
  const colorHexVal = getField(row, 'colorHex', 'hex');
  const badgeVal = getField(row, 'badge', 'data6');
  const leadTimeVal = getField(row, 'leadTime', 'deliveryTime');
  const warrantyVal = getField(row, 'warranty');

  const product: RawImportProduct = {
    sourceCategory,
    ...(sourceSubCategory ? { sourceSubCategory } : {}),
    name,
    ...(sku ? { sku } : {}),
    price,
    ...(originalPrice > 0 ? { originalPrice } : {}),
    ...(shortDescription ? { shortDescription } : {}),
    ...(fullDescription ? { fullDescription } : {}),
    dimensions: parseDimensionsField(row),
    materials,
    colors,
    ...(colorNameVal ? { colorName: String(colorNameVal).trim() } : {}),
    ...(colorHexVal ? { colorHex: String(colorHexVal).trim() } : {}),
    images,
    ...(badgeVal !== undefined ? { badge: String(badgeVal).trim() || null } : {}),
    leadTime: leadTimeVal ? String(leadTimeVal).trim() : '',
    warranty: warrantyVal ? String(warrantyVal).trim() : '',
    ...(parseOptionalNumber(getField(row, 'stockQuantity', 'stock')) !== undefined
      ? { stockQuantity: parseOptionalNumber(getField(row, 'stockQuantity', 'stock')) }
      : {}),
    isActive: parseBooleanField(getField(row, 'isActive', 'active'), true),
    isFeatured: parseBooleanField(getField(row, 'isFeatured', 'featured'), false),
    isBestseller: parseBooleanField(getField(row, 'isBestseller', 'bestseller'), false),
  };

  return product;
}

async function resolveInputPath(explicitInput?: string): Promise<string> {
  if (explicitInput) {
    return path.resolve(process.cwd(), explicitInput);
  }

  const dropDirAbs = path.resolve(process.cwd(), DEFAULT_DROP_DIR);
  const entries = await fs.readdir(dropDirAbs, { withFileTypes: true }).catch(() => null);
  const candidates = (entries ?? [])
    .filter((e) => {
      if (!e.isFile()) return false;
      const lower = e.name.toLowerCase();
      if (lower.includes('template') || lower.startsWith('prepared-catalog')) return false;
      return /\.(json|xlsx|xls|csv)$/i.test(lower);
    })
    .map((e) => path.join(dropDirAbs, e.name));

  if (candidates.length === 0) {
    throw new Error(
      `No data file found in "${DEFAULT_DROP_DIR}". Place damro-catalog.json, damro-products.xlsx, or damro-products.csv there, or pass --input=<path>.`
    );
  }
  return candidates[0];
}

export async function prepareAndRunImport(options: {
  inputPath?: string;
  imagesDir?: string;
  outputPath?: string;
  isDryRun: boolean;
  convertOnly?: boolean;
  onlyCategory?: string;
  allowFallbackImage?: boolean;
}): Promise<{
  inputPath: string;
  outputPath: string;
  preparedCount: number;
  importReport?: ImportReport;
}> {
  const inputAbs = await resolveInputPath(options.inputPath);
  const inputDirAbs = path.dirname(inputAbs);
  const imagesDirAbs = path.resolve(process.cwd(), options.imagesDir || DEFAULT_IMAGES_DIR);
  const outputAbs = path.resolve(process.cwd(), options.outputPath || DEFAULT_OUTPUT_FILE);
  const outputDirAbs = path.dirname(outputAbs);

  await fs.mkdir(outputDirAbs, { recursive: true });
  const ext = path.extname(inputAbs).toLowerCase();

  let rawRows: FlatRow[] = [];
  if (ext === '.json') {
    const rawJson = JSON.parse(await fs.readFile(inputAbs, 'utf8'));
    if (Array.isArray(rawJson)) {
      rawRows = rawJson;
    } else if (rawJson && Array.isArray(rawJson.products)) {
      rawRows = rawJson.products;
    } else if (rawJson && typeof rawJson === 'object' && rawJson.name) {
      rawRows = [rawJson];
    } else {
      throw new Error(`Unsupported JSON shape in "${inputAbs}". Expected { products: [...] } or [...].`);
    }
  } else if (ext === '.csv') {
    rawRows = parseCsvRows(await fs.readFile(inputAbs, 'utf8'));
  } else if (ext === '.xlsx' || ext === '.xls') {
    rawRows = await parseExcelRows(inputAbs);
  } else {
    throw new Error(`Unsupported input format "${ext}". Supported: .json, .csv, .xlsx, .xls`);
  }

  const folderImageFiles = await listFolderImageFiles(imagesDirAbs);
  const preparedProducts: RawImportProduct[] = [];

  for (const row of rawRows) {
    preparedProducts.push(
      await normalizeToRawProduct(row, inputDirAbs, imagesDirAbs, outputDirAbs, folderImageFiles)
    );
  }

  const preparedPayload: CatalogImportFile = {
    schemaVersion: 1,
    products: preparedProducts,
  };

  await fs.writeFile(outputAbs, `${JSON.stringify(preparedPayload, null, 2)}\n`, 'utf8');
  console.log(
    `[Prepare Catalog] Converted ${preparedProducts.length} record(s) from "${inputAbs}" -> "${outputAbs}"`
  );

  if (options.convertOnly) {
    return {
      inputPath: inputAbs,
      outputPath: outputAbs,
      preparedCount: preparedProducts.length,
    };
  }

  // Always run Dry-Run validation first before executing live writes
  const dryReport = await runCatalogImport({
    inputPath: outputAbs,
    isDryRun: true,
    onlyCategory: options.onlyCategory,
    allowFallbackImage: options.allowFallbackImage,
  });

  if (options.isDryRun) {
    return {
      inputPath: inputAbs,
      outputPath: outputAbs,
      preparedCount: preparedProducts.length,
      importReport: dryReport,
    };
  }

  if (dryReport.failed > 0 || dryReport.validatedDryRun === 0) {
    console.error(
      '[Prepare Catalog] Aborting --execute: Dry-run validation produced 0 valid new products or encountered errors.'
    );
    return {
      inputPath: inputAbs,
      outputPath: outputAbs,
      preparedCount: preparedProducts.length,
      importReport: dryReport,
    };
  }

  const liveReport = await runCatalogImport({
    inputPath: outputAbs,
    isDryRun: false,
    onlyCategory: options.onlyCategory,
    allowFallbackImage: options.allowFallbackImage,
  });

  return {
    inputPath: inputAbs,
    outputPath: outputAbs,
    preparedCount: preparedProducts.length,
    importReport: liveReport,
  };
}

const isMain = process.argv[1]?.includes('prepare-catalog-import');
if (isMain) {
  const inputArg = process.argv.find((arg) => arg.startsWith('--input='));
  const imagesArg = process.argv.find((arg) => arg.startsWith('--images-dir='));
  const outputArg = process.argv.find((arg) => arg.startsWith('--output='));
  const onlyCatArg = process.argv.find((arg) => arg.startsWith('--only-category='));
  const allowFallbackImage = process.argv.includes('--allow-fallback-image');
  const isDryRun = !process.argv.includes('--execute') || process.argv.includes('--dry-run');
  const convertOnly = process.argv.includes('--convert-only');

  prepareAndRunImport({
    inputPath: inputArg ? inputArg.slice('--input='.length) : undefined,
    imagesDir: imagesArg ? imagesArg.slice('--images-dir='.length) : undefined,
    outputPath: outputArg ? outputArg.slice('--output='.length) : undefined,
    isDryRun,
    convertOnly,
    onlyCategory: onlyCatArg ? onlyCatArg.slice('--only-category='.length) : undefined,
    allowFallbackImage,
  })
    .then((result) => {
      if (result.importReport) {
        console.log('\n=====================================================');
        console.log(
          `BULK WORKFLOW REPORT [${result.importReport.isDryRun ? 'DRY-RUN' : 'EXECUTED'}]`
        );
        console.log('=====================================================');
        console.log(JSON.stringify(result.importReport, null, 2));
        process.exit(result.importReport.failed > 0 ? 1 : 0);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Prepare Catalog Error]:', err.message || err);
      process.exit(1);
    });
}
