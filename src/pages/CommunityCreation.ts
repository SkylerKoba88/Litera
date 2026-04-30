import { html, css, type TemplateResult } from 'lit';
import '../components/PillButton.js';
import '../components/ImagePicker.js';
import { createCommunity, getCurrentUser, type Categories } from '../Services.js';
import '../components/successAnimation.jsx';
import '../components/AddMembersModal.js';
import type { PillButton } from '../components/PillButton.ts';
import { VALID_CATEGORIES, formatCategoryName } from '../constants.js';

const SCHEMES: Record<string, { deep: string; mid: string; light: string; textLight: string; textDark: string }> = {
  default: { deep: '#414833', mid: '#646d4a', light: '#ece0d5', textLight: '#fbfff4', textDark: '#2d2a26' },
  dark:    { deep: '#1c1c1e', mid: '#3a3a3c', light: '#d1d1d6', textLight: '#f5f5f7', textDark: '#1c1c1e' },
  ocean:   { deep: '#0d2137', mid: '#1a4a6e', light: '#cde8f5', textLight: '#e8f4fd', textDark: '#0d2137' },
  forest:  { deep: '#1e3a2f', mid: '#2d6a4f', light: '#d8f3dc', textLight: '#f0fdf4', textDark: '#1e3a2f' },
  sunset:  { deep: '#4a1942', mid: '#a0522d', light: '#fde8e0', textLight: '#fdf4f0', textDark: '#3d1a18' },
};

interface ComProps {
  currentPath?: string;
}

