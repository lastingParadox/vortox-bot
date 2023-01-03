COMPOSE_FILE=docker-compose.yml
DOCKER_COMPOSE=docker compose -f ${COMPOSE_FILE}

BLACK	:= \033[1;30m
RED		:= \033[1;31m
GREEN	:= \033[1;32m
YELLOW	:= \033[1;33m
BLUE	:= \033[1;34m
MAGENTA	:= \033[1;35m
CYAN	:= \033[1;36m
WHITE	:= \033[1;37m
RESET	:= \033[m

default: build

build: ## Build all Docker images
	@echo Building Vortox Bot images
	@${DOCKER_COMPOSE} build

clean: ## Stops and removes existing containers and volumes
	@echo ${YELLOW}Stopping running containers and purging existing volumes${RESET}
	${DOCKER_COMPOSE} down -v
	@echo Rebuilding images

start: start-daemon ## Start Vortox Bot (default: daemon mode)

start-attached:
	@echo ${GREEN}Starting Vortox Bot in attached mode${RESET}
	${DOCKER_COMPOSE} up

start-daemon:
	@echo ${GREEN}Starting Vortox Bot in daemon mode${RESET}
	@echo Run \`make start-attached\` to run in attached mode
	${DOCKER_COMPOSE} up -d

stop: ## Stop all containers
	@echo ${YELLOW}Stopping all containers${RESET}
	${DOCKER_COMPOSE} stop


