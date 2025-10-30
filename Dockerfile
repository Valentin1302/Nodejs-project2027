FROM sitespeedio/node:ubuntu-22.04-nodejs-18.18.0

# Set application working directory 
WORKDIR /usr/src/app

# Copy files
COPY . .

RUN apt-get update
RUN apt-get install -y curl

# Run application
EXPOSE 3000

CMD /bin/bash
