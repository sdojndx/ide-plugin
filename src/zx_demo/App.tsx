import React, { useEffect } from 'react';
import Home from './pages';

export default function App() {
  // const [load,setLoad] = useState(import.meta.env.VITE_EVN !== 'development');
  useEffect(() => {
    // console.log('app');
    // if(import.meta.env.VITE_EVN === 'development'){
    //     setTimeout(()=>{
    //         setLoad(true);
    //     },1000)
    // }
  }, []);
  return <Home />;
  // return <>{load&&<Home/>}</>
}
