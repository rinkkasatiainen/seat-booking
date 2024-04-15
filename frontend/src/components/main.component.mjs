

export class MainComponent extends HTMLElement{
    connectedCallback() {
        const head = document.createElement("h1");
        head.innerHTML = 'This is main Component❤️ '
        this.appendChild(head);
    }



    static registerModule() {
        // const m = new MainComponent()
        return {
            configure: () => {
                customElements.define('main-component', MainComponent)
            },
            activate: () => {

            },
            run: () => {

            }
        }
    }
}