---
title: "Linux Auth"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "* 使用 Docker 搭建 Linux 容器環境"
published: true
---

# Linux Auth

## 在 Windows 中模擬 Linux 環境進行練習

* 使用 Docker 搭建 Linux 容器環境

  * 安裝 Docker Desktop（支援 Windows 10 以上）
  * 使用指令快速啟動 Ubuntu 容器：`docker run -it --rm ubuntu`
  * 容器內可自由操作 Linux 指令，離開即清除環境
  * 適合安全地練習權限變更、不怕破壞系統


## Linux 權限教學文章大綱

### 一、前言

一直以來在使用 Linux 時，只有熟悉那些常常用到的指令，例如 `cp` `mv` `rm` `ll` 這些，知道 `ll` 最前面有一串奇怪的字串是權限，但是從來沒有了解他到底在做什麼

直到最近專案上線，很多鬼故事發生，在某些環境中，原本可以使用的指令，都突然出現 `permission denied`

Damn，到底是誰動了我的東西，怎麼以前可以的指令現在不行了。

一切都是權限在搞事，要想辦法弄回來。

所以...還是好好了解一下吧...

#### 為什麼權限管理在 Linux 中很重要？

Linux 是一個多使用者、多工的作業系統，權限管理是其核心安全機制。良好的權限管理能夠：

- **保護系統安全**：防止惡意或意外的檔案修改、刪除
- **確保資料隱私**：控制哪些使用者可以存取敏感資訊
- **維護系統穩定**：避免不當操作導致系統崩潰
- **符合法規要求**：企業環境中的資料保護與稽核需求

#### 常見場景

1. **多人共享伺服器環境**
   - 開發團隊共用開發機器
   - 不同專案需要隔離檔案存取權限
   - 防止誤刪他人檔案

2. **Web 服務器權限控制**
   - Web 應用程式檔案的存取權限
   - 資料庫檔案保護
   - 設定檔安全性

3. **系統管理與維運**
   - 系統設定檔保護
   - 服務帳號權限最小化
   - 日誌檔案的讀寫控制

### 二、基本概念

#### 使用者（User）與群組（Group）

**使用者（User）**：
- 每個檔案都有一個擁有者（owner）
- 使用者 ID（UID）是系統內部識別碼
- root 使用者的 UID 為 0，擁有最高權限
- 一般使用者 UID 通常從 1000 開始


**群組（Group）**：
- 使用者可以屬於一個或多個群組
- 群組 ID（GID）是系統內部識別碼
- 主要群組：使用者的預設群組
- 附加群組：使用者額外加入的群組


```bash
# 查看目前使用者資訊，包含 uid,gid,groups
whoami
id

# 查看使用者所屬群組
groups
groups username

# 查看系統所有使用者
cat /etc/passwd

# 查看系統所有群組
cat /etc/group
```

#### 檔案與目錄的屬性

每個檔案和目錄都有三種存取對象：
- **Owner（擁有者）**：檔案的擁有者
- **Group（群組）**：檔案所屬群組的成員
- **Others（其他人）**：系統上所有其他使用者

#### 權限種類

**基本權限**：
- **read (r)**：讀取權限
  - 檔案：可以查看檔案內容
  - 目錄：可以列出目錄內容（需搭配 execute 權限）
- **write (w)**：寫入權限
  - 檔案：可以修改檔案內容
  - 目錄：可以在目錄中建立、刪除、重命名檔案
- **execute (x)**：執行權限
  - 檔案：可以執行檔案（如程式、腳本）
  - 目錄：可以進入目錄（cd 指令）

### 三、權限表示法

#### 字母表示法

使用 `ls -l` 指令可以查看詳細權限資訊：

> 或是也可以使用縮寫 `ll`

```bash
$ ls -l
-rwxr-xr-- 1 user group 1024 Jun 7 10:30 example.txt
drwxr-xr-x 2 user group 4096 Jun 7 10:31 folder
```

權限字串解析：
```
-rwxr-xr--
│└┬┘└┬┘└┬┘
│ │  │  └── Others 權限 (r--)：只能讀取
│ │  └───── Group 權限 (r-x)：可讀取和執行
│ └──────── Owner 權限 (rwx)：可讀、寫、執行
└─────────── 檔案類型 (-：一般檔案, d：目錄 dictionary, l：符號連結 link)
```

