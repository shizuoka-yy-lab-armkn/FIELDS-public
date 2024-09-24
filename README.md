# FIELDS (Feedback Integrated Expert Level Description System)

日本語: [README.ja.md](./README.ja.md)

:bulb: Homepage: https://sites.google.com/view/jim-fields

FIELDS is a web application that supports learning in motorcycle assembly tasks.

Main Features:

- Capturing RTMP streams of assembly videos
- Task recognition using MS-TCN
    - After capturing, the system automatically performs Temporal Action Segmentation, splitting the video timeline into different tasks.
    - A simple example of segmentation results: `[(name="Screw Placement", begin=00:00, end=00:07), (name="Lubricant" Application, begin=00:07, end=00:13)]`
- Integration and display of the recognition results with the video
    - The recognized tasks are displayed in sync with video playback, indicating what task is being performed at any given time.
    - Clicking on a task allows users to jump to the corresponding video segment.
    - The system helps identify skipped tasks, incorrect task order, and tasks that took too long to complete.
- Scoring and feedback based on the recognition results

## System Requirements
The system has been confirmed to run under the following environment:

- Ubuntu 20.04
- NVIDIA GeForce RTX 4090
- CUDA v12.1
- Docker Engine v25.03
- Docker Compose v2.24.6
- [mise](https://mise.jdx.dev/getting-started.html) v2024.9.6
- [pipx](https://pipx.pypa.io/stable/installation/) v1.7.1
- GNU Make 3.81

## Execution Instructions

### (1) Clone the repository and start the Docker containers
1. Clone the repository.

    ```bash
    git clone git@github.com:shizuoka-yy-lab-armkn/FIELDS-public.git
    cd FIELDS-public
    ```

2. Prepare the configuration file for setting up PostgreSQL using Docker Compose.

    ```bash
    cp .env.postgres.example .env.postgres
    ```
    You only need to copy the file.

3. Start services such as PostgreSQL, Nginx, Redis, etc.

    ```bash
    docker compose up -d
    ```

4. Ensure the services are running correctly.

    ```console
    $ docker compose ps -a
    NAME                      IMAGE                                   COMMAND                   SERVICE    CREATED          STATUS          PORTS
    yylab-fields-nginx-1      tiangolo/nginx-rtmp:latest-2023-11-13   "nginx -g 'daemon of…"   nginx      21 seconds ago   Up 20 seconds   0.0.0.0:8080->80/tcp, 0.0.0.0:21935->1935/tcp
    yylab-fields-postgres-1   postgres:16.0-bookworm                  "docker-entrypoint.s…"   postgres   21 seconds ago   Up 19 seconds   0.0.0.0:25432->5432/tcp
    yylab-fields-redis-1      redis:7.2-bookworm                      "docker-entrypoint.s…"   redis      21 seconds ago   Up 20 seconds   0.0.0.0:26379->6379/tcp
    ```

## (2) Download necessary files

1. Access the following Google Drive and download `dummy.mp4`, `dummy_video_feature.npy`, and `mstcn.pt`.

    https://drive.google.com/drive/folders/10pHmn2Qg8ZJ08SQyfsvvi0krTDzzfHpQ?usp=sharing

2. Move the downloaded files to the appropriate directories.

    ```bash
    mv ~/Downloads/mstcn.pt backend/models/
    mv ~/Downloads/dummy.mp4 backend/static/public/
    mv ~/Downloads/dummy_video_feature.npy backend/static/private/
    ```

## (3) Start the frontend server with mock API
Since the frontend includes a mock API, you do not need to start the API server or inference job processor at this stage.

The process involves launching MSW (Mock Service Worker) in the browser → intercepting API requests → generating mock API responses in the browser, meaning no requests are sent to the API server.

- The mock-related handling can be found in [frontend/src/mocks](./frontend/src/mocks).
- Whether to mock API calls or not is controlled by an environment variable in [frontend/.env.development](frontend/.env.development).

1. Navigate to the frontend directory.

    ```bash
    cd frontend
    ```

2. Install specific versions of Node.js and Corepack as defined in `.mise.toml`.

    ```bash
    mise i
    ```

3. Install specific versions of libraries based on pnpm-lock.yaml.

    ```bash
    pnpm i
    ```

4. Start the Next.js server in development mode.

    ```bash
    pnpm dev
    ```

    *The actual command for the `dev` script is specified in package.json.*

5. Verify that the web page is displayed without errors by accessing the Next.js server directly.

    Open http://localhost:3000/recording in a web browser and check for errors.

6. Access the web server via Nginx and ensure the web page is displayed.

    Access via port 8080:

    - http://localhost:8080/recording
    - http://localhost:8080/records
    - http://localhost:8080/exemplars

*To stop the frontend server, press <kbd>Ctrl</kbd>+<kbd>C</kbd> in the terminal where `pnpm dev` was run.*

## (4) Start the API server and migrate the database
It is advisable to run the following steps in a separate terminal (shell) from the frontend.

1. Navigate to the backend directory at the root of the repository.

    ```bash
    cd backend
    ```

2. Install the specified version of Python and create the virtual environment as defined in `.mise.toml`.

    ```bash
    mise i
    ```

3. Ensure the Python virtual environment path is set correctly.

    ```console
    $ which python
    /xxx/FIELDS-public/backend/.venv/bin/python
    ```

4. Install dependencies and generate ORM code.

    ```bash
    make install
    ```

5. Prepare the .env file.

    ```bash
    cp .env.example .env
    ```
    You only need to copy the file.

6. Start the API server in development mode.

    ```bash
    make run/server/dev
    ```

7. Verify that the API server responds with 200 OK when sending a GET request to /api/v1/debug/ping.

    ```console
    $ curl -i localhost:8000/api/v1/debug/ping
    HTTP/1.1 200 OK
    date: Tue, 24 Sep 2024 20:55:20 GMT
    server: uvicorn
    content-length: 66
    content-type: application/json

    {"message":"pong","serverTime":"2024-09-25T05:55:20.433822+09:00"}
    ```

8. Verify that the API server responds with 200 OK when accessed via Nginx (port 8080).

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
    The `Server` field in the request header should be `nginx`.

9. Apply the migration scripts to the database (this generates the necessary tables).

    ```bash
    make migrate/deploy
    ```

10. Insert initial data into the database.

    ```bash
    poetry run python3 -m fields.cmd.seed_subject_and_actions
    poetry run python3 -m fields.cmd.create_user test-user-01
    ```

    *As indicated by the above commands, the scripts are located in `fields/cmd/`.*

11. Modify `frontend/.env.development` to disable the API mock.

    Change `NEXT_PUBLIC_MOCK_ENABLED` to `false`.

    ```diff
    NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080
    - NEXT_PUBLIC_MOCK_ENABLED=true
    + NEXT_PUBLIC_MOCK_ENABLED=false
    ```

12. If the frontend server is not running, start it.

    *If `pnpm dev` is already running, the changes in `.env.development` will be detected and reloaded automatically, so no action is required.*

    ```bash
    pnpm dev
    ```

13. Access the recording list page and verify that an empty page (with 0 recorded videos) is displayed.

    Open http://localhost:8080/records.

    By disabling the mock API, the system now retrieves data from the actual API server. At this point, there are no recordings in the database, so the page should display no entries.

## (5) Start the video recognition job processor and verify its operation

1. Modify backend/.env to set the following three parameters to 0:

    - `FIELDS_MOCK_RECORDING`
    - `FIELDS_MOCK_RECORD_EVAL_WORKER`
    - `FIELDS_MOCK_VIDEO_FEATURE_EXTRACTION`

2. Start the job processor. This may take several seconds to minutes.

    ```bash
    make run/worker
    ```

3. Set the action camera to stream RTMP to `rtmp://{server_address}:21935/live/test`.

4. Wear the action camera on your head and start the recording from the recording start page.

5. Perform the motorcycle assembly task
