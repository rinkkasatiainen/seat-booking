export class ExampleComponent extends HTMLElement {
    async #doMagic(){
        const response = await fetch('http://localhost:4000/health/check')
            .then(async (res) => await res.json())
        const elem = document.createElement("p");
        elem.innerHTML = response.status
        this.appendChild(elem)
    }

    async connectedCallback() {
        this.#doMagic()
    }

    static elementName = 'sb-example'

    static registerModule() {
        // const m = new ButtonComponent()
        return {
            configure: () => {
                customElements.define(this.elementName, ExampleComponent)
            },
            activate: () => {

            },
            run: () => {

            }
        }
    }
}
