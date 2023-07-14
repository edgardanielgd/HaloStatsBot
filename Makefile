DOCKER_IMAGE = "discord_bot"

docker.build: 
	docker build -t $(DOCKER_IMAGE) .

docker.exec:
	docker run --rm -d --name $(DOCKER_IMAGE) -p 8050:8050 $(DOCKER_IMAGE)

docker.run: docker.build docker.exec

docker.stop: 
	docker stop $(DOCKER_IMAGE)