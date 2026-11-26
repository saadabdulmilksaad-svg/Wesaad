"""Original score + sound design for the Rollana spot, synthesised with numpy
(100% original => cleared for commercial use). Outputs separate stems:
assets/audio/music.wav and assets/audio/sfx.wav (48 kHz stereo)."""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

TL = json.load(open('timeline.json'))
SC = TL['scenes']
SR, DUR = 48000, float(TL['duration'])
N = int(SR * DUR)
rng = np.random.default_rng(11)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, kind, fc, order=2): return sosfilt(butter(order, fc, kind, fs=SR, output='sos'), x)

class Bus:
    def __init__(self): self.L, self.R = np.zeros(N), np.zeros(N)
    def add(self, sig, at, pan=0.0):
        i = int(at * SR)
        if i >= N: return
        j = min(N, i + len(sig)); s = sig[:j - i]
        self.L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.414
        self.R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.414

def adsr(n, a, r):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.minimum(1, (n / SR - t) / r).clip(0, 1)

music, sfx = Bus(), Bus()

# ---------------- harmony: Db major colour, warm & elegant ----------------
#   Dbmaj9 | Bbm9 | Gbmaj7#11 | Ab6sus -> Db
CH = [[49, 56, 60, 63, 65, 68], [46, 53, 56, 60, 61, 65], [42, 49, 53, 58, 60, 65], [44, 51, 56, 58, 61, 63]]
BAR = 3.2  # ~75 bpm, 4 beats

def piano(f, dur=3.2, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for h, a in zip(range(1, 9), [1, .5, .28, .16, .09, .05, .03, .02]):
        s += a * np.sin(2 * np.pi * f * h * t * (1 + 0.00035 * h * h)) * np.exp(-t * (0.9 + 0.75 * h))
    s *= np.minimum(1, t / 0.003) * adsr(n, 0.003, 0.3)
    return s * 0.07 * vel

def strings(f, dur, amp=0.016):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    vib = 1 + 0.0025 * np.sin(2 * np.pi * 5.1 * t)
    for det in (-0.08, 0.0, 0.09):
        ph = 2 * np.pi * np.cumsum(f * 2 ** (det / 12) * vib) / SR
        for h in range(1, 8): s += np.sin(h * ph + rng.uniform(0, 6.3)) / h ** 1.5
    return filt(s * adsr(n, 1.4, 1.6), 'low', 1800) * amp

def reverb(x, secs=2.6, mix=0.32):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 6.9 / secs)
    ir = filt(ir, 'low', 6000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - mix) + fftconvolve(x, ir)[:len(x)] * mix * 1.4

# hook (0 - 3.3): low drone + one sparse piano motif, no beat
t0 = 0.0
dr = strings(hz(37), SC['hook'][1] + 1.2, 0.03) + strings(hz(44), SC['hook'][1] + 1.2, 0.018)
music.add(dr, 0.0)
for at, m in [(0.15, 80), (0.95, 77), (1.75, 73), (2.45, 72)]:
    music.add(piano(hz(m), 3.0, 0.8), at, 0.2)

# body (3.3 - 30)
start = SC['journey'][0]
k = 0; tc = start
while tc < DUR - 0.5:
    ch = CH[k % 4]
    if tc >= SC['hero'][0] - 0.05: ch = CH[0]  # resolve to tonic for the hero shot
    d = min(BAR + 1.6, DUR - tc + 1)
    for i, m in enumerate(ch[1:]):
        music.add(strings(hz(m), d, 0.012 + 0.006 * (tc > SC['reveal'][0])), tc, (i - 2) * 0.3)
    bass = np.sin(2 * np.pi * hz(ch[0] - 12) * np.arange(int(d * SR)) / SR) * adsr(int(d * SR), 0.08, 1.2) * 0.09
    music.add(bass, tc)
    k += 1; tc += BAR
    if tc >= SC['hero'][0] and tc - BAR < SC['hero'][0]: tc = SC['hero'][0]

# piano arpeggios in eighths (75 bpm => 0.4 s)
pat = [0, 2, 4, 5, 3, 4, 2, 1]
step = BAR / 8; tc = start; k = 0
while tc < DUR - 3.0:
    sec = int((tc - start) // BAR)
    ch = CH[0] if tc >= SC['hero'][0] else CH[sec % 4]
    m = ch[pat[k % 8]] + 12
    music.add(piano(hz(m), 2.8, 0.55 + 0.3 * (k % 4 == 0)), tc, 0.4 * np.sin(k * 0.9))
    k += 1; tc += step

# soft cinematic pulse from the reveal onward
tk = SC['reveal'][0]
while tk < DUR - 2.5:
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = 48 + 60 * np.exp(-t * 28)
    music.add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * 0.16, tk)
    tk += BAR / 2

# final swell: big Db chord, decays across the end card
for i, m in enumerate([37, 49, 56, 61, 65, 68, 73, 80]):
    music.add(strings(hz(m), DUR - SC['hero'][0] + 0.5, 0.016), SC['hero'][0], (i - 4) * 0.2)
