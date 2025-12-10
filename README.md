docker build -t mi-react-app --build-arg VITE_API_URL="https://mi-api.com" .

docker build -t mi-react-app .

docker run -d -p 8080:80 --name contenedor-react mi-react-app

docker stop contenedor-react
docker start contenedor-react

http://localhost:8080

http://localhost:8080/corp-espionage
http://localhost:8080/electroconexiones
http://localhost:8080/haunted-mansion
http://localhost:8080/neon-detective
