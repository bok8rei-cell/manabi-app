"""アイコン(PNG)を作るスクリプト。ポコ（マスコット）の顔のアイコン。
使い方: python scripts/make_icons.py   （Pillow が必要: pip install pillow）
icons/icon.svg と同じ絵を、Pillow で描いて PNG にする。"""
import os
from PIL import Image, ImageDraw

BG = (255, 209, 102)        # たいようの黄色
GLOW = (255, 226, 154)
BODY = (92, 201, 176)       # ポコの体
BELLY = (184, 235, 221)
CHEEK = (255, 158, 138)
INK = (59, 47, 42)
WHITE = (255, 255, 255)


def draw_icon(size):
    s = 4                                  # 4倍の大きさで描いて、縮小してなめらかにする
    big = size * s
    k = big / 512.0
    img = Image.new('RGB', (big, big), BG)
    d = ImageDraw.Draw(img)

    def P(x, y):
        return (x * k, y * k)

    def ellipse(cx, cy, rx, ry, fill):
        d.ellipse([ (cx - rx) * k, (cy - ry) * k, (cx + rx) * k, (cy + ry) * k ], fill=fill)

    ellipse(256, 270, 215, 215, GLOW)                                  # 後ろのひかり
    d.polygon([P(118, 245), P(140, 88), P(238, 166)], fill=BODY)       # 左の耳
    d.polygon([P(394, 245), P(372, 88), P(274, 166)], fill=BODY)       # 右の耳
    ellipse(256, 292, 172, 150, BODY)                                  # 体
    ellipse(256, 335, 112, 84, BELLY)                                  # おなか
    ellipse(122, 322, 24, 24, CHEEK)                                   # ほっぺ
    ellipse(390, 322, 24, 24, CHEEK)
    ellipse(190, 266, 38, 38, WHITE)                                   # 目
    ellipse(322, 266, 38, 38, WHITE)
    ellipse(197, 273, 19, 19, INK)
    ellipse(329, 273, 19, 19, INK)
    ellipse(204, 265, 6, 6, WHITE)
    ellipse(336, 265, 6, 6, WHITE)

    # 口：なめらかな にっこり（2次ベジェ曲線）
    pts = []
    x0, y0, cx, cy, x1, y1 = 214, 322, 256, 372, 298, 322
    for i in range(201):
        t = i / 200
        x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1
        y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
        pts.append(P(x, y))
    w = int(14 * k)
    for (x, y) in pts:                      # 小さな丸をならべて、なめらかな線にする
        d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=INK)

    return img.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, '..', 'icons')
    for size in (180, 192, 512):
        draw_icon(size).save(os.path.join(out, 'icon-%d.png' % size), optimize=True)
        print('icon-%d.png' % size)
