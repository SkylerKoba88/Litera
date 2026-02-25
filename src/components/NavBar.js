// This file defines and styles the NavBar element

import { html, css, LitElement} from "lit";

class NavBar extends LitElement {
    static get tag() {
        return "nav-bar";
    }

    static get properties() {
        return {
            appName: {type: String, reflect: true},
            appLogoUrl: {type: String, reflect: true},
        };
    }
    constructor() {
        super();
        this.appName = "";
        this.appLogoUrl = "#";
    }

    static get styles() {
        return css`
            :host {
                display: block;
                width: 100%;
            }
            #container {
                display: flex;
                background-color: grey;
                align-items: center;
                gap: 24px;
                margin-inline: auto;
                justify-content: space-between;
                padding: 12px 24px;
                box-sizing: border-box;
            }
            #left {
                display: flex;
            }
            img {
                max-width: 80px;
            }
        `;
    }
    
    render() {
        return html`
            <div id="container">
                <div id="left">
                    <img src="${this.appLogoUrl}">
                    <h2>${this.appName}</h2>
                </div>
                <div id="rights">
                    <a>home</a>
                    <a>communities</a>
                    <a>library</a>
                    <button id="navToProfile">profile</button>
                </div>
            </div>
        `;
    }
}

//declare as a callable html element
customElements.define(NavBar.tag, NavBar);