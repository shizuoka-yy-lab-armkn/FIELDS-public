from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F  # noqa: N812 Lowercase `functional` imported as non-lowercase `F`
from torch import Tensor

from fields.utils.logging import get_colored_logger

# TODO: config
_num_stages = 4
_num_layers = 10
_num_f_maps = 64

_log = get_colored_logger(__name__)


class MsTcn(nn.Module):
    def __init__(
        self,
        num_stages: int,
        num_layers: int,
        num_f_maps: int,
        input_feat_dim: int,
        num_classes: int,
    ) -> None:
        super().__init__()
        self.input_feat_dim = input_feat_dim

        self.stage1 = _SingleStageModel(
            num_layers, num_f_maps, input_feat_dim, num_classes
        )
        self.stages = nn.ModuleList(
            _SingleStageModel(num_layers, num_f_maps, num_classes, num_classes)
            for _ in range(num_stages - 1)
        )

    def forward(self, x: Tensor, mask: Tensor) -> Tensor:
        out = self.stage1(x, mask)
        outputs = out.unsqueeze(0)
        for s in self.stages:
            out = s(F.softmax(out, dim=1) * mask[:, 0:1, :], mask)
            outputs = torch.cat((outputs, out.unsqueeze(0)), dim=0)
        return outputs

    @staticmethod
    def from_file(path: Path, features_dim: int, num_classes: int) -> "MsTcn":
        model = MsTcn(
            num_stages=_num_stages,
            num_layers=_num_layers,
            num_f_maps=_num_f_maps,
            input_feat_dim=features_dim,
            num_classes=num_classes,
        )
        model.load_state_dict(torch.load(path))
        return model

    def predict(self, input: np.ndarray, device: torch.device) -> list[int]:
        _log.info(f"{type(input)=}, {input.shape=}")
        seq_len = len(input[0])
        assert input.shape == (self.input_feat_dim, seq_len)

        self.eval()
        self.to(device)
        with torch.no_grad():
            input_x = torch.tensor(input, dtype=torch.float)
            input_x.unsqueeze_(0)
            input_x = input_x.to(device)
            output = self(input_x, torch.ones(input_x.size(), device=device))
            _log.info(f"{type(output)=}, {output.size()=}")
            _, pred = torch.max(output[-1].data, 1)
            pred.squeeze_()
            _log.info(f"{type(pred)=}, {pred.size()=}")
            assert pred.size() == (seq_len,)
            return pred.tolist()


class _SingleStageModel(nn.Module):
    def __init__(
        self, num_layers: int, num_f_maps: int, dim: int, num_classes: int
    ) -> None:
        super().__init__()
        self.conv_1x1 = nn.Conv1d(dim, num_f_maps, 1)
        self.layers = nn.ModuleList(
            _DilatedResidualLayer(2**i, num_f_maps, num_f_maps)
            for i in range(num_layers)
        )
        self.conv_out = nn.Conv1d(num_f_maps, num_classes, 1)

    def forward(self, x: Tensor, mask: Tensor) -> Tensor:
        out = self.conv_1x1(x)
        for layer in self.layers:
            out = layer(out, mask)
        out = self.conv_out(out) * mask[:, 0:1, :]
        return out


class _DilatedResidualLayer(nn.Module):
    def __init__(self, dilation: int, in_channels: int, out_channels: int) -> None:
        super().__init__()
        self.conv_dilated = nn.Conv1d(
            in_channels, out_channels, 3, padding=dilation, dilation=dilation
        )
        self.conv_1x1 = nn.Conv1d(out_channels, out_channels, 1)
        self.dropout = nn.Dropout()

    def forward(self, x: Tensor, mask: Tensor) -> Tensor:
        out = F.relu(self.conv_dilated(x))
        out = self.conv_1x1(out)
        out = self.dropout(out)
        return (x + out) * mask[:, 0:1, :]
