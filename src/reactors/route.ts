import { IStore, isCancelled, IAction } from "../types";

import { Watcher } from "./watcher";

import env from "../env";
import * as os from "../os";

import rootLogger from "../logger";
const logger = rootLogger.child({ name: "route" });

let printError = (msg: string) => {
  logger.error(msg);
};

if (env.name === "test") {
  printError = (msg: string) => {
    console.error(msg);
    console.error("Bailing out...");
    os.exit(1);
  };
}

const emptyArr = [];

function err(e: Error, action: IAction<any>) {
  if (isCancelled(e)) {
    console.warn(`reactor for ${action.type} was cancelled`);
  } else {
    printError(
      `while reacting to ${(action || { type: "?" }).type}: ${e.stack || e}`
    );
  }
}

function route(watcher: Watcher, store: IStore, action: IAction<any>): void {
  (async () => {
    for (const r of watcher.reactors[action.type] || emptyArr) {
      await r(store, action);
    }

    for (const sub of watcher.subs) {
      if (!sub) {
        continue;
      }

      for (const r of sub.reactors[action.type] || emptyArr) {
        await r(store, action);
      }
    }
  })().catch(e => {
    err(e, action);
  });

  return;
}

export default route;
