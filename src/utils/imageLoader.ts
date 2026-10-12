const GLOBAL_AUTO_CDN_IMAGE_URL = "images.furrycons.cn";

export const imageUrl = (src: string) => {
  return src.startsWith("http") ? src : `https://${GLOBAL_AUTO_CDN_IMAGE_URL}/${src}`;
};
