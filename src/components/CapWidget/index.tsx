import "@cap.js/widget";
import type { CapWidget as CapWidgetType } from "@cap.js/widget";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface CapWidgetProps {
  apiEndpoint: string;
  onSolve?: (token: string) => void;
  onProgress?: (progress: number) => void;
  onCapError?: (message: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CapWidgetRef {
  reset: () => void;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "cap-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<CapWidgetType> & {
          "data-cap-api-endpoint"?: string;
          onsolve?: (e: CustomEvent<{ token: string }>) => void;
          onprogress?: (e: CustomEvent<{ progress: number }>) => void;
          onerror?: (e: CustomEvent<{ message: string }>) => void;
        },
        CapWidgetType
      >;
    }
  }
}

export const CapWidget = forwardRef<CapWidgetRef, CapWidgetProps>(
  ({ apiEndpoint, onSolve, onProgress, onCapError, className, style }, ref) => {
    const widgetRef = useRef<CapWidgetType>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        widgetRef.current?.reset();
      },
    }));

    return (
      <cap-widget
        ref={widgetRef}
        className={className}
        style={style}
        data-cap-api-endpoint={apiEndpoint}
        onsolve={(e) => onSolve?.(e.detail.token)}
        onprogress={(e) => onProgress?.(e.detail.progress)}
        onerror={(e) => onCapError?.(e.detail.message)}
        data-cap-i18n-initial-state="验证您是人类"
        data-cap-i18n-verifying-label="验证中..."
        data-cap-i18n-solved-label="验证成功"
        data-cap-i18n-error-label="验证失败"
        data-cap-i18n-troubleshooting-label="故障排除"
        data-cap-i18n-wasm-disabled="启用 WASM 以显著加快验证速度"
        data-cap-i18n-verify-aria-label="点击验证您是人类"
        data-cap-i18n-verifying-aria-label="验证中，请稍候"
        data-cap-i18n-verified-aria-label="验证成功"
        data-cap-i18n-error-aria-label="验证失败，请重试"
      />
    );
  }
);

CapWidget.displayName = "CapWidget";
