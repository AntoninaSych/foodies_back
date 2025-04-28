Налаштування:
1. Завантажте Docker Desktop і запустіть його   https://docs.docker.com/get-started/introduction/get-docker-desktop/ 
2. В терміналі в foodies_back каталозі введіть команду ```docker compose up```
3. В терміналі в foodies_back  одна за одной
   - ```npm install -g nodemon```
   - ```npm run dev```
   - ```npx sequelize-cli db:migrate```
   - ```npx sequelize-cli db:seed:undo:all```