**權限符號對照**：
- `r` = read（讀取）
- `w` = write（寫入）
- `x` = execute（執行）
- `-` = 沒有該權限

#### 數字表示法（八進位）

每個權限對應一個數字：
- `r` = 4
- `w` = 2  
- `x` = 1

三個數字分別代表 Owner、Group、Others 的權限：

| 數字 | 二進位 | 權限 | 說明 |
|------|--------|------|------|
| 0 | 000 | --- | 無任何權限 |
| 1 | 001 | --x | 只有執行權限 |
| 2 | 010 | -w- | 只有寫入權限 |
| 3 | 011 | -wx | 寫入 + 執行 |
| 4 | 100 | r-- | 只有讀取權限 |
| 5 | 101 | r-x | 讀取 + 執行 |
| 6 | 110 | rw- | 讀取 + 寫入 |
| 7 | 111 | rwx | 完全權限 |

**常見權限組合**：
- `755`：擁有者完全權限，群組和其他人可讀取和執行
- `644`：擁有者可讀寫，群組和其他人只能讀取
- `700`：只有擁有者有完全權限
- `600`：只有擁有者可讀寫

#### 特殊權限

**SetUID (SUID)**：
- 符號：`s` 在 owner 的 execute 位置
- 數字：在權限前加 `4`（如 4755）
- 功能：執行檔案時，暫時獲得檔案擁有者的權限
- 例子：`/usr/bin/passwd` 指令

**SetGID (SGID)**：
- 符號：`s` 在 group 的 execute 位置
- 數字：在權限前加 `2`（如 2755）
- 功能：
  - 檔案：執行時獲得檔案群組權限
  - 目錄：新建檔案自動繼承目錄的群組
  - 也就是說，無論誰執行它，都會以「檔案擁有者（這裡是 root）」的身份來執行
- 例子：`/usr/bin/passwd` 

**Sticky Bit**：
- 符號：`t` 在 others 的 execute 位置
- 數字：在權限前加 `1`（如 1755）
- 功能：
    - 所有人都可以寫入該目錄（777）
    - 但只能刪除自己建立的檔案
    - 其他人（即使有寫入權限）不能刪除或改動你建立的檔案
- 例子：`/tmp` 目錄

```bash
# 查看特殊權限範例
ls -l /usr/bin/passwd  # SUID
ls -ld /tmp           # Sticky bit
```

### 四、常用指令教學

#### `ls -l`：檢視檔案權限

```bash
# 查看目前目錄的詳細權限資訊
ls -l
# 等同 ll，以下的指令以 ls -l 開頭的，都可以改成 ll，例如 ls -la = ll -a
ll

# 查看特定檔案權限
ls -l filename.txt

# 查看目錄本身的權限（而非目錄內容）
ls -ld dirname

# 查看隱藏檔案權限
ls -la

# 以人類可讀格式顯示檔案大小
ls -lh
```

輸出解析：
```
-rw-r--r-- 1 user group 1024 Jun 7 10:30 file.txt
│    │     │  │    │     │    │         └── 檔案名稱
│    │     │  │    │     │    └─────────── 修改時間
│    │     │  │    │     └──────────────── 檔案大小
│    │     │  │    └────────────────────── 群組名稱
│    │     │  └─────────────────────────── 使用者名稱
│    │     └────────────────────────────── 硬連結數量
│    └──────────────────────────────────── 檔案權限(前三為 owner、中三為 group、後三維 others)
└───────────────────────────────────────── 檔案類型
```

> 硬連結
> 數量表示有多少個連結指向這個檔案，對於目錄來說，這個數字會包含子目錄的連結數。
> 假設我用 `touch` 建立一個 txt 檔案，使用 `ll` 時看到的硬連結束自為 1
> 再用 `ln` 建立一個硬連結的另外一個檔案，再使用 `ll`，就會看到這兩個檔案的硬連結數字變成 2
> 修改其中一個檔案，另外一個也會被做一樣的修改。因為實際上這兩個檔案是同一個。

#### `chmod`：變更權限

**數字模式**：
```bash
# 設定權限為 755 (rwxr-xr-x)
chmod 755 filename

# 設定權限為 644 (rw-r--r--)
chmod 644 filename

# 遞迴設定目錄及其內容權限
chmod -R 755 directory

# 設定特殊權限
chmod 4755 filename  # SUID + 755
chmod 2755 dirname   # SGID + 755
chmod 1755 dirname   # Sticky + 755
```

