---
title: "Github action practice ( Angular, Spring Boot, Containerication, gmail notify)"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "Coming soon"
published: true
---

# Github action practice ( Angular, Spring Boot, Containerication, gmail notify)


## What is Github action?

Coming soon

## How to use Github action?

Coming soon

## Getting hands dirty with Github action

### Environment 

Before we start,        
build a front-end project with angular.
And a back-end project with spring boot.

My front-end project environment is:

- npm: 8.19.1
- node: v19.4.0
- @angular/cli: 16.2.14
- Angular: 16.2.12
- Bootstrap: 5.0.1 [Bootstrap](https://www.npmjs.com/package/bootstrap/v/5.0.1)
- ngx-bootstrap: 10.2.0 [ngx-bootstrap](https://www.npmjs.com/package/ngx-bootstrap/v/10.2.0)
- bootstrap-icons: 1.11.3 [bootstrap-icons](https://www.npmjs.com/package/ngx-bootstrap-icons)
- @types/bootstrap: 5.2.10 

My back-end project environment is:     

- Java 17
- Maven 4.0.0
- Spring Boot 3.3.1
- lombok
- Swagger 2.0.2
- h2database

My folder structure is:

```
ninja-ddd-practice
├── ninja-frontend
│   ├── src
│   └── ...
├── ninja-backend
│   ├── src
│   └── ...
```

### Plan

Let's list the what we want to do with Github action.

- Cache front-end project dependencies to speed up the build (TODO)
- Build front-end project
- Unit test front-end project (TODO)
- SonarCloud analysis to make sure the front-end project code quality (TODO)
- Snyk test to make sure the front-end project security (TODO)
- Build front-end project image
- Push front-end project image to docker hub
- Cache back-end project dependencies to speed up the build (TODO)
- Build back-end project
- Unit test back-end project (TODO)
- SonarCloud analysis to make sure the back-end project code quality (TODO)
- Snyk test to make sure the back-end project security (TODO)
- Build back-end project image
- Push back-end project image to docker hub
- Deploy front-end on ??? (TODO)
- Health check front-end (TODO)
- Deploy back-end on ??? (TODO)
- Health check back-end (TODO)
- Send notification to email

### Dockerize front-end project

Create a Dockerfile in the front-end project root directory.
Our front-end will be served by nginx.

```Dockerfile
# 使用Node.js作為基礎鏡像
FROM node:19.4.0 as build

# 設置工作的目錄
WORKDIR /app

# 複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴，好孩子不會用--legacy-peer-deps，會好好找到相容的版本
RUN npm install --legacy-peer-deps

# 複製所有源代碼
COPY . .

# 構建應用
# RUN npm run build -- --prod # 不太確定，但好像這個指令是舊版的
# 新版的指令
RUN npm run build -- --configuration production

# 使用nginx作為最終鏡像
FROM nginx:stable-alpine

# 從build階段複製構建結果到nginx的html目錄
COPY --from=build /app/dist/ninja-frontend /usr/share/nginx/html/

# 暴露80端口
EXPOSE 80

# 啟動nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Dockerize back-end project

Create a Dockerfile in the back-end project root directory.

```Dockerfile
# Use the official OpenJDK image, which is based on Linux Alpine
FROM openjdk:17-jdk-slim
# Set the working directory in the container
WORKDIR /app
# Copy the packaged jar file into the container
COPY target/*.jar app.jar
# Run the jar file
ENTRYPOINT ["java","-jar","/app/app.jar"]
# Expose the port
EXPOSE 8080
```

### Github action workflow

Create a `.github/workflows` directory in the ninja-ddd-practice git root directory.
Create a `main.yml` file in the `.github/workflows` directory.

Let's break down the workflow file.

1. Base

```yaml
# Name of the workflow
name: Ninja-ddd-practice CI/CD Pipeline

# When the workflow will be triggered
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```

2. Job section

```yaml
# Define the jobs that will be executed
jobs:
```

3. Build, This job will build the front-end and back-end project.

```yaml
# Define this job name is build
  build:
#   Define the runner for this job will run on ubuntu-latest
#   outputs is used to pass data between jobs, here we create a version output, let after jobs can use it.
#   steps is a list of tasks that will be executed in this job
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.VERSION }}

    steps:
#    Checkout the code from the repository，ˋ這是一個官方的action，使在 workflow 中，檢出我們在 github repository 中的程式碼。其實就是 git clone 我們的程式碼到 runner 中。讓後續的流程都可以使用這些程式碼。
    - uses: actions/checkout@v2

#   Generate version number，這個步驟是用來生成版本號的，我們會在這個步驟中生成一個版本號，這個版本號是由日期、github run number、github sha 組成的。讓我們在後續 image tag 中使用。
#   id 是這個步驟的唯一標識，可以在後續的步驟中使用這個 id 來引用這個步驟的輸出。
#   >> $GITHUB_OUTPUT 的意思是將結果寫入到一個名為 GITHUB_OUTPUT 的變數中。
    - name: Generate version number
      id: version
      run: |
        echo "VERSION=$(date +'%Y.%m.%d')-${GITHUB_RUN_NUMBER}-${GITHUB_SHA::7}" >> $GITHUB_OUTPUT

#   Set up JDK 17，這個步驟是用來設置 JDK 17 的，我們會在這個步驟中設置 JDK 17，讓我們可以在後續的步驟中使用 JDK 17 來編譯我們的程式碼。
#   distribution 是這個步驟的參數，這個參數是用來指定我們使用的 JDK 的發行版，這裡我們使用的是 AdoptOpenJDK。其他也有 oracle、zulu 等。
    - name: Set up JDK 17
      uses: actions/setup-java@v2
      with:
        java-version: '17'
        distribution: 'adopt'
    
#   Build ninja-backend，我們會在這個步驟中編譯 ninja-backend。
#   要注意的是 cd 進我們的 root directory 後，我們需要先給 mvnw 檔案權限，不然會報錯。
#   DskipTests 是用來跳過測試的，因為我們只是要編譯，不需要跑測試。之後我會再來修改他，加上測試。
    - name: Build ninja-backend
      run: |
        cd ./ninja-backend/  
        chmod +x mvnw
        ./mvnw clean package -DskipTests
    
#   Build ninja-frontend，我們會在這個步驟中編譯 ninja-frontend。
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '19.4.0'
    
#   安裝依賴，其實在我本機上直接 npm install 是可以的，但是在 github action 中，會報錯，所以我才加上 --legacy-peer-deps。原因未知。
    - name: Build ninja-frontend
      run: |
        cd ./ninja-frontend  
        npm install --legacy-peer-deps
        npm run build -- --configuration production
    
#   這段配置的作用是將 ninja-backend/target 和 ninja-frontend/dist 這兩個目錄中的所有文件上傳到 GitHub 的工件存儲，並將這些文件打包成一個名為 dist 的工件。
#   | 這個符號是用來分隔多個路徑的，這樣我們就可以將多個路徑的文件一起上傳。
    - name: Archive production artifacts
      uses: actions/upload-artifact@v2
      with:
        name: dist
        path: |
          ninja-backend/target
          ninja-frontend/dist
```

4. Push image, This job will push the front-end and back-end project image to docker hub.

```yaml
# Define this job name is push
# needs means this job will run after the build job. In normal case, if the build job failed, this job will not run.
  push:
    needs: build
    runs-on: ubuntu-latest
    
#  steps is a list of tasks that will be executed in this job
#  Use `actions/checkout@v2` to checkout the code from the repository, to get the code that we need to build the image.
    steps:
    - uses: actions/checkout@v2
    
# In previous job, we use `actions/upload-artifact@v2` to upload the build result to github artifact and name it dist.
# In this job, we use `actions/download-artifact@v2` to download the artifact.
    - name: Download artifacts
      uses: actions/download-artifact@v2
      with:
        name: dist

# Log in to Docker Hub
# We need to set the github secrets in the repository settings, so we can use it in the workflow.
    - name: Log in to Docker Hub
      uses: docker/login-action@v1
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
    
# Build and push backend Docker image
# In previous job, we generate a version number, we can use it here by `${{ needs.build.outputs.version }}`.
    - name: Build and push backend Docker image
      uses: docker/build-push-action@v2
      with:
        context: ./ninja-backend
        push: true
        tags: |
          vincentkai/ninja-backend:latest
          vincentkai/ninja-backend:${{ needs.build.outputs.version }}
    
# Build and push frontend Docker image
    - name: Build and push frontend Docker image
      uses: docker/build-push-action@v2
      with:
        context: ./ninja-frontend
        push: true
        tags: |
          vincentkai/ninja-frontend:latest
          vincentkai/ninja-frontend:${{ needs.build.outputs.version }}
```

- In the `Log in to Docker Hub` step, there are two secrets `DOCKER_HUB_USERNAME` and `DOCKER_HUB_ACCESS_TOKEN` that we need to set in the repository settings.
    1. Go to your docker hub account settings. Click on `Personal access tokens` and generate a new token. Copy the token.

    2. Go to your repository settings. Click on `Secrets and variables` > `Actions`. Down the page, you will see Repository secrets. Click on `New repository secret`. Add `DOCKER_HUB_USERNAME` and `DOCKER_HUB_ACCESS_TOKEN` with your docker hub username and token. Then you can use it in the workflow.


5. notify, This job will send an email notification.

There are many ways to send the notification, here I will show you how to send an email notification.

```yaml
# Define this job name is notify
# This job will run after the build and push job.
# In previous job, we said if the build job failed, the push job will not run. But I want to receive the notification whether the job failed or not. So I use if: always(). It means this job will always run.
# `if` has many options, like `always()`, `success()`, `failure()`, `cancelled()`, `changed()`, `github.event_name == 'push'`, `github.event_name == 'pull_request'`, etc.
  notify:
    needs: [build, push]
    runs-on: ubuntu-latest
    if: always()


    steps:
#   dawidd6/action-send-mail is an action that can send an email notification.
#   Here has repository secrets `EMAIL_USER` and `EMAIL_PASS` that we need to set in the repository settings.
#   `github.repository` is the repository name.
#   `job.status` is the job status, like success, failure, cancelled.
#   `github.event.head_commit.message` is the last commit message.
#   `github.server_url` is the github server url.
#   `github.run_id` is the github run id. We combine these information to build the actions run url, let the receiver can check the details.
    - name: Send email notification
      uses: dawidd6/action-send-mail@v2
      with:
        server_address: smtp.gmail.com
        server_port: 465
        username: ${{secrets.EMAIL_USER}}
        password: ${{secrets.EMAIL_PASS}}
        subject: GitHub Actions job result for ${{github.repository}}
        body: |
          Job in ${{github.repository}} finished with status ${{job.status}}.
          
          Build job status: ${{ needs.build.result }}
          Push job status: ${{ needs.push.result }}
          
          Commit message: ${{ github.event.head_commit.message }}
          
          See details here: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        to: mister33221@gmail.com
        from: GitHub Actions
```

- In the `Send email notification` step, there are two secrets `EMAIL_USER` and `EMAIL_PASS` that we need to set in the repository settings.
    1. Here we use gmail, so we need to get the gmail access token.
    2. Go to your gmail account home page, use search bar to search `App passwords 應用程式密碼`. Generate a new password for the app. Copy the password.

    3. Go to your repository settings. Click on `Secrets and variables` > `Actions`. Down the page, you will see Repository secrets. Click on `New repository secret`. Add `EMAIL_USER` and `EMAIL_PASS` with your gmail address and password. Then you can use it in the workflow.

### Test the workflow

- In the repositorys action tab you will see the jobs running.
- After the jobs done. We will receive the mail.


## Conclusion

As always, I put my code on my [Github](https://github.com/mister33221/ninja-ddd-practice.git). You can check it out.
