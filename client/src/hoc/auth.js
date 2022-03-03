import { Axios } from 'axios';
import { response } from 'express';
import React, { useEffect } from 'react';
import {useDispatch} from 'react-redux'
import { auth } from '../_actions/user_action'
export default function(SpecificComponent, option, adminRoute = null){
  // null => 아무나 출입이 가능한 페이지
  // true =>  로그인한 유저만 출입이 가능한 페이지
  // false => 로그인한 유저는 출입이 불가능한 페이지
  function AuthneticationCheck(props){
    const dispatch = useDispatch()
    useEffect(()=>{
      dispatch(auth())
        .then(response => {
          console.log(response);
        })
    },[])
  }

  return AuthneticationCheck
}