**符號模式**：
```bash
# 語法：chmod [who][operator][permission] filename
# who: u(user), g(group), o(others), a(all)
# operator: +(加入), -(移除), =(設定)
# permission: r(read), w(write), x(execute)

# 給予 owner 執行權限
chmod u+x filename

# 移除 group 寫入權限
chmod g-w filename

# 設定 others 只有讀取權限
chmod o=r filename

# 給所有人加入執行權限
chmod a+x filename
chmod +x filename  # 簡寫

# 組合使用
chmod u+rw,g+r,o-rwx filename
```

#### `chown`：變更檔案擁有者

```bash
# 語法：chown [owner][:group] filename

# 變更檔案擁有者
chown newuser filename

# 同時變更擁有者和群組
chown newuser:newgroup filename

# 只變更群組（使用冒號開頭）
chown :newgroup filename

# 遞迴變更目錄及其內容
chown -R newuser:newgroup directory

# 從參考檔案複製權限
chown --reference=ref_file target_file

# 變更符號連結本身的擁有者（而非目標檔案）
chown -h newuser symlink
```

#### `chgrp`：變更檔案群組

```bash
# 變更檔案群組
chgrp newgroup filename

# 遞迴變更
chgrp -R newgroup directory

# 從參考檔案複製群組
chgrp --reference=ref_file target_file

# 顯示變更過程
chgrp -v newgroup filename
```

#### `umask`：預設權限設定

umask 決定新建檔案和目錄的預設權限：

```bash
# 查看目前 umask 值
umask

# 查看 umask 的符號表示
umask -S

# 設定 umask（數字模式）
umask 022  # 新檔案權限 = 666-022 = 644
           # 新目錄權限 = 777-022 = 755

# 設定 umask（符號模式）
umask u=rwx,g=rx,o=rx

# 臨時設定 umask
umask 077  # 只有擁有者有權限

# 永久設定 umask（寫入 ~/.bashrc）
echo "umask 027" >> ~/.bashrc
```

**umask 計算範例**：
- 檔案預設最大權限：666 (rw-rw-rw-)
- 目錄預設最大權限：777 (rwxrwxrwx)
- umask 022：表示移除 group 和 others 的 write 權限
- 結果：檔案 644 (rw-r--r--)，目錄 755 (rwxr-xr-x)

### 五、進階權限管理

#### ACL（Access Control List）介紹與設定

傳統的 Linux 權限系統只能為檔案設定一個擁有者、一個群組和其他人的權限。ACL 提供更細緻的權限控制，可以為特定使用者或群組設定個別權限。

**ACL 的優勢**：
- 可以為多個不同使用者設定不同權限
- 不需要建立大量群組
- 更靈活的權限組合

**檢查 ACL 支援**：
```bash
# 檢查檔案系統是否支援 ACL
mount | grep acl

# 查看檔案是否有 ACL（ls -l 會顯示 + 號）
ls -l filename
-rw-rw-r--+ 1 user group 1024 Jun 7 10:30 filename
```

**ACL 基本指令**：

```bash
# 安裝 ACL 工具（Ubuntu/Debian）
sudo apt-get install acl

# 查看檔案的 ACL 設定
getfacl filename
getfacl directory

# 設定使用者權限
setfacl -m u:username:rwx filename    # 給予特定使用者 rwx 權限
setfacl -m u:alice:r-- filename       # 給予 alice 只讀權限

# 設定群組權限
setfacl -m g:groupname:rw- filename   # 給予特定群組 rw 權限

# 設定預設 ACL（針對目錄，新檔案會繼承）
setfacl -d -m u:username:rwx directory

# 移除特定 ACL
setfacl -x u:username filename        # 移除特定使用者的 ACL
setfacl -x g:groupname filename       # 移除特定群組的 ACL

# 移除所有 ACL
setfacl -b filename

# 遞迴設定 ACL
setfacl -R -m u:username:rwx directory

# 從檔案讀取 ACL 設定
setfacl --set-file=acl_rules.txt filename
```

**ACL 實用範例**：
```bash
# 情境：讓 alice 可以讀寫專案目錄，bob 只能讀取
setfacl -m u:alice:rwx project_dir
setfacl -m u:bob:r-x project_dir
setfacl -d -m u:alice:rwx project_dir  # 預設權限
setfacl -d -m u:bob:r-x project_dir

# 備份和還原 ACL
getfacl -R directory > acl_backup.txt
setfacl --restore=acl_backup.txt
```

