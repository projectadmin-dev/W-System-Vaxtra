const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'app', 'pengaturan', 'hc');
const pages = fs.readdirSync(pagesDir).filter(dir => {
  const pagePath = path.join(pagesDir, dir, 'page.tsx');
  return fs.existsSync(pagePath);
});

console.log(`Found ${pages.length} pages to update:\n`);

pages.forEach(page => {
  const pagePath = path.join(pagesDir, page, 'page.tsx');
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Get page title from h1
  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : page.replace(/-/g, ' ');
  
  // Get description if exists
  const descMatch = content.match(/<p className="text-muted-foreground">([^<]+)<\/p>/);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Check if already using LayoutWithSidebar
  if (content.includes('LayoutWithSidebar')) {
    console.log(`✓ ${page} - Already using LayoutWithSidebar`);
    return;
  }
  
  // Add LayoutWithSidebar import
  if (!content.includes('import { LayoutWithSidebar }')) {
    const sidebarImport = 'import { LayoutWithSidebar } from "@/components/layout-with-sidebar"\n';
    content = content.replace(/(import \{ AppSidebar \} from)/i, sidebarImport + '$1');
  }
  
  // Remove manual header section
  content = content.replace(
    /<div className="flex items-center justify-between mb-6">\s*<div>\s*<h1[^>]*>[^<]+<\/h1>\s*<p className="text-muted-foreground">[^<]+<\/p>\s*<\/div>/s,
    ''
  );
  
  // Replace SidebarProvider structure with LayoutWithSidebar
  const oldStructure = /<SidebarProvider>\s*<AppSidebar \/>/;
  if (oldStructure.test(content)) {
    // Extract breadcrumb from content or create default
    const breadcrumbItems = `[{ label: "Dashboard", href: "/dashboard" }, { label: "${title}" }]`;
    
    content = content.replace(
      oldStructure,
      `<LayoutWithSidebar\n      breadcrumbItems={${breadcrumbItems}}\n    >`
    );
    
    // Remove closing tags
    content = content.replace(/<\/SidebarInset>\s*<\/SidebarProvider>/, '</LayoutWithSidebar>');
    content = content.replace(/<SidebarInset>/, '');
  }
  
  fs.writeFileSync(pagePath, content);
  console.log(`✓ ${page} - Updated (Title: ${title})`);
});

console.log('\n✅ All pages updated!');
