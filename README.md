<h1 align="center">
  <br>
   <a ><img src="https://user-images.githubusercontent.com/62745858/229376399-edede393-f1e7-4e91-8c68-d76510ece76f.png" width="100"></a><br>
   React Native Chat App
   
   ![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
   ![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
   ![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
</h1>

<p align="center">
  <a href="#ℹ%EF%B8%8F-introduction">Introduction</a> •
  <a href="#features">Features</a> •
  <a href="#installation-guide">Installation Guide</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a> •
  <a href="#contributors">Contributors</a> 
</p>

<div align="center">

![GitHub Repo stars](https://img.shields.io/github/stars/Ctere1/react-native-chat?style=social)
![GitHub forks](https://img.shields.io/github/forks/Ctere1/react-native-chat?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Ctere1/react-native-chat?style=social)

</div>



## ℹ️ Introduction

- Real Time Chat Application that written in [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) platform.
- It uses [Firebase](https://firebase.google.com/) (Web version 9) realtime database.
- For the report see [Rapor.pdf](https://github.com/Ctere1/react-native-chat/blob/master/RAPOR.pdf).     
- For figma design see [Figma.pdf](https://github.com/Ctere1/react-native-chat/blob/master/Figma.pdf).   
- ~For the live demo video see [Demo.mp4](https://github.com/Ctere1/react-native-chat/blob/master/ReactNativeChat-Live-Demo.mp4).~
- Live demo video:    

https://github.com/Ctere1/react-native-chat/assets/62745858/bcde4aa0-d2f2-4d8c-8716-bf274c059d2e          
  

>[!Note]  
  You can check the screenshots below

 
## ⚡Features
 
 | Feature                    | Description                                                                                            |    
 | :------------------------  | :--------------------------------------------------------------------------------------------------    |
 | `Signup and Login`         |   Firebase Email/Password sign-in method. Allow users to sign up using their email address and password|
 | `Send Text Message`        |   Essential for casual messaging                                                                       |
 | `Send Picture`             |   You can send pictures without losing quality                                                         |
 | `Group Chat`               |   You can send your messages to multiple people at the same time                                       |
 | `Delete Chat`              |   You can delete chats after holding and selecting them                                                |
 | `Delete Account`           |   You can delete your account                                                                          |
 | `Real Time Chat`           |   The last incoming message will be placed at the top of the chat screen                               |
 | `Users List`               |   Registered users sorted by alphabetical index (A -> Z)                                               |
 | `Note to Self`             |   You can also take notes by sending a message to yourself                                             |

## 💾Installation Guide
 
 To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com))    installed on your computer. 
 
 ```bash
 # Clone this repository
 $ git clone https://github.com/Ctere1/react-native-chat
 # Go into the repository
 $ cd react-native-chat
 # Install dependencies
 $ npm install
 ```

 > For running the app:
 ```bash
 # Go into the repository
 $ cd react-native-chat
 # Run the expo
 $ expo start
 ```
 
 > [!Warning] 
   Do not forget to setup `.env` file for Firebase connection. Please see the [doc](https://firebase.google.com/docs/firestore/quickstart).


## 🪟Screenshots

### **Login-Signup Pages**
| User can login      |  User can signup    |  
| :-----------------: | :-----------------: |
| <img src="https://user-images.githubusercontent.com/62745858/229377832-f0987252-55c7-4293-95f5-871d02e19e27.png"  width="250">        |  <img src="https://user-images.githubusercontent.com/62745858/229377844-75e5815a-fef7-4fc1-a9bd-c00cae2a2e7e.png"  width="250">                                 |


### **Chats Page**
| User can access chats   |  User can see all users   |  User can create new group chat      |  User can delete chats     | 
| :--------------------:  | :-----------------------: | :----------------------------------: | :------------------------: |
| <img src="https://user-images.githubusercontent.com/62745858/229378355-aaf9e2b4-e4c6-4ab8-b915-ae0bd9ed0332.png"  width="250">        |  <img src="https://user-images.githubusercontent.com/62745858/229378356-3bf317cc-dc9b-4f99-b542-c6160b7dcd5d.png"  width="250">                                 |  <img src="https://user-images.githubusercontent.com/62745858/229378358-14ed60d2-7fef-4ead-ba1c-8a0f51ac4707.png"  width="250">                                 |  <img src="https://user-images.githubusercontent.com/62745858/229588078-6df974e4-7bef-4215-aa79-eafc6d680d63.png"  width="250">  


### **Settings Page**
| User can access settings |  User can see the profile section |  User can see the help section  | User can see the account section  | 
| :----------------------: | :-------------------------------: | :-----------------------------: | :-------------------------------: |
| <img src="https://user-images.githubusercontent.com/62745858/229378800-6df72401-545e-4dac-887e-02596a114987.png"  width="250">        |  <img src="https://user-images.githubusercontent.com/62745858/229378809-84d2196f-38d4-41f5-96af-92a4a4edb926.png"  width="250">                                 |  <img src="https://user-images.githubusercontent.com/62745858/229378815-42c7d883-cb05-45ab-901a-e54d98626906.png"  width="250">                                 |  <img src="https://user-images.githubusercontent.com/62745858/229378826-0140102a-e98c-4db8-bb87-a300c2dba982.png"  width="250">  


### **Chat Page**
| Emoji Panel        | Note to Self       | Main Chat Screen   |            
| :----------------: | :----------------: | :----------------: |
| <img src="https://user-images.githubusercontent.com/62745858/229378919-8329b3da-a2c4-4a79-9ee9-ea543a31586e.png"  width="250">        |  <img src="https://user-images.githubusercontent.com/62745858/229587790-b9a80ed3-e40b-4e1b-8730-51ded83154ce.png"  width="250">        |   <img src="https://user-images.githubusercontent.com/62745858/229589358-e097f0e2-f9d6-42f0-bd00-0e238854d077.png"  width="250">        | 


## 📝Credits

This software uses the following packages:

- [Expo](https://expo.dev/)
- [React](https://react.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [react-native-gifted-chat](https://github.com/FaridSafi/react-native-gifted-chat)
- [react-native-emoji-modal](https://github.com/staltz/react-native-emoji-modal)


## ©License
![GitHub](https://img.shields.io/github/license/Ctere1/react-native-chat)

```
Copyright (c) 2023 Cemil Tan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📌Contributors

<a href="https://github.com/Ctere1/">
  <img src="https://contrib.rocks/image?repo=Ctere1/Ctere1" />
</a>
