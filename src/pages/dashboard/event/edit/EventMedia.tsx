import { Form, Typography } from "antd";
import type { FormInstance } from "antd";
import type { MediaOwner } from "@/types/media";
import MediaPicker, { MediaListFields } from "@/components/Cms/MediaPicker";

export default function EventMedia({
  owner,
  disabled,
}: {
  form: FormInstance;
  pathPrefix: string;
  disabled: boolean;
  owner?: MediaOwner;
}) {
  return (
    <div>
      <Typography.Title level={5}>活动媒体资源</Typography.Title>
      <Form.Item label="封面" name="cover">
        <MediaPicker owner={owner} disabled={disabled} />
      </Form.Item>
      <MediaListFields name="poster" label="海报" owner={owner} disabled={disabled} />
      <MediaListFields name="gallery" label="相册" owner={owner} disabled={disabled} />
      <MediaListFields name="videos" label="视频" owner={owner} disabled={disabled} />
      <MediaListFields name="lives" label="直播" owner={owner} disabled={disabled} />
    </div>
  );
}
