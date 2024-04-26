export class GetHealthCheckResult extends HTMLElement {
    // static observedAttributes = ['content', 'status-id']

    async connectedCallback() {
        const p = document.createElement('p')

        const content = this.dataset['content'] || 'Unknown'
        const statusId = this.dataset['status_id'];

        p.innerHTML = `Status: ${content}`
        if( statusId ){
            this.setAttribute('status_id', statusId)
            this.markAsToBeRemoved(statusId )
        }

        this.appendChild(p)
    }

    markAsToBeRemoved(dataId) {
        setTimeout(() => {
            const selectors = `${GetHealthCheckResult.elementName}[status_id="${dataId}"]`;
            const element = document.querySelector(selectors)
            if (element) {
                element.remove()
            }
        }, 3000)
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
