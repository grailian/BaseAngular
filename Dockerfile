FROM ubuntu

MAINTAINER Keith Keough, rightbrainmedia.com

WORKDIR /home/baseangular

ADD dist /home/baseangular/dist

WORKDIR /home/proxy

ADD nginx.conf /home/proxy/

RUN sudo apt-get install nginx -y
RUN sudo cp nginx.conf /etc/nginx

CMD service nginx start

