const fs = require('fs');
const file = "src/pages/admin/AdminMatrixBuilder.jsx";
let content = fs.readFileSync(file, 'utf8');

// Match <button ... className="..."
// Using a non-greedy match that doesn't cross </button> or > of the start tag
content = content.replace(/<button\s+([^>]*?)(?:=>[^>]*?)?className="([^"]*)"/g, (match, p1, p2) => {
  // Wait, regular expressions are tricky with HTML.
  return match;
});

// A simpler and absolutely safe way:
let lines = content.split('\n');
for(let i=0; i<lines.length; i++) {
   if(lines[i].includes('<button') && lines[i].includes('className="') && !lines[i].includes('cursor-pointer')) {
       lines[i] = lines[i].replace('className="', 'className="cursor-pointer ');
   } else if (lines[i].includes('className="') && !lines[i].includes('cursor-pointer') && lines[i-1] && lines[i-1].includes('<button')) {
       // if className is on the next line
       lines[i] = lines[i].replace('className="', 'className="cursor-pointer ');
   } else if (lines[i].includes('className="') && !lines[i].includes('cursor-pointer') && lines[i-2] && lines[i-2].includes('<button')) {
       lines[i] = lines[i].replace('className="', 'className="cursor-pointer ');
   }
}

fs.writeFileSync(file, lines.join('\n'));
