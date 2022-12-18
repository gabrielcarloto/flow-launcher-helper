type PrependFlowLauncher<Method> = Method extends string
  ? `Flow.Launcher.${Method}`
  : never;

type FlowLauncherInternMethods = PrependFlowLauncher<
  | 'ChangeQuery'
  | 'RestartApp'
  | 'SaveAppAllSettings'
  | 'CheckForNewUpdate'
  | 'ShellRun'
  | 'CloseApp'
  | 'HideApp'
  | 'ShowApp'
  | 'ShowMsg'
  | 'GetTranslation'
  | 'OpenSettingDialog'
  | 'GetAllPlugins'
  | 'StartLoadingBar'
  | 'StopLoadingBar'
  | 'ReloadAllPluginData'
  | 'CopyToClipboard'
>;

export type JSONRPCMethods = FlowLauncherInternMethods | 'query';

export type Methods<T> = JSONRPCMethods | T;

export type MethodsObj<T> = {
  [key in Methods<T> extends string
    ? Methods<T>
    : // eslint-disable-next-line @typescript-eslint/ban-types
      JSONRPCMethods | (string & {})]: (
    params: Parameters | ParametersAllowedTypes,
  ) => void;
};

export type ParametersAllowedTypes =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | ParametersAllowedTypes[];

export type Method<T> = keyof MethodsObj<T>;
export type Parameters = ParametersAllowedTypes[];

export interface Data<TMethods, TSettings> {
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

export interface IFlow<TMethods, TSettings> {
  method: Method<TMethods>;
  params: Parameters | ParametersAllowedTypes;
  settings: TSettings;
  on: On<TMethods>;
  showResult: ShowResult<TMethods>;
  run: () => void;
}

export interface IFlowPrivate<TMethods, TSettings>
  extends IFlow<TMethods, TSettings> {
  methods: MethodsObj<TMethods>;
  defaultIconPath: string | undefined;
  data: Data<TMethods, TSettings>;
  createResultObject: (result: JSONRPCResponse<TMethods>) => Result<TMethods>;
}
