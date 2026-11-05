import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');

const checks = [
  {
    pattern: /\bMath\.random\s*\(/,
    message: 'Math.random() is prohibited for security-sensitive randomness.',
  },
  {
    pattern: /\bconsole\.(?:log|info|debug)\s*\(/,
    message:
      'Do not log application values. Use console.warn or console.error only when necessary.',
  },
  {
    pattern: /\beval\s*\(/,
    message: 'Dynamic code execution is prohibited.',
  },
  {
    pattern: /\bnew\s+Function\s*\(/,
    message: 'Dynamic code execution is prohibited.',
  },
  {
    pattern: /\bXMLHttpRequest\b/,
    message: 'Unexpected network request API. FacPass v1 must not make runtime network requests.',
  },
  {
    pattern: /\bfetch\s*\(/,
    message: 'Unexpected network request API. FacPass v1 must not make runtime network requests.',
  },
  {
    pattern: /\bsendBeacon\s*\(/,
    message: 'Unexpected network request API. FacPass v1 must not make runtime network requests.',
  },
  {
    pattern: /dangerouslySetInnerHTML/,
    message: 'Unsafe HTML injection is prohibited.',
  },
  {
    pattern: /searchParams[\s\S]{0,80}(?:password|passphrase|pin)\b/i,
    message: 'Do not serialize sensitive values into URLs.',
  },
];

const sourceFiles = await collectSourceFiles(sourceRoot);
const violations = [];

for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    for (const check of checks) {
      if (check.pattern.test(lines[index])) {
        violations.push({
          file: relative(root, file),
          line: index + 1,
          message: check.message,
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`Security scan failed with ${violations.length} violation(s):`);

  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} ${violation.message}`);
  }

  process.exitCode = 1;
} else {
  console.log(`Security scan passed: ${sourceFiles.length} source files checked.`);
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
    } else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}
