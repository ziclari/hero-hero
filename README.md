docker build -t mi-react-app --build-arg VITE_API_URL="https://mi-api.com" .

docker build -t simulador-app .

docker run -d -p 8080:80 --name simulador simulador-app
docker run -d --name simulador \
  --network general-ebc-network \
  simulador-app

docker stop simulador
docker start simulador

http://localhost:8080

http://localhost:8080/corp-espionage
http://localhost:8080/electroconexiones
http://localhost:8080/haunted-mansion
http://localhost:8080/neon-detective

npx serve -s dist -l 4173