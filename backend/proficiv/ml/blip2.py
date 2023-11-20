from typing import Callable, Literal, Protocol, TypedDict

import numpy as np
import torch
from lavis.models import load_model_and_preprocess  # type:ignore
from PIL.Image import Image

from proficiv.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


class _FeatureExtractorInput(TypedDict, total=False):
    image: torch.Tensor
    text_input: list[str]


class _Feature(Protocol):
    image_embeds: torch.Tensor
    image_embeds_proj: torch.Tensor


class FeatureExtractor(Protocol):
    def extract_features(
        self, param: _FeatureExtractorInput, mode: Literal["image"]
    ) -> _Feature:
        ...


_FnVisionProcessor = Callable[[Image], torch.Tensor]


class Blip2FeatureExtractor:
    def __init__(self, device: torch.device) -> None:
        _log.info("Loading BLIP-2 feature extractor model and preprocessors...")
        model, vis_processors, _ = load_model_and_preprocess(
            name="blip2_feature_extractor",
            model_type="pretrain",
            is_eval=True,
            device=device,
        )
        _log.info("Loading BLIP-2 feature extractor done.")
        self.feature_extractor: FeatureExtractor = model
        self.vis_processors: dict[Literal["eval"], _FnVisionProcessor] = vis_processors
        self.device = device

    def extract_image_feature(
        self,
        img: Image,
    ) -> np.ndarray:
        img_tensor = self.vis_processors["eval"](img).unsqueeze(0).to(self.device)
        f = self.feature_extractor.extract_features({"image": img_tensor}, mode="image")
        embeds = f.image_embeds_proj[0, 0]
        assert embeds.shape == (256,)
        return np.array(embeds.cpu())
