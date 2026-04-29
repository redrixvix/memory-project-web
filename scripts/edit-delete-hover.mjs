import fs from "fs";
let content = fs.readFileSync('app/books/[id]/page.tsx', 'utf8');

// Make Edit/Delete buttons reveal on hover - hide by default, show on card hover
const old = `className="flex items-center justify-end gap-2 mt-7 pt-5 border-t transition-all duration-300"
                        style={{ borderColor: 'rgba(212,163,115,0.08)' }}
                      >
                        <Link
                          href={\`/books/\${id}/edit?memory=\${memory.id}\`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
                          style={{
                            color: 'var(--charcoal)',
                            backgroundColor: 'rgba(212,163,115,0.08)',
                            border: '1px solid rgba(212,163,115,0.15)',
                          }}
                          aria-label="Edit memory"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ memoryId: memory.id })}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-95"
                          style={{
                            color: '#B07070',
                            backgroundColor: 'rgba(212,163,115,0.06)',
                            border: '1px solid rgba(212,163,115,0.12)',
                          }}
                          aria-label="Delete memory"`;

const replacement = `className="flex items-center justify-end gap-2 mt-7 pt-5 border-t transition-all duration-500"
                        style={{ borderColor: 'rgba(212,163,115,0.08)', opacity: hoveredCard === memoryIndex ? 1 : 0 }}
                      >
                        <Link
                          href={\`/books/\${id}/edit?memory=\${memory.id}\`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
                          style={{
                            color: 'var(--charcoal)',
                            backgroundColor: 'rgba(212,163,115,0.08)',
                            border: '1px solid rgba(212,163,115,0.15)',
                          }}
                          aria-label="Edit memory"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--bronze)' }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ memoryId: memory.id })}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-95"
                          style={{
                            color: '#B07070',
                            backgroundColor: 'rgba(212,163,115,0.06)',
                            border: '1px solid rgba(212,163,115,0.12)',
                          }}
                          aria-label="Delete memory"`;

if (content.includes(old)) {
  content = content.replace(old, replacement);
  fs.writeFileSync('app/books/[id]/page.tsx', content);
  console.log('Done - Edit/Delete buttons now fade in on card hover');
} else {
  console.log('Could not find exact string');
  // Find the pattern
  const idx = content.indexOf('justify-end gap-2 mt-7');
  if (idx > 0) {
    console.log('Found at index:', idx);
    console.log('Context:', content.slice(idx - 50, idx + 400));
  }
}