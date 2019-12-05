import "!style-loader!css-loader!./fonts/icomoon/style.css";
import "!style-loader!css-loader!./fonts/lato/latofonts-custom.css";

import { packets } from "common/packets";
import { queries } from "common/queries";
import React, { Suspense, useEffect, useState } from "react";
import { hot } from "react-hot-loader/root";
import { IntlProvider } from "react-intl";
import { Spinner } from "renderer/basics/LoadingCircle";
import { SocketContext } from "renderer/contexts";
import { Route } from "renderer/Route";
import { theme } from "renderer/styles";
import { ThemeProvider } from "styled-components";
import { Socket } from "renderer/Socket";
import GlobalStyles from "renderer/global-styles";

export const App = hot(() => {
  let [socket, setSocket] = useState();
  let [currentLocale, setCurrentLocale] = useState();

  useEffect(() => {
    establishSocketConnection()
      .then(socket => {
        socket.listen(packets.currentLocaleChanged, params => {
          console.log(`Locale changed!`);
          setCurrentLocale(params.currentLocale);
        });

        socket
          .query(queries.getCurrentLocale)
          .then(({ currentLocale }) => setCurrentLocale(currentLocale))
          .catch(e => {
            alert(`While fetching current locale:\n\n${e.stack}`);
          });
        setSocket(socket);
      })
      .catch(e => {
        alert(`While establishing websocket connection:\n\n${e.stack}`);
      });
  }, []);

  if (!(socket && currentLocale)) {
    return <div>...</div>;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <SocketContext.Provider value={socket}>
        <IntlProvider
          locale={currentLocale.lang}
          messages={currentLocale.strings}
        >
          <ThemeProvider theme={theme}>
            <React.Fragment>
              <GlobalStyles />
              <Route />
            </React.Fragment>
          </ThemeProvider>
        </IntlProvider>
      </SocketContext.Provider>
    </Suspense>
  );
});

export default App;

async function establishSocketConnection(): Promise<Socket> {
  const SESSION_WS_KEY = "internal-websocket";

  let address = sessionStorage.getItem(SESSION_WS_KEY);
  if (!address) {
    log(`Fetching websocket address...`);
    let res = await fetch("itch://api/websocket-address");
    log(`Fetching websocket address...done`);
    let payload = await res.json();
    address = payload.address as string;
    sessionStorage.setItem(SESSION_WS_KEY, address);
  }

  log(`Connecting to WebSocket...`);
  let t1 = Date.now();
  let socket = await Socket.connect(address);
  let t2 = Date.now();
  log(`Connecting to WebSocket...done (took ${t2 - t1} ms)`);
  return socket;
}

function log(...args: any[]) {
  let d = new Date();
  console.log(
    `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`,
    ...args
  );
}
