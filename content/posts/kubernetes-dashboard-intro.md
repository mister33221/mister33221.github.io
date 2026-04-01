---
title: "What is kubernetes dashboard?"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to"
published: true
---

{%hackmd BJzAwtWvp %}
## What is kubernetes dashboard?

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to manage applications running in the cluster and troubleshoot them, as well as manage the cluster itself.

## Let's deploy kubernetes dashboard

1. Install kubernetes dashboard pod

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

2. Create a service account yaml named `admin-user-service-account.yaml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
```

2. Create a cluster role binding yaml named `admin-user-cluster-role-binding.yaml`

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

3. Apply the yaml files

```bash
kubectl apply -f admin-user-service-account.yaml
kubectl apply -f admin-user-cluster-role-binding.yaml
```

4. Get the token 
```bash
kubectl -n kubernetes-dashboard create serviceaccount admin-user
```
**IMPORTANT NOTE VERSION 1.24+**
    - Before this version, when you create a service account, it will create a token for this service account automatically. 
    - After this version, when you create a service account, it will not create a token for this service account automatically. You need to create a secret object for this service account manually. Like below:
```bash
kubectl create secret token <service-account-name>
```

- Record the token, we will use it later.

5. Create a proxy to access the dashboard
- This command means
    - `port-forward` create a port to transfor.
    - `-n kubernetes-dashboard` specify which service we are going to transfer.
    - `8080:443` specify that we are going to let our 8080 transfer to kubernetes-dashboard 443 port in kubernetes cluster.
```bash
kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8080:443
```

6. Access the dashboard
- Open the browser and access `https://localhost:8080`
- Paste the token from previous output.

wala, we can access the dashboard now.
