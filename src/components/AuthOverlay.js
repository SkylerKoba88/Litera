import { LitElement, css, html } from "lit";
import '../components/successAnimation.js';
import { createUser, loginUser } from '../Services.ts';


class AuthOverlay extends LitElement {
    static get properties() {
        return {
            open: {type: Boolean, reflect: true},
            mode: {type: String},
            showSuccess: { type: Boolean },

            loginIdentifier: { type: String },

            firstname: {type: String},
            lastname: {type: String},
            dob: {type: String},
            username: {type: String},
            email: {type: String},
            password: { type: String },
            confirmPassword: {type: String},

            passwordChecks: { type: Object },       
            showPasswordChecks: { type: Boolean },
            showConfirmChecks: { type: Boolean }
        }
    }

    constructor() {
        super();
        this.open = false;
        this.mode = "";
        this.showSuccess = false;

        this.loginIdentifier = "";

        this.firstname = "";
        this.lastname = "";
        this.dob = "" | null;
        this.username = "";
        this.email = "";
        this.password = "";
        this.confirmPassword = "";

        this.passwordChecks = {};
        this.showPasswordChecks = false;
        this.showConfirmChecks = false;
    }

    static get styles() {
        return css`
        :host {
            display: none;
        }
        :host([open]) {
            display: block;
        }
        .modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .panel {
            justify-items: center;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            min-width: 320px;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 80vh;
            flex-wrap: wrap;
            padding-bottom: 24px;
        }
        .required::after {
            content: " *";
            color: red;
        }

        .wrapper {
            display: block;
            color: #666;
            font-style: italic;
            font-size: 10px;
        }

        `;
    }
    
    close = () => {
        this.open = false;
        this.showSuccess = false;
        this.resetForm();
    }

    renderForm(mode) {
        if (mode === "login") {
            return html`
                <h2>Login</h2>
                <form>
                    <input placeholder="Username or Email" @input=${e => (this.loginIdentifier = e.target.value)} required>
                    <input placeholder="Password" @input=${e => (this.password = e.target.value)} required>
                    <button type="submit">Login</button>
                <!--add database function call-->
                </form>
            `;
        }

        return html`
            <h2>Create Account</h2>
            <form @submit=${this.handleSubmit}>
                <label class="required">Name</label>
                <div style="display: flex; gap: 12px;">
                    <input placeholder="First" required @input=${(e) => (this.firstname = e.target.value)}> 
                    <input placeholder="Last" required @input=${(e) => (this.lastname = e.target.value)}>
                </div>

                <label class="required">Date of Birth</label>
                <div>
                    <input type="date" required @input=${(e) => (this.dob = e.target.value)}>
                </div>
                
                <label class="required">Email address</label>
                <input placeholder="ex. example@email.com" required @input=${(e) => (this.email = e.target.value)}>

                <label class="required">Username</label>
                <input placeholder="ex. PolarBear34" required @input=${(e) => (this.username = e.target.value)}>
                <!--add username unique check-->

                <label class="required">Password</label>
                <div>
                    <input type="password" id="pass1" placeholder=""
                        @focus=${() => (this.showPasswordChecks = true)}
                        @input=${(e) => {this.password = e.target.value; this.passwordCheck(e)}}>
                    
                    ${this.showPasswordChecks
                    ? html`
                        <div class="wrapper">
                            <p class="passCheck"
                                style="color:${this.passwordChecks.length ? 'green' : 'red'}">
                                Password must be at least 8 characters.
                            </p>

                            <p class="passCheck"
                                style="color:${this.passwordChecks.upper ? 'green' : 'red'}">
                                Must include at least 1 uppercase letter.
                            </p>

                            <p class="passCheck"
                                style="color:${this.passwordChecks.number ? 'green' : 'red'}">
                                Must include at least 1 number.
                            </p>

                            <p class="passCheck"
                                style="color:${this.passwordChecks.symbol ? 'green' : 'red'}">
                                Must include at least 1 special character.
                            </p>
                        </div>
                    `: ""}
                </div>

                <div>
                    <input type="password" id="confirm" placeholder="Confirm Password" required
                        @focus=${() => (this.showConfirmChecks = true)}
                        @input=${(e) => (this.confirmPassword = e.target.value)}
                        >
                    ${this.showConfirmChecks
                        ? html`
                            <p style="color:${this.password === this.confirmPassword ? 'green' : 'red'}; font-size: 10px;">
                                ${this.password === this.confirmPassword
                                ? 'Passwords match.'
                                : 'Passwords do not match.'}
                            </p>
                        ` : ""}
                </div>
                <button type="submit">Submit</button>
            </form>
        `
    }

    resetForm() {
        this.password = "";
        this.confirmPassword = "";
        this.passwordChecks = {};
        this.passwordsMatch = false;
        this.showPasswordChecks = false;
        this.showConfirmChecks = false;

        const form = this.renderRoot?.querySelector("form");
        form?.reset();

        const confirm = this.renderRoot?.querySelector("#confirm");
        confirm?.setCustomValidity("");
    }

    passwordCheck = (e) => {  
        const password = e.target.value;
        
        this.passwordChecks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[!@#$%&?><]/.test(password),
        };
    }

    handleLogin = async (e) => {
        e.preventDefault();
        
        if (this.password !== this.confirmPassword) return;
        if (!Object.values(this.passwordChecks).every(Boolean)) return;

        try {
            const result = await loginUser({
            identifier: this.loginIdentifier,
            password: this.password,
            });

            console.log('Logged in:', result);

            // Example options:
            // localStorage.setItem('token', result.token);
            // this.dispatchEvent(new CustomEvent('login-success', { detail: result }));

            this.open = false;
            this.resetForm();
        } catch (err) {
            console.error(err);
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await createUser({
                firstname: this.firstname,
                lastname: this.lastname,
                dob: this.dob || null,
                username: this.username,
                email: this.email,
                password: this.password,
            });

            this.showSuccess = true;

            await this.updateComplete;
            this.renderRoot
                .querySelector('success-animation')
                ?.play();

            this.open = false;
        } catch (e) {
            console.error(e);

        }
    }

    render() {
        return html`
            <div class="modal"  @click=${this.close}>
                <div class="panel" @click=${e => e.stopPropagation()}>
                    ${this.showSuccess
                        ? html`
                            <success-animation
                                @finished=${this.onSuccessFinished}
                            ></success-animation>
                            `
                        : this.renderForm(this.mode)
                    }
                </div>
            </div>
        `;
    }
}

customElements.define("auth-overlay", AuthOverlay);