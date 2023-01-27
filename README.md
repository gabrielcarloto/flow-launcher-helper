<h1 align="center">Flow Launcher Helper</h1>

<p align="center">A simple library to help build plugins for Flow Launcher with Javascript or Typescript</p>

## Installation

```
npm install flow-launcher-helper
```

## Usage

I recommend you read the [Flow docs](https://www.flowlauncher.com/docs/#/nodejs-develop-plugins) before writing your plugin. This example is based on [their example](https://github.com/Flow-Launcher/Flow.Launcher.Plugin.HelloWorldNodeJS/blob/main/main.js).

```js
import { Flow } from 'flow-launcher-helper';

const { on, showResult, run } = new Flow();

on('query', (params) => {
  showResult({
    title: 'Hello World',
    subtitle: `Showing your query parameters: ${params}. Click to open Flow's website`,
    method: 'do_something_for_query',
    params: ['https://github.com/Flow-Launcher/Flow.Launcher'],
    iconPath: 'Images\\app.png',
  });
});

on('do_something_for_query', () => {
  const url = params;
  open(url);
});

run();
```

### `Flow`

#### Parameters

- `defaultIconPath` — `string (optional)`: the default icon path that will be sent to Flow, so you don't need to specify everytime in the `showResult` function.

#### Methods

- `method` — `string`: current method.
- `requestParams` - `FlowParameters`: array of parameters sent from Flow.
- `settings` — `object`: plugin settings.
- `on` — `(params: T extends FlowParameters) => void`: receives a method (string) and a callback function that will be executed when the method matches the current method.
- `showResult` — `(...results: JSONRPCResponse<TMethods>[]) => void`: receives an array of results, where you specify the title, subtitle, method, params and icon path, and logs the data to be displayed in Flow.
- `run` — `function`: runs the current method. You should call this function at the end of your script, or after all the `on` functions have been called.
- ~~`params` — `string`: current parameters.~~
  - Note: it is no longer recommended to get the params from this method, as it returns only the first parameter as a string.
  
##### Typescript

If you're writing a plugin in Typescript, you can add types to `method` and `settings`.

###### Example

```ts
type Methods = 'my_method' | 'my_other_method'

interface Settings {
  username: string;
  api_token: string;
}

const { method, settings } = new Flow<Methods, Settings>()

console.log(method === 'my_method') // ✅ true
console.log(method === 'another_method') // ❌ false
console.log(settings.username) // ✅
console.log(settings.name) // ❌ Property 'name' does not exist on type 'Settings'
```
