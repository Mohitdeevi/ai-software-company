import { logger } from '../utils/logger.js';

/**
 * Merge generated file arrays from agent outputs into a single list.
 *
 * Each agent may produce a `files` array of { path, content, language }.
 * This function deduplicates by path (later entries win) and returns
 * a clean array ready for storage or ZIP generation.
 *
 * @param {object} architectureOutput - Output from the architect agent.
 * @param {object} backendOutput      - Output from the backend developer agent.
 * @param {object} frontendOutput     - Output from the frontend developer agent.
 * @returns {{ path: string, content: string, language: string }[]}
 */
export function generateProjectFiles(architectureOutput, backendOutput, frontendOutput) {
  const fileMap = new Map();

  const sources = [
    { label: 'architecture', data: architectureOutput },
    { label: 'backend', data: backendOutput },
    { label: 'frontend', data: frontendOutput },
  ];

  for (const { label, data } of sources) {
    if (!data) continue;

    const files = Array.isArray(data.files) ? data.files : [];

    for (const file of files) {
      if (!file.path || !file.content) {
        logger.warn({ label, file: file.path }, 'Skipping file entry with missing path or content');
        continue;
      }

      // Normalize path separators to forward slashes
      const normalizedPath = file.path.replace(/\\/g, '/');

      fileMap.set(normalizedPath, {
        path: normalizedPath,
        content: file.content,
        language: file.language || inferLanguage(normalizedPath),
      });
    }
  }

  const result = Array.from(fileMap.values());
  logger.info({ fileCount: result.length }, 'Project files generated');
  return result;
}

/**
 * Infer a language identifier from a file path extension.
 *
 * @param {string} filePath
 * @returns {string}
 */
function inferLanguage(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();

  const map = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    css: 'css',
    scss: 'scss',
    html: 'html',
    sh: 'shell',
    bash: 'shell',
    dockerfile: 'dockerfile',
    py: 'python',
    env: 'dotenv',
  };

  return map[ext] || 'text';
}
