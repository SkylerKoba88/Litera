import { html, css, LitElement, type TemplateResult } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { getCurrentUser, getFriends, addCommunityMembers, type FriendUser } from '../Services.js';

@customElement('add-members-modal')
export class AddMembersModal extends LitElement {
  @property({ type: Number }) communityId = 0;

  @state() private friends: FriendUser[] = [];
  @state() private selectedIds: Set<number> = new Set();
  @state() private loading = true;
  @state() private saving = false;
  @state() private searchQuery = '';

  static styles = css`
    :host {
      display: block;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal {
      background: white;
      border-radius: 14px;
      padding: 32px;
      width: 480px;
      max-width: 92vw;
      max-height: 88vh;
      overflow-y: auto;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
    }

    .modal-header { margin: 0 0 6px; font-size: 1.4rem; font-weight: 700; }
    .modal-sub { margin: 0 0 20px; color: #666; font-size: 0.9rem; }

    .search {
      width: 100%;
      box-sizing: border-box;
      padding: 9px 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 0.95rem;
      margin-bottom: 10px;
    }
    .search:focus { outline: none; border-color: #646d4a; }

    .friend-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
    }

    .friend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      cursor: pointer;
      border-bottom: 1px solid #f2f2f2;
      transition: background 100ms;
    }
    .friend-item:last-child { border-bottom: none; }
    .friend-item:hover { background: #f8f8f5; }
    .friend-item.selected { background: rgba(100, 109, 74, 0.1); }

    .friend-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
      background: #d9d9d9;
      flex-shrink: 0;
    }

    .friend-name { font-weight: 600; font-size: 0.9rem; flex: 1; }

    .check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.75rem;
      color: white;
    }
    .check.checked { background: #646d4a; border-color: #646d4a; }

    .empty {
      padding: 28px 16px;
      text-align: center;
      color: #999;
      font-style: italic;
      font-size: 0.88rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .btn-skip {
      padding: 10px 22px;
      border-radius: 8px;
      border: none;
      background: #e5e5e5;
      color: #444;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .btn-skip:hover { background: #d5d5d5; }

    .btn-add {
      padding: 10px 22px;
      border-radius: 8px;
      border: none;
      background: #646d4a;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-add:not(:disabled):hover { opacity: 0.88; }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadFriends();
  }

  private async loadFriends() {
    const user = getCurrentUser();
    if (!user) { this.loading = false; return; }
    try {
      this.friends = await getFriends(user.id);
    } catch (e) {
      console.error('Failed to load friends', e);
    } finally {
      this.loading = false;
    }
  }

  private toggle(id: number) {
    const next = new Set(this.selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedIds = next;
  }

  private done() {
    this.dispatchEvent(new CustomEvent('done', { bubbles: true, composed: true }));
  }

  private async handleAdd() {
    if (this.saving) return;
    this.saving = true;
    try {
      if (this.selectedIds.size > 0) {
        await addCommunityMembers(this.communityId, [...this.selectedIds]);
      }
    } catch (e) {
      console.error('Failed to add members', e);
    } finally {
      this.saving = false;
      this.done();
    }
  }

  render(): TemplateResult {
    const q = this.searchQuery.toLowerCase();
    const filtered = q
      ? this.friends.filter(f => f.username.toLowerCase().includes(q))
      : this.friends;

    return html`
      <div class="overlay">
        <div class="modal">
          <h2 class="modal-header">Add Members</h2>
          <p class="modal-sub">Invite friends to join your private community. You can skip this for now.</p>

          ${this.loading ? html`<div class="empty">Loading friends…</div>` : html`
            <input
              class="search"
              type="text"
              placeholder="Search friends…"
              .value=${this.searchQuery}
              @input=${(e: Event) => { this.searchQuery = (e.target as HTMLInputElement).value; }}
            />
            <div class="friend-list">
              ${filtered.length === 0 ? html`
                <div class="empty">
                  ${this.friends.length === 0
                    ? "You don't have any friends yet. Add friends by visiting their profiles."
                    : `No friends matching "${this.searchQuery}".`}
                </div>
              ` : filtered.map(f => html`
                <div
                  class="friend-item ${this.selectedIds.has(f.id) ? 'selected' : ''}"
                  @click=${() => this.toggle(f.id)}
                >
                  ${f.avatarUrl
                    ? html`<img class="friend-avatar" src="${f.avatarUrl}" alt="${f.username}" />`
                    : html`<div class="friend-avatar"></div>`}
                  <span class="friend-name">@${f.username}</span>
                  <div class="check ${this.selectedIds.has(f.id) ? 'checked' : ''}">
                    ${this.selectedIds.has(f.id) ? '✓' : ''}
                  </div>
                </div>
              `)}
            </div>
          `}

          <div class="actions">
            <button class="btn-skip" @click=${this.done.bind(this)}>Skip</button>
            <button
              class="btn-add"
              ?disabled=${this.saving || this.selectedIds.size === 0}
              @click=${this.handleAdd.bind(this)}
            >${this.saving ? 'Adding…' : `Add ${this.selectedIds.size > 0 ? `(${this.selectedIds.size}) ` : ''}Member${this.selectedIds.size !== 1 ? 's' : ''}`}</button>
          </div>
        </div>
      </div>
    `;
  }
}

export default AddMembersModal;
