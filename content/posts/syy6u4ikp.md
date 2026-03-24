---
title: "Set a key-value pair"
date: "2026-03-24"
category: "Java"
tags: ["Java", "Concurrency"]
summary: "- Redis is an open source (BSD licensed), in-memory(內存) data structure store, used as a database"
published: true
---


## What is Redis?

- Redis is an open source (BSD licensed), in-memory(內存) data structure store, used as a database, cache(暫存) and message broker(消息). It supports data structures such as strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs, geospatial indexes with radius queries and streams.

- In early years, we usually use transactional database like MySQL, Oracle, etc. to store data. But as the data grows, the performance of these databases will be worse and worse. Because the data is stored in the disk, and the disk IO is much slower than the memory. So we need to find a way to store the data in the memory. Redis is a good choice. Because it is a in-memory database.

### The pros and cons of Redis

- Pros:
  - Efficient because it is a in-memory database.
  - key-value database, so it is easy to use.
  - Redis supports many data structures.
  - Redis supports persistence.
  - Redis has atomic operations, so the transaction is safe.
- Cons:
  - Redis is a in-memory database, it means if the data is too large, it will cost a lot of memory. And when the server restart, the data will be lost.
  - Redis is single-threaded, so it is not suitable for a high concurrency environment.
  - Data is limited by memory size, so it is not suitable for a large amount of data.
  - Redis supports persistence, so it is not suitable for a temporary database.

### Redis data structure

- Redis has 5 basic data structures: 
  - String(字串)
  - List(列表)
  - Set(集合)
  - Sorted Set(有序集合)
  - Hash(哈希表)
- And it also has 5 high-level data structures:
  - Stream(流)
  - Geospatial(地理空間)
  - HyperLogLog
  - Bitmaps(位圖)
  - Bitfields(位域)

### Interaction with Redis

- There are three way to interact with Redis:
  - Redis CLI
  - API
  - GUI(Redisinsight)

## Redis CLI

### Install Redis by Docker

- Pull the Redis image from Docker Hub and specify the port to 6379.
- `-d` means run the container in the background.
- `-p` means publish a container's port(s) to the host.
- `--name` means assign a name to the container.
- `redis` is the name of the image.
- `redis` is the name of the container.
```bash
docker run -d -p 6379:6379 --name redis redis
```

### Install Redisinsight by Docker

- Redisinsight is a GUI tool for Redis. It can help us to manage the Redis easily.
- Pull the Redisinsight image from Docker Hub and specify the port to 8001.
- `-d` means run the container in the background.
- `-p` means publish a container's port(s) to the host.
- `--name` means assign a name to the container.
- `redisinsight` is the name of the image.
- `redisinsight` is the name of the container.
- `redislabs/redisinsight` is the image name.
```bash
docker run -d -p 8001:8001 --name redisinsight redislabs/redisinsight
```
- Open the browser and go to `http://localhost:8001/` to use Redisinsight.
- Now we are going to connect to the Redis server.
- Because in the previous step, we have already run the Redis server in the Docker container, so we can use the `host.docker.internal` to connect to the Redis server.
- So the connection setting should be like:
  - Host: `host.docker.internal`
  - Port: `6379`
  - Password: `<anything you want>`

## Command

### String

- In redis, the string is a binary safe string. It means we can store any type of data in the string.
- In redis, uppercase and lowercase are different.

#### Command

```bash
# Set a key-value pair
SET <key> <value>

# Get the value of a key
GET <key>

# Delete a key
DEL <key>

# Check if a key exists. Returns 1 if the key exists, 0 otherwise
EXISTS <key>

# Get all keys
KEYS *

# Get keys that match a pattern. This command gets all keys ending with 'me'
KEYS *me

# Delete all keys
FLUSHALL

# Redis uses binary safe strings, so the default encoding is English. If we set the value to Chinese, it will show '\xe4\xb8\xad\xe6\x96\x87'.
# There is a way to solve this problem in redis-cli. Enter redis-cli and use the '--raw' option.
redis-cli --raw

# Check the time to live of a key. Returns -1 if the key does not have a time to live. Returns -2 if the key does not exist.
TTL <key>

# Set the time to live of a key. Returns -2 if the key does not exist.
EXPIRE <key> <seconds>

# Set a key-value pair with a time to live. Returns 0 if the key already exists.
SETEX <key> <seconds> <value>

# Set a key-value pair only if the key does not exist.
SETNX <key> <value>
```

