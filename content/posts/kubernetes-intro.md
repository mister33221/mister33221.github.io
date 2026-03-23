---
title: "Kubernetes 核心概念入門"
date: "2022-09-30"
category: "DevOps"
tags: ["Kubernetes", "k8s", "Docker", "Container", "DevOps"]
summary: "從 Pod、Node、Master 到 Cluster，理解 Kubernetes 的四大核心元件與基本運作流程，以及如何搭配 Spring Boot 部署。"
published: true
---

## Kubernetes 能做什麼

使用 Kubernetes（k8s）主要達到三個目的：

- **Deployment**：同時將多個容器部署到多台機器
- **Scaling**：服務乘載量變化時，自動水平擴展或縮減容器數量
- **Management**：自動偵測並重啟故障的容器，維持服務穩定性

---

## 四大核心元件

Kubernetes 由小到大依序由四個元件組成：Pod → Worker Node → Master Node → Cluster。

### Pod

Kubernetes 的最小運作單位，通常對應一個應用服務。

- 每個 Pod 有自己的 yaml 設定檔（身分證）
- 一個 Pod 可以有多個 Container，但**建議一個 Pod 只放一個 Container**
- 同一個 Pod 的 Container 共享網路，彼此透過 `localhost` 溝通

#### Pod 生命週期

| 狀態 | 說明 |
|------|------|
| Pending | Pod 已被接受，但 Container 尚未完全啟動 |
| Running | Pod 與 Container 正常運行中 |
| Succeeded | Pod 正常結束，不會自動重啟 |
| Failed | 至少一個 Container 以異常方式結束 |
| Unknown | 通常發生在 Pod 與 Node 連線異常時 |

---

### Worker Node

對應一台實體或虛擬機器（例如 AWS EC2、GCP Compute Engine）。每個 Node 包含三個組件：

- **kubelet**：該 Node 的管理員，管理所有 Pod 狀態並與 Master 溝通
- **kube-proxy**：更新 Node 的 iptables，讓 Cluster 其他物件能得知該 Node 上的 Pod 狀態
- **Container Runtime**：真正執行容器的程式（例如 Docker Engine）

---

### Master Node

Kubernetes 的指揮中心，包含四個核心組件：

#### kube-apiserver
- 整個 Kubernetes 的 API 接口（Endpoint）
- `kubectl` 指令就是送到這裡
- 負責 Node 間的溝通橋樑，以及身份認證與授權

#### etcd
- 儲存整個 Cluster 的狀態資料
- Master 故障時可用來還原 Kubernetes 狀態

#### kube-controller-manager
- 運行各種 Controller（Node Controller、Replication Controller 等）
- 持續比對「預期狀態（desire state）」與「現有狀態（current state）」，有差異時自動更新

#### kube-scheduler
- Pod 調度員，決定新 Pod 要跑在哪個 Node 上
- 依照各 Node 的資源狀況、硬體限制等條件做最佳選擇

---

### Cluster

多個 Node 與 Master 的集合，也就是整個 Kubernetes 環境。

---

## Pod 建立的完整流程

一個 Pod 從指令到實際運行，流程如下：

```
使用者輸入 kubectl 指令
        ↓
身份認證
        ↓
kube-apiserver 接收指令，備份到 etcd
        ↓
controller-manager 確認資源後建立新 Pod
        ↓
scheduler 選出最適合的 Node
        ↓
kubelet 在該 Node 上啟動 Container
```

雖然流程看起來複雜，但實際操作只需要一行 `kubectl` 指令，後續全部自動完成。

---

## Spring Boot 搭配 k8s 部署

搭配 Docker Desktop for Windows，可以快速在本地建立 k8s 環境，並部署 Spring Boot 應用程式：

**1. 建立 Spring Boot Docker Image**

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**2. 建立 Deployment YAML**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: springboot-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: springboot-app
  template:
    metadata:
      labels:
        app: springboot-app
    spec:
      containers:
      - name: springboot-app
        image: your-image:latest
        ports:
        - containerPort: 8080
```

**3. 建立 Service（對外暴露）**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: springboot-service
spec:
  type: NodePort
  selector:
    app: springboot-app
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30080
```

**4. 部署**

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods  # 確認 Pod 狀態
```

---

## 參考資料

- [Kubernetes 基礎教學（一）原理介紹](https://cwhu.medium.com/kubernetes-basic-concept-tutorial-e033e3504ec0)
- [Day23 Kubernetes on Docker Desktop & Pod Lifetime](https://ithelp.ithome.com.tw/articles/10247441)
