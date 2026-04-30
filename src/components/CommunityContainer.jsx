import { html, css, LitElement } from "lit";
import './CommunityCard.jsx';

class CommunityContainer extends LitElement {
    static get tag() {
        return "community-container";
    }

    static get properties() {
        return{
            name:{ type: String}
        }
    }

    constructor(){
        super();
        this.name="Communities";
    }

    static get styles(){
        return css`
        .card{
           display:flex;
           gap: 16px;
           flex-wrap: wrap;
        }

        ::slotted(*){
            padding: 1em 1em 1em 0em;
        }

        @media (max-width: 640px) {
            .card {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            ::slotted(*) {
                padding: 0;
            }
        }
        `;
    }

    render(){
        return html`
        <div class="card">
            <slot></slot>
        </div>
        `;
    }
}

customElements.define(CommunityContainer.tag, CommunityContainer);