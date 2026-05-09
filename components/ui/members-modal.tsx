'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Member {
  user_id: number;
  name: string;
  email: string;
  role: string;
  invite_email: string | null;
  joined_at: string | null;
}

interface MembersModalProps {
  bookId: number;
  onClose: () => void;
  currentUserId: number;
  currentUserRole: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  contributor: 'Contributor',
  answer_only: 'Answer Only',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'rgba(212,163,115,0.2)',
  admin: 'rgba(204,213,174,0.3)',
  contributor: 'rgba(212,163,115,0.1)',
  answer_only: 'rgba(200,200,200,0.2)',
};

export function MembersModal({ bookId, onClose, currentUserId, currentUserRole }: MembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('contributor');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState('');
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [newRole, setNewRole] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Fetch members on mount
  useEffect(() => {
    fetch(`/api/books/${bookId}/members`)
      .then(res => res.json())
      .then(data => {
        setMembers(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load members');
        setLoading(false);
      });
  }, [bookId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteResult('');
    try {
      const res = await fetch(`/api/books/${bookId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteResult(data.error || 'Failed to send invite');
      } else {
        setInviteResult('Invite sent! Share this link: ' + data.invite_url);
        setInviteEmail('');
        // Refresh members
        const membersRes = await fetch(`/api/books/${bookId}/members`);
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }
    } catch {
      setInviteResult('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: number) => {
    if (!newRole) return;
    try {
      const res = await fetch(`/api/books/${bookId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setMembers(members.map(m => m.user_id === memberId ? { ...m, role: newRole } : m));
        setEditingRole(null);
        setNewRole('');
      }
    } catch { /* silent */ }
  };

  const handleRemove = async (memberId: number) => {
    if (!window.confirm('Remove this member from the book?')) return;
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/books/${bookId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers(members.filter(m => m.user_id !== memberId));
      }
    } catch { /* silent */ }
    setRemovingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 members-backdrop"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="members-modal-title"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto members-panel"
        style={{ backgroundColor: 'var(--cornsilk)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b"
          style={{ backgroundColor: 'rgba(254,250,224,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(212,163,115,0.18)' }}
        >
          <h2 id="members-modal-title" className="text-lg font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--charcoal)' }}>
            Members
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
            style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#6A6A5A' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Invite section */}
          {!showInvite ? (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="w-full h-10 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
              style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
            >
              + Invite someone
            </button>
          ) : (
            <Card className="p-5 rounded-xl" style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.2)' }}>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm font-medium" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}>
                  Invite by email
                </p>
                <form onSubmit={handleInvite} className="space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    placeholder="friend@example.com"
                    className="w-full h-10 px-3 rounded-lg text-sm"
                    style={{ border: '1px solid rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)' }}
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg text-sm"
                    style={{ border: '1px solid rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)' }}
                  >
                    <option value="contributor">Contributor — can add memories</option>
                    <option value="answer_only">Answer Only — can answer prompts</option>
                    <option value="admin">Admin — can manage members</option>
                  </select>
                  {inviteResult && (
                    <p className="text-xs" style={{ color: inviteResult.startsWith('Invite') ? 'var(--charcoal)' : '#c0392b' }}>
                      {inviteResult}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={inviting}
                      className="flex-1 h-9 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--bronze)', color: 'var(--charcoal)' }}
                    >
                      {inviting ? 'Sending...' : 'Send Invite'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => { setShowInvite(false); setInviteResult(''); }}
                      className="flex-1 h-9 rounded-full text-xs font-medium"
                      style={{ border: '1px solid rgba(212,163,115,0.3)', color: 'var(--charcoal)', backgroundColor: 'transparent' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Members list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid rgba(212,163,115,0.2)', borderTopColor: 'var(--bronze)', borderRightColor: 'rgba(212,163,115,0.5)' }} />
              <p className="text-sm" style={{ color: '#6A6A5A' }}>Loading members...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 rounded-2xl" style={{ backgroundColor: 'rgba(185,28,28,0.06)', border: '1px solid rgba(169,84,60,0.15)' }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#c0392b' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm" style={{ color: '#c0392b' }}>{error}</p>
              <button
                type="button"
                onClick={() => { setError(''); setLoading(true); fetch(`/api/books/${bookId}/members`).then(r => r.json()).then(d => { setMembers(d.data || []); setLoading(false); }).catch(() => { setError('Failed to load members'); setLoading(false); }); }}
                className="text-xs font-medium px-4 py-1.5 rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(212,163,115,0.14)', color: 'var(--charcoal)' }}
              >
                Retry
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(204,213,174,0.25)' }}>
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ color: 'var(--bronze)' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>No members yet</p>
              <p className="text-xs text-center max-w-[220px]" style={{ color: '#6A6A5A' }}>Invite family or friends to collaborate on this memory book.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="label-caps text-xs" style={{ color: 'var(--bronze)' }}>
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
              {members.map(member => (
                <Card
                  key={member.user_id}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: '#FDFCF5', border: '1px solid rgba(212,163,115,0.12)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ backgroundColor: 'rgba(212,163,115,0.15)', color: 'var(--charcoal)' }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--charcoal)' }}>
                          {member.name || member.email}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#8A8A7A' }}>{member.email}</p>
                      </div>
                    </div>

                    {/* Role + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Role badge */}
                      {editingRole === member.user_id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                            className="h-7 px-2 rounded-lg text-xs"
                            style={{ border: '1px solid rgba(212,163,115,0.3)', backgroundColor: 'var(--papaya)', color: 'var(--charcoal)' }}
                          >
                            <option value="contributor">Contributor</option>
                            <option value="answer_only">Answer Only</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRoleChange(member.user_id)}
                            className="text-xs font-medium px-1.5"
                            style={{ color: 'var(--bronze)' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingRole(null); setNewRole(''); }}
                            className="text-xs px-1.5"
                            style={{ color: '#8A8A7A' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: ROLE_COLORS[member.role] || 'rgba(212,163,115,0.1)', color: 'var(--charcoal)' }}
                        >
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                      )}

                      {/* Actions */}
                      {member.role !== 'owner' && currentUserId !== member.user_id && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setEditingRole(member.user_id); setNewRole(member.role); }}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                            style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: '#6A6A5A' }}
                            title="Change role"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(member.user_id)}
                            disabled={removingId === member.user_id}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                            style={{ backgroundColor: 'rgba(212,163,115,0.1)', color: removingId === member.user_id ? 'rgba(0,0,0,0.3)' : '#c0392b' }}
                            title="Remove member"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .members-backdrop {
          opacity: 0;
          animation: fadeIn 0.2s ease forwards;
        }
        .members-panel {
          transform: translateX(100%);
          animation: slideInPanel 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes slideInPanel {
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}