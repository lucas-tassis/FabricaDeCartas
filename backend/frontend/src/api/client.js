// Centralizes all API communication. Never use fetch() directly in components.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function buildErrorLog(status, statusText, rawBody, context = null) {
  const lines = [];
  const now = new Date().toISOString();

  lines.push('='.repeat(72));
  lines.push('FÁBRICA DE CARTAS — ERROR REPORT');
  lines.push('='.repeat(72));
  lines.push(`Timestamp : ${now}`);
  lines.push(`HTTP      : ${status} ${statusText}`);
  lines.push('');

  let parsed = null;
  try { parsed = JSON.parse(rawBody); } catch { /* not JSON */ }

  if (parsed) {
    if (parsed.message) lines.push(`Message   : ${parsed.message}`);
    if (parsed.path)    lines.push(`Path      : ${parsed.path}`);
    if (parsed.error)   lines.push(`Error     : ${parsed.error}`);
    lines.push('');
    if (parsed.trace) {
      lines.push('-'.repeat(72));
      lines.push('STACK TRACE');
      lines.push('-'.repeat(72));
      lines.push(parsed.trace.replace(/\r\n/g, '\n').replace(/\\n/g, '\n'));
    } else {
      lines.push('(no stack trace — set server.error.include-stacktrace=always in application.properties)');
    }
  } else {
    lines.push('-'.repeat(72));
    lines.push('RAW RESPONSE');
    lines.push('-'.repeat(72));
    lines.push(rawBody || '(empty body)');
  }

  if (context != null) {
    lines.push('');
    lines.push('='.repeat(72));
    lines.push('CONTEXT');
    lines.push('='.repeat(72));
    try {
      lines.push(typeof context === 'string' ? context : JSON.stringify(context, null, 2));
    } catch {
      lines.push('(could not serialize context)');
    }
  }

  return lines.join('\n');
}

function networkErrorLog(networkErr, url, context = null) {
  return buildErrorLog(
    '(sem resposta HTTP)',
    networkErr.message,
    `Não foi possível conectar ao servidor em ${API_BASE_URL}.\nURL: ${url}\nErro original: ${networkErr.message}`,
    context
  );
}

async function safeFetch(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (networkErr) {
    const err = new Error('Network error');
    err.serverDetail = networkErrorLog(networkErr, url, options._context);
    throw err;
  }
  if (!response.ok) {
    const rawBody = await response.text().catch(() => '');
    const err = new Error(`HTTP ${response.status}`);
    err.serverDetail = buildErrorLog(response.status, response.statusText, rawBody, options._context);
    throw err;
  }
  return response;
}

export const api = {
  async extractColumns(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await safeFetch(`${API_BASE_URL}/api/cards/extract-columns`, {
      method: 'POST',
      body: formData,
      _context: `Arquivo: ${file.name}`,
    });
    return response.json();
  },

  async generateCards(file, template, format) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('template', JSON.stringify(template));
    formData.append('format', format);
    const response = await safeFetch(`${API_BASE_URL}/api/cards/generate`, {
      method: 'POST',
      body: formData,
      _context: template,
    });
    return response.blob();
  },

  async uploadImages(files) {
    const results = await Promise.all(files.map(async (f) => {
      const formData = new FormData();
      formData.append('files', f);
      const response = await safeFetch(`${API_BASE_URL}/api/images/upload`, {
        method: 'POST',
        body: formData,
        _context: `Arquivo: ${f.name}`,
      });
      return response.json(); // string[]
    }));
    return results.flat();
  },

  async listImages() {
    const response = await safeFetch(`${API_BASE_URL}/api/images/list`, { method: 'GET' });
    return response.json();
  },

  async clearImages() {
    await safeFetch(`${API_BASE_URL}/api/images/clear`, { method: 'DELETE' });
  },

  async listFonts() {
    const response = await safeFetch(`${API_BASE_URL}/api/fonts`, { method: 'GET' });
    return response.json(); // string[]
  },

  async shutdown() {
    await safeFetch(`${API_BASE_URL}/api/cards/shutdown`, { method: 'POST' });
  },
};
