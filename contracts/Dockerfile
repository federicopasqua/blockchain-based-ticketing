FROM ubuntu:20.04

ENV ENVIRONMENT=dev

SHELL ["/bin/bash", "-c"]

RUN apt update

RUN apt install -y curl git jq

RUN curl -L https://foundry.paradigm.xyz | bash

ENV PATH="$PATH:/root/.foundry/bin"

RUN foundryup

WORKDIR /root

RUN mkdir ./lib
RUN mkdir ./script
RUN mkdir ./src

COPY lib/ ./lib
COPY script/ ./script
COPY src/ ./src
COPY foundry.toml .
COPY dockerInitScript.sh .

# Runs `forge script` against the anvil chain to set up contracts
ENV INIT_SCRIPTS='/bin/bash /root/dockerInitScript.sh'

# Command to start the anvil service
# Add your flags commands here
ENV ANVIL_START='anvil --chain-id 8118 --host 0.0.0.0 --order fifo --steps-tracing'

EXPOSE 8545

# Execute the scripts after the anvil service is started
CMD (sleep 5 && $INIT_SCRIPTS) & $ANVIL_START