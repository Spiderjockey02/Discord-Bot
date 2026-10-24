FROM node:lts-slim

WORKDIR /usr/src/bot

ENV NODE_ENV=production \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    FFMPEG_PATH=/usr/lib/jellyfin-ffmpeg/ffmpeg

# python3 runs yt-dlp; jellyfin-ffmpeg is a current FFmpeg build that is used instead of the bundled ffmpeg-static
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl gnupg python3 && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://repo.jellyfin.org/jellyfin_team.gpg.key | gpg --dearmor -o /etc/apt/keyrings/jellyfin.gpg && \
    . /etc/os-release && \
    printf "Types: deb\nURIs: https://repo.jellyfin.org/debian\nSuites: %s\nComponents: main\nArchitectures: %s\nSigned-By: /etc/apt/keyrings/jellyfin.gpg\n" \
        "$VERSION_CODENAME" "$(dpkg --print-architecture)" > /etc/apt/sources.list.d/jellyfin.sources && \
    apt-get update && \
    apt-get install -y --no-install-recommends jellyfin-ffmpeg8 && \
    ln -sf /usr/lib/jellyfin-ffmpeg/ffmpeg /usr/local/bin/ffmpeg && \
    ln -sf /usr/lib/jellyfin-ffmpeg/ffprobe /usr/local/bin/ffprobe && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

# pnpm-workspace.yaml allows the install scripts that download yt-dlp and FFmpeg, and the postinstall script updates yt-dlp
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/scripts ./src/scripts

RUN pnpm install --prod --frozen-lockfile

COPY . .

# Run node directly so it receives SIGTERM and can save the music queues before stopping
CMD ["node", "."]
