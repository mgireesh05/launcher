FROM node:0.12.2-slim
MAINTAINER Gireesh Kumar M "m.gireesh05@gmail.com"

COPY app /home/app
RUN apt-get update --fix-missing && \
    apt-get install -y vim && \
    apt-get autoremove -yqq && \
    apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN cd /home/app/src && \
    npm install && npm cache clear

EXPOSE  8000

#Start the nodejs app
CMD ["node", "/home/app/src/app.js"]

