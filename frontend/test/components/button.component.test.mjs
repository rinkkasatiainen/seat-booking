import {GetHealthCheckButton} from "../../src/components/get-health-check-button.mjs";
import {expect} from "@esm-bundle/chai";
import {httpGet} from "@sb-adapters/fetch.js";
import {GetHealthCheckResult} from "../../src/components/health-check-result.mjs";
import {tick} from '@testing/tick.mjs'
import * as sinon from 'sinon'


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
        httpGet.returns(Promise.resolve({'status': 'NOT OK'}))
    })

    afterEach(() => {
        document.body.removeChild(element)
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

        expect(document.querySelector(GetHealthCheckButton.elementName)).to.not.be.null
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
        httpGet.returns(Promise.resolve({'status': 'NOT OK!!!'}))
        document.body.appendChild(element)

        // awaiting a click is enough - no need to `tick`
        await element.querySelector('button').click()

        const elem = document.querySelector(`${GetHealthCheckResult.elementName}[slot="health-check-status"]`)
        expect(elem.getAttribute('data-content')).to.eql('NOT OK!!!')
    })

    xit('faking fetch - disabled as this is moved to example tst', async () => {
        const fetchStub = sinon.stub(window, 'fetch')
        fetchStub.resolves({
            json: () => {
                return Promise.resolve({status: "Faked FETCH"});
            }
        })
        document.body.appendChild(element)

        await tick()

        const elem = document.querySelector(`${GetHealthCheckResult.elementName}[slot="health-check-status"]`)

        expect(elem.getAttribute('data-content')).to.eql("Faked FETCH")
    })
});