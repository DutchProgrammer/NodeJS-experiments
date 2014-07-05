NodeJS-experiments
=========
In this repository you get all kind of fun experiments with NodeJS


Requirements
----
  - Express
  - Socket.io
  
  ```sh
sudo npm install
```


BroadCast Mouse Position
----

In this folder you will find an NodeJS experiment to broadcast your mouse position, mouse click and scroll to all the other clients.

Demo
----
[Broadcast Mouse position Demo](http://dutchprogrammer.nl:9002/)


How to start
----
  All experiments can be start with the main.js
```sh
sudo nodejs main.js
```
  
Problems and fixes
----

When you got problems with ubuntu server because it can't find the node command execute the following line:

```sh
sudo update-alternatives --install /usr/sbin/node node /usr/bin/nodejs 99
```
