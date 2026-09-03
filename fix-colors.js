const fs = require('fs');
const path = require('path');

const dirsToScan = ['app', 'components'];

const replacements = [
  // First, blindly replace all hover:text-white
  { regex: /hover:text-white/g, replacement: 'hover:text-foreground' },
  // Then replace text-white
  { regex: /text-white(?!(\/70|\/80|\/60|\/10|\/5))/g, replacement: 'text-foreground' },
  // Now fix the buttons that were incorrectly changed to text-foreground
  { regex: /bg-blue-600([^"']*?)text-foreground/g, replacement: 'bg-primary$1text-primary-foreground' },
  { regex: /bg-blue-500([^"']*?)text-foreground/g, replacement: 'bg-blue-500$1text-white' },
  { regex: /bg-red-500([^"']*?)text-foreground/g, replacement: 'bg-destructive$1text-destructive-foreground' },
  { regex: /bg-amber-500([^"']*?)text-foreground/g, replacement: 'bg-amber-500$1text-white' },
  { regex: /bg-emerald-500([^"']*?)text-foreground/g, replacement: 'bg-emerald-500$1text-white' },
  { regex: /bg-blue-600/g, replacement: 'bg-primary' },
  { regex: /hover:bg-blue-500/g, replacement: 'hover:bg-primary/90' },
  { regex: /shadow-blue-600/g, replacement: 'shadow-primary' },
  { regex: /shadow-blue-500/g, replacement: 'shadow-primary' },
  { regex: /text-blue-400/g, replacement: 'text-primary' },
  { regex: /text-blue-500/g, replacement: 'text-primary' }
];

function scanAndReplace(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanAndReplace(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirsToScan.forEach(scanAndReplace);
console.log('Done fixing text-white and blue buttons.');
