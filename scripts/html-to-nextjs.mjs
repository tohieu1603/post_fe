/**
 * Convert Stitch HTML → Next.js page.tsx
 * Extracts <body> content, applies JSX transforms, outputs clean component.
 * Preserves 100% of HTML structure and Tailwind classes.
 */
import fs from 'fs';
import path from 'path';

const STITCH_DIR = path.resolve('..', 'design-to-code', 'screenshots', 'stitch');
const APP_DIR = path.resolve('src', 'app');

// Page mapping: stitch filename → Next.js route
const PAGES = {
  'homepage':         '(public)/page.tsx',
  'category-listing': '(public)/chuyen-muc/[slug]/page.tsx',
  'article-detail':   '(public)/bai-viet/[slug]/page.tsx',
  'search-results':   '(public)/tim-kiem/page.tsx',
  'login':            '(auth)/dang-nhap/page.tsx',
  'register':         '(auth)/dang-ky/page.tsx',
  'forgot-password':  '(auth)/quen-mat-khau/page.tsx',
  'profile':          '(user)/tai-khoan/page.tsx',
  'bookmarks':        '(user)/tai-khoan/da-luu/page.tsx',
  'buy-tokens':       '(user)/tai-khoan/nap-token/page.tsx',
  'ai-chat':          '(user)/ai-chat/page.tsx',
  'admin-dashboard':  '(admin)/admin/page.tsx',
  'admin-posts':      '(admin)/admin/bai-viet/page.tsx',
};

function extractBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return html;
  return bodyMatch[1].trim();
}

function extractStyles(html) {
  const styles = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = styleRegex.exec(html)) !== null) {
    styles.push(m[1].trim());
  }
  return styles.join('\n');
}

