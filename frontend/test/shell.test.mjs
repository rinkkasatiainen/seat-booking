import chai from '@esm-bundle/chai'
import {spy} from 'sinon'
import {Shell} from '../src/shell/src/shell.mjs'

const {expect} = chai


class SpyModule {

    configureSpy = spy()
    activateSpy = spy()
    configure(){
        this.configureSpy()
    }
    activate(){
        this.activateSpy()
    }
}

describe('Shell', () => {
    describe('has 3-step activation process', () => {

        let shell;

        beforeEach(() => {
            shell = new Shell();
        })

        it('can register and then configure', () => {
            const testModule = {
                configure: spy()
            };

            shell.register(testModule).configure()

            expect(testModule.configure.calledOnce).to.be.true;
        })

        it('can activate after configure', () => {
            const testModule = {
                configure: spy(),
                activate: spy()
            };
            shell.register(testModule).configure().activate()

            expect(testModule.activate.calledOnce).to.be.true;
        })

        it('can run after activation', () => {
            const testModule = {
                configure: spy(),
                activate: spy(),
                run: spy()
            };
            shell.register(testModule).configure().activate().run()

            expect(testModule.run.calledOnce).to.be.true;
        })
    });

    describe('can Register multiple components', () => {
        let shell;

        beforeEach(() => {
            shell = new Shell();
        })

        it('can register and then configure', () => {
            const testModule = {
                configure: spy()
            };

            shell.register(testModule).register(testModule).configure()

            expect(testModule.configure.callCount).to.eql(2);
        })
    });
})
