# データの保存場所

## 受信した RTMP ストリームの保存先

```
$PRIVATE_STATIC_ROOT
    /records
        /forehead_camera
            /orig            /2023/1118/user_001_2023118_123456.mp4
            /trimmed_prelude /2023/1118/user_001_2023118_123456.mp4
            /blip2           /2023/1118/user_001_2023118_123456.npy
```


## Nginx での配信

```
$PUBLIC_STATIC_ROOT
    /records
        /forehead_camera
            /{YYYY}/{mmdd}/{user}/
                /{userWiseSeq}-{record_id}.mp4 -> symlink to $PRIVATE_STATIC_ROOT/...
```

