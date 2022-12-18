type JSONRPCMethods =
  | 'Flow.Launcher.ChangeQuery'
  | 'Flow.Launcher.RestartApp'
  | 'Flow.Launcher.SaveAppAllSettings'
  | 'Flow.Launcher.CheckForNewUpdate'
  | 'Flow.Launcher.ShellRun'
  | 'Flow.Launcher.CloseApp'
  | 'Flow.Launcher.HideApp'
  | 'Flow.Launcher.ShowApp'
  | 'Flow.Launcher.ShowMsg'
  | 'Flow.Launcher.GetTranslation'
  | 'Flow.Launcher.OpenSettingDialog'
  | 'Flow.Launcher.GetAllPlugins'
  | 'Flow.Launcher.StartLoadingBar'
  | 'Flow.Launcher.StopLoadingBar'
  | 'Flow.Launcher.ReloadAllPluginData'
  | 'Flow.Launcher.CopyToClipboard'
  | 'query';

type Methods<T> = JSONRPCMethods | T;

type MethodsObj<T> = {
  [key in Methods<T> extends string
    ? Methods<T>
    : // eslint-disable-next-line @typescript-eslint/ban-types
      JSONRPCMethods | (string & {})]: (
    params: Parameters | ParametersAllowedTypes,
  ) => void;
};

type ParametersAllowedTypes =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | ParametersAllowedTypes[];

export type Method<T> = keyof MethodsObj<T>;
export type Parameters = ParametersAllowedTypes[];

interface Data<TMethods, TSettings> {
  method: Method<TMethods>;
  parameters: Parameters;
  settings: TSettings;
}

export interface JSONRPCResponse<TMethods> {
  title: string;
  subtitle?: string;
  method?: Method<TMethods>;
  params?: Parameters;
  dontHideAfterAction?: boolean;
  iconPath?: string;
  score?: number;
}

export interface Result<TMethods> {
  Title: string;
  Subtitle?: string;
  JsonRPCAction: {
    method?: Method<TMethods>;
    parameters: Parameters;
    dontHideAfterAction: boolean;
  };
  IcoPath?: string;
  score: number;
}

export type ShowResult<TMethods> = (
  ...results: JSONRPCResponse<TMethods>[]
) => void;
export type On<TMethods> = (
  method: Method<TMethods>,
  callbackFn: (params: Parameters | ParametersAllowedTypes) => void,
) => void;

interface IFlow<TMethods, TSettings> {
  method: Method<TMethods>;
  params: Parameters | ParametersAllowedTypes;
  settings: TSettings;
  on: On<TMethods>;
  showResult: ShowResult<TMethods>;
  run: () => void;
}

function isPrimitive(value: any): boolean {
  return (
    typeof value == 'string' ||
    typeof value == 'number' ||
    typeof value == 'boolean'
  );
}

/**
 * A class that helps in the communication between the Flow Launcher app and a plugin.
 *
 * @class Flow
 * @template TMethods - The type that defines the custom methods for the plugin.
 * @template TSettings - The type that defines the plugin's settings.
 */
export class Flow<TMethods, TSettings = Record<string, string>>
  implements IFlow<TMethods, TSettings>
{
  private methods = {} as MethodsObj<TMethods>;
  private defaultIconPath: string | undefined;
  private readonly data: Data<TMethods, TSettings> = JSON.parse(
    process.argv[2],
  );

  /**
   * Creates an instance of Flow.
   *
   * @constructor
   * @param defaultIconPath Sets the default icon path.
   */
  constructor(defaultIconPath?: string) {
    this.defaultIconPath = defaultIconPath;
    this.createResultObject = this.createResultObject.bind(this);
    this.showResult = this.showResult.bind(this);
    this.run = this.run.bind(this);
    this.on = this.on.bind(this);
  }

  /**
   * @readonly
   */
  get method() {
    return this.data.method;
  }

  /**
   * If the first parameter is a primitive type, return it, otherwise return the entire array of parameters.
   *
   * @readonly
   */
  get params() {
    const firstParam = this.data.parameters[0];
    const hasJustOneItem = this.data.parameters.length == 1;

    if (hasJustOneItem && isPrimitive(firstParam)) return firstParam;

    return this.data.parameters;
  }

  /**
   * @readonly
   */
  get settings() {
    return this.data.settings;
  }

  /**
   * Registers a method and the callback function that will run when this method is sent from Flow Launcher.
   *
   * @public
   * @param method The method to register.
   * @param callbackFn Receives the params as an argument.
   */
  public on(
    method: keyof MethodsObj<TMethods>,
    callbackFn: (params: Parameters | ParametersAllowedTypes) => void,
  ) {
    this.methods[method] = callbackFn;
  }

  /**
   * Takes a JSONRPCResponse object and returns a Result object
   *
   * @private
   */
  private createResultObject(
    result: JSONRPCResponse<TMethods>,
  ): Result<TMethods> {
    return {
      Title: result.title,
      Subtitle: result.subtitle,
      JsonRPCAction: {
        method: result.method,
        parameters: result.params || [],
        dontHideAfterAction: result.dontHideAfterAction || false,
      },
      IcoPath: result.iconPath || this.defaultIconPath,
      score: result.score || 0,
    };
  }

  /**
   * Sends the data to be displayed in Flow Launcher.
   *
   * @public
   * @param resultsArray Array with all the results objects.
   */
  public showResult(...resultsArray: JSONRPCResponse<TMethods>[]) {
    const result = resultsArray.map(this.createResultObject);
    console.log(JSON.stringify({ result }));
  }

  /**
   * Runs the function for the current method. Should be called at the end of your script, or after all the `on()` functions have been called.
   *
   * @public
   */
  public run() {
    if (this.data.method in this.methods)
      this.methods[this.data.method](this.params);
    else throw new Error(`Method ${this.data.method} is not defined.`);
  }
}
