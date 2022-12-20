# Changelog

## 2.2.0 (beta)

### Added

- Now you can access the params used in a method directly from the callback function (`on('method', (params) => ...)`). You can also add types to the params in the `on` method (`on('method', (params: string) => ...)`). Note that you can't pass interfaces in this case, just types.
- There is a new method `requestParams` that returns the array of parameters of the current method. The method `params` is now deprecated, as it would return just the first parameter as a string. However, it is highly recommended to get the current params via the `params` argument in the callback function, as mentioned above.
- When a method that does not exist is called, an error will be thrown, indicating the misspelled method.

## 2.1.0

### Added

- Result score.
- More types to the parameters.
- `dontHideAfterAction`: prevents the query window from closing when the action is fired (useful when using the method `Flow.Launcher.ChangeQuery` with the `requery` parameter set to `true`).

### Fixed

- An error caused by sending empty parameters to Flow. Now, by default, if no param is provided, sends an empty array.

## 2.0.0

### Added

- The `flow` function is now a class `Flow`.
- It is now possible to type the methods.

## 1.1.0

### Added

- Support for plugin settings

## 1.0.2

### Fixed

- `"flow" has no call signatures` error

## 1.0.1

### Fixed

- `"flow" is not a function` error

## 1.0.0

- Initial release 🎉