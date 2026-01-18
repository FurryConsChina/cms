import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { StyleProvider } from "@ant-design/cssinjs";
import * as z from "zod";
import { zhCN as zhCNZod } from "zod/locales";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

z.config(zhCNZod());

import router from "@/routes";

const queryClient = new QueryClient();

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);

  root.render(
    <React.StrictMode>
      <StyleProvider layer>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: "#228be6",
              colorInfo: "#228be6",
              borderRadius: 12,
              wireframe: false,
              colorSuccess: "#40c057",
            },
            components: {
              Menu: {
                itemSelectedBg: "rgba(59,131,246,0.2)",
                subMenuItemBg: "rgba(0,0,0,0)",
              },
            },
          }}
        >
          <AntdApp>
            <NuqsAdapter>
              <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
              </QueryClientProvider>
            </NuqsAdapter>
          </AntdApp>
        </ConfigProvider>
      </StyleProvider>
    </React.StrictMode>,
  );
}
