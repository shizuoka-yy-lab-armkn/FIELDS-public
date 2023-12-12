from typing import Callable, Literal, Protocol, TypedDict

import numpy as np
import torch
from lavis.models import load_model_and_preprocess  # type:ignore
from PIL.Image import Image

from fields.utils.logging import get_colored_logger

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
        assert model is not None
        assert vis_processors is not None
        self.feature_extractor: FeatureExtractor = model
        self.prerprocess_image: _FnVisionProcessor = vis_processors["eval"]
        self.device = device

    def extract_image_feature_from_preproecessed_img_batch(
        self, img_tensor: torch.Tensor
    ) -> torch.Tensor:
        batch_size = img_tensor.size(0)
        f = self.feature_extractor.extract_features(
            {"image": img_tensor.to(self.device)}, mode="image"
        )
        embeds = f.image_embeds_proj[:, 0, :]
        assert embeds.shape == (batch_size, 256)
        return embeds

    def extract_image_feature(
        self,
        img: Image,
    ) -> np.ndarray:
        img_tensor = self.prerprocess_image(img).unsqueeze_(0)
        embeds = self.extract_image_feature_from_preproecessed_img_batch(img_tensor)
        return embeds.cpu().numpy()
