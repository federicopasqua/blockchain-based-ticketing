forge script /root/script/DeployMspRegister.s.sol --chain-id 8118 --rpc-url http://0.0.0.0:8545 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  --silent --broadcast

if [ $ENVIRONMENT == "dev" ];
    then
        forge script /root/script/Interactions.s.sol:CreateTrenitaliaMsp --chain-id 8118 --rpc-url http://0.0.0.0:8545 --private-key dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97  --silent --broadcast
        forge script /root/script/Interactions.s.sol:CreateItaloMsp --chain-id 8118 --rpc-url http://0.0.0.0:8545 --private-key 2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6  --silent --broadcast
        forge script /root/script/Interactions.s.sol:CreateNotJustBikesMsp --chain-id 8118 --rpc-url http://0.0.0.0:8545 --private-key 92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e  --silent --broadcast
        forge script /root/script/Interactions.s.sol:CreatePedalaSrlMsp --chain-id 8118 --rpc-url http://0.0.0.0:8545 --private-key 4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356  --silent --broadcast
        forge script /root/script/Interactions.s.sol:SendEthToWallet --chain-id 8118 --rpc-url http://0.0.0.0:8545 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  --silent --broadcast
fi

echo "INITIAL SETUP FINISHED!"