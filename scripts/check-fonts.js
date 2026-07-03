import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const FORBIDDEN_DOMAINS = [
    'fonts.googleapis.com',
    'use.typekit.net',
    'fonts.net',
    'rsms.me'
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

function checkFonts() {
    if (!fs.existsSync(DIST_DIR)) {
        console.error('❌ dist/ directory not found. Run build first.');
        process.exit(1);
    }

    const files = getAllFiles(DIST_DIR).filter(file => file.endsWith('.html') || file.endsWith('.css'));
    let hasError = false;

    console.log(`🔍 Scanning ${files.length} files for external fonts...`);

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        FORBIDDEN_DOMAINS.forEach(domain => {
            if (content.includes(domain)) {
                console.error(`❌ External font detected in ${path.relative(DIST_DIR, file)}: ${domain}`);
                hasError = true;
            }
        });
    });

    if (hasError) {
        console.error('🚫 Build failed: External fonts detected. Please use local fonts via @fontsource.');
        process.exit(1);
    } else {
        console.log('✅ No external fonts detected. Good job!');
    }
}

checkFonts();
