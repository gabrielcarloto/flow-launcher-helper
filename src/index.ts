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

  constructor(defaultIconPath?: string) {
    this.defaultIconPath = defaultIconPath;
    this.showResult = this.showResult.bind(this);
    this.run = this.run.bind(this);
    this.on = this.on.bind(this);
  }

  get method() {
    return this.data.method;
  }

  get params() {
    return this.data.parameters[0] as string;
  }

  get settings() {
    return this.data.settings;
  }

  public on(method: keyof MethodsObj<TMethods>, callbackFn: () => void) {
    this.methods[method] = callbackFn;
  }

  public showResult(...result: JSONRPCResponse<TMethods>[]) {
    type GenerateResult = Result<TMethods>;

    const generateResult = (): GenerateResult => {
      const results: Array<GenerateResult['result']['0']> = [];

      for (const r of result) {
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

  public run() {
    this.data.method in this.methods && this.methods[this.data.method]();
  }
}
