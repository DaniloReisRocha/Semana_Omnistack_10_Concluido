import React from 'react';
import Routes from './src/Routes';
import { StatusBar } from 'react-native';

export default function App() {
  return (
  <>
    <StatusBar barstyle ="light-content" backgrondColor="#7D40E7" />
    <Routes/>
  </>
  )
}

