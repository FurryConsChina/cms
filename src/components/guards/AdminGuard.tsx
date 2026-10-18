import { Link, Outlet } from "react-router";
import { Button, Result } from "antd";
import useAuthStore from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";

export default function AdminGuard() {
  const role = useAuthStore((state) => state.user?.role);
  return isAdmin(role) ? (
    <Outlet />
  ) : (
    <Result
      status="403"
      title="没有管理员权限"
      subTitle="此页面仅向管理员开放。"
      extra={
        <Link to="/dashboard">
          <Button>返回首页</Button>
        </Link>
      }
    />
  );
}
