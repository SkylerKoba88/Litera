import { html, css, LitElement } from "lit";

class ProfileTag extends LitElement {

    static get tag() {
        return "interest-tag"
    }

    // Things put in here, declare a default in the constructor
    static get properties() {
        return {
            text: { type : String }
        };
    }

    constructor() {
        super();
        this.text = "Default";
    }

    static get styles() {
        return css`
        `;
    }

    render() {
        return html`
        `;
    }

    // connectedCallback() runs when the page is loaded

    // IMPORT IN THE .ts FILE!!!

    // js logic goes here...
}

customElements.define(ProfileTag.tag, ProfileTag);