### 六、實作範例

#### 建立使用者與群組並設計權限實例

**情境**：建立一個專案開發環境，有三種角色：
- 專案經理（project_manager）：完全存取權限
- 開發人員（developers）：可讀寫程式碼，不能修改設定
- 測試人員（testers）：只能讀取和執行，不能修改

```bash
# 1. 建立群組
groupadd project_managers
groupadd developers  
groupadd testers

# 2. 建立使用者並加入群組
## -m：就是 --create-home 的縮寫，預設建立 /home/使用者名稱 的路徑，沒有加 -m 的話，有些系統四射不會幫你建立 home 目錄
## -G：就是 --groups 的縮寫，把使用者加入指定的附加群組，一次可以多個 group，用逗號隔開就好
useradd -m -G project_managers alice
useradd -m -G developers bob
useradd -m -G developers charlie
useradd -m -G testers david

# 3. 設定密碼
passwd alice
passwd bob
passwd charlie
passwd david

# 4. 建立專案目錄結構
## -p：即 parant，遞迴建立資料夾
## {xxx,xxxx}：只建立多個子目錄
mkdir -p /project/{src,config,docs,bin}
chown -R alice:project_managers /project

# 5. 設定目錄權限
# 專案根目錄：專案經理完全權限，其他群組可進入
chmod 755 /project

# 原始碼目錄：開發人員可讀寫，測試人員只讀
chgrp developers /project/src
chmod 775 /project/src
setfacl -m g:testers:r-x /project/src

# 設定目錄：只有專案經理可修改
chmod 750 /project/config
setfacl -m g:developers:r-x /project/config
setfacl -m g:testers:r-x /project/config

# 文件目錄：所有人可讀，開發人員和專案經理可寫
chgrp developers /project/docs
chmod 775 /project/docs
setfacl -m g:testers:r-x /project/docs

# 執行檔目錄：所有人可執行，專案經理可修改
chmod 755 /project/bin
setfacl -m g:developers:r-x /project/bin
setfacl -m g:testers:r-x /project/bin

# 6. 設定預設 ACL（新檔案自動繼承權限）
setfacl -d -m g:developers:rw- /project/src
setfacl -d -m g:testers:r-- /project/src
```

#### 權限錯誤排除範例

**常見問題 1：無法進入目錄**
```bash
# 錯誤：Permission denied when trying to cd into directory
cd: permission denied: /some/directory

# 診斷步驟：
ls -ld /some/directory          # 檢查目錄權限
ls -ld /some                    # 檢查上層目錄權限
getfacl /some/directory         # 檢查 ACL

# 解決方案：確保目錄有 execute 權限
sudo chmod +x /some/directory
```

**常見問題 2：無法建立檔案**
```bash
# 錯誤：無法在目錄中建立檔案
touch: cannot touch 'newfile': Permission denied

# 診斷步驟：
ls -ld .                        # 檢查目錄權限
id                              # 檢查使用者和群組
df -h .                         # 檢查磁碟空間

# 解決方案：確保目錄有 write 權限
sudo chmod g+w .
```

**常見問題 3：無法執行檔案**
```bash
# 錯誤：程式無法執行
bash: ./script.sh: Permission denied

# 診斷步驟：
ls -l script.sh                 # 檢查檔案權限
file script.sh                  # 檢查檔案類型

# 解決方案：加入執行權限
chmod +x script.sh
```

**常見問題 4：權限看起來正確但仍無法存取**
```bash
# 可能原因：SELinux 或 AppArmor 限制
# 診斷：
getenforce                      # 檢查 SELinux 狀態
ausearch -m AVC -ts recent      # 查看 SELinux 拒絕日誌
sudo apparmor_status            # 檢查 AppArmor 狀態

# 暫時解決：
sudo setenforce 0              # 暫時停用 SELinux
sudo aa-complain /path/to/program  # AppArmor 警告模式
```

#### 使用 `find` 搭配權限查找異常檔案

