import {expect} from "@esm-bundle/chai";
import * as sinon from "sinon";
import {ExampleComponent} from "../../src/example/example-component.mjs";
import {tick} from '@testing/tick.mjs'

describe('ExampleComponent', () => {

    before(() => {
        const resultComponent = ExampleComponent.registerModule();
        resultComponent.configure()
        resultComponent.activate()
        resultComponent.run()
    })

    it('can stub fetch, even though it might not we wise', async () => {
        const fetchStub = sinon.stub(window, 'fetch')
        fetchStub.resolves({ json: () => Promise.resolve({status: "Faked FETCH"}) })
        const element = document.createElement(ExampleComponent.elementName)

        document.body.appendChild(element)
        await tick()

        const elem = document.querySelector(`${ExampleComponent.elementName}`)
        expect(elem.innerHTML).to.eql("<p>Faked FETCH</p>")
    })
});