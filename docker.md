### Build the image and push
```bash
docker buildx build --platform linux/amd64,linux/arm64 --push --rm --tag=docker.io/oskarsammet/app:260623v1 .
```

```bash
docker swarm init --advertise [192.168...]
```

### Overlay network
```bash
docker network create --driver=overlay --attachable [NETWORK_NAME]
```

### Service
```bash
docker service create --name=[SERVICE_NAME] --network=[NETWORK_NAME] --replicas=2 -p 9000:8081 -t -d docker.io/oskarsammet/app:260623v1
```
-d = als deamon service

-t =

-p 9000:8081 (8081 Lokaler Container Port, 9000 Nach Außen)

```bash
docker service scale [SERVICE_NAME]=3
```

```bash
docker exec -it [CONTAINER_NAME] /bin/bash
```