### List

- In redis, the list is a linked list. It means we can insert the value at the head or the tail of the list.
- Insert the value at the head of the list.

#### Command

```bash
# Insert the value at the head of the list
LPUSH <key> <value>

# Insert the value at the tail of the list
RPUSH <key> <value>

# Get the values from the list within a range
LRANGE <key> <start> <end>

# Get the length of the list
LLEN <key>

# Get the value from the head of the list and remove it. It can also remove a number of values.
LPOP <key>
LPOP <key> <count>

# Get the value from the tail of the list and remove it. It can also remove a number of values.
RPOP <key>
RPOP <key> <count>

# Insert the new value before the existing value in the list
LINSERT <key> BEFORE <value> <new value>

# Only keep the values in the list within a range
LTRIM <key> <keep start index> <keep end index>
```

### Set

- In redis, the set is a unordered collection of strings. It means we can not insert the value at the head or the tail of the set.
- You can't insert the repeated value to the set.

#### Command
```bash
# Add a value to the set
SADD <key> <value>

# Get all the values from the set
SMEMBERS <key>

# Get the number of elements in the set
SCARD <key>

# Remove a value from the set
SREM <key> <value>

# Check if a value is in the set. Returns 1 if the value is in the set, 0 otherwise
SISMEMBER <key> <value>
```

### Sorted Set

- The sorted set is a ordered collection of elements.
- Every is the unique value, but the score can be repeated.

#### Command

**TODO:**

### Hash

- The hash is a collection of field-value pairs.

#### Command

**TODO:**

## Publish/Subscribe

- We can use the publish/subscribe to send the message to the channel.
- But there are some cons about the publish/subscribe:
  - The message won't be persisted. (We can use the stream to solve this problem.)
  
### Command

```bash
# Subscribe to a channel
SUBSCRIBE <channel>

# Publish a message to a channel with another cmd
PUBLISH <channel> <message>

# Unsubscribe from a channel
UNSUBSCRIBE <channel>

# Unsubscribe from all channels
UNSUBSCRIBE
```

## Stream

- Stream is a new data structure in Redis 5.0. It is a log data structure.
- It's a lightweight data structure which can be used to store a large amount of data. This feature solves the pub/sub's problem.

### Command

- Basic operation
```bash
# Use the XADD command to add a message to the stream
XADD geekhour * course redis
XADD geekhour * course java
XADD geekhour * course springboot

# Use the XLEN command to get the length of the stream
XLEN geekhour

# Use the XRANGE command to get the messages from the stream
XRANGE geekhour - +

# Use the XDEL command to delete the message from the stream
XDEL geekhour <id>

# Use the XTRIM command to trim the stream, and the MAXLEN 0 means delete all the messages
XTRIM geekhour MAXLEN 0
```

- Let's publish/subscribe the message to the stream
```bash
# Add some messages to the stream
XADD geekhour * course redis
XADD geekhour * course java
XADD geekhour * course springboot

# get the messages from the stream
XRANGE geekhour - +

# Get the geekhour stream data.The last parameter is specify which id to start from(not include the id). 0 means start from the beginning. $ means start from the end.
# structure is XREAD COUNT <how many messages> BLOCK <wait time> STREAMS <stream name> <id>
XREAD COUNT 2 BLOCK 2000 STREAMS geekhour 0

# Use $ sign to get the new message and add the wait time to 100000
XREAD COUNT 2 BLOCK 10000 STREAMS geekhour $

# Open another terminal and use the XADD command to add a message to the stream. And you will see the message in the previous terminal show up.
docker exec -it redis redis-cli

XADD geekhour * course springcloud

```
- Subscribe group
```bash
# Create a group named geekhour-group
XGROUP CREATE geekhour geekhour-group 0-0 MKSTREAM

# Use XINFO GROUPS command to get the information of the group
XINFO GROUPS geekhour

# And then we create 2 consumers in the group
XGROUP CREATECONSUMER geekhour geekhour-group consumer-1
XGROUP CREATECONSUMER geekhour geekhour-group consumer-2

# Look at the information of the group again
XINFO GROUPS geekhour

# Use the XREADGROUP command to use specified consumer to read the message from the stream
# The structure is XREADGROUP GROUP <group name> <consumer name> COUNT <how many messages> BLOCK <wait time> STREAMS <stream name> <id>，`>` means start from the last message
XREADGROUP GROUP geekhour-group consumer-1 COUNT 2 BLOCK 2000 STREAMS geekhour >
```

