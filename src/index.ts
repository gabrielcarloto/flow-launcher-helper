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

type Method<T> = keyof MethodsObj<T>;
type Parameters = [string, boolean?] | [string, string, string] | [];

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
  iconPath?: string;
}

interface Result<TMethods> {
  result: {
    Title: string;
    Subtitle?: string;
    JsonRPCAction: {
      method?: Method<TMethods>;
      parameters?: Parameters;
    };
    IcoPath?: string;
  }[];
}

interface IFlow<TMethods, TSettings> {
  method: Method<TMethods>;
  params: string;
  settings: TSettings;
  on: (method: Method<TMethods>, callbackFn: () => void) => void;
  showResult: (...result: JSONRPCResponse<TMethods>[]) => void;

  copyToClipboard: (
    title: string,
    text: string,
    subtitle?: string,
    iconPath?: string,
  ) => void;

  run: () => void;
}

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
   * @param {?string} [defaultIconPath] Sets the default icon path to be displayed in all results.
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

  /**
   * Sends the data to be displayed in Flow Launcher.
   *
   * @public
   * @param {...JSONRPCResponse<TMethods>[]} resultsArray Array with all the results objects.
   */
  public showResult(...resultsArray: JSONRPCResponse<TMethods>[]) {
    type GenerateResult = Result<TMethods>;

    const generateResult = (): GenerateResult => {
      const results: Array<GenerateResult['result']['0']> = [];

      for (const r of resultsArray) {
        results.push({
          Title: r.title,
          Subtitle: r.subtitle,
          JsonRPCAction: {
            method: r.method,
            parameters: r.params || [],
          },
          IcoPath: r.iconPath || this.defaultIconPath,
        });
      }

      return { result: results };
    };

    return console.log(JSON.stringify(generateResult()));
  }

  /**
   * Copy text to clipboard.
   *
   * @public
   * @param {string} title The title that will be displayed in the result.
   * @param {string} text The text that will be copied to the clipboard.
   * @param {?string} [subtitle] The subtitle that will be displayed in the result.
   * @param {?string} [iconPath] The icon that will be displayed in the result.
   */
  public copyToClipboard(
    title: string,
    text: string,
    subtitle?: string,
    iconPath?: string,
  ) {
    this.showResult({
      title,
      subtitle,
      method: 'Flow.Launcher.CopyToClipboard',
      params: [text],
      iconPath,
    });
  }

  /**
   * Runs the function for the current method. Should be called at the end of your script, or after all the `on()` functions have been called.
   *
   * @public
   */
  public run() {
    this.data.method in this.methods && this.methods[this.data.method]();
  }
}