function htmlToJsx(html) {
  let jsx = html;

  // Remove <script> tags
  jsx = jsx.replace(/<script[\s\S]*?<\/script>/gi, '');

  // HTML comments → JSX comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  // class → className
  jsx = jsx.replace(/\bclass="/g, 'className="');
  jsx = jsx.replace(/\bclass='/g, "className='");

  // for → htmlFor
  jsx = jsx.replace(/\bfor="/g, 'htmlFor="');

  // tabindex → tabIndex
  jsx = jsx.replace(/\btabindex="/g, 'tabIndex="');
  jsx = jsx.replace(/\btabindex=/g, 'tabIndex=');

  // colspan → colSpan, rowspan → rowSpan
  jsx = jsx.replace(/\bcolspan="/g, 'colSpan="');
  jsx = jsx.replace(/\browspan="/g, 'rowSpan="');

  // maxlength → maxLength
  jsx = jsx.replace(/\bmaxlength="/g, 'maxLength="');

  // autocomplete → autoComplete
  jsx = jsx.replace(/\bautocomplete="/g, 'autoComplete="');

  // readonly → readOnly
  jsx = jsx.replace(/\breadonly\b/g, 'readOnly');

  // Self-close void elements
  const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'track', 'wbr', 'col'];
  for (const tag of voidTags) {
    // Match <tag ... > that isn't already self-closed
    const regex = new RegExp(`<(${tag})\\b([^>]*?)(?<!/)>`, 'gi');
    jsx = jsx.replace(regex, `<$1$2 />`);
  }

  // Boolean attributes: checked="" → checked, disabled="" → disabled
  jsx = jsx.replace(/\bchecked=""/g, 'checked');
  jsx = jsx.replace(/\bdisabled=""/g, 'disabled');
  jsx = jsx.replace(/\bselected=""/g, 'selected');
  jsx = jsx.replace(/\brequired=""/g, 'required');
  jsx = jsx.replace(/\bautofocus=""/g, 'autoFocus');

  // Numeric attributes: rows="N" → rows={N}, cols="N" → cols={N}
  jsx = jsx.replace(/\brows="(\d+)"/g, 'rows={$1}');
  jsx = jsx.replace(/\bcols="(\d+)"/g, 'cols={$1}');

  // SVG attributes camelCase
  jsx = jsx.replace(/\bviewbox=/gi, 'viewBox=');
  jsx = jsx.replace(/\bpreserveaspectratio=/gi, 'preserveAspectRatio=');
  jsx = jsx.replace(/\bstop-color=/g, 'stopColor=');
  jsx = jsx.replace(/\bstop-opacity=/g, 'stopOpacity=');
  jsx = jsx.replace(/\bfill-rule=/g, 'fillRule=');
  jsx = jsx.replace(/\bclip-rule=/g, 'clipRule=');
  jsx = jsx.replace(/\bstroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/\bstroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/\bstroke-linejoin=/g, 'strokeLinejoin=');
  jsx = jsx.replace(/\bstroke-dasharray=/g, 'strokeDasharray=');
  jsx = jsx.replace(/\bstroke-dashoffset=/g, 'strokeDashoffset=');
  jsx = jsx.replace(/\bfill-opacity=/g, 'fillOpacity=');
  jsx = jsx.replace(/\bstroke-opacity=/g, 'strokeOpacity=');
  jsx = jsx.replace(/\bfont-size=/g, 'fontSize=');
  jsx = jsx.replace(/\bfont-weight=/g, 'fontWeight=');
  jsx = jsx.replace(/\btext-anchor=/g, 'textAnchor=');
  jsx = jsx.replace(/\bxlink:href=/g, 'xlinkHref=');
  jsx = jsx.replace(/\bxml:space=/g, 'xmlSpace=');
  jsx = jsx.replace(/\bclip-path=/g, 'clipPath=');

  // SVG elements camelCase
  jsx = jsx.replace(/<lineargradient/g, '<linearGradient');
  jsx = jsx.replace(/<\/lineargradient>/g, '</linearGradient>');
  jsx = jsx.replace(/<radialgradient/g, '<radialGradient');
  jsx = jsx.replace(/<\/radialgradient>/g, '</radialGradient>');
  jsx = jsx.replace(/<clippath/g, '<clipPath');
  jsx = jsx.replace(/<\/clippath>/g, '</clipPath>');
  jsx = jsx.replace(/<textpath/g, '<textPath');
  jsx = jsx.replace(/<\/textpath>/g, '</textPath>');
  jsx = jsx.replace(/<foreignobject/g, '<foreignObject');
  jsx = jsx.replace(/<\/foreignobject>/g, '</foreignObject>');

  // Convert inline style="" to style={{}}
  jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
    const obj = styleStr.split(';')
      .filter(s => s.trim())
      .map(s => {
        const [key, ...valParts] = s.split(':');
        if (!key || valParts.length === 0) return null;
        const prop = key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const val = valParts.join(':').trim();
        // Handle font-variation-settings with single quotes
        const escaped = val.replace(/'/g, '"');
        return `${prop}: '${escaped}'`;
      })
      .filter(Boolean)
      .join(', ');
    return `style={{${obj}}}`;
  });

  // Fix font-variation-settings edge case: ''FILL' 1' → '"FILL" 1'
  jsx = jsx.replace(/fontVariationSettings: ''/g, "fontVariationSettings: '\"");
  jsx = jsx.replace(/' (\d)'}/g, "\" $1'}");

  // Remove event handlers (onclick, onchange, etc.)
  jsx = jsx.replace(/\bon[a-z]+="[^"]*"/gi, '');

  // Remove xmlns on non-svg elements (but keep on <svg>)
  // Actually just leave xmlns, React handles it

  return jsx;
}

function getComponentName(name) {
  return name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('') + 'Page';
}

// Navigation link replacements
function fixLinks(jsx) {
  // Category nav
  jsx = jsx.replace(/href="#"([^>]*)>Tin nhanh/g, 'href="/chuyen-muc/tin-nhanh"$1>Tin nhanh');
  jsx = jsx.replace(/href="#"([^>]*)>Ứng dụng AI/g, 'href="/chuyen-muc/ung-dung-ai"$1>Ứng dụng AI');
  jsx = jsx.replace(/href="#"([^>]*)>Thư viện Vibecode/g, 'href="/chuyen-muc/thu-vien-vibecode"$1>Thư viện Vibecode');
  jsx = jsx.replace(/href="#"([^>]*)>Chia sẻ chuyên sâu/g, 'href="/chuyen-muc/chia-se-chuyen-sau"$1>Chia sẻ chuyên sâu');
  jsx = jsx.replace(/href="#"([^>]*)>AI Trends/g, 'href="/chuyen-muc/ai-trends"$1>AI Trends');
  jsx = jsx.replace(/href="#"([^>]*)>Công cụ AI/g, 'href="/chuyen-muc/cong-cu-ai"$1>Công cụ AI');
  jsx = jsx.replace(/href="#"([^>]*)>Hướng dẫn A-Z/g, 'href="/chuyen-muc/huong-dan-a-z"$1>Hướng dẫn A-Z');
  jsx = jsx.replace(/href="#"([^>]*)>AI cho DN/g, 'href="/chuyen-muc/ai-cho-doanh-nghiep"$1>AI cho DN');
  jsx = jsx.replace(/href="#"([^>]*)>AI cho Doanh nghiệp/g, 'href="/chuyen-muc/ai-cho-doanh-nghiep"$1>AI cho Doanh nghiệp');

  // Auth
  jsx = jsx.replace(/href="#"([^>]*)>Đăng nhập/g, 'href="/dang-nhap"$1>Đăng nhập');
  jsx = jsx.replace(/href="#"([^>]*)>Đăng ký ngay/g, 'href="/dang-ky"$1>Đăng ký ngay');
  jsx = jsx.replace(/href="#"([^>]*)>Đăng ký</g, 'href="/dang-ky"$1>Đăng ký<');
  jsx = jsx.replace(/href="#"([^>]*)>Quên mật khẩu/g, 'href="/quen-mat-khau"$1>Quên mật khẩu');
  jsx = jsx.replace(/href="#"([^>]*)>Quay lại đăng nhập/g, 'href="/dang-nhap"$1>Quay lại đăng nhập');

  // User
  jsx = jsx.replace(/href="#"([^>]*)>Bài đã lưu/g, 'href="/tai-khoan/da-luu"$1>Bài đã lưu');
  jsx = jsx.replace(/href="#"([^>]*)>Nạp token/g, 'href="/tai-khoan/nap-token"$1>Nạp token');
  jsx = jsx.replace(/href="#"([^>]*)>AI Chat/g, 'href="/ai-chat"$1>AI Chat');
  jsx = jsx.replace(/href="#"([^>]*)>Trang chủ/g, 'href="/"$1>Trang chủ');
  jsx = jsx.replace(/href="#"([^>]*)>Giới thiệu/g, 'href="/gioi-thieu"$1>Giới thiệu');
  jsx = jsx.replace(/href="#"([^>]*)>Liên hệ/g, 'href="/lien-he"$1>Liên hệ');
  jsx = jsx.replace(/href="#"([^>]*)>Tìm kiếm/g, 'href="/tim-kiem"$1>Tìm kiếm');

  return jsx;
}

function convertFile(name, outputPath) {
  const htmlFile = path.join(STITCH_DIR, `${name}.html`);
  if (!fs.existsSync(htmlFile)) {
    console.log(`  ✗ ${name}.html not found`);
    return false;
  }

  const html = fs.readFileSync(htmlFile, 'utf-8');
  const bodyContent = extractBody(html);
  const styles = extractStyles(html);
  let jsx = htmlToJsx(bodyContent);
  jsx = fixLinks(jsx);

  const compName = getComponentName(name);
  const output = `export default function ${compName}() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: \`${styles.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}} />
      ${jsx}
    </>
  );
}
`;

  const outFile = path.join(APP_DIR, outputPath);
  const outDir = path.dirname(outFile);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, output, 'utf-8');
  console.log(`  ✓ ${name} → ${outputPath}`);
  return true;
}

console.log('===========================================');
console.log('  Stitch HTML → Next.js JSX Converter v2');
console.log('===========================================');
console.log(`  Input:  ${STITCH_DIR}`);
console.log(`  Output: ${APP_DIR}\n`);

let success = 0;
for (const [name, outPath] of Object.entries(PAGES)) {
  if (convertFile(name, outPath)) success++;
}

console.log(`\n  ✓ Converted: ${success}/${Object.keys(PAGES).length}`);
console.log('===========================================');
