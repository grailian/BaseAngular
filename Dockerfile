FROM ubuntu

MAINTAINER Keith Keough, rightbrainmedia.com

WORKDIR /home

RUN sudo apt-get update
# Install software 
RUN apt-get install -y git
# Make ssh dir
RUN mkdir /root/.ssh/

# Copy over private key, and set permissions
ADD id_rsa /root/.ssh/id_rsa
WORKDIR /root/.ssh/
RUN sudo chmod 400 id_rsa

WORKDIR /home

# Create known_hosts
RUN touch /root/.ssh/known_hosts
# Add bitbuckets key
RUN ssh-keyscan -T 60 bitbucket.org >> /root/.ssh/known_hosts

# Clone the conf files into the docker container
RUN git clone git@bitbucket.org:rbmgit/baseangular.git

WORKDIR /home/proxy

ADD nginx.conf /home/proxy/

RUN sudo apt-get install nginx -y
RUN sudo cp nginx.conf /etc/nginx

WORKDIR /home/baseangular/

RUN sudo apt-get install nodejs -y
RUN sudo ln -s /usr/bin/nodejs /usr/bin/node
RUN sudo apt-get install npm -y

CMD service nginx start

