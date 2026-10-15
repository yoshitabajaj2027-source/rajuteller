import React,{useEffect,useRef,useState} from 'react';
import {AppState,Platform,Text,View} from 'react-native';
import Purchases,{CustomerInfo,PurchasesPackage} from 'react-native-purchases';
import mobileAds,{AdsConsent,BannerAd,BannerAdSize,TestIds,MaxAdContentRating} from 'react-native-google-mobile-ads';
import {canShowBanner,isPro,usableRevenueCatKey} from './commerceCore';
let configured=false;
let adsStarted=false;
let bannerAllowed=false;
const subscribers=new Set<()=>void>();
const notify=()=>subscribers.forEach(f=>f());
export function useCommerce(onboarded:boolean){
 const [pro,setPro]=useState(false),[known,setKnown]=useState(false),[consent,setConsent]=useState(false),[price,setPrice]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const product=useRef<PurchasesPackage|null>(null),lock=useRef(false);
 const key=Platform.OS==='ios'?process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY:process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
 const apply=(info:CustomerInfo)=>{setPro(isPro(info));setKnown(true)};
 useEffect(()=>{let alive=true;
  const listener=(i:CustomerInfo)=>{if(alive)apply(i)};
  async function load(){
   if(!onboarded)return;
   if(!usableRevenueCatKey(key,!__DEV__)){setMessage('Store purchases are not configured for this build.');return}
   try{if(!configured){Purchases.configure({apiKey:key!});configured=true}Purchases.addCustomerInfoUpdateListener(listener);const i=await Purchases.getCustomerInfo();if(!alive)return;apply(i);
    const offers=await Purchases.getOfferings();if(!alive)return;product.current=offers.current?.lifetime??null;setPrice(product.current?.product.priceString??'');if(!product.current)setMessage('The one-time unlock is not available yet.');
   }catch{if(alive)setMessage('Store unavailable. Try again later. Ads stay off until purchase status is checked.')}
  }load();const sub=AppState.addEventListener('change',s=>{if(s==='active'&&configured)Purchases.getCustomerInfo().then(i=>{if(alive)apply(i)}).catch(()=>{})});
  return()=>{alive=false;sub.remove();if(configured)Purchases.removeCustomerInfoUpdateListener(listener)}
 },[onboarded,key]);
 async function consentFlow(){if(!onboarded||!known||pro||Platform.OS==='web')return;try{await AdsConsent.gatherConsent();const i=await AdsConsent.getConsentInfo();if(i.canRequestAds){if(!adsStarted){await mobileAds().setRequestConfiguration({maxAdContentRating:MaxAdContentRating.PG});await mobileAds().initialize();adsStarted=true}setConsent(true)}else setConsent(false)}catch{setConsent(false)}}
 useEffect(()=>{if(onboarded&&known&&!pro)void consentFlow()},[onboarded,known,pro]);
 useEffect(()=>{bannerAllowed=canShowBanner({consent,customerKnown:known,pro,onboarded});notify();return()=>{bannerAllowed=false;notify()}},[consent,known,pro,onboarded]);
 async function transact(restore:boolean){if(lock.current)return;if(!configured){setMessage('Purchases are not configured for this build.');return}if(!restore&&!product.current){setMessage('No one-time unlock is available.');return}lock.current=true;setBusy(true);setMessage('');try{const info=restore?await Purchases.restorePurchases():(await Purchases.purchasePackage(product.current!)).customerInfo;apply(info);setMessage(isPro(info)?'Ad-free unlock is active.':restore?'No active unlock found for this store account.':'Purchase is pending or not active yet. No unlock was granted.')}catch(e){const cancelled=typeof e==='object'&&e!==null&&'userCancelled'in e&&e.userCancelled;setMessage(cancelled?'Purchase cancelled.':'The store could not finish. Try again later.')}finally{lock.current=false;setBusy(false)}}
 async function privacy(){setConsent(false);bannerAllowed=false;notify();try{const i=await AdsConsent.showPrivacyOptionsForm();setConsent(i.canRequestAds)}catch{setMessage('Privacy options are unavailable. Try again later. Ads are off.')}}
 return {pro,price,busy,message,buy:()=>transact(false),restore:()=>transact(true),privacy};
}
export function AdBanner(){const [,rerender]=useState(0);useEffect(()=>{const f=()=>rerender(x=>x+1);subscribers.add(f);return()=>{subscribers.delete(f)}},[]);const id=__DEV__?TestIds.BANNER:Platform.OS==='ios'?process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID:process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;if(!bannerAllowed||!id)return null;return <View accessibilityLabel="Advertisement" style={{alignItems:'center',marginTop:24}}><BannerAd unitId={id} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}/></View>}
