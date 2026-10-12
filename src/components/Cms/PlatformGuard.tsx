import { Link, Outlet } from "react-router-dom";
import { Button, Result } from "antd";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
export default function PlatformGuard() {
  const role = useAuthStore((state) => state.user?.role);
  return isPlatform(role) ? (
    <Outlet />
  ) : (
    <Result
      status="403"
      title="没有平台管理权限"
      subTitle="此页面仅向管理员和编辑开放。"
      extra={
        <Link to="/dashboard">
          <Button>返回首页</Button>
        </Link>
      }
    />
  );
}
