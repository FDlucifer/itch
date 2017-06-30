import { Fetcher } from "./types";

import normalize from "../api/normalize";
import { game, arrayOf } from "../api/schemas";

import { addSortAndFilterToQuery } from "./sort-and-filter";
import { QueryInterface } from "../db/querier";
import { fromJSONField } from "../db/json-field";

import { pluck, indexBy } from "underscore";

const emptyArr = [];
const emptyObj = {} as any;

export default class DashboardFetcher extends Fetcher {
  async work(): Promise<void> {
    await this.pushLocal();

    if (this.warrantsRemote(this.reason)) {
      await this.remote();
      await this.pushLocal();
    }
  }

  async pushLocal() {
    const { db, store } = this.ctx;
    const { session } = store.getState();
    const meId = this.ensureCredentials().me.id;
    const profile = db.profiles.findOneById(meId);
    if (!profile) {
      this.debug(`Could not find a profile for ${meId}`);
      return;
    }
    const myGameIds = fromJSONField<number[]>(profile.myGameIds) || emptyArr;

    const tabPagination = session.tabPagination[this.tabId] || emptyObj;
    let { offset = 0, limit = 30 } = tabPagination;

    let doQuery = (k: QueryInterface) =>
      addSortAndFilterToQuery(
        k.whereIn("games.id", myGameIds),
        this.tabId,
        store,
      );

    const totalCount = myGameIds.length;
    const games = db.games.all(k =>
      doQuery(k).offset(offset).limit(limit).select("games.*"),
    );
    const gamesCount = db.games.count(k => doQuery(k));

    this.push({
      games: indexBy(games, "id"),
      gameIds: pluck(games, "id"),
      gamesCount,
      gamesOffset: offset,
      hiddenCount: totalCount - gamesCount,
    });
  }

  async remote() {
    const { db } = this.ctx;

    const apiResponse = await this.withApi(async api => {
      return await api.myGames();
    });

    const normalized = normalize(apiResponse, {
      games: arrayOf(game),
    });
    const meId = this.ensureCredentials().me.id;

    const remoteGameIds = pluck(normalized.entities.games, "id");
    this.debug(
      `Fetched ${Object.keys(normalized.entities.games).length} games from API`,
    );

    db.saveMany({
      ...normalized.entities,
      profiles: {
        [meId]: {
          id: meId,
          myGameIds: remoteGameIds,
        },
      },
    });
  }
}
