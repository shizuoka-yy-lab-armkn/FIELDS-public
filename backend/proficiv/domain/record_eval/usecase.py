import subprocess
from pathlib import Path
from typing import Protocol

import cv2
import numpy as np
import PIL.Image
import torch

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


class BatchDoneCallback(Protocol):
    def __call__(self, processed_frame_count: int) -> None:
        ...


def _nop(processed_frame_count: int) -> None:
    del processed_frame_count  # suprress unused variable warning


def extract_video_feature(
    blip2: Blip2FeatureExtractor,
    video: cv2.VideoCapture,
    batch_size: int,
    skip_prefix_frames: int = 0,
    batch_done_callback: BatchDoneCallback = _nop,
) -> np.ndarray:
    """(256, SeqLen) の形状の ndarray を返す"""
    _log.info("Start extracting video feature...")

    video.set(cv2.CAP_PROP_POS_FRAMES, skip_prefix_frames)
    batch_wise_embeds: list[torch.Tensor] = []
    batch_buff: list[torch.Tensor] = []
    processed_frame_count = 0

    while True:
        ok, frame = video.read()

        if not ok or len(batch_buff) >= batch_size:
            batch_wise_embeds.append(
                blip2.extract_image_feature_from_preproecessed_img_batch(
                    torch.stack(batch_buff)
                ).cpu()
            )
            fl = skip_prefix_frames + processed_frame_count
            fr = fl + len(batch_buff)
            _log.info(f"Extracted embeddings from video frame {fl} - {fr}")
            processed_frame_count += len(batch_buff)
            batch_buff.clear()
            batch_done_callback(processed_frame_count)

        if not ok:
            break

        img = PIL.Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        batch_buff.append(blip2.prerprocess_image(img))

    a = torch.cat(batch_wise_embeds).numpy().T
    _log.info(f"Extracted video feature: {a.shape=}")
    return a
