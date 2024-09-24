# FIELDS (Feedback Integrated Expert Level Description System)
FIELDS はバイクの組立作業の学習を補助する、Web アプリケーションです。

:bulb: ホームページ: https://sites.google.com/view/jim-fields

主な機能：

- 組立作業の動画の RTMP ストリームの収録
- MS-TCN による作業動画の認識
    - 動画収録後、自動で Temporal Action Segmentation をして作業工程ごとに動画を時間軸で分割します
    - セグメンテーションの結果の簡単な例： `[(name=ネジ仮付け, begin=00:00, end=00:07), (name=潤滑剤塗布, begin=00:07, end=00:13)]`
- 認識結果を動画と統合して表示。
    - 動画の再生と同期して、動画ではどんな工程をしているのかを表示します。
    - 工程をクリックすることで、動画の再生位置をジャンプすることもできます。
    - 工程抜けや工程の順序間違い、時間のかかり過ぎている工程を確認できます。
- 認識結果に基づくスコアリングおよび示唆の表示。


## 環境要件
以下の環境にて動作を確認した：

- Ubuntu 20.04
- NVIDIA GeForce RTX 4090
- CUDA v12.1
- Docker Engine v25.03
- Docker Compose v2.24.6
- [mise](https://mise.jdx.dev/getting-started.html) v2024.9.6
- [pipx](https://pipx.pypa.io/stable/installation/) v1.7.1
- GNU Make 3.81

## 実行方法

### (1) リポジトリのクローンと Docker コンテナの起動
1. リポジトリをクローンする。

    ```bash
    git clone git@github.com:shizuoka-yy-lab-armkn/FIELDS-public.git
    cd FIELDS-public
    ```

2. Docker Compose で PostgreSQL を構築する際の設定情報のファイルを用意する。

    ```bash
    cp .env.postgres.example .env.postgres
    ```
    コピーするだけでよい。

3. PostgreSQL や Nginx, Redis など諸々のサービスを立ち上げる。

    ```bash
    docker compose up -d
    ```

4. サービスが正常に立ち上がっていることを確認する。

    ```console
    $ docker compose ps -a
    NAME                      IMAGE                                   COMMAND                   SERVICE    CREATED          STATUS          PORTS
    yylab-fields-nginx-1      tiangolo/nginx-rtmp:latest-2023-11-13   "nginx -g 'daemon of…"   nginx      21 seconds ago   Up 20 seconds   0.0.0.0:8080->80/tcp, 0.0.0.0:21935->1935/tcp
    yylab-fields-postgres-1   postgres:16.0-bookworm                  "docker-entrypoint.s…"   postgres   21 seconds ago   Up 19 seconds   0.0.0.0:25432->5432/tcp
    yylab-fields-redis-1      redis:7.2-bookworm                      "docker-entrypoint.s…"   redis      21 seconds ago   Up 20 seconds   0.0.0.0:26379->6379/tcp
    ```

## (2) 必要なファイルのダウンロード

1. 以下の Google Drive にアクセスして、`dummy.mp4`, `dummy_video_feature.npy`, `mstcn.pt` をダウンロードする。

    https://drive.google.com/drive/folders/10pHmn2Qg8ZJ08SQyfsvvi0krTDzzfHpQ?usp=sharing

2. ダウンロードしたファイルを所定のディレクトリへ移動する。

    ```bash
    mv ~/Downloads/mstcn.pt backend/models/
    mv ~/Downloads/dummy.mp4 backend/static/public/
    mv ~/Downloads/dummy_video_feature.npy backend/static/private/
    ```


## (3) API をモックした状態でフロントエンドサーバを起動する
モック API はフロントエンド側で用意しているので、この段階では API サーバや推論ジョブプロセッサの起動は不要。

仕組みとしては、MSW (Mock Service Worker) をブラウザ上で起動 → API サーバへのリクエストを補足 → ブラウザ上でダミーの API レスポンスを生成してレスポンス、という流れになる。レスポンスはブラウザ内部で返されるので、リクエストが実際に API サーバへ飛ぶことはない。

- モック周りの処理は [frontend/src/mocks](./frontend/src/mocks) にある。
- API 呼び出しをモックするか否かは [frontend/.env.development](frontend/.env.development) の環境変数で制御される。

1. frontend ディレクトリへ移動する。

    ```bash
    cd frontend
    ```

2. .mise.toml に従って特定のバージョンの Node.js や Corepack をインストールする。

    ```bash
    mise i
    ```
3. pnpm-lock.yaml に従って特定のバージョンのライブラリをインストールする。

    ```bash
    pnpm i
    ```

4. Next.js のサーバを開発モードで起動する。

    ```bash
    pnpm dev
    ```

    ※ `dev` というスクリプトの実際のコマンドは package.json に記載されている。

5. Next.js サーバへ直接アクセスして Web ページが表示されることを確認する。

    http://localhost:3000/recording を Web ブラウザで開いて、エラーにならないことを確認する。

6. Nginx 経由で Web サーバへアクセスして Web ページが表示されることを確認する。
    8080 ポートでアクセスする。

    - http://localhost:8080/recording
    - http://localhost:8080/records
    - http://localhost:8080/exemplars

※ フロントエンドサーバを停止したいときは `pnpm dev` したシェルで、<kbd>Ctrl</kbd>+<kbd>C</kbd> を押せばよい。

## (4) API サーバの起動と DB のマイグレーション
以下の手順は、前述のフロントエンドの手順とは別のターミナル (シェル) を起動して進めるとよい。

1. リポジトリルート直下の backend ディレクトリへ移動する。

    ```bash
    cd backend
    ```

2. .mise.toml に従って、指定したバージョンの Python をインストールして .venv を作成する。

    ```bash
    mise i
    ```

3. .venv 内の Python へのパスが通っていることを確認する。

    ```console
    $ which python
    /xxx/FIELDS-public/backend/.venv/bin/python
    ```

4. 依存ライブラリをインストールする。ORM のコード生成もする。

    ```bash
    make install
    ```

5. .env ファイルを用意する。

    ```bash
    cp .env.example .env
    ```
    コピーするだけでよい。

6. API サーバを開発モードで起動する。

    ```bash
    make run/server/dev
    ```

7. API サーバへ GET /api/v1/debug/ping リクエストを投げて、200 OK が返ることを確認する。

    ```console
    $ curl -i localhost:8000/api/v1/debug/ping
    HTTP/1.1 200 OK
    date: Tue, 24 Sep 2024 20:55:20 GMT
    server: uvicorn
    content-length: 66
    content-type: application/json

    {"message":"pong","serverTime":"2024-09-25T05:55:20.433822+09:00"}
    ```
8. Nginx 経由で API サーバへアクセスして 200 OK が返ることを確認する (port 8080)。

    ```console
    $ curl -i localhost:8080/api/v1/debug/ping
    HTTP/1.1 200 OK
    Server: nginx
    Date: Tue, 24 Sep 2024 20:56:06 GMT
    Content-Type: application/json
    Content-Length: 66
    Connection: keep-alive

    {"message":"pong","serverTime":"2024-09-25T05:56:06.753194+09:00"}
    ```
    リクエストヘッダの `Server` は `nginx` になっているはずである。

9. DB へマイグレーションスクリプトを適用する (必要なテーブルを生成したりする)。

    ```bash
    make migrate/deploy
    ```

10. DB へ初期データを登録する。

    ```bash
    poetry run python3 -m fields.cmd.seed_subject_and_actions
    poetry run python3 -m fields.cmd.create_user test-user-01
    ```

    ※ 上記のコマンドから読み取れるように、スクリプトは fields/cmd/ にある。

11. frontend/.env.development を修正して、API のモックを無効化する。

    `NEXT_PUBLIC_MOCK_ENABLED` を `false` に変える。

    ```diff
    NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080
    - NEXT_PUBLIC_MOCK_ENABLED=true
    + NEXT_PUBLIC_MOCK_ENABLED=false
    ```

12. フロントエンドサーバを起動していないなら起動する。

    ※ 既に `pnpm dev` で起動済みの場合は、 .env.development の変更を検知して自動でリロードしてくれるので特にすることはない。

    ```bash
    pnpm dev
    ```

13. 収録一覧ページへアクセスして、空 (= 収録動画 0 件) ページが表示されることを確認する。

    http://localhost:8080/records

    API をモックしないことで、実際の API サーバからデータを取得するようになった。
    この時点では DB には収録は 0 件なので、空のページが表示される。

## (5) 動画認識ジョブプロセッサの起動と動作確認

1. backend/.env を修正して、以下の3つのパラメータを 0 に変更する。

    - `FIELDS_MOCK_RECORDING`
    - `FIELDS_MOCK_RECORD_EVAL_WORKER`
    - `FIELDS_MOCK_VIDEO_FEATURE_EXTRACTION`

2. ジョブプロセッサを起動する。数十秒〜数分かかる。

    ```bash
    make run/worker
    ```

3. アクションカメラの設定で、`rtmp://{サーバのアドレス}:21935/live/test` に RTMP ストリームを送信するよう設定する。

4. アクションカメラを額につけた状態で、収録開始画面にて収録を開始する。

5. バイクの組立作業をする。

6. 収録終了ボタンを押すと、自動で動画のセグメンテーションが行われ、しばらくすると認識結果が表示される。
