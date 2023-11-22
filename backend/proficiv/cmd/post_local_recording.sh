#!/usr/bin/env bash
set -Eeuo pipefail

username="$1"
video_path="$2"
xh -v POST http://localhost:8080/api/v1/recording/local_video subjectSlug=bike_frame_2023 username="$username" localVideoAbsPath="$(realpath "$video_path")"
