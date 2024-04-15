import {GetHealthCheckButton} from "../../src/components/get-health-check-button.mjs";
import {expect} from "@esm-bundle/chai";
import {httpGet} from "@sb-adapters/fetch.js";
import {GetHealthCheckResult} from "../../src/components/health-check-result.mjs";

describe('GetHealthCheckButton', () => {
    let element;

    before(() => {
        const resultComponent = GetHealthCheckResult.registerModule();
        resultComponent.configure()
        resultComponent.activate()
        resultComponent.run()
        const healthCheckComponent = GetHealthCheckButton.registerModule();
        healthCheckComponent.configure()
        healthCheckComponent.activate()
        healthCheckComponent.run()
    })

    beforeEach(() => {
        element = elementWith([{name: 'data-title', value: 'Button title'}]);
    })

    afterEach(() => {
        httpGet.reset()
    })

    function elementWith(attrs) {
        const element = document.createElement(GetHealthCheckButton.elementName)
        for (const attr of attrs) {
            element.setAttribute(attr.name, attr.value)
        }
        return element;
    }

    it('renders the component', () => {
        document.body.appendChild(element)

        expect(document.querySelector(GetHealthCheckButton.elementName )).to.not.be.null
    })

    it('renders a button with data-attribute', () => {
        document.body.appendChild(element)

        expect(document.querySelector('button').innerHTML).to.equal('Button title')
    })

    it('can change the title by changing data attribute', () => {
        document.body.appendChild(element)
        element.setAttribute('data-title', 'Button title v2')

        expect(element.querySelector('button').innerHTML).to.equal('Button title v2')
    })


    it('does not have data visible', async () => {
        document.body.appendChild(element)

        const elem = document.querySelector('p[slot="health-check-status"]')
        expect(elem).to.be.null
    })

    it('clicking sends a http GET and returned data is visible', async () => {
        document.body.appendChild(element)

        httpGet.returns( Promise.resolve( { 'status': 'NOT OK'}) )
        await element.querySelector('button').click()

        const elem = document.querySelector(`${GetHealthCheckResult.elementName}[slot="health-check-status"]`)
        expect(elem.getAttribute('content')).to.eql('NOT OK')
    })
});