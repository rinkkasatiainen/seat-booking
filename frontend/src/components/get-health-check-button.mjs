import {httpGet} from "@sb-adapters/fetch.js";
import {GetHealthCheckResult} from "./health-check-result.mjs";

const template = document.createElement('template');
template.innerHTML = /*html*/ `
<div class="health-check">
    <slot name ="health-check-button"></slot>
    
    <div class="status">
        <p>Health check:</p>
        <slot name="health-check-status"></slot>
    </div>
</div>`;

let count = 0

export class GetHealthCheckButton extends HTMLElement {
    static observedAttributes = ['data-title']
    state = ''

    onClickResponse(response) {
        const dataId = `status-${count++}`;
        this.state = response.status

        const slot = document.createElement(GetHealthCheckResult.elementName)
        slot.slot = 'health-check-status'
        slot.setAttribute('content', response.status)
        slot.setAttribute('status-id', dataId)

        this.appendChild(slot)
    }

    async connectedCallback() {
        const title = this.dataset['title'] || 'Health Check'
        const shadow = this.attachShadow({mode: 'open'})
        const b = document.createElement("button");
        b.onclick = callHealthCheck((...args) => this.onClickResponse(...args))
        b.slot = 'health-check-button'
        b.innerHTML = title
        this.appendChild(b)
        shadow.appendChild(template.content.cloneNode(true))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const buttonElement = this.querySelector('button')
        if (buttonElement) {
            buttonElement.innerHTML = newValue
        }
    }

    render() {
        this.innerHTML = ''
        console.log('rendering now')
    }

    static elementName = 'sb-button-component'

    static registerModule() {
        // const m = new ButtonComponent()
        return {
            configure: () => {
                customElements.define(this.elementName, GetHealthCheckButton)
            },
            activate: () => {

            },
            run: () => {

            }
        }
    }
}


const callHealthCheck = (cb) => async () => {
    return httpGet('http://localhost:4000/health/check')
        .then(body => {
            cb(body)
        })
        .catch(err => {
            console.error('Error in response', err)
        });
}