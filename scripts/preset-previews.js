/**
 * Taylor Swift 歌曲对战锦标赛 — 预置预览 URL 缓存
 *
 * 用途：当 iTunes API 不可用时（如中国大陆网络环境），
 *       优先使用此文件中预置的预览 URL，避免 fallback 到生成式蜂鸣声。
 *
 * 格式：{ 歌曲id: "预览URL" }
 *
 * 如何获取 iTunes 预览 URL：
 *   1. 访问 https://itunes.apple.com/search?term=歌曲名+Taylor+Swift&media=music&limit=1
 *   2. 返回的 JSON 中 results[0].previewUrl 即为预览地址
 *   3. 将 URL 填入下方对应歌曲 id
 *
 * 注意：预览 URL 有时效性（约 24 小时），如需长期使用建议使用外部 API。
 */
window.TS_PRESET_PREVIEWS = {
  // 示例：
  // 8: "https://audio-ssl.itunes.apple.com/itunes-assets/.../m4af_base.m4a",  // Love Story
  // 9: "https://audio-ssl.itunes.apple.com/itunes-assets/.../m4af_base.m4a",  // You Belong with Me
  //
  // 以下为热门歌曲预留位置，可自行填充：
};
