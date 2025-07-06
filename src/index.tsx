import React from "react";
import ReactDOM from "react-dom/client";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, MantineProvider } from "@mantine/core";

import "@ant-design/v5-patch-for-react-19";

import router from "@/routes";

const theme = createTheme({
  /** Put your mantine theme override here */
  components: {
    Notification: {
      defaultProps: {
        radius: "lg",
      },
    },
  },
});
const queryClient = new QueryClient();

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);

  root.render(
    <React.StrictMode>
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Notifications
            position="top-right"
            styles={{ root: { borderRadius: 20 } }}
          />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}
