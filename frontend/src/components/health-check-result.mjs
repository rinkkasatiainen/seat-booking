export class GetHealthCheckResult extends HTMLElement {
    // static observedAttributes = ['content', 'status-id']

    async connectedCallback() {
        const p = document.createElement('p')
        // TODO: AkS: For some reason, need to get throught attributes, not from dataset.
        p.innerHTML = `Status: ${this.getAttribute('content')}`
        // const content = this.dataset['content'] || 'Unknown'
        // p.innerHTML = content

        if( this.getAttribute('status-id') ){
            this.removeOld(this.getAttribute('status-id') )
        }

        this.appendChild(p)
    }

    removeOld(dataId) {
        setTimeout(() => {
            const selectors = `${GetHealthCheckResult.elementName}[status-id="${dataId}"]`;
            const element = document.querySelector(selectors)
            if (element) {
                element.remove()
            }
        }, 9000)
    }

    static elementName = 'sb-health-check-status'

    static registerModule() {
        return {
            configure: () => {
                customElements.define(this.elementName, GetHealthCheckResult)
            },
            activate: () => {

            },
            run: () => {

            }
        }
    }
}
