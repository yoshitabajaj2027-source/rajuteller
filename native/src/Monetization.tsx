// Web/default fallback: native commerce is not simulated.
import React from 'react';
import {Text} from 'react-native';
export function useCommerce(_onboarded:boolean){return {pro:false,price:'',busy:false,message:'Purchases are available only in a configured native build.',buy:async()=>{},restore:async()=>{},privacy:async()=>{}}}
export function AdBanner(){return null}
