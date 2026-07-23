FROM public.ecr.aws/docker/library/python:3.9-bookworm AS base


RUN apt update \
  && apt dist-upgrade -y \
  && apt install postgresql-client -y \
  && apt clean

COPY ./requirements.txt /opt/requirements.txt
RUN pip3 install -r /opt/requirements.txt
FROM base AS dev

ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=20.11.1
RUN mkdir -p $NVM_DIR
# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
RUN ln -sf $NVM_DIR//versions/node/v$NODE_VERSION/bin/npm /usr/bin/npm
RUN ln -sf $NVM_DIR/versions/node/v$NODE_VERSION/bin/node /usr/bin/node

WORKDIR /opt/app

FROM base AS deploy
COPY ./spectrum/ /opt/app
COPY ./docker/start.sh /start.sh

WORKDIR /opt/app
CMD /start.sh
EXPOSE 80
