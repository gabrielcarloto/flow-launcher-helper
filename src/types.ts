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

export type MethodsObj<TMethods> = {
  [key in Methods<TMethods> extends string
    ? Methods<TMethods>
    : // eslint-disable-next-line @typescript-eslint/ban-types
      JSONRPCMethods | (string & {})]: (params: any) => void;
};

export type ParametersAllowedTypes =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | ParametersAllowedTypes[];

export type Method<T> = keyof MethodsObj<T>;
export type FlowParameters = ParametersAllowedTypes[];
export type Params = FlowParameters | string | number | boolean;

export interface Data<TMethods, TSettings> {
  method: Method<TMethods>;
  parameters: FlowParameters;
  settings: TSettings;
}

export interface JSONRPCResponse<TMethods> {
  title: string;
  subtitle?: string;
  method?: Method<TMethods>;
  params?: FlowParameters;
  dontHideAfterAction?: boolean;
  iconPath?: string;
  score?: number;
}

export interface Result<TMethods> {
  Title: string;
  Subtitle?: string;
  JsonRPCAction: {
    method?: Method<TMethods>;
    parameters: FlowParameters;
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
  callbackFn: (params: Params) => void,
) => void;

export interface IFlow<TMethods, TSettings> {
  method: Method<TMethods>;
  params: string;
  requestParams: FlowParameters;
  settings: TSettings;
  on: On<TMethods>;
  showResult: ShowResult<TMethods>;
  run: () => void;
}

export interface IFlowPrivate<TMethods = unknown, TSettings = unknown>
  extends IFlow<TMethods, TSettings> {
  methods: MethodsObj<TMethods>;
  defaultIconPath: string | undefined;
  data: Data<TMethods, TSettings>;
  createResultObject: (result: JSONRPCResponse<TMethods>) => Result<TMethods>;
}
