# AlgoLens

AlgoLens is a social media platform where users can buy a username to sign in. Users can find all the user posts on the home page and see their profile photo or set it accordingly.

App Link 
[https://algolens.vercel.app](https://algolens.vercel.app/)


## Technologies Used

- React
- Algorand
- Pyteal
- Imgur (for image hosting)


## Note
User must connect their algorand wallet using perawallet
Ensure to have selected testnet as chainID is currently testnet
for faucet: https://bank.testnet.algorand.network/

### Prerequisites
- Node.js installed
- yarn or npm package manager
  

### Installation
1. Clone the repository
   ```sh
   git clone https://github.com/CodeDialect/algolens.git
   ```
2. Navigate to the algolens directory
    ```bash
   cd algolens
     ```
  
    2.1 Edit Enviornment Variable [.env.example]
        
    rename the .env.example to: 
    ```bash 
       .env 
    ```
       
    Update .env
    ```bash 
       REACT_APP_IMGUR_CLIENT_ID= YOUR_IMGUR_CLIENT_ID (from imgur.com)
    ```


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