```bash
# 尋找權限過於寬鬆的檔案
# 1. 找出所有人都可寫入的檔案（潛在安全風險）
find /home -type f -perm -o+w 2>/dev/null

# 2. 找出 SUID 檔案（需要特別注意）
find /usr -type f -perm -4000 2>/dev/null

# 3. 找出 SGID 檔案
find /usr -type f -perm -2000 2>/dev/null

# 4. 找出沒有擁有者的檔案
find /home -nouser 2>/dev/null

# 5. 找出沒有群組的檔案
find /home -nogroup 2>/dev/null

# 尋找特定權限的檔案
# 6. 找出權限為 777 的檔案（完全開放）
find /home -type f -perm 777 2>/dev/null

# 7. 找出權限為 666 的檔案（所有人可讀寫）
find /home -type f -perm 666 2>/dev/null

# 8. 找出擁有者可執行的檔案
find /home -type f -perm -u+x 2>/dev/null

# 尋找最近修改的檔案並檢查權限
# 9. 找出最近 7 天修改且權限異常的檔案
find /var/log -type f -mtime -7 -perm -o+w 2>/dev/null

# 10. 找出大於 100MB 且所有人可讀的檔案
find /home -type f -size +100M -perm -o+r 2>/dev/null

# 批次修復權限問題
# 11. 將所有 .txt 檔案設為 644 權限
find /home/user -name "*.txt" -type f -exec chmod 644 {} \;

# 12. 將所有目錄設為 755 權限
find /home/user -type d -exec chmod 755 {} \;

# 13. 移除所有人的寫入權限（除了擁有者）
find /home/user -type f -exec chmod o-w {} \;

# 生成權限報告
# 14. 生成目錄權限報告
find /project -exec ls -ld {} \; > permissions_report.txt

# 15. 找出可能的安全問題並記錄
{
  echo "=== SUID Files ==="
  find /usr -type f -perm -4000 2>/dev/null
  echo "=== World Writable Files ==="
  find /home -type f -perm -o+w 2>/dev/null
  echo "=== No Owner Files ==="
  find /home -nouser 2>/dev/null
} > security_audit.txt
```

### 七、最佳實踐與建議

#### 最小權限原則（Principle of Least Privilege）

**核心概念**：只給予使用者完成工作所需的最少權限，降低安全風險。

**實踐方法**：

1. **使用者權限設計**：
```bash
# 不好的做法：直接給予 777 權限
chmod 777 /shared/data  # 所有人完全權限

# 好的做法：針對需求設計權限
chmod 750 /shared/data          # 擁有者和群組權限
setfacl -m u:alice:rw- /shared/data    # 給特定使用者讀寫權限
setfacl -m u:bob:r-- /shared/data      # 給特定使用者只讀權限
```

2. **服務帳號管理**：
```bash
# 為服務建立專用使用者（無法登入）
useradd -r -s /bin/false webapp_user
useradd -r -s /bin/false database_user

# 設定服務檔案權限
chown webapp_user:webapp_user /var/www/app
chmod 750 /var/www/app
```

3. **目錄權限規劃**：
```bash
# 分層權限設計
/project/                    # 755 - 專案根目錄
├── src/                     # 770 - 開發人員讀寫
├── config/                  # 750 - 管理員專用
├── public/                  # 755 - 公開讀取
└── logs/                    # 750 - 管理員和服務讀寫
```

#### 避免使用 root 身份操作

**為什麼要避免**：
- root 權限過大，誤操作可能損壞系統
- 安全審計困難
- 不符合最小權限原則

**替代方案**：

1. **使用 sudo 進行特權操作**：
```bash
# 設定 sudo 權限（編輯 /etc/sudoers）
sudo visudo

# 給予特定使用者特定指令權限
alice ALL=(ALL) /bin/systemctl restart apache2
bob ALL=(ALL) NOPASSWD: /usr/bin/tail -f /var/log/apache2/*

# 給予群組權限
%developers ALL=(ALL) /usr/bin/docker
```

2. **使用 su 切換使用者**：
```bash
# 切換到特定使用者
su - webapp_user

# 執行特定指令後返回
su -c "systemctl status apache2" root
```

3. **使用服務帳號執行應用程式**：
```bash
# 以特定使用者身份執行服務
sudo -u webapp_user /usr/bin/python3 /var/www/app/app.py

# 設定 systemd 服務使用非 root 使用者
# /etc/systemd/system/myapp.service
[Service]
User=webapp_user
Group=webapp_user
ExecStart=/usr/bin/python3 /var/www/app/app.py
```

###### Tags: `Linux`, `Permissions`, `Security`, `ACL`, `Best Practices` `Uncategorized`
