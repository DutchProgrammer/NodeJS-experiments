Small LoginSystem
=========
A small login system in NodeJS with mysql and with permissions. Users can register and login and an hidden Admin Page.

Requirements
----
  - AngularJS
  - Express
  - MySQL
  - Express
  - Socket.io
  - NodeMailer
  
  ```sh
sudo npm install
```

Demo
----
[Small LoginSystem Demo](http://dutchprogrammer.nl:9003/)


How to start
----
This experiments can be start with the smallLoginSystem.js
```sh
sudo nodejs smallLoginSystem.js
```
  How to start this chat as an service:
----

  
 ```sh
 sudo forever start -l forever.log -o out.log -e err.log -a smallLoginSystem.js
  ```
  
Problems and fixes
----

When you got problems with ubuntu server because it can't find the node command execute the following line:

```sh
sudo update-alternatives --install /usr/sbin/node node /usr/bin/nodejs 99
```
