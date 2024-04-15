export class Shell {
    register(module) {
        return new RegisterdShell(module)
    }
}

class RegisterdShell {
    #modules = []

    constructor(...module) {
        this.#modules.push(...module)
    }

    register( module ){
        return new RegisterdShell(...[...this.#modules, module])
    }

    configure() {
        const configuredModules = []
        for (const module of this.#modules) {
            module.configure()
            configuredModules.push(module)
        }
        return new ConfiguredShell(...configuredModules)
    }
}

class ConfiguredShell {
    #configuredModules = []

    constructor(...modules) {
        this.#configuredModules.push(...modules)
    }

    activate(){
        const activatedModules = []
        for (const module of this.#configuredModules) {
            module.activate()
            activatedModules.push(module)
        }
        return new ActivatedShell(...activatedModules)
    }
}

class ActivatedShell {
    #activatedModules = []

    constructor(...modules) {
        this.#activatedModules.push(...modules)
    }

    run(){
        for (const module of this.#activatedModules) {
            module.run()
        }
    }
}
