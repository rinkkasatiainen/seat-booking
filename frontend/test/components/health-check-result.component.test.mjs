import {expect} from "@esm-bundle/chai";
import {GetHealthCheckResult} from "../../src/components/health-check-result.mjs";

describe('GetHealthCheckButton', () => {

    before(() => {
        const resultComponent = GetHealthCheckResult.registerModule();
        resultComponent.configure()
        resultComponent.activate()
        resultComponent.run()
    })

    function elementWith(attrs) {
        const element = document.createElement(GetHealthCheckResult.elementName)
        for (const attr of attrs) {
            element.setAttribute(attr.name, attr.value)
        }
        return element;
    }

    it('does not have data visible', async () => {
        const element = elementWith([
            {name: 'content', value: 'STATUS-VALUE'},
            {name: 'status-id', value: '1'}
        ]);

        document.body.appendChild(element)

        const elem = element.querySelector('p')
        expect(elem.innerHTML).to.eql('Status: STATUS-VALUE')
    })
});