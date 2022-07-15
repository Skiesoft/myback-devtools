# Getting started with Myback SDK
To get started, copy the `template` directory from the repository and everyting is good to go. The directory structure should look like a React app.

## Overview of Myback custom module
Myback custom module is implemented based on the idea that it mounts your React app to the Myback web page and get all the work done in browser. When you need to interact with Myback backend, the SDK will act as a helper to do so.
Overall, your job is to focus on using React to create a custom feature for Myback and utilize the SDK in this process.

# Hand on Myback SDK
First you need to build Myback SDK and API Mocker in order to get started. Typing 
```bash
npm install
npm run build
```
commands in `api-mocker` & `sdk` & `template` directory.
Now you can start develop your Myback custom module in the template directory.

Now you are ready to develop your own custom module. All the needed file is in the `template` directory.

## Overview of Myback SDK and template directory structure
Myback staerter kit, or files contain in `template` contains SDK and API mocker. SDK helps you to connect your application to Myback backend and access remote database by using Myback API. API mocker is a fake implementation of Myback API, you can use it to simulate the environment on Myback platform.