for i, m in enumerate([61, 65, 68, 73, 77]):
    music.add(piano(hz(m), 5.5, 0.9), SC['hero'][0] + 1.0 + i * 0.09, (i - 2) * 0.3)

# ---------------- sound design ----------------
def whoosh(at, dur=0.9, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    no = rng.standard_normal(n + 6000); out = np.zeros(n); seg = 1200
    for i in range(0, n, seg):
        fc = 350 + 3600 * np.sin(np.pi * i / n)
        out[i:i + seg] = filt(no[i:i + seg + 6000], 'band', [fc * 0.6, fc * 1.5])[-seg:][:len(out[i:i + seg])]
    s = out * np.sin(np.pi * t / dur) ** 2 * 0.22 * g
    pan = np.linspace(-0.6, 0.6, n)
    sfx.L[int(at * SR):int(at * SR) + n] += (s * (1 - pan))[:max(0, N - int(at * SR))]
    sfx.R[int(at * SR):int(at * SR) + n] += (s * (1 + pan))[:max(0, N - int(at * SR))]

def shimmer(at, g=1.0):
    for i, m in enumerate([85, 89, 92, 97, 101, 104]):
        sfx.add(piano(hz(m), 2.6, 0.45) * g, at + i * 0.05, (i - 3) * 0.25)

def boom(at, g=1.0):
    n = int(2.4 * SR); t = np.arange(n) / SR
    f = 36 + 80 * np.exp(-t * 16)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * 0.35 + filt(rng.standard_normal(n), 'low', 2500) * np.exp(-t * 30) * 0.08
    sfx.add(s * g, at)

def crunch(at, g=1.0):
    """wafer bite: a cluster of short filtered noise crackles"""
    for _ in range(26):
        o = rng.uniform(0, 0.38) ** 1.3
        n = int(rng.uniform(0.006, 0.03) * SR); t = np.arange(n) / SR
        c = filt(rng.standard_normal(n + 800), 'band', [rng.uniform(1200, 2600), rng.uniform(4500, 9000)])[-n:]
        sfx.add(c * np.exp(-t * rng.uniform(90, 240)) * rng.uniform(0.25, 0.7) * g, at + o, rng.uniform(-0.3, 0.3))
    n = int(0.25 * SR); t = np.arange(n) / SR  # body of the bite
    sfx.add(filt(rng.standard_normal(n), 'band', [300, 1600]) * np.exp(-t * 18) * 0.18 * g, at)

def flakes(at, dur, g=1.0):
    """airy coconut flakes: tiny high ticks"""
    for _ in range(int(dur * 9)):
        n = int(0.012 * SR); t = np.arange(n) / SR
        c = filt(rng.standard_normal(n + 400), 'high', 6000)[-n:] * np.exp(-t * 300)
        sfx.add(c * rng.uniform(0.03, 0.08) * g, at + rng.uniform(0, dur), rng.uniform(-0.8, 0.8))

def silk(at, dur=1.6, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = filt(rng.standard_normal(n), 'band', [2500, 9000]) * np.sin(np.pi * t / dur) ** 3 * (0.6 + 0.4 * np.sin(2 * np.pi * 2.2 * t)) * 0.05
    sfx.add(s * g, at, 0.3)

whoosh(0.0, 0.8, 0.6); boom(0.12, 0.7); flakes(0.2, 3.0, 0.8); shimmer(1.2, 0.6)
whoosh(SC['journey'][0] - 0.45, 0.9, 0.9); flakes(SC['journey'][0] + 0.2, 4.5, 0.7)
whoosh(SC['secret'][0] - 0.45, 0.9, 0.8)
crunch(SC['secret'][0] + 0.78, 1.0)       # with "مُقَرمِش"
whoosh(SC['secret'][0] + 5.1, 1.0, 0.5)   # pull back
whoosh(SC['reveal'][0] - 0.5, 1.0, 1.0); boom(SC['reveal'][0], 0.9)
silk(SC['reveal'][0] + 0.2, 2.2, 1.0); shimmer(SC['reveal'][0] + 1.1, 0.9)
whoosh(SC['hero'][0] - 0.5, 1.0, 0.8); boom(SC['hero'][0], 0.6)
shimmer(SC['hero'][0] + 1.2, 1.0)          # tagline sparkle
flakes(SC['hero'][0] + 0.3, 3.0, 0.5)

def save(bus, fn, fade_out=1.4, rev=True):
    st = np.stack([bus.L, bus.R], 1)
    if rev: st = np.stack([reverb(st[:, 0]), reverb(st[:, 1])], 1)
    st[-int(fade_out * SR):] *= np.linspace(1, 0, int(fade_out * SR))[:, None] ** 1.5
    st[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    st /= np.abs(st).max() / 0.85
    wavfile.write(fn, SR, (st * 32767).astype(np.int16))
    print(fn)

save(music, 'assets/audio/music.wav', 2.2)
save(sfx, 'assets/audio/sfx.wav', 0.6, rev=True)
