from pathlib import Path
from typing import Final

import librosa
import numpy as np


def detect_triple_clap_timepoint_in_sec(
    wav_path: str | Path, threshold: float = 0.5, load_duration: float | None = None
) -> float:
    """動画開始から拍手3回までの時間 [sec] を求める"""
    a, sr = librosa.load(wav_path, sr=44100, duration=load_duration)
    assert isinstance(a, np.ndarray)

    j = 0
    k = 0
    l = 0
    m = 0

    z2: Final = sr * 0.2

    flag = False
    for i, ai in enumerate(a):
        if i < sr:
            continue

        aai = abs(ai)

        if aai > threshold and not flag:
            j += 1
            flag = True
            l = 0
            m = 0

        if aai > threshold and flag:
            l += 1
            if k > z2:
                flag = False
                k = 0
                j = 0
                l = 0

        ## ここ変えたほうがいいかも（次に手を叩くまでの時間）
        if k < z2 and flag:
            k += 1
        else:
            flag = False
            k = 0

        if aai < threshold and not flag:
            m += 1
            if m > sr:
                flag = False
                k = 0
                j = 0
                m = 0
                l = 0

        if j == 3:
            return i / sr
    return 0
