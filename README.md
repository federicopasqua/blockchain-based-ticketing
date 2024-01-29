# Blockchain based Ticketing
This project is a proof of concept of a ticketing platform that uses blockchain and smart contracts to create and validate tickets.

The project containes a few folders:
- app-backend includes all the app source code written with React Native
- contracts includes all the contracts written in solidity
- msp-backend includes the source code for the Mobility Service Providers Backend
- ticketing-app includes the source code for the app Backend

More information about how it works can be found on the my [thesis here.](https://github.com/federicopasqua/blockchain-based-ticketing/files/14085469/thesis_Pasqualini.pdf)
Vehicle rent            |  Trip Plan        |  User Tab       
:-------------------------:|:-------------------------:|:-------------------------:
![app_map_selected](https://github.com/federicopasqua/blockchain-based-ticketing/assets/61752550/0f15c687-02b5-4b0d-9339-ceeead76f9ad) | ![app_plan](https://github.com/federicopasqua/blockchain-based-ticketing/assets/61752550/8067d623-5567-4da8-9201-94c5f9821a0c) | ![app_user](https://github.com/federicopasqua/blockchain-based-ticketing/assets/61752550/ea3c5be2-9690-40bd-a532-6633216fc64e)


## Quick Startup

#### Requirements
This project has been tested only on Ubuntu 22.04. You need to install [docker](https://docs.docker.com/engine/install/), [docker compose](https://docs.docker.com/compose/install/) and [setup the environment for react native](https://reactnative.dev/docs/environment-setup)

#### Install

To run the project, you need to clone the repository and run the docker compose. This will setup a test blockchain together with all the required backed services needed.
```bash
git clone https://github.com/federicopasqua/blockchain-based-ticketing
cd blockchain-based-ticketing

docker compose up
```
To run the app, open another terminal inside the `ticketing-app` folder and run:
```
npm i
npm start
```
