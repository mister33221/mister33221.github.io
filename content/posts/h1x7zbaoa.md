---
title: "Learning Nexus Repository (docker)"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "- Sonatype nexus repository is a kind of repository manager. Includes support for Maven, NuGet, PyPI"
published: true
---

{%hackmd BJzAwtWvp %}
# Learning Nexus Repository (docker)

## What is Nexus Repository?

- Sonatype nexus repository is a kind of repository manager. Includes support for Maven, NuGet, PyPI, npm, Bower, RubyGems, Docker, P2, OBR, APT and YUM and many more. In addition to these, it also supports integration with other tools like CICD(Jenkins, Bamboo), IDE(Eclipse, IntelliJ, Visual Studio), etc.
- Nexus repository provides two types of repositories, we can check the difference between them from [here](https://www.sonatype.com/products/sonatype-nexus-oss-vs-pro-features).
  - Nexus Repository OSS: It is an open source repository manager. It is free to use and support all the features of nexus repository.
  - Nexus Repository Pro: It is a paid repository manager. It provides additional features like support, security, etc.

## What can Nexus Repository do?

- Proxy Remote Repositories: 
  - Nexus can act as a proxy for remote repositories, meaning you can access these remote repositories through Nexus instead of connecting to them directly. This can provide better performance and higher availability.

- Hosted Private Repositories: 
  - You can use Nexus to create your own private repositories and publish your build products to these repositories. This can provide better control and security.

- Group Repositories: 
  - Nexus allows you to create group repositories, which can include multiple other repositories (including proxy repositories and hosted repositories). This can make it easier for you to manage and organize your repositories.

- Support for Multiple Package Formats: 
  - Nexus supports multiple package formats, including Maven, NuGet, NPM, Python, RubyGems, and Docker, etc.

- Security and Permission Management: 
  - Nexus provides powerful security and permission management features, including user and role management, permission assignment, and LDAP integration, etc.

- Smart Proxy and Caching: 
  - Nexus caches all content downloaded from remote repositories and only updates this content when needed. This can provide faster build speeds and higher availability.

- Component Health Check: 
  - Nexus provides a component health check feature that can help you identify and fix security and license issues in your repository.

## Let's practice some basic operations by different ways (image version)

- Here we use the image version of nexus repository. (You can download the nexus zip from [here](https://help.sonatype.com/repomanager3/product-information/download) as well).
- Create a docker-compose.yml file and add the following content:
```yml
version: "3.1"
services:
  nexus:
    image: sonatype/nexus3:3.63.0
    container_name: nexus
    ports:
      - "8081:8081"
      - "8082:8082"
      - "8083:8083"
      - "8084:8084"
    restart: unless-stopped
    volumes:
      - ./nexus-data:/nexus-data
```
- Use below command to up the service (You need to have docker installed)
```
docker-compose up -d
```
- The default username is admin and password is at "\nexus-data\admin.password". After login, we can change the password and this password file will be deleted.
1. Open our nexus repository: "localhost:8081".
2. Login with our account "admin" and default password. (After login, go change the password.)
3. Go to Security -> Realm, check the Docker Bearer Token Realm has been activated.
4. Go modify your docker daemon settings.
   1. Open the docker desktop and click the settings icon.
   2. Go to the docker engine tab and "add" the following content:
       1. If your url has https, then you don't need to add this. In another hand, if your url is http, then you need to add this.
   ```json
   {
     "insecure-registries": [
       "127.0.0.1:8082",
       "127.0.0.1:8083",
       "127.0.0.1:8084"
     ]
   }
   ```
   3. Restart the docker desktop.


### Docker image situation

- There are three types of repositories for docker.
  - docker(hosted): This type of repository is used to store and distribute your own docker images. It is a private repository.
  - docker(proxy): This type of repository allows you to proxy remote docker repositories. For example, if you want to proxy the docker hub, you can create a docker(proxy) repository and configure it to proxy the docker hub. Then you don't need to download the docker images from the docker hub, you can download them from your own nexus repository.
  - docker(group): This type of repository allows you to combine mutiple docker repositories into a single repository. For example, if you have two docker repositories, one is docker(hosted) and another is docker(proxy). You can create a docker(group) repository and add these two repositories into it. Then you can download the docker images from the docker(group) repository. 

#### Docker(hosted) repository

1. Go setting icon -> Repositories -> Create repository.
2. Choose the type as "docker(hosted)".
   1. Give it a name as "docker-hosted-test".
   2. Give it a HTTP port as "8082".
   3. Tick the "Allow anonymous docker pull" checkbox.
   4. Tick the "Enable Docker V1 API" checkbox.
   5. Save it.

3. Open a command line and login to the nexus repository to check if it works.
```bash
docker login 127.0.0.1:8082
username: <your username>
password: <your password>
```

Now, everything is ready. Let's pull a official docker image (nginx) , then tag it and push it to our nexus repository.

4. Pull the official nginx image.
```bash
docker pull nginx
```
5. Tag the image.
```bash
docker tag nginx 127.0.0.1:8082/nginx
```
6. Push the image to our nexus repository.
```bash
docker push 127.0.0.1:8082/nginx
```
7. Go to the nexus repository and check if the image has been pushed successfully. On the page, click the "Browse" button and select the "docker-hosted-test" repository. Then we can see the image we just pushed.
8.  Now, we can run the image from our nexus repository and specify the port.
```bash
docker run -d -p 8080:80 127.0.0.1:8082/nginx:latest
```
---
Damn! It spent me a lot of time to make it work. I don't know why but it works now. Still need to understand how does it work and what abilities does it have.
---

#### Docker(proxy) repository

1. Go setting icon -> Blob Stores -> Create blob store.
   1. Choose the type as "File".
   2. Give it a name as "docker-hub".
   3. The path will be set automatically. Leave the Enable checkbox unticked.
   4. Save it.
2. Go setting icon -> Repositories -> Create repository.
   1. Give it a name as "docker-proxy-test".
   2. Give it a HTTP port as "8083".
   3. Tick the "Allow anonymous docker pull" checkbox.
   4. Tick the "Enable Docker V1 API" checkbox.
   5. Give the Remote storage as "https://registry-1.docker.io".
   6. Choose the Docker index as "Docker Hub" in this case.
   7. Choose the Blob store as "docker-hub".
   8. Save it.
4. Open a command line and login to the nexus repository to check if it works.
```bash
docker login 127.0.0.1:8083
username: <your username>
password: <your password>
```
5. Here we use Ubuntu on the docker hub to test if it works.
    1. Logout the previous nexus repository.
   ```bash
    docker logout 127.0.0.1:8082
    ```
    2. login to the new nexus repository.
    ```bash
    docker login 127.0.0.1:8083
    username: <your username>
    password: <your password>
    ```
    3. Pull the image from the docker hub.
    ```bash
    docker pull 127.0.0.1:8083/ubuntu
    ```

6. Wala! It works! Go to the nexus repository and check if the image has been pulled successfully. On the page, click the "Browse" button and select the "docker-proxy-test" repository. Then we can see the image we just pulled.

#### Docker(group) repository

Basically, Docker(group) repository is a combination of Docker(hosted) and Docker(proxy) repositories. So, we have alreadly established these two repository in the previous steps. Now, we just need to create a Docker(group) repository and add these two repositories into it.

1. Go setting icon -> Repositories -> Create repository.
   1. Give it a name as "docker-group-test".
   2. Give it a HTTP port as "8084".
   3. Tick the "Allow anonymous docker pull" checkbox.
   4. Tick the "Enable Docker V1 API" checkbox.
   5. Choose the Bolb store as "docker-hub".
   6. In member repositories section, add the "docker-hosted-test" and "docker-proxy-test" repositories.
   7. Save it.
2. Open a command line and login to the nexus repository to check if it works.
```bash
docker login 127.0.0.1:8083
username: <your username>
password: <your password>
```
3. Now, delete the images we pulled before.
```bash
docker images
docker rmi <image id>
```
4. Pull the image from the docker(group) repository.
    1. Logout the previous nexus repository.
   ```bash
    docker logout 127.0.0.1:8083
    ```
    2. login to the new nexus repository.
    ```bash
    docker login 127.0.0.1:8084
    username: <your username>
    password: <your password>
    ```
    3. Pull the image from the docker(group) repository.
    ```bash
    docker run -d -p 8080:80 127.0.0.1:8084/nginx:latest
    docker pull 127.0.0.1:8084/ubuntu
    ```
5. If you want to push image to the docker(group) repository, you need to pay for pro version. So, I will skip this part. You can refer to the official document [here](https://help.sonatype.com/repomanager3/nexus-repository-administration/formats/docker-registry/pushing-images-to-a-group-repository).

### Java library (jar) situation



### Angular library (npm) situation


----------------------------------------------

- Q: How to delete docker images from nexus repository?
- A: I use several ways to delete the images from nexus repository. But I can't delete all the file which is assocated with the specic image. You can check the official document below and try it by yourself.
  - [how to delete docker images form nexus repository3](https://support.sonatype.com/hc/en-us/articles/360009696054-How-to-delete-docker-images-from-Nexus-Repository-3)
