/**
 * Taylor Swift 歌曲对战锦标赛 — 128 首歌曲数据集
 *
 * 数据来源：综合 Spotify 播放量、Apple Music 热度、QQ音乐收藏/播放、
 *           网易云音乐评论/收藏等平台数据整理。
 * 覆盖范围：12 张录音室专辑 + 4 张已发行重录专辑（Fearless TV / Red TV /
 *           Speak Now TV / 1989 TV）的 From the Vault 曲目。
 *           reputation (TV) 与 Taylor Swift (TV) 不会发行，不纳入。
 * 字段说明：
 *   id              1-128 唯一编号
 *   title           歌曲名
 *   album           专辑名
 *   year            发行年份
 *   duration        时长（秒）
 *   trackNumber     在专辑中的曲目号（Vault 曲目为原 TV 专辑曲目号）
 *   popularityScore 综合热度 0-100
 *   era             专辑 era 分类（用于主题色切换）
 *   coverColor      专辑主色调（hex）
 *   isVault         是否为 From the Vault 曲目
 *   isTV            是否为 Taylor's Version（Vault 曲目来自 TV 专辑记为 true；
 *                   原版与 TV 重录二选一时优先原版，记为 false）
 *
 * 生成时间：2026-07-22
 */
window.TS_SONGS = [

  /* ============================================================
   * 1. Taylor Swift (2006) — 乡村木金 #C9A876
   * ============================================================ */
  { id: 1,   title: "Tim McGraw",                   album: "Taylor Swift",        year: 2006, duration: 234, trackNumber: 1,  popularityScore: 75, era: "Taylor Swift",        coverColor: "#C9A876", isVault: false, isTV: false },
  { id: 2,   title: "Teardrops on My Guitar",       album: "Taylor Swift",        year: 2006, duration: 244, trackNumber: 2,  popularityScore: 85, era: "Taylor Swift",        coverColor: "#C9A876", isVault: false, isTV: false },
  { id: 3,   title: "Our Song",                     album: "Taylor Swift",        year: 2006, duration: 203, trackNumber: 11, popularityScore: 82, era: "Taylor Swift",        coverColor: "#C9A876", isVault: false, isTV: false },
  { id: 4,   title: "Picture to Burn",              album: "Taylor Swift",        year: 2006, duration: 175, trackNumber: 4,  popularityScore: 75, era: "Taylor Swift",        coverColor: "#C9A876", isVault: false, isTV: false },
  { id: 5,   title: "Should've Said No",            album: "Taylor Swift",        year: 2006, duration: 245, trackNumber: 13, popularityScore: 73, era: "Taylor Swift",        coverColor: "#C9A876", isVault: false, isTV: false },
  { id: 6,   title: "A Place in This World",        album: "Taylor Swift",        year: 2006, duration: 204, trackNumber: 6,  popularityScore: 62, era: "Taylor Swift",        coverColor: "#C9A876", isVault: false, isTV: false },

  /* ============================================================
   * 2. Fearless (2008) — 金黄 #B8860B
   * ============================================================ */
  { id: 7,   title: "Fearless",                     album: "Fearless",            year: 2008, duration: 242, trackNumber: 1,  popularityScore: 78, era: "Fearless",            coverColor: "#B8860B", isVault: false, isTV: false },
  { id: 8,   title: "Love Story",                   album: "Fearless",            year: 2008, duration: 235, trackNumber: 2,  popularityScore: 95, era: "Fearless",            coverColor: "#B8860B", isVault: false, isTV: false },
  { id: 9,   title: "You Belong with Me",           album: "Fearless",            year: 2008, duration: 232, trackNumber: 6,  popularityScore: 95, era: "Fearless",            coverColor: "#B8860B", isVault: false, isTV: false },
  { id: 10,  title: "Fifteen",                      album: "Fearless",            year: 2008, duration: 295, trackNumber: 5,  popularityScore: 75, era: "Fearless",            coverColor: "#B8860B", isVault: false, isTV: false },
  { id: 11,  title: "White Horse",                  album: "Fearless",            year: 2008, duration: 235, trackNumber: 8,  popularityScore: 73, era: "Fearless",            coverColor: "#B8860B", isVault: false, isTV: false },
  { id: 12,  title: "Forever & Always",             album: "Fearless",            year: 2008, duration: 221, trackNumber: 11, popularityScore: 72, era: "Fearless",            coverColor: "#B8860B", isVault: false, isTV: false },

  /* ============================================================
   * 3. Fearless (Taylor's Version) (2021) — From the Vault
   * ============================================================ */
  { id: 13,  title: "Mr. Perfectly Fine",                              album: "Fearless (Taylor's Version)", year: 2021, duration: 278, trackNumber: 20, popularityScore: 72, era: "Fearless (Taylor's Version)", coverColor: "#B8860B", isVault: true,  isTV: true },
  { id: 14,  title: "You All Over Me (feat. Maren Morris)",            album: "Fearless (Taylor's Version)", year: 2021, duration: 218, trackNumber: 21, popularityScore: 68, era: "Fearless (Taylor's Version)", coverColor: "#B8860B", isVault: true,  isTV: true },
  { id: 15,  title: "Don't You",                                       album: "Fearless (Taylor's Version)", year: 2021, duration: 163, trackNumber: 23, popularityScore: 63, era: "Fearless (Taylor's Version)", coverColor: "#B8860B", isVault: true,  isTV: true },

  /* ============================================================
   * 4. Speak Now (2010) — 紫 #6A4C93
   * ============================================================ */
  { id: 16,  title: "Mine",                        album: "Speak Now",           year: 2010, duration: 230, trackNumber: 1,  popularityScore: 80, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },
  { id: 17,  title: "Sparks Fly",                  album: "Speak Now",           year: 2010, duration: 261, trackNumber: 2,  popularityScore: 78, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },
  { id: 18,  title: "Back to December",            album: "Speak Now",           year: 2010, duration: 294, trackNumber: 4,  popularityScore: 80, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },
  { id: 19,  title: "Speak Now",                   album: "Speak Now",           year: 2010, duration: 241, trackNumber: 3,  popularityScore: 72, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },
  { id: 20,  title: "Dear John",                   album: "Speak Now",           year: 2010, duration: 404, trackNumber: 5,  popularityScore: 75, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },
  { id: 21,  title: "Mean",                        album: "Speak Now",           year: 2010, duration: 238, trackNumber: 7,  popularityScore: 75, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },
  { id: 22,  title: "Enchanted",                   album: "Speak Now",           year: 2010, duration: 323, trackNumber: 10, popularityScore: 85, era: "Speak Now",           coverColor: "#6A4C93", isVault: false, isTV: false },

  /* ============================================================
   * 5. Speak Now (Taylor's Version) (2023) — From the Vault
   * ============================================================ */
  { id: 23,  title: "Electric Touch",                                album: "Speak Now (Taylor's Version)", year: 2023, duration: 253, trackNumber: 22, popularityScore: 65, era: "Speak Now (Taylor's Version)", coverColor: "#6A4C93", isVault: true,  isTV: true },
  { id: 24,  title: "When Emma Falls in Love",                       album: "Speak Now (Taylor's Version)", year: 2023, duration: 221, trackNumber: 24, popularityScore: 68, era: "Speak Now (Taylor's Version)", coverColor: "#6A4C93", isVault: true,  isTV: true },
  { id: 25,  title: "Castles Crumbling (feat. Hayley Williams)",     album: "Speak Now (Taylor's Version)", year: 2023, duration: 301, trackNumber: 25, popularityScore: 65, era: "Speak Now (Taylor's Version)", coverColor: "#6A4C93", isVault: true,  isTV: true },

  /* ============================================================
   * 6. Red (2012) — 深红 #8B0000
   * ============================================================ */
  { id: 26,  title: "State of Grace",               album: "Red",                 year: 2012, duration: 295, trackNumber: 1,  popularityScore: 78, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 27,  title: "Red",                          album: "Red",                 year: 2012, duration: 223, trackNumber: 3,  popularityScore: 82, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 28,  title: "Treacherous",                  album: "Red",                 year: 2012, duration: 242, trackNumber: 4,  popularityScore: 72, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 29,  title: "I Knew You Were Trouble",      album: "Red",                 year: 2012, duration: 219, trackNumber: 5,  popularityScore: 88, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 30,  title: "All Too Well",                 album: "Red",                 year: 2012, duration: 329, trackNumber: 8,  popularityScore: 90, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 31,  title: "22",                           album: "Red",                 year: 2012, duration: 232, trackNumber: 11, popularityScore: 83, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 32,  title: "We Are Never Ever Getting Back Together", album: "Red",       year: 2012, duration: 193, trackNumber: 2,  popularityScore: 85, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 33,  title: "Holy Ground",                  album: "Red",                 year: 2012, duration: 203, trackNumber: 14, popularityScore: 70, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },
  { id: 34,  title: "Starlight",                    album: "Red",                 year: 2012, duration: 220, trackNumber: 13, popularityScore: 62, era: "Red",                 coverColor: "#8B0000", isVault: false, isTV: false },

  /* ============================================================
   * 7. Red (Taylor's Version) (2021) — From the Vault
   * ============================================================ */
  { id: 35,  title: "All Too Well (10 Minute Version)",           album: "Red (Taylor's Version)", year: 2021, duration: 613, trackNumber: 30, popularityScore: 95, era: "Red (Taylor's Version)", coverColor: "#8B0000", isVault: true,  isTV: true },
  { id: 36,  title: "Message in a Bottle",                        album: "Red (Taylor's Version)", year: 2021, duration: 226, trackNumber: 26, popularityScore: 72, era: "Red (Taylor's Version)", coverColor: "#8B0000", isVault: true,  isTV: true },
  { id: 37,  title: "I Bet You Think About Me",                   album: "Red (Taylor's Version)", year: 2021, duration: 222, trackNumber: 23, popularityScore: 68, era: "Red (Taylor's Version)", coverColor: "#8B0000", isVault: true,  isTV: true },
  { id: 38,  title: "Nothing New (feat. Phoebe Bridgers)",        album: "Red (Taylor's Version)", year: 2021, duration: 258, trackNumber: 29, popularityScore: 68, era: "Red (Taylor's Version)", coverColor: "#8B0000", isVault: true,  isTV: true },

  /* ============================================================
   * 8. 1989 (2014) — 浅蓝 #5DADE2
   * ============================================================ */
  { id: 39,  title: "Welcome to New York",         album: "1989",                year: 2014, duration: 212, trackNumber: 1,  popularityScore: 75, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 40,  title: "Blank Space",                 album: "1989",                year: 2014, duration: 231, trackNumber: 2,  popularityScore: 96, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 41,  title: "Style",                       album: "1989",                year: 2014, duration: 231, trackNumber: 3,  popularityScore: 88, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 42,  title: "Out of the Woods",            album: "1989",                year: 2014, duration: 235, trackNumber: 4,  popularityScore: 82, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 43,  title: "Shake It Off",                album: "1989",                year: 2014, duration: 219, trackNumber: 6,  popularityScore: 96, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 44,  title: "Bad Blood",                   album: "1989",                year: 2014, duration: 211, trackNumber: 8,  popularityScore: 85, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 45,  title: "Wildest Dreams",              album: "1989",                year: 2014, duration: 220, trackNumber: 7,  popularityScore: 90, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 46,  title: "How You Get the Girl",        album: "1989",                year: 2014, duration: 247, trackNumber: 10, popularityScore: 72, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },
  { id: 47,  title: "Clean",                       album: "1989",                year: 2014, duration: 271, trackNumber: 13, popularityScore: 75, era: "1989",                coverColor: "#5DADE2", isVault: false, isTV: false },

  /* ============================================================
   * 9. 1989 (Taylor's Version) (2023) — From the Vault
   * ============================================================ */
  { id: 48,  title: "\"Slut!\"",                                     album: "1989 (Taylor's Version)", year: 2023, duration: 200, trackNumber: 17, popularityScore: 75, era: "1989 (Taylor's Version)", coverColor: "#5DADE2", isVault: true,  isTV: true },
  { id: 49,  title: "Now That We Don't Talk",                        album: "1989 (Taylor's Version)", year: 2023, duration: 144, trackNumber: 18, popularityScore: 78, era: "1989 (Taylor's Version)", coverColor: "#5DADE2", isVault: true,  isTV: true },
  { id: 50,  title: "Suburban Legends",                              album: "1989 (Taylor's Version)", year: 2023, duration: 254, trackNumber: 19, popularityScore: 70, era: "1989 (Taylor's Version)", coverColor: "#5DADE2", isVault: true,  isTV: true },
  { id: 51,  title: "Is It Over Now?",                               album: "1989 (Taylor's Version)", year: 2023, duration: 231, trackNumber: 20, popularityScore: 85, era: "1989 (Taylor's Version)", coverColor: "#5DADE2", isVault: true,  isTV: true },

  /* ============================================================
   * 10. reputation (2017) — 黑 #1A1A1A
   * ============================================================ */
  { id: 52,  title: "...Ready for It?",             album: "reputation",          year: 2017, duration: 208, trackNumber: 2,  popularityScore: 85, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 53,  title: "End Game",                     album: "reputation",          year: 2017, duration: 245, trackNumber: 3,  popularityScore: 72, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 54,  title: "I Did Something Bad",          album: "reputation",          year: 2017, duration: 239, trackNumber: 4,  popularityScore: 75, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 55,  title: "Don't Blame Me",               album: "reputation",          year: 2017, duration: 236, trackNumber: 6,  popularityScore: 78, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 56,  title: "Delicate",                     album: "reputation",          year: 2017, duration: 232, trackNumber: 5,  popularityScore: 88, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 57,  title: "Look What You Made Me Do",     album: "reputation",          year: 2017, duration: 212, trackNumber: 1,  popularityScore: 90, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 58,  title: "Gorgeous",                     album: "reputation",          year: 2017, duration: 209, trackNumber: 7,  popularityScore: 75, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },
  { id: 59,  title: "Getaway Car",                  album: "reputation",          year: 2017, duration: 233, trackNumber: 9,  popularityScore: 82, era: "reputation",          coverColor: "#1A1A1A", isVault: false, isTV: false },

  /* ============================================================
   * 11. Lover (2019) — 粉 #F8BBD9
   * ============================================================ */
  { id: 60,  title: "I Forgot That You Existed",    album: "Lover",               year: 2019, duration: 170, trackNumber: 1,  popularityScore: 72, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 61,  title: "Cruel Summer",                 album: "Lover",               year: 2019, duration: 178, trackNumber: 2,  popularityScore: 97, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 62,  title: "Lover",                        album: "Lover",               year: 2019, duration: 221, trackNumber: 11, popularityScore: 88, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 63,  title: "The Man",                      album: "Lover",               year: 2019, duration: 190, trackNumber: 4,  popularityScore: 75, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 64,  title: "The Archer",                   album: "Lover",               year: 2019, duration: 211, trackNumber: 5,  popularityScore: 72, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 65,  title: "Paper Rings",                  album: "Lover",               year: 2019, duration: 222, trackNumber: 8,  popularityScore: 73, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 66,  title: "Cornelia Street",              album: "Lover",               year: 2019, duration: 287, trackNumber: 6,  popularityScore: 78, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 67,  title: "Death by a Thousand Cuts",     album: "Lover",               year: 2019, duration: 198, trackNumber: 9,  popularityScore: 72, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 68,  title: "London Boy",                   album: "Lover",               year: 2019, duration: 161, trackNumber: 10, popularityScore: 68, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 69,  title: "You Need to Calm Down",        album: "Lover",               year: 2019, duration: 171, trackNumber: 7,  popularityScore: 80, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },
  { id: 70,  title: "Afterglow",                    album: "Lover",               year: 2019, duration: 223, trackNumber: 14, popularityScore: 68, era: "Lover",               coverColor: "#F8BBD9", isVault: false, isTV: false },

  /* ============================================================
   * 12. folklore (2020) — 灰 #8D99AE
   * ============================================================ */
  { id: 71,  title: "the 1",                        album: "folklore",            year: 2020, duration: 234, trackNumber: 1,  popularityScore: 80, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 72,  title: "cardigan",                     album: "folklore",            year: 2020, duration: 240, trackNumber: 2,  popularityScore: 92, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 73,  title: "the last great american dynasty", album: "folklore",         year: 2020, duration: 230, trackNumber: 4,  popularityScore: 72, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 74,  title: "exile",                        album: "folklore",            year: 2020, duration: 286, trackNumber: 6,  popularityScore: 80, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 75,  title: "my tears ricochet",            album: "folklore",            year: 2020, duration: 255, trackNumber: 5,  popularityScore: 78, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 76,  title: "mirrorball",                   album: "folklore",            year: 2020, duration: 201, trackNumber: 8,  popularityScore: 70, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 77,  title: "seven",                        album: "folklore",            year: 2020, duration: 211, trackNumber: 10, popularityScore: 70, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 78,  title: "august",                       album: "folklore",            year: 2020, duration: 262, trackNumber: 9,  popularityScore: 82, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 79,  title: "this is me trying",            album: "folklore",            year: 2020, duration: 195, trackNumber: 12, popularityScore: 72, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 80,  title: "illicit affairs",              album: "folklore",            year: 2020, duration: 191, trackNumber: 11, popularityScore: 68, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 81,  title: "invisible string",             album: "folklore",            year: 2020, duration: 221, trackNumber: 13, popularityScore: 70, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 82,  title: "betty",                        album: "folklore",            year: 2020, duration: 294, trackNumber: 14, popularityScore: 75, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },
  { id: 83,  title: "peace",                        album: "folklore",            year: 2020, duration: 235, trackNumber: 15, popularityScore: 65, era: "folklore",            coverColor: "#8D99AE", isVault: false, isTV: false },

  /* ============================================================
   * 13. evermore (2020) — 棕 #6B4226
   * ============================================================ */
  { id: 84,  title: "willow",                       album: "evermore",            year: 2020, duration: 214, trackNumber: 1,  popularityScore: 85, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 85,  title: "champagne problems",           album: "evermore",            year: 2020, duration: 244, trackNumber: 3,  popularityScore: 80, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 86,  title: "gold rush",                    album: "evermore",            year: 2020, duration: 186, trackNumber: 5,  popularityScore: 72, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 87,  title: "'tis the damn season",         album: "evermore",            year: 2020, duration: 224, trackNumber: 6,  popularityScore: 73, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 88,  title: "tolerate it",                  album: "evermore",            year: 2020, duration: 248, trackNumber: 7,  popularityScore: 72, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 89,  title: "no body, no crime",            album: "evermore",            year: 2020, duration: 222, trackNumber: 4,  popularityScore: 72, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 90,  title: "cowboy like me",               album: "evermore",            year: 2020, duration: 265, trackNumber: 13, popularityScore: 65, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 91,  title: "right where you left me",      album: "evermore",            year: 2020, duration: 239, trackNumber: 15, popularityScore: 68, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },
  { id: 92,  title: "ivy",                          album: "evermore",            year: 2020, duration: 289, trackNumber: 11, popularityScore: 70, era: "evermore",            coverColor: "#6B4226", isVault: false, isTV: false },

  /* ============================================================
   * 14. Midnights (2022) — 午夜蓝 #1A237E
   * ============================================================ */
  { id: 93,  title: "Lavender Haze",                album: "Midnights",           year: 2022, duration: 203, trackNumber: 1,  popularityScore: 90, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 94,  title: "Maroon",                       album: "Midnights",           year: 2022, duration: 218, trackNumber: 2,  popularityScore: 78, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 95,  title: "Anti-Hero",                    album: "Midnights",           year: 2022, duration: 201, trackNumber: 3,  popularityScore: 97, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 96,  title: "Snow on the Beach",            album: "Midnights",           year: 2022, duration: 256, trackNumber: 4,  popularityScore: 80, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 97,  title: "You're on Your Own, Kid",      album: "Midnights",           year: 2022, duration: 229, trackNumber: 5,  popularityScore: 80, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 98,  title: "Midnight Rain",                album: "Midnights",           year: 2022, duration: 175, trackNumber: 6,  popularityScore: 78, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 99,  title: "Question...?",                 album: "Midnights",           year: 2022, duration: 211, trackNumber: 7,  popularityScore: 72, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 100, title: "Vigilante Shit",               album: "Midnights",           year: 2022, duration: 156, trackNumber: 8,  popularityScore: 70, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 101, title: "Bejeweled",                    album: "Midnights",           year: 2022, duration: 194, trackNumber: 9,  popularityScore: 75, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 102, title: "Karma",                        album: "Midnights",           year: 2022, duration: 205, trackNumber: 11, popularityScore: 88, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 103, title: "Mastermind",                   album: "Midnights",           year: 2022, duration: 192, trackNumber: 13, popularityScore: 72, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },
  { id: 104, title: "Hits Different",               album: "Midnights",           year: 2022, duration: 227, trackNumber: 14, popularityScore: 72, era: "Midnights",           coverColor: "#1A237E", isVault: false, isTV: false },

  /* ============================================================
   * 15. THE TORTURED POETS DEPARTMENT (2024) — 墨黑 #2C2C2C
   * ============================================================ */
  { id: 105, title: "Fortnight",                    album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 230, trackNumber: 1,  popularityScore: 90, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 106, title: "The Tortured Poets Department", album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 271, trackNumber: 2,  popularityScore: 78, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 107, title: "My Boy Only Breaks His Favorite Toys", album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 189, trackNumber: 3,  popularityScore: 70, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 108, title: "Down Bad",                     album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 241, trackNumber: 4,  popularityScore: 80, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 109, title: "So Long, London",              album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 263, trackNumber: 5,  popularityScore: 85, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 110, title: "But Daddy I Love Him",         album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 271, trackNumber: 6,  popularityScore: 78, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 111, title: "Florida!!!",                   album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 211, trackNumber: 8,  popularityScore: 75, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 112, title: "Guilty as Sin?",               album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 245, trackNumber: 9,  popularityScore: 72, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 113, title: "Who's Afraid of Little Old Me?", album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 322, trackNumber: 10, popularityScore: 78, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 114, title: "I Can Do It With a Broken Heart", album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 218, trackNumber: 13, popularityScore: 88, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 115, title: "The Smallest Man Who Ever Lived", album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 215, trackNumber: 14, popularityScore: 75, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },
  { id: 116, title: "The Alchemy",                  album: "THE TORTURED POETS DEPARTMENT", year: 2024, duration: 209, trackNumber: 15, popularityScore: 72, era: "THE TORTURED POETS DEPARTMENT", coverColor: "#2C2C2C", isVault: false, isTV: false },

  /* ============================================================
   * 16. The Life of a Showgirl (2025-10-03) — showgirl 橙 #FF6F00
   * 第 12 张录音室专辑，全 12 首曲目
   * ============================================================ */
  { id: 117, title: "The Fate of Ophelia",          album: "The Life of a Showgirl", year: 2025, duration: 226, trackNumber: 1,  popularityScore: 92, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 118, title: "Elizabeth Taylor",             album: "The Life of a Showgirl", year: 2025, duration: 208, trackNumber: 2,  popularityScore: 80, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 119, title: "Opalite",                      album: "The Life of a Showgirl", year: 2025, duration: 235, trackNumber: 3,  popularityScore: 85, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 120, title: "Father Figure",                album: "The Life of a Showgirl", year: 2025, duration: 212, trackNumber: 4,  popularityScore: 70, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 121, title: "Eldest Daughter",              album: "The Life of a Showgirl", year: 2025, duration: 246, trackNumber: 5,  popularityScore: 68, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 122, title: "Ruin the Friendship",          album: "The Life of a Showgirl", year: 2025, duration: 220, trackNumber: 6,  popularityScore: 65, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 123, title: "Actually Romantic",            album: "The Life of a Showgirl", year: 2025, duration: 163, trackNumber: 7,  popularityScore: 63, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 124, title: "Wish List",                    album: "The Life of a Showgirl", year: 2025, duration: 207, trackNumber: 8,  popularityScore: 65, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 125, title: "Wood",                         album: "The Life of a Showgirl", year: 2025, duration: 150, trackNumber: 9,  popularityScore: 60, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 126, title: "Cancelled!",                   album: "The Life of a Showgirl", year: 2025, duration: 211, trackNumber: 10, popularityScore: 67, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 127, title: "Honey",                        album: "The Life of a Showgirl", year: 2025, duration: 181, trackNumber: 11, popularityScore: 64, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false },
  { id: 128, title: "The Life of a Showgirl (feat. Sabrina Carpenter)", album: "The Life of a Showgirl", year: 2025, duration: 241, trackNumber: 12, popularityScore: 78, era: "The Life of a Showgirl", coverColor: "#FF6F00", isVault: false, isTV: false }

];
