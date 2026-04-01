import mammoth from 'mammoth';
import fs from 'fs';

const result = await mammoth.convertToHtml({path: "invoice.docx"});
console.log(result.value);

// Save to file
fs.writeFileSync("invoice-converted.html", result.value);
