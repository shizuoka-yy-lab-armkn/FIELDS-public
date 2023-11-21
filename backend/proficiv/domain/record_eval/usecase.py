import subprocess
from pathlib import Path

import cv2
import numpy as np
import PIL.Image

import proficiv.utils.audio as audioutil
from proficiv.ml.blip2 import Blip2FeatureExtractor
from proficiv.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


def detect_triple_clap_timepoint_in_sec(
    video_path: Path, tmp_wav_save_path: Path
) -> float:
    # 効率のため動画の最初の40秒だけを動画に変換して書き出し
    cmd = ["ffmpeg", "-i", video_path, "-t", "40s", tmp_wav_save_path]
    _log.info(f"Running {cmd}")
    ffmpeg_proc = subprocess.run(cmd)
    assert ffmpeg_proc.returncode == 0

    _log.info("Start detecting triple clap time...")
    t = audioutil.detect_triple_clap_timepoint_in_sec(tmp_wav_save_path)
    _log.info(f"Detected triple clap time: {t}sec")
    return t


def extract_video_feature(
    feature_extractor: Blip2FeatureExtractor,
    video: cv2.VideoCapture,
    skip_prefix_frames: int = 0,
) -> np.ndarray:
    """(256, SeqLen) の形状の ndarray を返す"""
    _log.info("Start extracting video feature...")
    frame_wise_embeds: list[np.ndarray] = []

    video.set(cv2.CAP_PROP_POS_FRAMES, skip_prefix_frames)

    while True:
        ok, frame = video.read()
        if not ok:
            break

        img = PIL.Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        frame_wise_embeds.append(feature_extractor.extract_image_feature(img))

    a = np.array(frame_wise_embeds).T
    _log.info(f"Extracted video feature: {a.shape=}")
    return a
