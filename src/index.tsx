import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloProvider } from '@apollo/client';
import { SMIPClient } from './services/cesmiiApiService';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const client = new SMIPClient({
  "uri": process.env.REACT_APP_PLATFORM_URI || "",
  "authenticatorName": process.env.REACT_APP_AUTHENTICATOR_NAME || "",
  "authenticatorPassword": process.env.REACT_APP_AUTHENTICATOR_PASSWORD || "",
  "role": process.env.REACT_APP_ROLE || "",
  "username": process.env.REACT_APP_USERNAM || ""
})

root.render(
  <React.StrictMode>
    <ApolloProvider client={client.client!}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
