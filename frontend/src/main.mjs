import {Shell} from '@shell'
import {GetHealthCheckButton} from "./components/get-health-check-button.mjs";
import {MainComponent} from "./components/main.component.mjs";
import {GetHealthCheckResult} from "./components/health-check-result.mjs";
import {ExampleComponent} from "./example/example-component.mjs";

const shell = new Shell()
shell.register(MainComponent.registerModule())
    .register(ExampleComponent.registerModule())
    .register(GetHealthCheckButton.registerModule())
    .register(GetHealthCheckResult.registerModule())
    .configure()
    .activate()
    .run()

