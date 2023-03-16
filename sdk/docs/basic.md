# Getting Started
## Overview of Myback custom module
Myback custom module is implemented based on the idea that it mounts your React app to the Myback web page and get all the work done in browser. When you need to interact with Myback backend, the SDK will act as an interface to do so.

## The First step 
First you need to build Myback SDK and API Mocker in order to get started. Typing 
```bash
npm install
npm run build
```
commands in `api-mocker` & `sdk` & `template` directory.
Now you can start develop your Myback custom module in the template directory.
All the needed file is in the `template` directory.

## Overview of Myback SDK and template directory structure
Myback staerter kit, or files contain in `template` contains SDK and API mocker. SDK helps you to connect your application to Myback backend and access remote database by using Myback API. API mocker is a fake implementation of Myback API, you can use it to simulate the environment on Myback platform.