## Geospatial

- Geospatial is a new data structure in Redis 3.2. It is a data structure for storing geospatial data.
- Geospatial provides many feature, like calculating the distance between two points, getting the points within a circle, getting the points within a rectangle, etc.

### Command

```bash
# Add the geospatial data to the key
# GEOADD <key> <longitude> <latitude> <member>
GEOADD city 116.405285 39.904989 beijing
GEOADD city 121.472644 31.231706 shanghai
GEOADD city 113.264435 23.129163 guangzhou

# Get the geospatial data from the key
# GEORADIUS <key> <longitude> <latitude> <radius> <unit>
GEORADIUS city 116.405285 39.904989 1000 km

# Get the distance between two points
# GEODIST <key> <member1> <member2> <unit>
GEODIST city beijing shanghai km

# Use search to get the geospatial data
# GEOSEARCH <key> FROMMEMBER <member> BYRADIUS <radius> <unit>
GEOSEARCH city FROMMEMBER beijing BYRADIUS 1000 km
```

## HyperLogLog

- HyperLogLog is a Probabilistic data structures(概率型資料結構). It is used to count the number of unique values in a set.
- HyperLogLog is a space-efficient(節省空間) data structure. It can use a small amount of memory to store a large amount of data. 
- But HyperLogLog is not accurate. It can only get the approximate number of unique values.
- Hyperloglog can't get the value you add to it. It can only get the number of unique values. 

### Command

```bash
# Add the value to the HyperLogLog
# PFADD <key> <value>
PFADD user A B C D E F G H I J K L 

# Get the number of unique values
# PFCOUNT <key>
PFCOUNT user

# Get the data structure of the HyperLogLog


## Add another value to the HyperLogLog
PFADD user2:1 1
PFADD user2:1 2
PFADD user2:1 3

# Merge the HyperLogLog
# PFMERGE <destkey> <sourcekey> [<sourcekey> ...]
PFMERGE result user:1 user2:1

# Get the number of unique values
```

## Bitmaps

- Bitmaps is extention of string. It is used to store the binary data.
- It usually used to store the status of something. Like check if the user has logged in, check if the user has liked the post, etc.

### Command

```bash
# Set the value of the bit at offset in the string value stored at key
# SETBIT <key> <offset> <value>
SETBIT user 0 1
SETBIT user 1 0

# Get the value of the bit at offset in the string value stored at key
# GETBIT <key> <offset>
GETBIT user 0

# Get the number of bits that are set to 1 in a string
# BITCOUNT <key> 
BITCOUNT user

# Get the first bit set to 1 or 0 in a string
# BITPOS <key> <bit> [<start> [<end>]]
BITPOS user 1
```

## Bitfields

**TODO**

## Transaction

- The transaction in Redis use `multi` and `exec` to wrap the commands as a queue. And then execute the commands in the queue.
- In RDBMS(Relational Database Management System關聯式資料庫), the transaction is ACID(Atomicity(原子性), Consistency(一致性), Isolation(隔離性), Durability(持久性)). All the commands in the transaction will be executed or none of them will be executed.
- But in Redis, the transaction is not ACID. If there is a error in the transaction, the commands before the error will be executed, and the commands after the error will not be executed.
- Redis promise there three things in the transaction:
  - Before the `exec` command, all the commands will be executed in the queue.
  - The commands in the transaction will be executed atomically. It means the commands in the transaction will not be interrupted by other commands.
  - The commands in the transaction will be executed without interruption. Event when a new command is executed, the commands in the transaction will not be interrupted. The new command won't be executed until the transaction is finished.

