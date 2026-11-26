"""Synthesize an original luxury-ambient score + SFX for the Rollana spot (33 s)."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 33.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def note_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, d, s, r, sustain_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sl = max(int(sustain_len * SR), 0)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, s, max(d, 1)),
        np.full(sl, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def add(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


L = np.zeros(N)
R = np.zeros(N)

# ---------- Chord progression (D minor-ish, warm & luxurious) ----------
# Dm9 | Bbmaj7 | Gm9 | A7sus -> Dm  (each chord ~4.1 s, starting after the hook)
chords = [
    [50, 57, 62, 65, 69, 76],   # Dm9-ish
    [46, 53, 58, 62, 65, 69],   # Bbmaj7
    [43, 50, 55, 58, 62, 69],   # Gm9
    [45, 52, 57, 62, 64, 67],   # A7sus
]
bar = 4.0
start_music = 3.15


def pad_voice(freq, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        f = freq * 2 ** (det / 12)
        # soft saw approximation (few harmonics)
        for h in range(1, 7):
            s += np.sin(2 * np.pi * f * h * tt + rng.uniform(0, 6.28)) / (h ** 1.6)
    s *= env_adsr(n, 1.2, 0.8, 0.8, 1.6, dur - 3.6)
    return lp(s, 1400) * 0.018


def piano(freq, dur=3.0, vel=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for h, amp in zip(range(1, 8), [1, .45, .25, .14, .08, .05, .03]):
        s += amp * np.sin(2 * np.pi * freq * h * tt * (1 + 0.0004 * h * h)) * np.exp(-tt * (1.4 + 0.9 * h))
    s *= np.minimum(1, tt / 0.004)
    return s * 0.06 * vel


# Pads
k = 0
tcur = start_music
while tcur < DUR - 1:
    ch = chords[k % 4]
    d = min(bar + 1.2, DUR - tcur)
    for m in ch:
        v = pad_voice(note_hz(m), d)
        pan = rng.uniform(-0.6, 0.6)
        add(L, v * (1 - pan) * 0.9, tcur)
        add(R, v * (1 + pan) * 0.9, tcur)
    k += 1
    tcur += bar

# Arpeggio piano (gentle, 1/8 notes at 90 bpm ~0.333 s)
step = 60 / 90 / 2
tcur = start_music
k = 0
pattern = [0, 2, 3, 5, 4, 3, 2, 1]
while tcur < DUR - 2.5:
    ch = chords[int((tcur - start_music) // bar) % 4]
    m = ch[pattern[k % 8]] + 12
    v = piano(note_hz(m), 2.6, 0.75 + 0.25 * (k % 4 == 0))
    pan = 0.35 * np.sin(k * 0.7)
    add(L, v * (1 - pan), tcur)
    add(R, v * (1 + pan), tcur)
    k += 1
    tcur += step

# Sub bass on chord roots
tcur = start_music
k = 0
while tcur < DUR - 1:
    root = chords[k % 4][0] - 12
    n = int(min(bar, DUR - tcur) * SR)
    tt = np.arange(n) / SR
    b = np.sin(2 * np.pi * note_hz(root) * tt) * env_adsr(n, 0.05, 0.6, 0.6, 0.8, bar - 1.5) * 0.11
    add(L, b, tcur)
    add(R, b, tcur)
    k += 1
    tcur += bar

# Soft heartbeat kick (from 8.4s) for momentum
beat = 60 / 90
tk = 8.4
while tk < 30.5:
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = 50 + 70 * np.exp(-tt * 30)
    kk = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.22
    add(L, kk, tk)
    add(R, kk, tk)
    tk += beat * 2

# ---------- Hook section (0 - 3.15s): tension riser + suspense ----------
n = int(3.15 * SR)
tt = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 73.4 * tt) + 0.5 * np.sin(2 * np.pi * 110 * tt)) * 0.05 * np.minimum(1, tt / 0.3)
add(L, drone, 0); add(R, drone, 0)
noise = rng.standard_normal(n)
riser = np.zeros(n)
# swept band-pass riser
seg = 2400
for i in range(0, n, seg):
    fc = 300 + 5000 * (i / n) ** 2
    chunk = bp(noise[max(0, i - 2000): i + seg], fc * 0.7, fc * 1.3)[-min(seg, n - i):]
    riser[i:i + len(chunk)] = chunk
riser *= (tt / 3.15) ** 2 * 0.25
add(L, riser, 0); add(R, riser, 0)


def impact(at, gain=1.0):
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    f = 38 + 90 * np.exp(-tt * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.4) * 0.5
    crack = lp(rng.standard_normal(n), 3000) * np.exp(-tt * 25) * 0.25
    s = (boom + crack) * gain
    add(L, s, at); add(R, s, at)


def whoosh(at, dur=0.9, gain=1.0, up=True):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    no = rng.standard_normal(n + 4000)
    out = np.zeros(n)
    seg = 1200
    for i in range(0, n, seg):
        p = i / n
        fc = (400 + 4200 * p) if up else (4600 - 4200 * p)
        c = bp(no[i: i + seg + 4000], fc * 0.6, min(fc * 1.6, 20000))[-seg:]
        out[i:i + seg] = c[: len(out[i:i + seg])]
    e = np.sin(np.pi * tt / dur) ** 1.5
    s = out * e * 0.35 * gain
    pan = np.linspace(-0.7, 0.7, n)
    add(L, s * (1 - pan), at); add(R, s * (1 + pan), at)


def shimmer(at, gain=1.0):
    for i, m in enumerate([86, 90, 93, 98, 102]):
        v = piano(note_hz(m), 2.5, 0.5) * gain
        add(L, v, at + i * 0.06); add(R, v, at + i * 0.06 + 0.01)


impact(0.32, 0.9)        # "استنّى!"
whoosh(1.3, 0.6, 0.7)
impact(3.2, 1.0)         # product reveal hit
whoosh(2.75, 0.6, 1.0)
shimmer(5.0, 0.8)        # sheen
whoosh(8.4, 0.9, 0.8)    # zoom almond
whoosh(13.7, 0.8, 0.7, up=False)
whoosh(17.0, 0.8, 0.7)
whoosh(20.1, 0.9, 0.8)
shimmer(21.0, 1.0)       # logo
impact(24.9, 0.8)        # end card
shimmer(27.5, 0.8)

# ---------- Reverb ----------
ir_n = int(2.2 * SR)
irt = np.arange(ir_n) / SR
irL = rng.standard_normal(ir_n) * np.exp(-irt * 2.6)
irR = rng.standard_normal(ir_n) * np.exp(-irt * 2.6)
irL, irR = lp(irL, 6000), lp(irR, 6000)
wetL = fftconvolve(L, irL)[:N] * 0.035
wetR = fftconvolve(R, irR)[:N] * 0.035
L = L + wetL
R = R + wetR

# Fade out end
fade = np.ones(N)
fo = int(2.5 * SR)
fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
L *= fade; R *= fade
mx = max(np.abs(L).max(), np.abs(R).max())
L, R = L / mx * 0.89, R / mx * 0.89
wavfile.write('audio/music.wav', SR, (np.stack([L, R], 1) * 32767).astype(np.int16))
print('ok', mx)
