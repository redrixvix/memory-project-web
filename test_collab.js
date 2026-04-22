// Test script for book_members collaboration APIs

const postgres = require('postgres');
const crypto = require('crypto');
const sql = postgres('postgresql://neondb_owner:npg_lp6wvrYx9bBm@ep-shy-river-amg25vw2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
  console.log('Starting collaboration test...\n');

  // 1. Create test user
  const testEmail = 'test_collab_' + Date.now() + '@example.com';
  const [testUser] = await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES (${testEmail}, 'Test Collaborator', 'dummy')
    RETURNING id, email
  `;
  console.log('1. Created test user:', testUser.id, testUser.email);

  // 2. Create a test book owned by the test user
  const [book] = await sql`
    INSERT INTO books (owner_id, title, description, storage_tier)
    VALUES (${testUser.id}, 'Test Book for Collaboration', 'A test book', 'free')
    RETURNING id
  `;
  console.log('2. Created test book:', book.id);

  // 3. Add user as owner to book_members
  await sql`
    INSERT INTO book_members (book_id, user_id, role)
    VALUES (${book.id}, ${testUser.id}, 'owner')
  `;
  console.log('3. Added user as owner to book_members');

  // 4. Verify GET /api/books/[id]/members returns the member
  const members = await sql`
    SELECT bm.user_id, u.name, u.email, bm.role, bm.joined_at
    FROM book_members bm
    JOIN users u ON bm.user_id = u.id
    WHERE bm.book_id = ${book.id}
    ORDER BY bm.role = 'owner' DESC, bm.joined_at ASC
  `;
  console.log('4. GET members result:', JSON.stringify(members, null, 2));

  if (members.length !== 1 || members[0].role !== 'owner') {
    throw new Error('Member verification failed!');
  }
  console.log('   ✓ Member verification passed');

  // 5. Create another user to add as contributor
  const contributorEmail = 'contributor_' + Date.now() + '@example.com';
  const [contributor] = await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES (${contributorEmail}, 'Contributor', 'dummy')
    RETURNING id
  `;
  console.log('5. Created contributor user:', contributor.id);

  // 6. Add contributor as member
  const inviteToken = crypto.randomBytes(16).toString('hex');
  await sql`
    INSERT INTO book_members (book_id, user_id, role, invite_token, invite_email)
    VALUES (${book.id}, ${contributor.id}, 'contributor', ${inviteToken}, ${contributorEmail})
  `;
  console.log('6. Added contributor to book_members');

  // 7. Verify count
  const allMembers = await sql`
    SELECT bm.user_id, u.name, u.email, bm.role, bm.joined_at
    FROM book_members bm
    JOIN users u ON bm.user_id = u.id
    WHERE bm.book_id = ${book.id}
    ORDER BY bm.role = 'owner' DESC, bm.joined_at ASC
  `;
  console.log('7. All members:', allMembers.length);
  if (allMembers.length !== 2) throw new Error('Expected 2 members');
  console.log('   ✓ Two members verified');

  // 8. Cleanup
  await sql`DELETE FROM book_members WHERE book_id = ${book.id}`;
  await sql`DELETE FROM books WHERE id = ${book.id}`;
  await sql`DELETE FROM users WHERE id = ${testUser.id}`;
  await sql`DELETE FROM users WHERE id = ${contributor.id}`;
  console.log('8. Cleanup complete\n');

  console.log('All tests passed!');
  await sql.end();
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