### Command

```bash
# Use the multi command to start a transaction
MULTI

# Set some key-value pairs in the transaction
SET user1 1
SET user2 2
SET user3 3

# Open another terminal and try to get the value of the key. You will find that the value is not set yet.
docker exec -it redis redis-cli
GET user1

# Use the exec command to execute the transaction in original terminal
EXEC

# Now you can get the value of the key in the new terminal
GET user1
```
- You can try to create a `SET` error and inspect the result. You will find only the command has no error will be executed.

## Persistence

- Redis stores the data in the memory, so the data will be lost when the server down.
- So Redis provides two ways to persist the data:
  - RDB(Redis Database File)
    - It means Redis will create a snapshot of the data and write it to the disk in a specified time interval.
    - We usually use this way to persist the backup data.
    - Normally, we will give redis big memory, so when we persist the data from in-memory database to disk, it will cost a lot of time. In this time, the server will be blocked. So Redis provides a command call `bgsave`.
    - `bgsave` will create a child process to persist the data to decrease the time of blocking the server. But it still will block the server for a short time. So Redis AOF.
  - AOF(Append Only File)
    - AOF is a log file. Redis will write the commands to the AOF file when the commands are executed.
    - When the server restart, Redis will read the commands from the AOF file and execute them to restore the data.

### RDB

- We can modify the the `save` and `stop-writes-on-bgsave-error` in the `redis.conf` to change the behavior of the RDB.
```conf
# The save command is used to specify when to create a snapshot of the data.
# <second> <changes> means create a snapshot if there are <changes> changes in <second> seconds.

# Save <second> <changes> [Save <second> <changes> ...]
```
- Or we can use the `save` command in the redis-cli to change the behavior of the RDB.
```bash
# Create a change
Set k1 v1

# then exit 
exit

# Us `ls -ltr` to check the file
ls -ltr

# Use  xxd to check the snapshot file
xxd dump.rdb
```

### AOF

- We can modify the the `appendonly` in the `redis.conf` to change the the value from `no` to `yes` to enable the AOF.
```conf
# Append only mode is used to specify whether to enable the AOF.
# appendonly no
appendonly yes
```

## Replication

- Replication is used to create a backup of the data.
- There are two types of redis node:
  - Master
    - One master node can have multiple slave nodes.
    - Responsible for writing data.
    - Use asynchronous replication to replicate the data to the slave node.
  - Slave
    - One slave node can only have one master node.
    - Responsible for reading data.

### Master/Slave setup

- After we installed the redis, in `conf` directory, there is a `redis.conf` file. This is a default configuration file for redis.
- Copy the `redis.conf` file and rename it to `redis-slave-6380.conf`.
- Open the `redis-slave.conf` file and modify the value like below:
```conf
# Specify the port of the redis-slave
port 6380

# Specify the pid file of the redis-slave
pidfile /var/run/redis_6380.pid

# Specify the directory of the redis-slave
dir ./slave

# Specify the slaveof whcih is about the master node
slaveof <master ip> <master port>
```
- Run the redis-master and redis-slave
```bash
# Run the redis-master
bin/redis-server conf/redis.conf

# Run the redis-slave
bin/redis-server conf/redis-slave.conf
```
- Use `redis-cli` to connect to the redis-master and redis-slave
```bash
# Connect to the redis-master
bin/redis-cli -p 6379

# Connect to the redis-slave
bin/redis-cli -p 6380
```
- Use `info replication` to check the replication information in master and slave.
```bash
info replication
```
- Use `set` command to set the value in master and use `get` command to get the value in slave. You will find that the value in slave is the same as the value in master.
```bash
# Set the value in master
set k1 v1

# Get the value in slave
get k1
```


## Reference

- [一小时Redis教程]([https://redis.io/](https://www.youtube.com/watch?v=WgpP7-XAI5Y))
- [程式員隨手筆記 Redis:master/slave](https://stevenitlife.blogspot.com/2018/09/redis-master-slave.html)
