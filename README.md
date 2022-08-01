<h1 align="center">Flow Launcher Helper</h1>

<p align="center">A simple library to help build plugins for Flow Launcher with Javascript or Typescript</p>

## Installation

```
npm install flow-launcher-helper
```

## Usage

I recommend you read the [Flow docs](https://www.flowlauncher.com/docs/#/nodejs-develop-plugins) before writing your plugin. This example is based on [their example](https://github.com/Flow-Launcher/Flow.Launcher.Plugin.HelloWorldNodeJS/blob/main/main.js).

```ts
import { flow } from 'flow-launcher-helper';

const { params, on, showResult, run } = flow();

on('query', () => {
  showResult({
    title: 'Hello World Typescript',
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

### `flow()`

#### Parameters

- `defaultIconPath` — `string (optional)`: the default icon path that will be sent to Flow, so you don't need to specify everytime in the `showResult` function.

#### Returns

- `method` — `string`: current method.
- `params` — `string`: current parameters.
- `on` — `function`: receives a method (string) and a callback function that will be executed when the method matches the current method.
- `showResult` — `function`: receives an array of results, where you specify the title, subtitle, method, params and icon path, and logs the data to be displayed in Flow.
- `run` — `function`: runs the current method. You should call this function at the end of your script, or after all the `on` functions have been called.