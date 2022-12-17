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
      JSONRPCMethods | (string & {})]: () => void;
};

type ParametersAllowedTypes =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | ParametersAllowedTypes[];

type Method<T> = keyof MethodsObj<T>;
type Parameters = ParametersAllowedTypes[];

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

interface Result<TMethods> {
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

interface IFlow<TMethods, TSettings> {
  method: Method<TMethods>;
  params: string;
  settings: TSettings;
  on: (method: Method<TMethods>, callbackFn: () => void) => void;
  showResult: (...results: JSONRPCResponse<TMethods>[]) => void;
  run: () => void;
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
   * @param {?string} [defaultIconPath] Sets the default icon path.
   */
  constructor(defaultIconPath?: string) {
    this.defaultIconPath = defaultIconPath;
    this.showResult = this.showResult.bind(this);
    this.run = this.run.bind(this);
    this.on = this.on.bind(this);
  }

  /**
   * @readonly
   * @type {keyof MethodsObj<TMethods>}
   */
  get method() {
    return this.data.method;
  }

  /**
   * @readonly
   * @type {string}
   */
  get params() {
    return this.data.parameters[0] as string;
  }

  /**
   * @readonly
   * @type {TSettings}
   */
  get settings() {
    return this.data.settings;
  }

  /**
   * Registers a method and the function that will run when this method is sent from Flow.
   *
   * @public
   * @param {keyof MethodsObj<TMethods>} method
   * @param {() => void} callbackFn
   */
  public on(method: keyof MethodsObj<TMethods>, callbackFn: () => void) {
    this.methods[method] = callbackFn;
  }

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
    if (this.data.method in this.methods) this.methods[this.data.method]();
    else throw new Error(`Method ${this.data.method} is not defined.`);
  }
}