export const CommunityCreationPage = ({
  currentPath = '/communities/create-community'
}: ComProps): TemplateResult => {

  const styles = css`
    :host {
      display: block;
    }

    /* Banner */
    .banner {
      background-color: var(--color-5);
      margin: var(--spacing-6) auto;
      text-align: center;
      color: white;
      width: fit-content;
      border-radius: var(--radius-md);
    }

    .banner h1 {
      padding: var(--spacing-6) var(--spacing-8);
      margin: var(--spacing-0);
    }

    /* Main content wrapper */
    .content {
      justify-items: center;
      margin: var(--spacing-0) var(--spacing-20);
    }

    .subsec {
      margin-bottom: var(--spacing-5);
      width: 100%;
    }

    /* Section headers */
    .subhead {
      display: flex;
      align-items: center;
      gap: var(--spacing-6);
      margin-left: var(--spacing-12);
      margin-bottom: var(--spacing-2);
    }

    .num {
      background-color: var(--color-4);
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      color: white;
      display: grid;
      place-items: center;
      line-height: 0px;
    }

    /* Inputs layout */
    .inputs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-6);
      margin: 0px var(--spacing-12);
      padding-left: var(--spacing-12);
    }

    .label {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-0);
    }

    input, select {
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--radius-md);
      border: 1px solid #ccc;
      font-size: var(--font-size-sm);
    }

    input[type="checkbox"] {
      margin-right: 6px;
    }
    /* Rules layout */
    .rules {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-4) var(--spacing-6);
    }

    /* Footer button */
    .submit {
      display: flex;
      justify-content: flex-end;
      margin: var(--spacing-12) var(--spacing-20) var(--spacing-16);
    }

    button {
      background-color: var(--color-4);
      color: white;
      padding: var(--spacing-4) var(--spacing-16);
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      font-size: var(--font-size-base);
    }

    button:hover {
      opacity: 0.9;
    }

    /* Color preview */
    .options {
      display: flex;
      gap: var(--spacing-6);
    }
    .options label {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      justify-content: space-between;
      align-items: center;
    }

    .options label input {
      appearance: none;
      display: none;
    }

    .color-preview {
      display: flex;
      margin-top: var(--spacing-2);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      cursor: pointer;
    }

    .color-block {
      width: 25px;
      height: 25px;
    }

    .options label input:checked ~ div.color-preview {
        outline: 2px solid var(--color-6);
    }
    .options label:has(input:checked) {
      font-weight: bold;
      color: var(--color-6);
    }
  `;

  // Closure state — updated by @input/@change handlers so handleSubmit
  // never has to query the DOM (which would fail inside shadow DOM).
  let nameValue = '';
  let descriptionValue = '';
  let visibilityValue = 'public';
  let colorSchemeValue = 'default';
  let thumbnailValue = '';
  const rulesState = {
    allowProfanity: false,
    ageRestricted: false,
    spamProtection: true,
    allowImages: false,
    autoBan: false,
  };

  const showSuccess = () => {
    const successAnim = document.createElement('success-animation');
    successAnim.addEventListener('finished', () => {
      window.location.href = '#/communities';
    });
    document.body.appendChild(successAnim);
    customElements.whenDefined('success-animation').then(() => {
      (successAnim as any).play();
    });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    try {
      // pill-button elements live inside the app-root shadow root;
      // document.querySelectorAll cannot pierce it.
      const shadowRoot = document.querySelector('app-root')?.shadowRoot ?? document;
      const pills = Array.from(shadowRoot.querySelectorAll('pill-button')) as PillButton[];
      const categories = pills
        .filter(p => p.selected)
        .map(p => p.category as any) as Categories;

      const user = getCurrentUser();
      if (!user) {
        alert('You must be logged in to create a community');
        return;
      }

      const community = await createCommunity({
        name: nameValue || 'New Community',
        description: descriptionValue,
        categories,
        visibility: visibilityValue as 'public' | 'private',
        rules: rulesState,
        colorScheme: colorSchemeValue,
        thumbnailUrl: thumbnailValue,
        ownerId: user.id
      });

      if (visibilityValue === 'private' && community?.id) {
        await customElements.whenDefined('add-members-modal');
        const modal = document.createElement('add-members-modal') as any;
        modal.communityId = community.id;
        modal.addEventListener('done', () => {
          document.body.removeChild(modal);
          showSuccess();
        });
        document.body.appendChild(modal);
      } else {
        showSuccess();
      }

    } catch(e) {
      console.error(e);
    }
  };

  const _applyScheme = () => {
    const s = SCHEMES[colorSchemeValue ?? 'default'] ?? SCHEMES['default'];
    document.documentElement.style.setProperty('--cs-deep', s.deep);
    document.documentElement.style.setProperty('--cs-mid', s.mid);
    document.documentElement.style.setProperty('--cs-light', s.light);
    document.documentElement.style.setProperty('--cs-text-light', s.textLight);
    document.documentElement.style.setProperty('--cs-text-dark', s.textDark);
  };
  _applyScheme();

  const createColorPreview = (scheme: string) => {
    const s = SCHEMES[scheme] ?? SCHEMES['default'];
    return html`
      <div class="color-preview">
        <div class="color-block" style="background-color: ${s.deep}; border-radius: var(--radius-md) 0px 0px var(--radius-md);"></div>
        <div class="color-block" style="background-color: ${s.mid};"></div>
        <div class="color-block" style="background-color: ${s.light};"></div>
        <div class="color-block" style="background-color: ${s.textLight};"></div>
        <div class="color-block" style="background-color: ${s.textDark}; border-radius: 0px var(--radius-md) var(--radius-md) 0px;"></div>
      </div>
    `;
  };

  return html`
    <style>${styles}</style>

    <!-- Banner -->
    <button style="margin: 16px 24px; background: transparent; color: var(--color-5); border: none; font-size: 1rem; cursor: pointer; padding: 6px 0;"
      @click=${() => window.location.hash = '#/communities'}>&larr; Back</button>
    <div class="banner">
      <h1>Create a New Community</h1>
    </div>

    <div class="content">

      <!-- 1. General Info -->
      <div class="subsec">
        <div class="subhead">
          <div class="num"><h4>1</h4></div>
          <h3>General Information</h3>
        </div>

        <div class="inputs">
          <div class="label">
            <h5>Owner</h5>
            <input disabled placeholder="${getCurrentUser()?.username || 'Username'}" style="width: 16vw" />
          </div>

          <div class="label">
            <h5>Community Name*</h5>
            <input
              placeholder="Community Name"
              style="width: 30vw"
              @input=${(e: Event) => { nameValue = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <div class="label" style="flex: 1;">
            <h5>Description</h5>
            <input
              placeholder="Describe your community"
              style="width: 46vw"
              @input=${(e: Event) => { descriptionValue = (e.target as HTMLInputElement).value; }}
            />
          </div>
        </div>
      </div>

      <!-- 2. Categories -->
      <div class="subsec">
        <div class="subhead">
          <div class="num"><h4>2</h4></div>
          <h3>Choose Categories</h3>
          <p>(up to 5)</p>
        </div>

        <div class="inputs">
            ${VALID_CATEGORIES.map(
                category => html`
                    <pill-button class="pill" .category=${category}> ${formatCategoryName(category)}</pill-button>
                `
            )}
        </div>

      </div>

      <!-- 3. Rules -->
      <div class="subsec">
        <div class="subhead">
          <div class="num"><h4>3</h4></div>
          <h3>Rules & Privileges</h3>
        </div>

        <div class="inputs">
          <div class="label">
            <h5>Visibility*</h5>
            <select name="visibility" @change=${(e: Event) => { visibilityValue = (e.target as HTMLSelectElement).value; }}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div class="label">
            <h5>Community Guidelines</h5>
            <div class="rules">
              <label><input type="checkbox" @change=${(e: Event) => { rulesState.allowProfanity = (e.target as HTMLInputElement).checked; }} /> Allow Profanity</label>
              <label><input type="checkbox" @change=${(e: Event) => { rulesState.ageRestricted = (e.target as HTMLInputElement).checked; }} /> 18+ Age Restriction</label>
              <label><input type="checkbox" .checked=${true} @change=${(e: Event) => { rulesState.spamProtection = (e.target as HTMLInputElement).checked; }} /> Spam Protection</label>
              <label><input type="checkbox" @change=${(e: Event) => { rulesState.allowImages = (e.target as HTMLInputElement).checked; }} /> Allow Image Sending</label>
              <label><input type="checkbox" @change=${(e: Event) => { rulesState.autoBan = (e.target as HTMLInputElement).checked; }} /> Auto-Ban</label>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Personalization -->
      <div class="subsec">
        <div class="subhead">
          <div class="num"><h4>4</h4></div>
          <h3>Personalize</h3>
        </div>

        <div class="inputs">
          <div class="pickColor">
            <h5>Color Scheme</h5>
            <div class="options">
              <label>
                <input type="radio" name="colorScheme" value="default" @select=${(e: Event) => { colorSchemeValue = (e.target as HTMLInputElement).value; _applyScheme(); }} />Default
                ${createColorPreview('default')}
              </label>
              <label>
                <input type="radio" name="colorScheme" value="dark" @change=${(e: Event) => { colorSchemeValue = (e.target as HTMLInputElement).value; _applyScheme(); }} />Dark
                ${createColorPreview('dark')}
              </label>
              <label>
                <input type="radio" name="colorScheme" value="ocean" @change=${(e: Event) => { colorSchemeValue = (e.target as HTMLInputElement).value; _applyScheme(); }} />Ocean
                ${createColorPreview('ocean')}
              </label>
              <label>
                <input type="radio" name="colorScheme" value="forest" @change=${(e: Event) => { colorSchemeValue = (e.target as HTMLInputElement).value; _applyScheme(); }} />Forest
                ${createColorPreview('forest')}
              </label>
              <label>
                <input type="radio" name="colorScheme" value="sunset" @change=${(e: Event) => { colorSchemeValue = (e.target as HTMLInputElement).value; _applyScheme(); }} />Sunset
                ${createColorPreview('sunset')}
              </label>
            </div>
          </div>

          <div class="label">
            <h5>Thumbnail</h5>
            <image-picker
              style="width: 30vw; display: block;"
              @image-changed=${(e: CustomEvent) => { thumbnailValue = e.detail.value; }}
            ></image-picker>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit -->
    <div class="submit">
      <button @click=${handleSubmit}>Create Community</button>
    </div>
  `;
};

export default CommunityCreationPage;
