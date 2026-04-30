import { html, css, type TemplateResult, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import '../components/SearchBar.jsx';
import '../components/CommunityCard.jsx';
import '../components/CommunityContainer.jsx';
import '../components/Breadcrumb.jsx';
import { getCurrentUser, fetchCommunities, type Community } from "../Services.js";
import AddCommunityIcon from '../images/addCommunity.svg';
import AddCommunityHoverIcon from '../images/addCommunityHover.svg';

@customElement('communities-page')
export class CommunitiesPage extends LitElement {
    @state() private communities: Community[] = [];
    @state() private loading = true;
    @state() private searchQuery = '';
    @state() private activeFilters: string[] = [];

    connectedCallback(): void {
        super.connectedCallback();
        this.loadCommunities();
        this.addEventListener('search-changed', this.handleSearchChanged as unknown as EventListener);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener('search-changed', this.handleSearchChanged as unknown as EventListener);
    }

    private handleSearchChanged = (e: Event) => {
        const { query, filters } = (e as CustomEvent).detail;
        this.searchQuery = query;
        this.activeFilters = filters;
    };

    private filterAndSortCommunities(communities: Community[]): Community[] {
        const q = this.searchQuery.toLowerCase();
        let result = q
            ? communities.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                (Array.isArray(c.categories) ? c.categories.join(' ') : '').toLowerCase().includes(q)
              )
            : communities;

        if (this.activeFilters.includes('A-Z')) {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        }
        if (this.activeFilters.includes('Recently Updated')) {
            result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (this.activeFilters.includes('Popular')) {
            // Sort public communities first, then by newest
            result = [...result].sort((a, b) => {
                if (a.visibility === b.visibility) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return a.visibility === 'public' ? -1 : 1;
            });
        }
        return result;
    }

    private async loadCommunities() {
        try {
            this.communities = await fetchCommunities();
        } catch (e) {
            console.error('Failed to load communities', e);
        } finally {
            this.loading = false;
        }
    }

    private renderCommunityCard(community: Community): TemplateResult {
        return html`
          <div style="cursor:pointer" @click=${() => { window.location.hash = `#/community-detail/${community.id}`; }}>
            <community-card name="${community.name}" description="${community.description}" thumbnail="${community.thumbnailUrl || 'https://placehold.co/200x200'}"></community-card>
          </div>`;
    }

    render(): TemplateResult {
        const user = getCurrentUser();
        const isAuthenticated = !!user;

        const isSearchActive = !!this.searchQuery || this.activeFilters.length > 0;
        const publicCommunities = this.communities.filter(c => c.visibility === 'public');
        const popularCommunities = isSearchActive
            ? this.filterAndSortCommunities(publicCommunities)
            : this.filterAndSortCommunities(publicCommunities).slice(0, 3);
        const myCommunities = isAuthenticated
            ? this.filterAndSortCommunities(this.communities.filter(c => c.ownerId === user.id))
            : [];

        const styles = css`
            :host {
                display: block;
            }
            div.banner {
                background-color: var(--color-5);
                text-align: center;
                color: white;
                width: fit-content;
                margin: 24px auto;
                padding: 0 64px;
            }
            .search-wrap {
                display: flex;
                justify-content: center;
                margin: 24px 0;
            }
            div.page-content {
                max-width: 100%;
                margin: 0 auto;
                padding: 0 96px;
                justify-items: center;
                text-align: center;
            }
            div.my-communities, div.popular-communities {
                margin-bottom: 24px;
            }
            .add-community-btn {
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
                align-self: center;
                flex-shrink: 0;
                display: flex;
                transition: transform 0.2s ease;
            }
            .add-community-btn:hover { transform: scale(1.07); }
            .add-community-btn img { width: 52px; height: 52px; display: block; }
            .add-community-btn .icon-hover { display: none; }
            .add-community-btn:hover .icon-default { display: none; }
            .add-community-btn:hover .icon-hover { display: block; }
            @media (max-width: 640px) {
                div.page-content { padding: 0 16px; }
                .search-wrap { padding: 0 16px; }
                div.banner { padding: 0 16px; width: auto; }
            }
        `;

        if (this.loading) {
            return html`<div>Loading communities...</div>`;
        }

        return html`
            <style>${styles}</style>
            <bread-crumb></bread-crumb>
            <div class="banner">
                <h1 style="padding: 24px 0;">Communities</h1>
            </div>

            <div class="search-wrap">
                <search-bar></search-bar>
            </div>

            <div class="page-content">
                <div class="popular-communities">
                    <h3>Popular This Week</h3>
                    <community-container>
                        ${popularCommunities.length
                            ? popularCommunities.map(c => this.renderCommunityCard(c))
                            : html`<p style="color:#999; padding:8px 0;">No communities match your search.</p>`}
                    </community-container>
                </div>

                ${isAuthenticated ? html`
                    <div class="my-communities">
                        <h3>My Communities</h3>
                        <community-container>
                            ${myCommunities.map(c => this.renderCommunityCard(c))}
                            <button
                                class="add-community-btn"
                                @click=${() => window.location.hash = '#/create-community'}
                                title="Create a new community"
                            >
                                <img class="icon-default" src="${AddCommunityIcon}" alt="Add community" />
                                <img class="icon-hover" src="${AddCommunityHoverIcon}" alt="Add community" />
                            </button>
                        </community-container>
                    </div>
                ` : null}
            </div>
        `;
    }
};

export default CommunitiesPage;