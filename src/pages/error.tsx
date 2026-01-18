import { Button, Result } from "antd";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  console.error("Route error:", error);

  let errorMessage = "未知错误";
  let errorStack = "";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "路由错误";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <Result
      status="500"
      title="页面加载错误"
      subTitle={errorMessage}
      extra={
        <>
          {errorStack && (
            <pre
              style={{
                textAlign: "left",
                whiteSpace: "pre-wrap",
                marginBottom: 16,
                padding: 16,
                background: "#f5f5f5",
                borderRadius: 8,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {errorStack}
            </pre>
          )}
          <Button type="primary" onClick={() => (window.location.href = "/")}>
            返回首页
          </Button>
        </>
      }
    />
  );
}
