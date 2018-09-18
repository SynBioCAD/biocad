
FROM ubuntu:16.04
MAINTAINER James Alastair McLaughlin <j.a.mclaughlin@ncl.ac.uk>

ADD setup_7.x /

RUN chmod +x /setup_7.x && \
    sync && \
    /setup_7.x

RUN apt update && apt install -y nodejs chromium-browser
RUN npm install -g forever


RUN useradd biocad -p biocad -m -s /bin/bash

RUN mkdir /opt/biocad
RUN mkdir /opt/biocad/renderfarm

ADD biocad /opt/biocad

RUN chown -R biocad:biocad /opt/biocad

RUN su biocad -c "cd /opt/biocad/renderfarm && npm install"


COPY startup.sh /
RUN chmod +x /startup.sh

EXPOSE 9991

ENTRYPOINT ["/startup.sh"]



