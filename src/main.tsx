import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {Toaster} from "react-hot-toast";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {store} from "@/store";

import Routers from "@/routes";

import "@/styles/index.css";
import "@/i18n/config";

// import {SocketProvider} from "@/contexts/SocketContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      {/* <SocketProvider> */}
        <BrowserRouter>
          <Routers />
          <Toaster />
        </BrowserRouter>
      {/* </SocketProvider> */}
    </Provider>
  </StrictMode>,
);
