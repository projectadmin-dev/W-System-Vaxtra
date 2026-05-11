#!/usr/bin/env node
/**
 * Script untuk update semua halaman agar pakai LayoutWithSidebar
 * Run: node scripts/update-pages-with-sidebar.js
 */

const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..');
const appDir = path.join(webDir, 'app');

// Pages yang sudah punya sidebar (skip)
const skipPages = [
  'app/login/page.tsx',
  'app/page.tsx',
  'app/auth/callback/route.ts'
];

// Mapping halaman ke breadcrumb
const pageBreadcrumbs = {
  'app/dashboard/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' }
  ],
  'app/leads/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leads' }
  ],
  'app/leads/new/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leads', href: '/leads' },
    { label: 'New Lead' }
  ],
  'app/leads/[id]/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leads', href: '/leads' },
    { label: 'Lead Details' }
  ],
  'app/users/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users' }
  ],
  'app/users/new/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/users' },
    { label: 'New User' }
  ],
  'app/users/[id]/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/users' },
    { label: 'User Details' }
  ],
  'app/project-briefs/new/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Project Briefs' },
    { label: 'New' }
  ],
  'app/pengaturan/hc/departemen/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Department' }
  ],
  'app/pengaturan/hc/jabatan/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Jabatan' }
  ],
  'app/pengaturan/hc/grade/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Grade' }
  ],
  'app/pengaturan/hc/shift/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Shift' }
  ],
  'app/pengaturan/hc/umr/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'UMR' }
  ],
  'app/pengaturan/hc/kalender/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Kalender' }
  ],
  'app/pengaturan/hc/bpjs/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'BPJS' }
  ],
  'app/pengaturan/hc/pajak/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Pajak' }
  ],
  'app/pengaturan/hc/area-kerja/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Area Kerja' }
  ],
  'app/pengaturan/hc/komponen-gaji/page.tsx': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan', href: '/pengaturan' },
    { label: 'Komponen Gaji' }
  ]
};

function getRelativePath(filePath) {
  return filePath.replace(webDir + '/', '');
}

function updatePage(filePath) {
  const relPath = getRelativePath(filePath);
  
  // Skip if in skip list
  if (skipPages.some(skip => relPath.includes(skip))) {
    console.log(`⊘ Skipping ${relPath} (public page)`);
    return;
  }

  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has SidebarProvider
  if (content.includes('LayoutWithSidebar')) {
    console.log(`✓ Already updated: ${relPath}`);
    return;
  }

  // Add import
  if (!content.includes('import { LayoutWithSidebar')) {
    // Remove old imports
    content = content.replace(/import { AppSidebar } from ["']@\/components\/app-sidebar["']\n?/, '');
    content = content.replace(/import { NavUser } from ["']@\/components\/nav-user["']\n?/, '');
    content = content.replace(/import {\n  Breadcrumb,\n  BreadcrumbItem,\n  BreadcrumbLink,\n  BreadcrumbList,\n  BreadcrumbPage,\n  BreadcrumbSeparator,\n} from ["']@workspace\/ui\/components\/breadcrumb["']\n?/, '');
    content = content.replace(/import { Separator } from ["']@workspace\/ui\/components\/separator["']\n?/, '');
    content = content.replace(/import {\n  SidebarInset,\n  SidebarProvider,\n  SidebarTrigger,\n} from ["']@workspace\/ui\/components\/sidebar["']\n?/, '');
    
    // Add new import
    const importLine = 'import { LayoutWithSidebar } from "@/components/layout-with-sidebar"\n';
    content = content.replace(/^(import .+)$/m, importLine + '$1');
  }

  // Get breadcrumbs
  const breadcrumbs = pageBreadcrumbs[relPath] || [];
  const breadcrumbStr = JSON.stringify(breadcrumbs, null, 2);

  // Replace return statement
  const oldReturn = content.match(/return \(\s*<SidebarProvider>([\s\S]*?)<\/SidebarProvider>\s*\)/);
  if (oldReturn) {
    const innerContent = oldReturn[1];
    
    // Extract content between SidebarInset tags
    const sidebarInsetMatch = innerContent.match(/<SidebarInset>([\s\S]*?)<\/SidebarInset>/);
    if (sidebarInsetMatch) {
      const mainContent = sidebarInsetMatch[1];
      
      // Remove header from main content
      const withoutHeader = mainContent.replace(/<header[\s\S]*?<\/header>\s*/, '');
      
      // Create new return
      const newReturn = `return (\n    <LayoutWithSidebar\n      breadcrumbItems={${breadcrumbStr}}\n    >\n      ${withoutHeader}\n    </LayoutWithSidebar>\n  )`;
      
      content = content.replace(oldReturn[0], newReturn);
    }
  }

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated: ${relPath}`);
}

// Find all page.tsx files
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
      findPageFiles(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Run
console.log('🔧 Updating pages with LayoutWithSidebar...\n');

const pageFiles = findPageFiles(appDir);
pageFiles.forEach(updatePage);

console.log('\n✅ Done!');
