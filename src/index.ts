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
  | 'query';

type Methods =
  | {
      [key in JSONRPCMethods]?: () => void;
    }
  | {
      [key: string]: () => void;
    };

export interface JSONRPCResponse {
  title: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  method?: Args['method'] | (string & {});
  params?: Args['parameters'];
  iconPath?: string;
}

interface Result {
  result: {
    Title: string;
    Subtitle?: string;
    JsonRPCAction: {
      // eslint-disable-next-line @typescript-eslint/ban-types
      method?: Args['method'] | (string & {});
      parameters?: Args['parameters'];
    };
    IcoPath?: string;
  }[];
}

interface Args {
  method: keyof Methods;
  parameters: [string, boolean?] | [string, string, string];
}

interface FlowReturn {
  method: Args['method'];
  params: string;
  on: (
    // eslint-disable-next-line @typescript-eslint/ban-types
    method: Args['method'] | (string & {}),
    callbackFn: () => void,
  ) => void;
  showResult: (...result: JSONRPCResponse[]) => void;
  run: () => void;
}

function flow(defaultIconPath?: string): FlowReturn {
  const { method, parameters }: Args = JSON.parse(process.argv[2]);

  const methods: Methods = {};

  function on(
    // eslint-disable-next-line @typescript-eslint/ban-types
    method: Args['method'] | (string & {}),
    callbackFn: () => void,
  ) {
    methods[method as keyof typeof methods] = callbackFn;
  }

  function showResult(...result: JSONRPCResponse[]) {
    const generateResult = (): Result => {
      const results: Array<Result['result']['0']> = [];

      for (const r of result) {
        results.push({
          Title: r.title,
          Subtitle: r.subtitle,
          JsonRPCAction: {
            method: r.method,
            parameters: r.params,
          },
          IcoPath: r.iconPath || defaultIconPath,
        });
      }

      return { result: results };
    };

    return console.log(JSON.stringify(generateResult()));
  }

  // @ts-expect-error -> expect error because the `methods` object is empty by default, but will have methods when the `on` function is called; also, the `run` function already checks if the method exists in the `methods` object
  const run = () => method in methods && methods[method]();

  return {
    method,
    params: parameters[0],
    on,
    showResult,
    run,
  };
}

module.exports = flow;
