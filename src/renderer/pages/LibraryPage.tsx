import { messages } from "common/butlerd";
import { Game } from "common/butlerd/messages";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Container } from "renderer/basics/Container";
import { ErrorState } from "renderer/basics/ErrorState";
import { useProfile } from "renderer/contexts";
import { Call } from "renderer/use-butlerd";
import styled from "styled-components";

let ratio = 0.7;

const CoverImage = styled.img`
  width: ${300 * ratio}px;
  height: ${215 * ratio}px;
  border: 1px solid #333;
  border-radius: 4px;

  margin: 5px;
`;

const GameGridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const GameGrid = function<T>(props: { items: T[]; getGame: (t: T) => Game }) {
  const { items, getGame } = props;
  return (
    <>
      <GameGridContainer>
        {items.map(getGame).map(game => (
          <a key={game.id} href={`itch://games/${game.id}`}>
            <CoverImage src={game.stillCoverUrl || game.coverUrl} />
          </a>
        ))}
      </GameGridContainer>
    </>
  );
};

export const LibraryPage = () => {
  const profile = useProfile();
  if (!profile) {
    return (
      <ErrorState
        error={new Error("Missing profile - this should never happen")}
      />
    );
  }

  return (
    <Container>
      <h2>
        <FormattedMessage id="sidebar.installed" />
      </h2>
      <Call
        rc={messages.FetchCaves}
        params={{ limit: 15 }}
        render={({ items }) => (
          <GameGrid items={items} getGame={cave => cave.game} />
        )}
      />

      <h2>
        <FormattedMessage id="sidebar.owned" />
      </h2>
      <Call
        rc={messages.FetchProfileOwnedKeys}
        params={{ profileId: profile.id, limit: 15 }}
        render={({ items }) => (
          <GameGrid items={items} getGame={key => key.game} />
        )}
      />
    </Container>
  );
};

export default LibraryPage;